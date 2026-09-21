from django.db import migrations

DROP_MAKERSPACE_DETAIL_PAGES_VIEW = "DROP VIEW IF EXISTS view_makerspace_detail_pages"

CREATE_MAKERSPACE_DETAIL_PAGES_VIEW = """
CREATE VIEW view_makerspace_detail_pages AS
SELECT
    m.makerspace_id,
    m.makerspace_name,
    m.description,
    m.makerspace_status,
    m.cover_image,
    m.building,
    m.rooms,
    m.contact_email,
    m.contact_phone,
    m.audience,
    m.themes,
    m.floorplan_image,
    m.staff_ids,
    COALESCE(
        (
            SELECT JSON_ARRAYAGG(JSON_OBJECT('equipment_id', eo.equipment_id, 'equipment_name', eo.equipment_name))
            FROM (
                SELECT equipment_id, equipment_name
                FROM equipment
                WHERE makerspace_id = m.makerspace_id
                ORDER BY equipment_name
            ) eo
        ),
        JSON_ARRAY()
    ) AS equipment_list
FROM makerspaces m
"""

# Reverse: restore the previous version, which derived staff_ids from the (empty)
# makerspace_staff junction table instead of reading the column directly.
CREATE_MAKERSPACE_DETAIL_PAGES_VIEW_PREVIOUS = """
CREATE VIEW view_makerspace_detail_pages AS
SELECT
    m.makerspace_id,
    m.makerspace_name,
    m.description,
    m.makerspace_status,
    m.cover_image,
    m.building,
    m.rooms,
    m.contact_email,
    m.contact_phone,
    m.audience,
    m.themes,
    m.floorplan_image,
    (
        SELECT JSON_ARRAYAGG(ms.user_id)
        FROM makerspace_staff ms
        WHERE ms.makerspace_id = m.makerspace_id
    ) AS staff_ids,
    COALESCE(
        (
            SELECT JSON_ARRAYAGG(JSON_OBJECT('equipment_id', eo.equipment_id, 'equipment_name', eo.equipment_name))
            FROM (
                SELECT equipment_id, equipment_name
                FROM equipment
                WHERE makerspace_id = m.makerspace_id
                ORDER BY equipment_name
            ) eo
        ),
        JSON_ARRAY()
    ) AS equipment_list
FROM makerspaces m
"""


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_remove_post_user_makerspace_staff_ids_and_more'),
    ]

    operations = [
        migrations.RunSQL(
            sql=[DROP_MAKERSPACE_DETAIL_PAGES_VIEW, CREATE_MAKERSPACE_DETAIL_PAGES_VIEW],
            reverse_sql=[DROP_MAKERSPACE_DETAIL_PAGES_VIEW, CREATE_MAKERSPACE_DETAIL_PAGES_VIEW_PREVIOUS],
        ),
    ]
