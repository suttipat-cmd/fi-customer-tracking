# FI Customer Tracking Web App

> **Current version:** `0.8.0-customer-data-restructure`  
> **Base version:** `0.7.1-settings-hotfix`  
> **Runtime:** GitHub Pages + Plain HTML/CSS/JavaScript + Supabase Auth/PostgreSQL/Storage  
> **Repository runtime files:** 4 files only

## Release status

Version `0.8.0-customer-data-restructure` restructures customer data into six sections, adds contract/training data, profile position and editable display name, replaces date-pair filters with a date-range modal, hardens master-data ordering, and removes discontinued external links, operations and activity-history resources.

Migration `006_customer_data_restructure` is **destructive**. Before running it, export these tables if historical data may be needed:

- `external_links`
- `customer_operations`
- `customer_activities`
- related `customer_audit_logs` rows for Operations/Activities

The rollback recreates their former schema but cannot restore deleted rows without a backup.

## Changelog

### 0.8.0-customer-data-restructure

- เปลี่ยนตัวกรองช่วงวันที่เป็น Modal มีช่วงด่วน เดือนนี้, เดือนที่แล้ว, ปีนี้, ปีที่แล้ว, จากวันที่, ถึงวันที่, ล้างค่า, ยกเลิก และบันทึก
- ปรับข้อมูลลูกค้าเป็น 6 ส่วน: ข้อมูลพื้นฐาน, สถานะและวันที่, ผู้รับผิดชอบ, ผู้ติดต่อ, โมดูลและฟังก์ชัน, สัญญาและการอบรม
- หน้า `สร้างลูกค้า` แสดงและบันทึกทุกส่วนเหมือนหน้าแก้ไข โดยใช้ RPC แบบ Transaction เดียว
- เพิ่ม `customers.contract_type` และ Master `contract_type` ค่าเริ่มต้น `รายเดือน`, `รายปี`
- เพิ่ม `customers.onsite_training_count` เป็นจำนวนเต็ม ค่าเริ่มต้น `0`
- ตัด `customer_operations`, `customer_activities` และ `external_links` ออกจาก Frontend และฐานข้อมูล
- เพิ่ม `profiles.position`; หน้าเว็บแสดงตำแหน่งแทนสิทธิ์การใช้งานในข้อมูลส่วนตัวและ Topbar
- ผู้ใช้งานแก้ชื่อที่แสดงและตำแหน่งของตนเองได้; Admin แก้ให้ทุกบัญชีได้
- บังคับ `sort_order` ของ Master/Module/Feature ให้เป็น `1–9999` และห้ามซ้ำภายในหมวดเดียวกัน
- แก้การลบลูกค้าให้เอารายการออกจาก State และตารางทันทีหลัง Soft Delete สำเร็จ
- ภาพ Login ไม่บังคับอัตราส่วนไฟล์ แต่แสดงด้วยกรอบ 1:1 และ `object-fit: cover`
- อัปเดต Customer Detail, Create, Edit, Excel Export, Filters, RLS/RPC, Migration, Verify และ Rollback
- Cache busting และ internal version stamp เป็น `0.8.0-customer-data-restructure`

### 0.7.1-settings-hotfix

- แก้การอัปเดตหน้าตั้งค่าให้เปลี่ยนเฉพาะส่วนที่เกี่ยวข้อง
- แยกการโหลด Master จากข้อมูลร่วม
- ปรับ Favicon MIME และทำ Public Branding เป็น optional failure
- ปรับ Module/Feature code validation ให้ตรงกับฐานข้อมูล

## 1. Current system scope

ระบบรองรับ:

1. Login/Logout และ Session ผ่าน Supabase Auth
2. Role `admin`, `manager`, `user`
3. Customer CRUD แบบ Soft Delete โดยไม่มี Hard Delete จาก Frontend
4. Customer Create/Detail/Edit ตามโครงสร้างหกส่วน
5. ผู้รับผิดชอบหลายคนและผู้รับผิดชอบหลักไม่เกินหนึ่งคน
6. ผู้ติดต่อหลายคนและผู้ติดต่อหลักที่เปิดใช้งานไม่เกินหนึ่งคน
7. Module และ Feature หลายรายการต่อลูกค้า
8. Daily Report หนึ่งฉบับต่อผู้ใช้ต่อวัน พร้อม Manager acknowledge/revision
9. Profile avatar, display name, position และ Theme
10. Admin Branding และ Master Data
11. Excel Export จากข้อมูลที่ผ่านตัวกรองและลำดับปัจจุบัน
12. Audit ลูกค้าจาก Database Trigger

ทรัพยากรที่ยกเลิกแล้วและต้องไม่มีในระบบหลัง Migration 006:

- External website links
- Customer operations
- Customer activity history

## 2. Repository structure

```text
README.md
index.html
script.js
style.css
```

SQL เป็น deployment artifacts แยกจาก Repository runtime:

```text
001_initial_schema.sql
001_initial_schema_verify.sql
001_initial_schema_rollback.sql
002_bootstrap_roles_template.sql
003_frontend_support.sql
003_frontend_support_verify.sql
003_frontend_support_rollback.sql
004_profile_preferences.sql
004_profile_preferences_verify.sql
004_profile_preferences_rollback.sql
005_system_settings_media_master_data.sql
005_system_settings_media_master_data_verify.sql
005_system_settings_media_master_data_rollback.sql
006_customer_data_restructure.sql
006_customer_data_restructure_verify.sql
006_customer_data_restructure_rollback.sql
```

## 3. Roles and permissions

| Resource / Action | Admin | Manager | User |
|---|---:|---:|---:|
| อ่านลูกค้าที่ยังไม่ถูกลบ | Yes | Yes | Yes |
| สร้าง/แก้ไขลูกค้า | Yes | Yes | Yes |
| Soft Delete ลูกค้า | Yes | Yes | Yes |
| Hard Delete / Restore ผ่าน Frontend | No | No | No |
| อ่านรายงานของตนเอง | Yes | Yes | Yes |
| อ่านรายงานทั้งหมด | Yes | Yes | No |
| Acknowledge / Request revision | Yes | Yes | No |
| จัดการ Role/Active ของบัญชีอื่น | Yes | No | No |
| แก้ชื่อที่แสดง/ตำแหน่งตนเอง | Yes | Yes | Yes |
| แก้ชื่อที่แสดง/ตำแหน่งผู้อื่น | Yes | No | No |
| จัดการ Branding | Yes | No | No |
| จัดการ Master Data | Yes | No | No |
| เปลี่ยน Avatar ตนเอง | Yes | Yes | Yes |
| เปลี่ยน Avatar ผู้อื่น | Yes | No | No |

ข้อกำหนด Role:

- บัญชีต้องมี `profiles.is_active = true` จึงใช้งานระบบได้
- มี Active Manager ได้ไม่เกินหนึ่งบัญชี
- Admin เปลี่ยน Role หรือปิดบัญชีตัวเองผ่าน Admin RPC ไม่ได้
- `user_id`/`profiles.id` เป็น source of truth ไม่ใช่อีเมลหรือชื่อที่แสดง

## 4. Customer model and flow

### 4.1 Sections

1. **ข้อมูลพื้นฐาน**
   - ชื่อนิติบุคคล *
   - ชื่อย่อ
   - เลขประจำตัวผู้เสียภาษี *
   - จำนวนรถ *
   - สถานะบัญชี * — ค่าเริ่มต้น `active`

2. **สถานะและวันที่**
   - สถานะการนำเข้าข้อมูล
   - ขั้นตอนเริ่มใช้งาน
   - ระดับความสนใจ
   - วันที่เริ่มใช้งานจริง
   - วันที่เริ่มวางบิล

3. **ผู้รับผิดชอบ**
   - ผู้รับผิดชอบ 0 คนขึ้นไป
   - ผู้รับผิดชอบหลักได้ไม่เกินหนึ่งคนและต้องอยู่ในรายการที่เลือก

4. **ผู้ติดต่อ**
   - ผู้ติดต่อ 0 คนขึ้นไป
   - ผู้ติดต่อหลักที่เปิดใช้งานได้ไม่เกินหนึ่งคน

5. **โมดูลและฟังก์ชัน**
   - Module 0 รายการขึ้นไป
   - Feature 0 รายการขึ้นไป

6. **สัญญาและการอบรม**
   - ประเภทสัญญา * จาก Master `contract_type`
   - จำนวนครั้งสอนใช้งานนอกสถานที่ เป็นจำนวนเต็ม `0–999999`

### 4.2 Save behavior

- Create ใช้ `create_customer_complete` เพื่อบันทึก Customer, Owners, Contacts, Modules และ Features ใน Transaction เดียว
- Edit บันทึกตามลำดับ Core → Owners → Modules/Features → Contacts
- Edit เป็น sequential save ไม่ใช่ Transaction รวม หากส่วนหลังล้มเหลว ส่วนก่อนหน้าอาจบันทึกแล้ว
- Soft Delete ใช้ `archive_customer`; หลังสำเร็จ Frontend ต้องลบรายการจาก State และ Grid ทันที
- รายการ `is_archived = true` ไม่แสดงใน Dashboard, List, Detail หรือ Edit
- ไม่มี Restore UI และไม่มี Hard Delete Policy สำหรับ Client

### 4.3 Validation

- `tax_id`: ตัวเลข 13 หลักและไม่ซ้ำ
- `fleet_size`: จำนวนเต็มตั้งแต่ 0
- `account_status`: `active`, `inactive`
- `onboarding_stage`, `import_status`, `engagement_level`, `contract_type`: ตรวจด้วย Master Trigger
- วันที่เก็บเป็น PostgreSQL `date`; Frontend แสดง `DD/MM/YYYY`
- Timestamp แสดง `DD/MM/YYYY HH:mm` ตาม `Asia/Bangkok`

## 5. Date-range filter

Customer Advanced Filters ใช้ปุ่มเปิด Modal แทนช่อง From/To แยกกัน:

- ช่วงด่วน: เดือนนี้, เดือนที่แล้ว, ปีนี้, ปีที่แล้ว
- จากวันที่ / ถึงวันที่
- ล้างค่า / ยกเลิก / บันทึก
- ยังไม่ใช้ค่าร่างจนกดบันทึก
- จากวันที่ต้องไม่เกินถึงวันที่
- รองรับช่วง `start_date` และ `billing_date`

## 6. Master data

กลุ่มปัจจุบัน:

| Group | Storage |
|---|---|
| `modules` | `modules` |
| `features` | `features` |
| `onboarding_stage` | `master_options` |
| `import_status` | `master_options` |
| `engagement_level` | `master_options` |
| `contract_type` | `master_options` |

กฎ:

- Code/Value ห้ามว่าง
- Module/Feature code ใช้ `a-z`, `0-9`, `_`
- `sort_order` ต้องเป็นจำนวนเต็ม `1–9999`
- `sort_order` ห้ามซ้ำภายใน Master กลุ่มเดียวกัน
- รายการที่ถูกใช้งานแล้วให้ปิด `is_active` แทนการลบ
- Frontend บันทึกผ่าน `admin_save_master_item`; Authenticated Client ไม่มีสิทธิ์เขียนตาราง Master โดยตรง
- Contract seeds:
  - `monthly` → รายเดือน
  - `annual` → รายปี

## 7. Current database schema

### 7.1 `profiles`

| Column | Type | Null | Notes |
|---|---|---:|---|
| `id` | `uuid` | No | PK, FK → `auth.users.id` |
| `display_name` | `text` | No | 1–200 |
| `email` | `text` | No | Unique by lowercase |
| `position` | `text` | Yes | 1–200 when present |
| `role` | `text` | No | `admin`, `manager`, `user` |
| `is_active` | `boolean` | No | default `true` |
| `theme_mode` | `text` | No | `light`, `dark`, `system` |
| `theme_accent` | `text` | No | HEX `#RRGGBB` |
| `avatar_path` | `text` | Yes | `avatars/<profile_id>/...` |
| `created_at` | `timestamptz` | No | |
| `updated_at` | `timestamptz` | No | |

Indexes: lowercase email unique; partial unique active manager.

### 7.2 `customers`

| Column | Type | Null | Notes |
|---|---|---:|---|
| `id` | `uuid` | No | PK |
| `legacy_customer_id` | `text` | Yes | Partial unique |
| `legal_name` | `text` | No | 1–500 |
| `short_name` | `text` | Yes | 1–300 |
| `tax_id` | `text` | No | Unique, 13 digits |
| `fleet_size` | `integer` | No | default 0, nonnegative |
| `account_status` | `text` | No | `active`, `inactive` |
| `onboarding_stage` | `text` | Yes | Master controlled |
| `import_status` | `text` | No | Master controlled |
| `engagement_level` | `text` | Yes | Master controlled |
| `start_date` | `date` | Yes | |
| `billing_date` | `date` | Yes | |
| `contract_type` | `text` | No | Master controlled, default `monthly` |
| `onsite_training_count` | `integer` | No | default 0, `0–999999` |
| `is_archived` | `boolean` | No | Soft delete |
| `archived_at` | `timestamptz` | Yes | |
| `archived_by` | `uuid` | Yes | FK → profiles |
| `created_at` | `timestamptz` | No | |
| `created_by` | `uuid` | No | FK → profiles |
| `updated_at` | `timestamptz` | No | |
| `updated_by` | `uuid` | No | FK → profiles |
| `legacy_created_by_email` | `text` | Yes | Import snapshot |
| `legacy_updated_by_email` | `text` | Yes | Import snapshot |

### 7.3 Customer relation tables

`customer_owners`

| Column | Type | Notes |
|---|---|---|
| `customer_id` | `uuid` | PK part, FK → customers, cascade |
| `profile_id` | `uuid` | PK part, FK → profiles |
| `is_primary` | `boolean` | Partial unique per customer |
| `created_at`, `updated_at` | `timestamptz` | |
| `created_by`, `updated_by` | `uuid` | FK → profiles |

`customer_contacts`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `customer_id` | `uuid` | FK → customers, cascade |
| `contact_name` | `text` | required |
| `position`, `phone`, `email`, `line_id` | `text` | optional |
| `is_primary`, `is_active` | `boolean` | |
| metadata columns | | actor/timestamps |

`modules` / `features`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `code` | `text` | unique, lowercase code |
| `name` | `text` | required |
| `sort_order` | `integer` | unique per table, 1–9999 |
| `is_active` | `boolean` | |
| `created_at`, `updated_at` | `timestamptz` | |

`customer_modules` and `customer_features` are composite-key join tables with actor/timestamp metadata.

### 7.4 `master_options`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `group_key` | `text` | supported groups only |
| `option_value` | `text` | unique by group and lowercase value |
| `display_name` | `text` | 1–200 |
| `sort_order` | `integer` | 1–9999, unique per group |
| `is_active` | `boolean` | |
| `created_at`, `updated_at` | `timestamptz` | |
| `created_by`, `updated_by` | `uuid` | FK → profiles |

### 7.5 `app_settings`

Singleton row `id = 1`:

- `login_image_path`
- `favicon_path`
- `updated_at`
- `updated_by`

Public select contains only safe branding paths. Admin is the only writer.

### 7.6 Audit and Daily Report

`customer_audit_logs` stores immutable Customer/child change snapshots produced by triggers.

`daily_reports`

- One row per `(user_id, work_date)`
- Status: `draft`, `submitted`, `acknowledged`, `revision_required`
- `content_version` protects Manager actions from stale content
- Submit/acknowledge/revision timestamps and actors

`daily_report_items`

- FK → daily report
- `section`: `today`, `tomorrow`
- Optional `customer_id`
- Text 1–5,000
- Position and metadata

`daily_report_events`

- Immutable workflow event history
- Event types: created, submitted, resubmitted, acknowledged, revision_requested

## 8. RPC and security model

Important RPCs:

- `create_customer_complete`
- `save_customer_owners`
- `save_customer_contact`
- `archive_customer`
- `submit_daily_report`
- `acknowledge_daily_report`
- `request_daily_report_revision`
- `update_my_profile_details`
- `update_my_profile_preferences`
- `update_my_avatar_path`
- `admin_update_profile_full`
- `admin_update_profile_avatar`
- `admin_save_master_item`

Security rules:

- RLS enabled on every frontend-accessible table
- No `service_role` key in Frontend
- Browser uses Supabase publishable/anon key only
- Security-definer RPCs validate active user/admin internally and set `search_path = pg_catalog`
- Authenticated role cannot directly mutate `master_options`, `modules`, or `features` after Migration 006
- Storage:
  - `app-public-media`: public branding read, admin write
  - `app-profile-media`: authenticated private read; self/admin write by path policy
- External URLs and external-link table no longer exist

## 9. Environment and configuration

`script.js` contains public browser configuration only:

```js
const SUPABASE_URL = "https://<project-ref>.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "<publishable-or-anon-key>";
```

Never place these values in Frontend/README/logs:

- Database password
- `service_role` key
- Access token
- Refresh token
- Private API key

## 10. Migration and deployment

### Required order

1. Back up discontinued tables before Migration 006
2. Run `006_customer_data_restructure.sql`
3. Run `006_customer_data_restructure_verify.sql`
4. Deploy the four Frontend files together
5. Hard refresh browser cache
6. Smoke-test with Admin, Manager and User

### Local static run

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

Do not rely on `file://` because browser security behavior differs from GitHub Pages.

### Git deployment

```bash
git pull --rebase origin main
git status
git add README.md index.html script.js style.css
git commit -m "feat: restructure customer data and master workflow v0.8.0"
git push origin main
```

### Rollback

1. Revert Frontend to `0.7.1-settings-hotfix`
2. Run `006_customer_data_restructure_rollback.sql`
3. Restore discontinued table rows from backup when needed
4. Run smoke tests again

The rollback cannot reconstruct deleted historical rows by itself.

## 11. Test checklist

Minimum runtime checks:

- Login/logout/session refresh for all roles
- Create customer with all six sections
- Edit each customer section
- Soft delete from list and detail; row disappears immediately
- Customer date-range modal presets/manual/clear/cancel/save
- Excel export reflects filters and new fields
- Add/edit/deactivate every Master group
- Duplicate/zero sort order is rejected
- Contract monthly/yearly options load in Create/Edit
- Edit own display name/position
- Admin edits another profile name/position/role/status
- Login branding with portrait, landscape and square images
- Daily report create/edit/submit/acknowledge/revision
- Mobile layout, keyboard focus and dialogs

## 12. Known limitations

- Customer Edit remains sequential; it is not a single transaction across all sections.
- Lists are client-side and currently capped by query limits in `script.js`.
- CDN dependencies require internet access.
- SQL artifacts are kept outside the four-file runtime repository, so migration files must be archived separately.
- Static validation does not replace testing against the real Supabase schema, RLS, Storage and real role accounts.
