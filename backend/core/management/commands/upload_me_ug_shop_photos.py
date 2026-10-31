import os
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen

from django.core.management.base import BaseCommand, CommandError

from core.models import EquipmentModel

BUCKET = "equipment-model-photos"

# Photo filename -> (make, model) of the equipment model it shows.
PHOTOS = {
    "acer.jpg": ("Acer", "E-Mill 3VS"),
    "bridgeport.jpg": ("Bridgeport", "Series 1"),
    "clausing.jpg": ("Clausing", "20"),
    "dake.jpg": ("Dake", "VH-24"),
    "delta_unisaw.jpg": ("Delta", "Unisaw 10"),
    "delta_vert_bandsaw.webp": ("Delta", "28-203"),
    "grainger_sandblaster.jpg": ("Econoline", "RA 42x24"),
    "grizzly.jpg": ("Grizzly", "G9742"),
    "jet_disk_sander.jpg": ("Jet", "JDS-20-3"),
    "kalamazoo.jpg": ("Kalamazoo", "KC1016VS"),
    "lincoln.png": ("Lincoln", "SP-125 Plus"),
    "micromax.webp": ("OMAX", "MicroMax"),
    "miller_deltaweld.webp": ("Miller", "Deltaweld 302"),
    "miller_synchrowave.webp": ("Miller", "250 DX"),
    "miter_saw.jpg": ("Hitachi", "C 10 FS"),
    "nova_tumbler.jpg": ("Nova", "251"),
    "pc_cutoff.jpg": ("Porter-Cable", "1420"),
    "qc_grinder.webp": ("Queen City", "3-2"),
    "quantrex.png": ("L&R", "Quantrex 360"),
    "southbend.jpg": ("South Bend", "SB1012"),
    "tennsmith_brake.png": ("Tennsmith", "HBU4816"),
    "tennsmith_shear.png": ("Tennsmith", "T5216"),
}

CONTENT_TYPES = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}


class Command(BaseCommand):
    help = (
        f"Upload the ME Undergrad Machine Shop equipment model photos to the {BUCKET} bucket as <equipment_model_id>/<filename>, "
        "matching existing models, and add each path to the model's manufacturer_image_urls. Safe to re-run: uploads overwrite "
        "and paths are only added once. Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment."
    )

    def add_arguments(self, parser):
        parser.add_argument("photo_dir", help="Directory containing the photo files.")
        parser.add_argument("--dry-run", action="store_true", help="Show what would be uploaded and saved without doing it.")

    def handle(self, *args, **options):
        photo_dir = Path(options["photo_dir"])
        dry_run = options["dry_run"]
        supabase_url = os.environ.get("SUPABASE_URL", "").rstrip("/")
        service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

        if not dry_run and not (supabase_url and service_key):
            raise CommandError("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (backend/.env or the environment).")

        # Resolve everything before uploading anything, so a missing file or model stops the run up front.
        plan = []

        for filename, (make, model) in PHOTOS.items():
            path = photo_dir / filename

            if not path.exists():
                raise CommandError(f"Missing photo: {path}")

            if path.suffix.lower() not in CONTENT_TYPES:
                raise CommandError(f"Unsupported image type: {filename}")

            try:
                equipment_model = EquipmentModel.objects.get(make=make, model=model)
            except EquipmentModel.DoesNotExist:
                raise CommandError(f"No equipment model {make} {model} for {filename}")

            plan.append((path, equipment_model, f"{equipment_model.equipment_model_id}/{filename}"))

        for path, equipment_model, object_path in plan:
            size_mb = path.stat().st_size / 1_000_000
            self.stdout.write(f"  {object_path}  ({size_mb:.1f} MB)  -> {equipment_model.equipment_model_name}")

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
