import json
import os
import re
from datetime import datetime
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from core.models import CanvasCourse, Credential, CredentialStatus, User

PAGE_SIZE = 100

# Canvas reports completion in UTC; credentials store a date, so convert to campus time first.
CAMPUS_TIME_ZONE = ZoneInfo("America/Detroit")


def next_page_url(link_header):
    """Canvas splits long lists across pages and never sends a total count; follow rel="next" until it stops appearing."""
    for part in (link_header or "").split(","):
        match = re.search(r'<([^>]+)>\s*;\s*rel="next"', part)

        if match:
            return match.group(1)

    return None


def fetch_all(base_url, token, path, params):
    url = f"{base_url}{path}?{urlencode(params + [('per_page', PAGE_SIZE)])}"
    results = []

    while url:
        request = Request(url, headers={
            "Authorization": f"Bearer {token}",
            # Canvas ids are 64-bit; ask for strings so nothing is rounded.
            "Accept": "application/json+canvas-string-ids",
        })

        try:
            with urlopen(request) as response:
                results.extend(json.loads(response.read()))
                url = next_page_url(response.headers.get("Link"))
        except HTTPError as e:
            body = e.read().decode(errors="replace")

            if e.code == 403 and "Rate Limit Exceeded" in body:
                raise CommandError("Canvas rate limit hit; try again later.")

            if "not module based" in body:
                raise CommandError(
                    "This course has no modules with completion requirements, so Canvas can't compute completion. "
                    "Add a module and mark its items as required."
                )

            raise CommandError(f"Canvas {e.code} on {url}: {body}")

    return results


def completion_date(completed_at):
    return datetime.fromisoformat(completed_at.replace("Z", "+00:00")).astimezone(CAMPUS_TIME_ZONE).date()


class Command(BaseCommand):
    help = (
        "Create credentials for students who have completed each active Canvas course in canvas_courses. Students are "
        "matched to profiles by uniqname (Canvas login_id); students without a profile, or who already hold the course's "
        "credential, are skipped. Needs CANVAS_TOKEN (and optionally CANVAS_BASE_URL) in the environment."
    )

    def add_arguments(self, parser):
        parser.add_argument("--course", help="Only sync this Canvas course id.")
        parser.add_argument("--dry-run", action="store_true", help="Report what would be created, then roll back.")

    def handle(self, *args, **options):
        base_url = os.environ.get("CANVAS_BASE_URL", "https://umich.instructure.com").rstrip("/")
        token = os.environ.get("CANVAS_TOKEN", "")

        if not token:
            raise CommandError("Set CANVAS_TOKEN (backend/.env or the environment).")

        courses = CanvasCourse.objects.filter(is_active=True).select_related("credential_model", "issuing_makerspace")

        if options["course"]:
            courses = courses.filter(canvas_course_id=options["course"])

        if not courses:
            raise CommandError("No active Canvas courses to sync. Add a row to canvas_courses first.")

        for course in courses:
            # One transaction per course: a failure in one course doesn't undo or block the others.
            with transaction.atomic():
                self.sync_course(base_url, token, course)

                if options["dry_run"]:
                    transaction.set_rollback(True)

        if options["dry_run"]:
            self.stdout.write("\nDRY RUN: nothing was saved.")

    def sync_course(self, base_url, token, course):
        course_path = f"/api/v1/courses/{course.canvas_course_id}"

        # "completed" enrollments are students whose term ended, not students who finished, so include them too.
        students = fetch_all(base_url, token, f"{course_path}/users", [
            ("enrollment_type[]", "student"),
            ("enrollment_state[]", "active"),
            ("enrollment_state[]", "completed"),
        ])
        progress_by_id = {str(p["id"]): p.get("progress") or {} for p in fetch_all(base_url, token, f"{course_path}/bulk_user_progress", [])}

        created, already_held, unfinished, no_profile = [], [], 0, []

        for student in students:
            completed_at = progress_by_id.get(str(student["id"]), {}).get("completed_at")

            # completed_at stays null until every requirement in the course is met.
            if not completed_at:
                unfinished += 1
                continue

            # UMich Canvas login_id is the uniqname; tolerate an email-style login just in case.
            uniqname = (student.get("login_id") or "").split("@")[0].lower()
            recipient = User.objects.filter(uniqname=uniqname).first() if uniqname else None

            if recipient is None:
                no_profile.append(uniqname or f"canvas user {student['id']}")
                continue

            if Credential.objects.filter(recipient_user=recipient, credential_model=course.credential_model).exists():
                already_held.append(uniqname)
                continue

            Credential.objects.create(
                credential_model=course.credential_model,
                issuing_makerspace=course.issuing_makerspace,
                author_user_id=course.author_user_id,
                recipient_user=recipient,
                credential_status=CredentialStatus.ACTIVE_USER,
                completion_date=completion_date(completed_at),
                expiration_date=None,
            )
            created.append(uniqname)

        course.last_synced_at = timezone.now()
        course.save(update_fields=["last_synced_at", "last_updated"])

        self.stdout.write(f"\nCanvas course {course.canvas_course_id} -> {course.credential_model.credential_model_name} "
                          f"({course.issuing_makerspace.makerspace_name})")
        self.stdout.write(f"  students: {len(students)}   not finished: {unfinished}")
        self.stdout.write(f"  credentials created: {len(created)}  {', '.join(created)}")
        self.stdout.write(f"  already held (skipped): {len(already_held)}  {', '.join(already_held)}")
        # These students finished but have never signed in; they'll be picked up on a later run once they have a profile.
        self.stdout.write(f"  no profile yet (skipped): {len(no_profile)}  {', '.join(no_profile)}")
