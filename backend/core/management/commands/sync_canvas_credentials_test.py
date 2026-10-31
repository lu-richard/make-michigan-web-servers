# THROWAWAY: tests that Django can read a Canvas course and write credentials to RDS, using a course that has no
# module completion requirements. It treats every enrolled student as complete; delete this file once the test is done.

import os

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from core.management.commands.sync_canvas_credentials import CAMPUS_TIME_ZONE, fetch_all
from core.models import CanvasCourse, Credential, CredentialStatus, User


class Command(BaseCommand):
    help = "TEST ONLY: give every student enrolled in one Canvas course (from canvas_courses) its credential, ignoring completion."

    def add_arguments(self, parser):
        parser.add_argument("course", help="Canvas course id (must have a canvas_courses row).")
        parser.add_argument("--dry-run", action="store_true", help="Report what would be created, then roll back.")

    def handle(self, *args, **options):
        base_url = os.environ.get("CANVAS_BASE_URL", "https://umich.instructure.com").rstrip("/")
        token = os.environ.get("CANVAS_TOKEN", "")

        if not token:
            raise CommandError("Set CANVAS_TOKEN (backend/.env or the environment).")

        try:
            course = CanvasCourse.objects.select_related("credential_model", "issuing_makerspace").get(canvas_course_id=options["course"])
        except CanvasCourse.DoesNotExist:
            raise CommandError(f"No canvas_courses row for course {options['course']}.")

        # No bulk_user_progress call: this course has no completion requirements, so enrollment counts as completion.
        students = fetch_all(base_url, token, f"/api/v1/courses/{course.canvas_course_id}/users", [
            ("enrollment_type[]", "student"),
            ("enrollment_state[]", "active"),
            ("enrollment_state[]", "completed"),
        ])

        created, already_held, no_profile = [], [], []

        with transaction.atomic():
            for student in students:
                uniqname = (student.get("login_id") or "").split("@")[0].lower()
                recipient = User.objects.filter(uniqname=uniqname).first() if uniqname else None

                if recipient is None:
                    no_profile.append(uniqname)
                    continue

                if Credential.objects.filter(recipient_user=recipient, credential_model=course.credential_model).exists():
                    already_held.append(uniqname)
                    continue

                credential = Credential.objects.create(
                    credential_model=course.credential_model,
                    issuing_makerspace=course.issuing_makerspace,
                    author_user_id=course.author_user_id,
                    recipient_user=recipient,
                    credential_status=CredentialStatus.ACTIVE_USER,
                    completion_date=timezone.now().astimezone(CAMPUS_TIME_ZONE).date(),
                    expiration_date=None,
                )
                created.append(f"{uniqname} ({credential.credential_id})")

            if options["dry_run"]:
                transaction.set_rollback(True)

        self.stdout.write(f"Canvas course {course.canvas_course_id} -> {course.credential_model.credential_model_name} "
                          f"({course.issuing_makerspace.makerspace_name})")
        self.stdout.write(f"  students enrolled: {len(students)}")
        self.stdout.write(f"  credentials created: {len(created)}  {', '.join(created)}")
        self.stdout.write(f"  already held (skipped): {len(already_held)}")
        self.stdout.write(f"  no profile yet (skipped): {len(no_profile)}")

        if options["dry_run"]:
            self.stdout.write("DRY RUN: nothing was saved.")
