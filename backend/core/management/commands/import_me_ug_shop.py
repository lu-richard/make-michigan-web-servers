import csv
from collections import Counter
from datetime import datetime
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from zoneinfo import ZoneInfo

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.models import (
    Capability,
    CredentialModel,
    CredentialType,
    Equipment,
    EquipmentAcceptedMaterial,
    EquipmentModel,
    EquipmentModelCapability,
    EquipmentRestrictedMaterial,
    Makerspace,
    MakerspaceCredentialModel,
    Material,
)

MAKERSPACE_NAME = "ME Undergrad Machine Shop"
CREDENTIAL_MODEL_NAME = "ME X50 Training"

# CSV spellings -> the spellings already used in the database.
MAKES = {"SouthBend": "South Bend", "PorterCable": "Porter-Cable", "Omax": "OMAX"}
MODELS = {"CK1016VS": "KC1016VS"}
TYPES = {
    "Sandblaster": "Sand Blaster",
    "Disk Sander": "Disc Sander",
    "Vertical bandsaw": "Vertical Bandsaw",
    "Mig Welder": "MIG Welder",
    "Cut off tool": "Cut Off Saw",
}

# The shop's laser is the existing "Universal Systems PLS60.150D" model, whose model number was mistyped.
EXISTING_MODEL_ALIASES = {("Universal", "PLS6.150D"): ("Universal Systems", "PLS60.150D")}

# Capabilities and materials follow the existing lowercase snake_case names. Anything not listed here stops the import.
CAPABILITIES = {
    "milling": "mill",
    "drilling": "drill",
    "cutting": "cut",
    "welding": "weld",
    "bending": "bend",
    "grinding": "grind",
    "sanding": "sand",
    "cleaning": "clean",
    "turning": "turn",
    "threading": "thread",
    "deburring": "deburr",
    "surface prep": "surface_prep",
}
MATERIALS = {
    "metals": "metal",
    "plastics": "plastics",
    "composites": "composites",
    "wood": "wood",
    "metal sheet": "sheet_metal",
    "rubber": "rubber",
    "flammables": "flammables",
    "certain rubber": "certain_rubber",
    "non ferrous metals": "non_ferrous_metals",
    "pvc": "pvc",
}
IGNORED_LIST_ITEMS = {"etc.", "etc"}

TRACKING_PARAMS = {"srsltid", "gclid", "gclsrc", "gucid", "gad_source", "gad_campaignid", "fbclid"}

SHOP_TIME_ZONE = ZoneInfo("America/Detroit")


def split_list(value):
    return [item.strip() for item in (value or "").split(",") if item.strip() and item.strip().lower() not in IGNORED_LIST_ITEMS]


def clean_url(url):
    url = (url or "").strip()

    if not url:
        return None

    parts = urlsplit(url)
    query = [(key, value) for key, value in parse_qsl(parts.query, keep_blank_values=True) if key not in TRACKING_PARAMS and not key.startswith("utm_")]

    return urlunsplit(parts._replace(query=urlencode(query)))


def parse_service_year(value):
    # The sheet only records a year; store midnight on Jan 1 shop time so it displays as Jan 1 locally.
    return datetime(int(value.strip()), 1, 1, tzinfo=SHOP_TIME_ZONE)


def read_rows(path):
    with open(path, newline="", encoding="utf-8-sig") as f:
        lines = f.read().splitlines()

    # The sheet's first line is an empty row of commas; the header is the first line with content.
    header_index = next(i for i, line in enumerate(lines) if line.strip(", "))

    return [row for row in csv.DictReader(lines[header_index:]) if (row.get("Model") or "").strip()]


class Command(BaseCommand):
    help = (
        f"Import the {MAKERSPACE_NAME} equipment sheet: equipment models, equipment, capabilities, materials and their links. "
        "Reuses existing rows wherever they match, so it is safe to re-run. Runs in one transaction; --dry-run rolls it back."
    )

    def add_arguments(self, parser):
        parser.add_argument("csv_path", help="Path to the shop's equipment CSV.")
        parser.add_argument("--dry-run", action="store_true", help="Run the whole import, report what it would do, then roll back.")

    def handle(self, *args, **options):
        path = Path(options["csv_path"])

        if not path.exists():
            raise CommandError(f"No such file: {path}")

        rows = read_rows(path)
        self.created = Counter()
        self.reused = Counter()

        with transaction.atomic():
            self.import_rows(rows)

            if options["dry_run"]:
                transaction.set_rollback(True)

        self.stdout.write("")
        self.stdout.write(f"{'DRY RUN, rolled back' if options['dry_run'] else 'Imported'}: {len(rows)} sheet rows")

        for label in ["makerspace credential links", "credential models", "equipment models", "capabilities", "model capabilities",
                      "materials", "equipment", "accepted materials", "restricted materials"]:
            self.stdout.write(f"  {label:28} created {self.created[label]:3}   reused {self.reused[label]:3}")

    def track(self, label, created):
        (self.created if created else self.reused)[label] += 1

    def import_rows(self, rows):
        try:
            makerspace = Makerspace.objects.get(makerspace_name=MAKERSPACE_NAME)
        except Makerspace.DoesNotExist:
            raise CommandError(f'Makerspace "{MAKERSPACE_NAME}" not found.')

        unknown_facilities = {row["Facility"].strip() for row in rows} - {"ME - UG Shop"}
        unknown_trainings = {row["Training Modules"].strip() for row in rows} - {CREDENTIAL_MODEL_NAME}

        if unknown_facilities or unknown_trainings:
            raise CommandError(f"Unexpected facility/training values: {unknown_facilities | unknown_trainings}")

        credential_model, created = CredentialModel.objects.get_or_create(
            credential_model_name=CREDENTIAL_MODEL_NAME, defaults={"credential_type": CredentialType.EQUIPMENT}
        )
        self.track("credential models", created)
        _, created = MakerspaceCredentialModel.objects.get_or_create(makerspace=makerspace, credential_model=credential_model)
        self.track("makerspace credential links", created)

        # Machines of the same model are numbered #1..#n; a model the shop has only one of keeps the model name.
        model_counts = Counter((row["Make"].strip(), row["Model"].strip()) for row in rows)
        model_seen = Counter()

        for row in rows:
            key = (row["Make"].strip(), row["Model"].strip())
            equipment_model = self.get_equipment_model(row)

            model_seen[key] += 1
            name = equipment_model.equipment_model_name

            if model_counts[key] > 1:
                name = f"{name} #{model_seen[key]}"

            equipment, created = Equipment.objects.get_or_create(
                makerspace=makerspace,
                equipment_name=name,
                defaults={
                    "equipment_model": equipment_model,
                    "credential_model": credential_model,
                    "equipment_status": None,
                    "last_serviced": parse_service_year(row["Last Service Date"]),
                    "in_situ_image_url": None,
                    "specific_specs": None,
                    "notes": None,
                },
            )
            self.track("equipment", created)
            self.stdout.write(f"  {'+' if created else '='} {name}")

            for label, link_model, column in [
                ("accepted materials", EquipmentAcceptedMaterial, "Accepted Materials"),
                ("restricted materials", EquipmentRestrictedMaterial, "Restricted Materials"),
            ]:
                for material in split_list(row[column]):
                    _, created = link_model.objects.get_or_create(equipment=equipment, material=self.get_named(Material, MATERIALS, material, "materials"))
                    self.track(label, created)

    def get_equipment_model(self, row):
        csv_make, csv_model = row["Make"].strip(), row["Model"].strip()
        make, model = MAKES.get(csv_make, csv_make), MODELS.get(csv_model, csv_model)
        equipment_type = TYPES.get(row["Type"].strip(), row["Type"].strip())

        alias = EXISTING_MODEL_ALIASES.get((csv_make, csv_model))

        if alias:
            equipment_model = EquipmentModel.objects.get(make__iexact=alias[0], model__iexact=alias[1])
            # Correct the existing row's mistyped model number, in both its model field and its name.
            equipment_model.model = model
            equipment_model.equipment_model_name = equipment_model.equipment_model_name.replace(alias[1], model)
            equipment_model.specs_url = equipment_model.specs_url or clean_url(row["Link"])
            equipment_model.save()
            created = False
        else:
            equipment_model = EquipmentModel.objects.filter(make__iexact=make, model__iexact=model).first()
            created = equipment_model is None

            if created:
                equipment_model = EquipmentModel.objects.create(
                    equipment_model_name=f"{make} {model} {equipment_type}",
                    make=make,
                    model=model,
                    equipment_type=equipment_type,
                    is_cnc=row["CNC (Y/N)"].strip().upper() == "Y",
                    specs_url=clean_url(row["Link"]),
                    specific_specs=None,
                    manufacturer_image_urls=None,
                )

        # Count each distinct model once, not once per machine.
        if not hasattr(self, "_counted_models"):
            self._counted_models = set()

        if equipment_model.pk not in self._counted_models:
            self._counted_models.add(equipment_model.pk)
            self.track("equipment models", created)

            for capability in split_list(row["Capabilities"]):
                _, link_created = EquipmentModelCapability.objects.get_or_create(
                    equipment_model=equipment_model, capability=self.get_named(Capability, CAPABILITIES, capability, "capabilities")
                )
                self.track("model capabilities", link_created)

        return equipment_model

    def get_named(self, model, mapping, csv_value, label):
        key = csv_value.strip().lower()

        if key not in mapping:
            raise CommandError(f'Unmapped {label[:-1]} "{csv_value}". Add it to {label.upper()} in this command.')

        obj, created = model.objects.get_or_create(name=mapping[key])

        if not hasattr(self, "_counted_names"):
            self._counted_names = set()

        if (label, obj.pk) not in self._counted_names:
            self._counted_names.add((label, obj.pk))
            self.track(label, created)

        return obj
