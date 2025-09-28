# Pet Health Assistant – API Contract (Summary)

| # | Method | Path | Auth | Request Body (ย่อ) | Response (ย่อ) |
|---|--------|------|------|--------------------|----------------|
| **Auth** ||||||
| 1 | POST | `/api/auth/register` | ❌ | `{ email, password, full_name, role, phone, address }` | `201 { user_id, ... }` |
| 2 | POST | `/api/auth/login` | ❌ | `{ email, password }` | `200 { access_token, user }` |
| 3 | POST | `/api/auth/logout` | ✅ | - | `200 { message }` |
| **Users** ||||||
| 4 | GET | `/api/users/profile` | ✅ | - | `200 { profile }` |
| 5 | PUT | `/api/users/profile` | ✅ | `{ full_name?, phone?, address? }` | `200 { profile }` |
| **Pets** ||||||
| 6 | GET | `/api/pets` | ✅ | - | `200 [ { pet } ]` |
| 7 | POST | `/api/pets` | ✅ | `{ name, species, breed?, birth_date?, weight?, gender?, color? }` | `201 { pet }` |
| 8 | GET | `/api/pets/:id` | ✅ | - | `200 { pet }` |
| 9 | PUT | `/api/pets/:id` | ✅ | `{ ...fields }` | `200 { pet }` |
| 10 | DELETE | `/api/pets/:id` | ✅ | - | `204` |
| 11 | GET | `/api/pets/:id/health-records` | ✅ | - | `200 [ { record } ]` |
| 12 | POST | `/api/pets/:id/health-records` | ✅ | `{ record_date, diagnosis, treatment, weight?, notes? }` | `201 { record }` |
| **Appointments** ||||||
| 13 | GET | `/api/appointments` | ✅ | - | `200 [ { appointment } ]` |
| 14 | POST | `/api/appointments` | ✅ | `{ pet_id, vet_id, appointment_date, reason, notes? }` | `201 { appointment }` |
| 15 | GET | `/api/appointments/vet` | ✅(Vet) | - | `200 [ { appointment } ]` |
| 16 | PATCH | `/api/appointments/:id/cancel` | ✅ | - | `200 { appointment }` |
| 17 | PATCH | `/api/appointments/:id/status` | ✅ | `{ status }` | `200 { appointment }` |
| **Articles** ||||||
| 18 | GET | `/api/articles` | ❌ | - | `200 [ { article } ]` |
| 19 | GET | `/api/articles/:id` | ❌ | - | `200 { article }` |
| 20 | POST | `/api/articles` | ✅(Admin/Vet) | `{ title, content, summary?, tags? }` | `201 { article }` |
| **Notifications** ||||||
| 21 | GET | `/api/notifications` | ✅ | - | `200 [ { notification } ]` |
| 22 | GET | `/api/notifications/unread/count` | ✅ | - | `200 { count }` |
| 23 | PATCH | `/api/notifications/:id/mark-read` | ✅ | - | `200 { notification }` |
| 24 | PATCH | `/api/notifications/:id/mark-completed` | ✅ | - | `200 { notification }` |
| **Nutrition** ||||||
| 25 | GET | `/api/nutrition/guidelines` | ❌ | - | `200 [ { guideline } ]` |
| 26 | GET | `/api/pets/:id/nutrition-plans` | ✅ | - | `200 [ { plan } ]` |
| 27 | GET | `/api/nutrition/recommendations` | ✅ | - | `200 { recommendations }` |
| 28 | POST | `/api/nutrition/guidelines` | ✅(Admin/Vet) | `{ title, description, species, age_group, diet_type }` | `201 { guideline }` |
| **File Upload** ||||||
| 29 | POST | `/api/upload` | ✅ | FormData: `file` | `201 { file }` |
| 30 | GET | `/api/upload` | ✅ | - | `200 [ { file } ]` |
| **Vet** ||||||
| 31 | GET | `/api/vet/appointments` | ✅(Vet) | - | `200 [ { appointment } ]` |
| 32 | POST | `/api/vet/nutrition-guidelines` | ✅(Vet) | `{ ...guideline }` | `201 { guideline }` |
| **Admin** ||||||
| 33 | GET | `/api/admin/pending-approvals` | ✅(Admin) | - | `200 [ { approval } ]` |
| 34 | PATCH | `/api/admin/appointments/:id/approve` | ✅(Admin) | `{ notes? }` | `200 { appointment }` |
| 35 | PATCH | `/api/admin/nutrition-guidelines/:id/approve` | ✅(Admin) | `{ notes? }` | `200 { guideline }` |
| 36 | GET | `/api/admin/statistics` | ✅(Admin) | - | `200 { stats }` |
