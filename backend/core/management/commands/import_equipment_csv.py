import csv
from collections import Counter
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.models import (
    Capability,
    CredentialModel,
    Equipment,
    EquipmentAcceptedMaterial,
    EquipmentModel,
    EquipmentModelCapability,
    EquipmentRestrictedMaterial,
    EquipmentStatus,
    Makerspace,
    Material,
)

CAMPUS_TIME_ZONE = ZoneInfo("America/Detroit")

REQUIRED_COLUMNS = {
    "makerspace", "equipment_name", "equipment_model_name", "make", "model", "equipment_type", "is_cnc", "specs_url",
    "capabilities", "credential_model", "accepted_materials", "restricted_materials", "equipment_status", "last_serviced",
    "notes", "in_situ_image_url", "manufacturer_image_urls",
}


def blank_to_none(value):
    value = (value or "").strip()
    return value or None


def split_list(value):
    return [item.strip() for item in (value or "").split(";") if item.strip()]


def parse_last_serviced(value):
    # Dates are taken as midnight campus time so they display as that date locally.
    value = blank_to_none(value)
    return datetime.fromisoformat(value).replace(tzinfo=CAMPUS_TIME_ZONE) if value else None


class Command(BaseCommand):
    help = (
        "Import equipment from a CSV with one row per machine, whose columns map onto equipment and equipment_models "
        "(lists such as capabilities and materials are ';'-separated, using the existing database names). Reuses existing "
        "models (by make + model) and equipment (by makerspace + name), so it is safe to re-run. One transaction per file."
    )

    def add_arguments(self, parser):
        parser.add_argument("csv_paths", nargs="+", help="One or more equipment CSVs.")
        parser.add_argument("--dry-run", action="store_true", help="Run the import, report what it would do, then roll back.")

    def handle(self, *args, **options):
        for path in map(Path, options["csv_paths"]):
            if not path.exists():
                raise CommandError(f"No such file: {path}")

            with open(path, newline="", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f)
                missing = REQUIRED_COLUMNS - set(reader.fieldnames or [])

                if missing:
                    raise CommandError(f"{path.name} is missing columns: {', '.join(sorted(missing))}")

                rows = list(reader)

            self.created, self.reused = Counter(), Counter()

            with transaction.atomic():
                self.stdout.write(f"\n{path.name}")

                for row in rows:
                    self.import_row(row)

                if options["dry_run"]:
                    transaction.set_rollback(True)

            self.stdout.write(f"  {'DRY RUN, rolled back' if options['dry_run'] else 'Imported'}: {len(rows)} rows")

            for label in ["equipment models", "capabilities", "model capabilities", "materials", "equipment",
                          "accepted materials", "restricted materials"]:
                self.stdout.write(f"    {label:22} created {self.created[label]:3}   reused {self.reused[label]:3}")

    def track(self, label, created):
        (self.created if created else self.reused)[label] += 1

    def import_row(self, row):
        try:
            makerspace = Makerspace.objects.get(makerspace_name=row["makerspace"].strip())
        except Makerspace.DoesNotExist:
            raise CommandError(f'Makerspace "{row["makerspace"]}" not found.')

        credential_model = None

        if blank_to_none(row["credential_model"]):
            try:
                credential_model = CredentialModel.objects.get(credential_model_name=row["credential_model"].strip())
            except CredentialModel.DoesNotExist:
                raise CommandError(f'Credential model "{row["credential_model"]}" not found.')

        status = blank_to_none(row["equipment_status"])

        if status and status not in EquipmentStatus.values:
            raise CommandError(f'Invalid equipment_status "{status}" for {row["equipment_name"]}.')

        equipment_model = EquipmentModel.objects.filter(make__iexact=row["make"].strip(), model__iexact=row["model"].strip()).first()
        created = equipment_model is None

        if created:
            equipment_model = EquipmentModel.objects.create(
                equipment_model_name=row["equipment_model_name"].strip(),
                make=row["make"].strip(),
                model=row["model"].strip(),
                equipment_type=row["equipment_type"].strip(),
                is_cnc=row["is_cnc"].strip().upper() == "Y",
                specs_url=blank_to_none(row["specs_url"]),
                specific_specs=None,
                manufacturer_image_urls=split_list(row["manufacturer_image_urls"]) or None,
            )

        self.track("equipment models", created)

        for name in split_list(row["capabilities"]):
            capability, created = Capability.objects.get_or_create(name=name)
            self.track("capabilities", created)
            _, created = EquipmentModelCapability.objects.get_or_create(equipment_model=equipment_model, capability=capability)
            self.track("model capabilities", created)

        equipment, created = Equipment.objects.get_or_create(
            makerspace=makerspace,
            equipment_name=row["equipment_name"].strip(),
            defaults={
                "equipment_model": equipment_model,
                "credential_model": credential_model,
                "equipment_status": status,
                "last_serviced": parse_last_serviced(row["last_serviced"]),
                "in_situ_image_url": blank_to_none(row["in_situ_image_url"]),
                "specific_specs": None,
                "notes": blank_to_none(row["notes"]),
            },
        )
        self.track("equipment", created)
        self.stdout.write(f"  {'+' if created else '='} {equipment.equipment_name}  (model {equipment_model.equipment_model_id})")

        for label, link_model, column in [
            ("accepted materials", EquipmentAcceptedMaterial, "accepted_materials"),
            ("restricted materials", EquipmentRestrictedMaterial, "restricted_materials"),
        ]:
            for name in split_list(row[column]):
                material, created = Material.objects.get_or_create(name=name)
                self.track("materials", created)
                _, created = link_model.objects.get_or_create(equipment=equipment, material=material)
                self.track(label, created)
