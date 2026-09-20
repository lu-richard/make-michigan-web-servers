from django.db import migrations

CREATE_USER_TRAININGS_VIEW = """
CREATE VIEW user_trainings_view AS
SELECT
    p.user_id,
    p.uniqname,
    p.first_name,
    p.last_name,
    (
        SELECT JSON_ARRAYAGG(t.credential_model_name)
        FROM (
            SELECT DISTINCT cm2.credential_model_name
            FROM credentials c2
            JOIN credential_models cm2 ON c2.credential_model_id = cm2.credential_model_id
            WHERE c2.recipient_user_id = p.user_id
              AND cm2.credential_type = 'safety'
              AND c2.credential_status = 'active_user'
        ) t
    ) AS completed_trainings
FROM profiles p
WHERE EXISTS (
    SELECT 1
    FROM credentials c
    JOIN credential_models cm ON c.credential_model_id = cm.credential_model_id
    WHERE c.recipient_user_id = p.user_id
      AND cm.credential_type = 'safety'
      AND c.credential_status = 'active_user'
)
"""

CREATE_CREDENTIAL_MODEL_PREREQS_VIEW = """
CREATE VIEW view_credential_model_prerequisites AS
SELECT
    cm1.credential_model_name AS prerequisite_credential_model_name,
    cm2.credential_model_name AS dependent_credential_model_name
FROM credential_models cm1
JOIN credential_model_prerequisites cmp ON cm1.credential_model_id = cmp.prerequisite_credential_model_id
JOIN credential_models cm2 ON cm2.credential_model_id = cmp.dependent_credential_model_id
"""

CREATE_CREDENTIALS_ADMIN_VIEW = """
CREATE VIEW view_credentials_admin AS
SELECT
    c.recipient_user_id,
    c.credential_id,
    c.completion_date,
    cm.credential_model_name,
    c.credential_status,
    m.makerspace_name
FROM credentials c
JOIN credential_models cm ON c.credential_model_id = cm.credential_model_id
JOIN makerspaces m ON c.issuing_makerspace_id = m.makerspace_id
"""

CREATE_EQUIPMENT_DETAIL_PAGES_VIEW = """
CREATE VIEW view_equipment_detail_pages AS
SELECT
    e.equipment_id,
    e.equipment_status,
    (
        SELECT JSON_ARRAYAGG(mat.name)
        FROM equipment_accepted_materials eam
        JOIN materials mat ON mat.material_id = eam.material_id
        WHERE eam.equipment_id = e.equipment_id
    ) AS materials,
    (
        SELECT JSON_ARRAYAGG(mat.name)
        FROM equipment_restricted_materials erm
        JOIN materials mat ON mat.material_id = erm.material_id
        WHERE erm.equipment_id = e.equipment_id
    ) AS restricted_materials,
    e.in_situ_image_url,
    e.last_serviced,
    e.specific_specs AS equipment_specific_specs,
    e.notes,
    em.equipment_model_name,
    em.model,
    em.make,
    em.equipment_type,
    em.specs_url,
    em.is_cnc,
    em.manufacturer_image_urls,
    (
        SELECT JSON_ARRAYAGG(cap.name)
        FROM equipment_model_capabilities emc
        JOIN capabilities cap ON cap.capability_id = emc.capability_id
        WHERE emc.equipment_model_id = em.equipment_model_id
    ) AS capabilities,
    em.specific_specs AS equipment_model_specific_specs,
    m.makerspace_id,
    m.makerspace_name,
    m.building,
    m.rooms,
    cm.credential_model_id,
    cm.credential_model_name
FROM equipment e
JOIN equipment_models em ON e.equipment_model_id = em.equipment_model_id
JOIN makerspaces m ON e.makerspace_id = m.makerspace_id
LEFT JOIN credential_models cm ON e.credential_model_id = cm.credential_model_id
"""

CREATE_ISSUE_REPORT_CARDS_VIEW = """
CREATE VIEW view_issue_report_cards AS
SELECT
    ir.issue_report_id,
    ir.issue_type,
    ir.is_resolved,
    m.makerspace_id,
    e.equipment_name,
    ir.title,
    ir.description,
    ir.created_at,
    r.first_name AS reporter_first_name,
    r.last_name AS reporter_last_name,
    o.first_name AS overseer_first_name,
    o.last_name AS overseer_last_name
FROM issue_reports ir
LEFT JOIN profiles r ON ir.reporter_user_id = r.user_id
LEFT JOIN profiles o ON ir.overseer_user_id = o.user_id
JOIN equipment e ON ir.equipment_id = e.equipment_id
JOIN makerspaces m ON e.makerspace_id = m.makerspace_id
"""

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

CREATE_CREDENTIAL_SUMMARY_VIEW = """
CREATE VIEW credential_summary AS
SELECT
    c.recipient_user_id,
    c.credential_id,
    c.credential_model_id,
    cm.credential_model_name,
    c.credential_status,
    a.first_name AS author_first_name,
    a.last_name AS author_last_name,
    c.completion_date,
    c.expiration_date,
    m.makerspace_name
FROM credentials c
LEFT JOIN credential_models cm ON cm.credential_model_id = c.credential_model_id
LEFT JOIN profiles a ON a.user_id = c.author_user_id
LEFT JOIN makerspaces m ON m.makerspace_id = c.issuing_makerspace_id
"""

CREATE_EQUIPMENT_CARDS_VIEW = """
CREATE VIEW view_equipment_cards AS
SELECT
    e.equipment_id,
    em.equipment_model_name,
    m.building,
    m.rooms,
    em.equipment_type,
    (
        SELECT JSON_ARRAYAGG(cap.name)
        FROM equipment_model_capabilities emc
        JOIN capabilities cap ON cap.capability_id = emc.capability_id
        WHERE emc.equipment_model_id = em.equipment_model_id
    ) AS capabilities,
    em.manufacturer_image_urls,
    (
        SELECT JSON_ARRAYAGG(mat.name)
        FROM equipment_accepted_materials eam
        JOIN materials mat ON mat.material_id = eam.material_id
        WHERE eam.equipment_id = e.equipment_id
    ) AS materials
FROM equipment e
JOIN equipment_models em ON e.equipment_model_id = em.equipment_model_id
JOIN makerspaces m ON e.makerspace_id = m.makerspace_id
"""

CREATE_MAKERSPACE_CARDS_VIEW = """
CREATE VIEW view_makerspace_cards AS
SELECT
    m.makerspace_id,
    m.makerspace_name,
    m.cover_image,
    m.building,
    m.rooms,
    m.description,
    m.themes
FROM makerspaces m
"""

VIEWS = [
    (CREATE_USER_TRAININGS_VIEW, "user_trainings_view"),
    (CREATE_CREDENTIAL_MODEL_PREREQS_VIEW, "view_credential_model_prerequisites"),
    (CREATE_CREDENTIALS_ADMIN_VIEW, "view_credentials_admin"),
    (CREATE_EQUIPMENT_DETAIL_PAGES_VIEW, "view_equipment_detail_pages"),
    (CREATE_ISSUE_REPORT_CARDS_VIEW, "view_issue_report_cards"),
    (CREATE_MAKERSPACE_DETAIL_PAGES_VIEW, "view_makerspace_detail_pages"),
    (CREATE_CREDENTIAL_SUMMARY_VIEW, "credential_summary"),
    (CREATE_EQUIPMENT_CARDS_VIEW, "view_equipment_cards"),
    (CREATE_MAKERSPACE_CARDS_VIEW, "view_makerspace_cards"),
]


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(sql=sql, reverse_sql=f"DROP VIEW IF EXISTS {name}")
        for sql, name in VIEWS
    ]
