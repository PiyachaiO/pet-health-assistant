1. ตาราง users
คำอธิบาย: เก็บข้อมูลผู้ใช้ระบบ
| Field | Type | Relation |
| :--- | :--- | :--- |
| id | uuid | PK (Primary Key) |
| email | varchar | Unique |
| password_hash | varchar | |
| full_name | varchar | |
| role | USER-DEFINED | |
| phone | varchar | |
| address | text | |
| profile_picture_url | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

2. ตาราง pets
คำอธิบาย: เก็บข้อมูลสัตว์เลี้ยง
| Field | Type | Relation |
| :--- | :--- | :--- |
| id | uuid | PK |
| user_id | uuid | FK to users(id) |
| name | varchar | |
| species | varchar | |
| breed | varchar | |
| birth_date | date | |
| gender | USER-DEFINED | |
| weight | numeric | |
| color | varchar | |
| microchip_id | varchar | |
| photo_url | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

3. ตาราง appointments
คำอธิบาย: เก็บข้อมูลการนัดหมายระหว่างผู้ใช้กับสัตวแพทย์
| Field | Type | Relation |
| :--- | :--- | :--- |
| id | uuid | PK |
| user_id | uuid | FK to users(id) |
| pet_id | uuid | FK to pets(id) |
| veterinarian_id | uuid | FK to users(id) |
| appointment_type | USER-DEFINED | |
| appointment_date | timestamptz | |
| status | USER-DEFINED | |
| notes | text | |
| diagnosis | text | |
| treatment | text | |
| approval_status | USER-DEFINED | |
| approved_by | uuid | FK to users(id) |
| approved_at | timestamptz | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

4. ตาราง health_records
คำอธิบาย: เก็บข้อมูลประวัติสุขภาพสัตว์เลี้ยง
| Field | Type | Relation |
| :--- | :--- | :--- |
| id | uuid | PK |
| pet_id | uuid | FK to pets(id) |
| record_type | USER-DEFINED | |
| title | varchar | |
| description | text | |
| record_date | date | |
| next_due_date | date | |
| veterinarian_id | uuid | FK to users(id) |
| attachments | jsonb | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

5. ตาราง nutrition_guidelines
คำอธิบาย: เก็บข้อมูลคำแนะนำด้านโภชนาการสำหรับสัตว์เลี้ยง
| Field | Type | Relation |
| :--- | :--- | :--- |
| id | uuid | PK |
| veterinarian_id | uuid | FK to users(id) |
| species | varchar | |
| age_range | varchar | |
| daily_calories | integer | |
| protein_percentage | numeric | |
| fat_percentage | numeric | |
| feeding_frequency | integer | |
| instructions | text | |
| approval_status | USER-DEFINED | |
| approved_by | uuid | FK to users(id) |
| approved_at | timestamptz | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

6. ตาราง pet_nutrition_plans
คำอธิบาย: เชื่อมโยงสัตว์เลี้ยงเข้ากับแผนโภชนาการ
| Field | Type | Relation |
| :--- | :--- | :--- |
| id | uuid | PK |
| pet_id | uuid | FK to pets(id) |
| guideline_id | uuid | FK to nutrition_guidelines(id) |
| custom_calories | integer | |
| custom_instructions | text | |
| start_date | date | |
| end_date | date | |
| is_active | boolean | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

7. ตาราง notifications
คำอธิบาย: เก็บข้อมูลการแจ้งเตือน
| Field | Type | Relation |
| :--- | :--- | :--- |
| id | uuid | PK |
| user_id | uuid | FK to users(id) |
| pet_id | uuid | FK to pets(id) |
| notification_type | USER-DEFINED | |
| title | varchar | |
| message | text | |
| due_date | date | |
| priority | USER-DEFINED | |
| is_read | boolean | |
| is_completed | boolean | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

8. ตาราง articles
คำอธิบาย: เก็บข้อมูลบทความ
| Field | Type | Relation |
| :--- | :--- | :--- |
| id | uuid | PK |
| author_id | uuid | FK to users(id) |
| title | varchar | |
| excerpt | text | |
| content | text | |
| category | varchar | |
| featured_image_url | text | |
| is_published | boolean | |
| published_at | timestamptz | |
| created_at | timestamptz | |
| updated_at | timestamptz | |