import csv
import json
import re
from datetime import datetime
from decimal import Decimal
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from core.models import (
    Capability,
    Credential,
    CredentialModel,
    CredentialModelPrerequisite,
    Equipment,
    EquipmentAcceptedMaterial,
    EquipmentModel,
    EquipmentModelCapability,
    EquipmentRestrictedMaterial,
    IssueReport,
    Makerspace,
    MakerspaceCredentialModel,
    Material,
    User,
)

# Repo root: backend/core/management/commands/import_legacy_csv.py -> up 4 levels
REPO_ROOT = Path(__file__).resolve().parents[4]


def none_if_empty(value):
    value = (value or "").strip()
    return value or None


def parse_ts(value):
    value = none_if_empty(value)
    if value is None:
        return None
    value = value.replace(" ", "T", 1)
    value = re.sub(r"([+-]\d{2})$", r"\1:00", value)  # +00 -> +00:00
    return datetime.fromisoformat(value)


def parse_date(value):
    value = none_if_empty(value)
    return datetime.strptime(value, "%Y-%m-%d").date() if value else None


def parse_decimal(value):
    value = none_if_empty(value)
    return Decimal(value) if value is not None else None


def parse_bool(value):
    return (value or "").strip().lower() == "true"


def parse_json(value):
    value = none_if_empty(value)
    return json.loads(value) if value is not None else None


def read_csv_rows(path):
    if not path.exists():
        raise CommandError(f"Missing CSV file: {path}")
    with open(path, newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


class Command(BaseCommand):
    help = (
        "One-time import of legacy Supabase Postgres CSV exports (profiles_rows.csv, "
        "makerspaces_rows.csv, etc.) into the new Django-managed MySQL schema. "
        "Runs as a single all-or-nothing transaction -- any error aborts and rolls back "
        "everything, nothing is left partially imported."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dir",
            default=str(REPO_ROOT),
            help="Directory containing the *_rows.csv files (default: repo root).",
        )

    def handle(self, *args, **options):
        base = Path(options["dir"])
        capability_cache = {}
        material_cache = {}

        def get_capability(name):
            key = name.strip().lower()
            if not key:
                return None
            if key not in capability_cache:
                obj, _ = Capability.objects.get_or_create(name=key)
                capability_cache[key] = obj
            return capability_cache[key]

        def get_material(name):
            key = name.strip().lower()
            if not key:
                return None
            if key not in material_cache:
                obj, _ = Material.objects.get_or_create(name=key)
                material_cache[key] = obj
            return material_cache[key]

        def import_rows(filename, label, row_fn):
            path = base / filename
            rows = read_csv_rows(path)
            for i, row in enumerate(rows, start=2):  # row 1 is the header
                try:
                    row_fn(row)
                except Exception as exc:
                    raise CommandError(f"{filename} line {i}: {exc}") from exc
            self.stdout.write(f"Imported {len(rows)} {label}")

        def import_user(row):
            user = User.objects.create_user(
                uniqname=row["uniqname"],
                user_id=row["user_id"],
                first_name=row["first_name"],
                middle_initial=none_if_empty(row["middle_initial"]),
                last_name=row["last_name"],
                image_url=none_if_empty(row["image_url"]),
                pronouns=none_if_empty(row["pronouns"]),
                roles=parse_json(row["roles"]) or [],
                system_theme=row["system_theme"],
                is_grad_student=parse_bool(row["is_grad_student"]),
                locale=row["locale"],
            )
            User.objects.filter(pk=user.pk).update(created_at=parse_ts(row["created_at"]))

        def import_credential_model(row):
            obj = CredentialModel.objects.create(
                credential_model_id=row["credential_model_id"],
                credential_model_name=row["credential_model_name"],
                credential_type=row["credential_type"],
                description=none_if_empty(row["description"]),
            )
            CredentialModel.objects.filter(pk=obj.pk).update(
                created_at=parse_ts(row["created_at"]),
                last_updated=parse_ts(row["last_updated"]),
            )

        def import_makerspace(row):
            obj = Makerspace.objects.create(
                makerspace_id=row["makerspace_id"],
                makerspace_name=row["makerspace_name"],
                makerspace_tier=none_if_empty(row["makerspace_tier"]),
                makerspace_status=none_if_empty(row["makerspace_status"]),
                description=none_if_empty(row["description"]),
                rooms=parse_json(row["rooms"]),
                themes=parse_json(row["themes"]),
                audience=parse_json(row["audience"]),
                latitude=parse_decimal(row["latitude"]),
                longitude=parse_decimal(row["longitude"]),
                contact_email=row["contact_email"],
                contact_phone=row["contact_phone"],
                building=row["building"],
                cover_image=none_if_empty(row["cover_image"]),
                floorplan_image=none_if_empty(row["floorplan_image"]),
                staff_ids=parse_json(row["staff_ids"]),
            )
            Makerspace.objects.filter(pk=obj.pk).update(
                created_at=parse_ts(row["created_at"]),
                last_updated=parse_ts(row["last_updated"]),
            )

        def import_equipment_model(row):
            obj = EquipmentModel.objects.create(
                equipment_model_id=row["equipment_model_id"],
                equipment_model_name=row["equipment_model_name"],
                make=row["make"],
                model=row["model"],
                equipment_type=row["equipment_type"],
                is_cnc=parse_bool(row["is_cnc"]),
                specs_url=none_if_empty(row["specs_url"]),
                specific_specs=parse_json(row["specific_specs"]),
                manufacturer_image_urls=parse_json(row["manufacturer_image_urls"]),
            )
            EquipmentModel.objects.filter(pk=obj.pk).update(
                created_at=parse_ts(row["created_at"]),
                last_updated=parse_ts(row["last_updated"]),
            )
            for cap_name in parse_json(row["capabilities"]) or []:
                capability = get_capability(cap_name)
                if capability is not None:
                    EquipmentModelCapability.objects.create(equipment_model=obj, capability=capability)

        def import_equipment(row):
            obj = Equipment.objects.create(
                equipment_id=row["equipment_id"],
                equipment_name=row["equipment_name"],
                equipment_model_id=row["equipment_model_id"],
                makerspace_id=row["makerspace_id"],
                credential_model_id=none_if_empty(row["credential_model_id"]),
                equipment_status=none_if_empty(row["equipment_status"]),
                in_situ_image_url=none_if_empty(row["in_situ_image_url"]),
                specific_specs=parse_json(row["specific_specs"]),
                notes=none_if_empty(row["notes"]),
                last_serviced=parse_ts(row["last_serviced"]),
            )
            Equipment.objects.filter(pk=obj.pk).update(
                created_at=parse_ts(row["created_at"]),
                last_updated=parse_ts(row["last_updated"]),
            )
            for mat_name in parse_json(row["materials"]) or []:
                material = get_material(mat_name)
                if material is not None:
                    EquipmentAcceptedMaterial.objects.create(equipment=obj, material=material)
            for mat_name in parse_json(row["restricted_materials"]) or []:
                material = get_material(mat_name)
                if material is not None:
                    EquipmentRestrictedMaterial.objects.create(equipment=obj, material=material)

        def import_credential(row):
            obj = Credential.objects.create(
                credential_id=row["credential_id"],
                credential_model_id=row["credential_model_id"],
                issuing_makerspace_id=row["issuing_makerspace_id"],
                author_user_id=row["author_user_id"],
                recipient_user_id=row["recipient_user_id"],
                credential_status=row["credential_status"],
                completion_date=parse_date(row["completion_date"]),
                expiration_date=parse_date(row["expiration_date"]),
            )
            Credential.objects.filter(pk=obj.pk).update(
                created_at=parse_ts(row["created_at"]),
                last_updated=parse_ts(row["last_updated"]),
            )

        def import_credential_model_prerequisite(row):
            obj = CredentialModelPrerequisite.objects.create(
                prerequisite_credential_model_id=row["prerequisite_credential_model_id"],
                dependent_credential_model_id=row["dependent_credential_model_id"],
            )
            CredentialModelPrerequisite.objects.filter(pk=obj.pk).update(
                created_at=parse_ts(row["created_at"]),
                last_updated=parse_ts(row["last_updated"]),
            )

        def import_makerspace_credential_model(row):
            obj = MakerspaceCredentialModel.objects.create(
                makerspace_id=row["makerspace_id"],
                credential_model_id=row["credential_model_id"],
            )
            MakerspaceCredentialModel.objects.filter(pk=obj.pk).update(
                created_at=parse_ts(row["created_at"]),
                last_updated=parse_ts(row["last_updated"]),
            )

        def import_issue_report(row):
            obj = IssueReport.objects.create(
                issue_report_id=row["issue_report_id"],
                equipment_id=row["equipment_id"],
                reporter_user_id=none_if_empty(row["reporter_user_id"]),
                overseer_user_id=none_if_empty(row["overseer_user_id"]),
                title=none_if_empty(row["title"]) or "a",
                issue_type=row["issue_type"],
                description=row["description"],
                is_resolved=parse_bool(row["is_resolved"]),
            )
            IssueReport.objects.filter(pk=obj.pk).update(
                created_at=parse_ts(row["created_at"]),
                last_updated=parse_ts(row["last_updated"]),
            )

        try:
            with transaction.atomic():
                import_rows("profiles_rows.csv", "users", import_user)
                import_rows("credential_models_rows.csv", "credential models", import_credential_model)
                import_rows("makerspaces_rows.csv", "makerspaces", import_makerspace)
                import_rows("equipment_models_rows.csv", "equipment models", import_equipment_model)
                import_rows("equipment_rows.csv", "equipment", import_equipment)
                import_rows("credentials_rows.csv", "credentials", import_credential)
                import_rows(
                    "credential_model_prerequisites_rows.csv",
                    "credential model prerequisites",
                    import_credential_model_prerequisite,
                )
                import_rows(
                    "makerspace_credential_models_rows.csv",
                    "makerspace credential models",
                    import_makerspace_credential_model,
                )
                import_rows("issue_reports_rows.csv", "issue reports", import_issue_report)
        except CommandError:
            raise
        except Exception as exc:
            raise CommandError(f"Import failed, nothing was committed: {exc}") from exc

        self.stdout.write(self.style.SUCCESS("Legacy data import complete."))
