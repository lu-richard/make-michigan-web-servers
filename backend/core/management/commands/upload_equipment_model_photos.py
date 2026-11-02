import csv
import os
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen

from django.core.management.base import BaseCommand, CommandError

from core.models import EquipmentModel

BUCKET = "equipment-model-photos"

CONTENT_TYPES = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}


class Command(BaseCommand):
    help = (
        f"Upload equipment model photos to the {BUCKET} bucket as <equipment_model_id>/<filename> and add each path to the "
        "model's manufacturer_image_urls. Photos are matched to models by a mapping CSV with columns filename, make, model. "
        "Safe to re-run: uploads overwrite and paths are only added once. Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    )

    def add_arguments(self, parser):
        parser.add_argument("photo_dir", help="Directory containing the photo files.")
        parser.add_argument("mapping_csv", help="CSV with columns filename, make, model.")
        parser.add_argument("--dry-run", action="store_true", help="Show what would be uploaded and saved without doing it.")

    def handle(self, *args, **options):
        photo_dir = Path(options["photo_dir"])
        dry_run = options["dry_run"]
        supabase_url = os.environ.get("SUPABASE_URL", "").rstrip("/")
        service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

        if not dry_run and not (supabase_url and service_key):
            raise CommandError("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (backend/.env or the environment).")

        with open(options["mapping_csv"], newline="", encoding="utf-8-sig") as f:
            mapping = list(csv.DictReader(f))

        # Resolve everything before uploading anything, so a missing file or model stops the run up front.
        plan = []

        for row in mapping:
            path = photo_dir / row["filename"].strip()

            if not path.exists():
                raise CommandError(f"Missing photo: {path}")

            if path.suffix.lower() not in CONTENT_TYPES:
                raise CommandError(f"Unsupported image type: {path.name}")

            try:
                equipment_model = EquipmentModel.objects.get(make__iexact=row["make"].strip(), model__iexact=row["model"].strip())
            except EquipmentModel.DoesNotExist:
                raise CommandError(f"No equipment model {row['make']} {row['model']} for {path.name}")

            plan.append((path, equipment_model, f"{equipment_model.equipment_model_id}/{path.name}"))

        for path, equipment_model, object_path in plan:
            self.stdout.write(f"  {object_path}  ({path.stat().st_size / 1000:.0f} KB)  -> {equipment_model.equipment_model_name}")

            if dry_run:
                continue

            self.upload(supabase_url, service_key, object_path, path)

            images = list(equipment_model.manufacturer_image_urls or [])

            if object_path not in images:
                equipment_model.manufacturer_image_urls = images + [object_path]
                equipment_model.save(update_fields=["manufacturer_image_urls", "last_updated"])

        self.stdout.write(f"\n{'DRY RUN, nothing uploaded or saved' if dry_run else 'Uploaded and saved'}: {len(plan)} photos")

    def upload(self, supabase_url, service_key, object_path, file_path):
        request = Request(
            f"{supabase_url}/storage/v1/object/{BUCKET}/{quote(object_path)}",
            data=file_path.read_bytes(),
            method="POST",
            headers={
                "Authorization": f"Bearer {service_key}",
                "apikey": service_key,
                "Content-Type": CONTENT_TYPES[file_path.suffix.lower()],
                # Overwrite on re-runs instead of failing because the object already exists.
                "x-upsert": "true",
            },
        )

        try:
            with urlopen(request) as response:
                response.read()
        except HTTPError as e:
            raise CommandError(f"Upload of {object_path} failed ({e.code}): {e.read().decode(errors='replace')}")
