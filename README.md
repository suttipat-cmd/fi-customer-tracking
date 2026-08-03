# FI Customer Tracking Web App

> **Current version:** `0.10.0-sales-notes-profile-theme`  
> **Base version:** `0.9.0-customer-accounts-report-groups`  
> **Runtime:** GitHub Pages + Plain HTML/CSS/JavaScript + Supabase Auth/PostgreSQL/Storage  
> **Repository runtime files:** `README.md`, `index.html`, `script.js`, `style.css`

## Release status

เวอร์ชันนี้เพิ่ม Master Data `เซลล์`, จำนวนผู้ใช้งานลูกค้าแบบกรอกเอง, โน้ตลูกค้าหลายรายการ, ขยายการแสดงรูปโปรไฟล์และผลของสี Accent, จำกัดการแก้ตำแหน่งให้เฉพาะ Admin และปรับหน้า Master Data เป็น Compact List

ต้องรัน Migration `008_sales_notes_profile_theme` และ Verify ให้ผ่านก่อน Deploy Frontend ชุดนี้

Migration จะกำหนด `customer_user_count = 1` ให้ลูกค้าเดิมทั้งหมดที่ยังไม่มีค่า ส่วน `sales_code` จะเริ่มเป็นค่าว่างจนกว่าจะสร้าง Master เซลล์และเลือกให้ลูกค้า

> **คำเตือนด้านข้อมูลลับ:** `customer_user_accounts.password_text` และ `pin_text` ยังคงเก็บเป็นข้อความปกติตาม Business Requirement เดิม ห้ามนำสองคอลัมน์นี้ไปใส่ใน Excel, Log, Toast, Screenshot หรือระบบวิเคราะห์ภายนอก และต้องจำกัดสิทธิ์ฐานข้อมูลกับ Backup อย่างเข้มงวด

## Changelog

### 0.10.0-sales-notes-profile-theme

- เพิ่ม Master Data `sales` สำหรับเก็บรายชื่อเซลล์
- ลูกค้าหนึ่งรายเลือกเซลล์ได้ไม่เกินหนึ่งรายการผ่าน `customers.sales_code`
- เพิ่ม `customers.customer_user_count` เป็นจำนวนเต็มบังคับกรอก `1–999999`
- จำนวนผู้ใช้งานลูกค้าเป็นข้อมูลอิสระ ไม่คำนวณจากจำนวนแถวใน `customer_user_accounts`
- หน้า List และ Excel แสดงจำนวนผู้ใช้งานที่กรอกกับจำนวนบัญชีที่บันทึกไว้แยกกัน
- เพิ่ม `customer_notes` รองรับหลายโน้ตต่อหนึ่งลูกค้า
- Active Admin, Manager และ User สามารถอ่าน เพิ่ม แก้ไข และลบโน้ตของลูกค้าที่ยังแก้ไขได้
- หน้า Create บันทึกลูกค้า บัญชีผู้ใช้งาน และโน้ตผ่าน `create_customer_complete_v3` ใน Transaction เดียว
- หน้า Edit รองรับเพิ่ม แก้ไข และลบโน้ต พร้อมเก็บแบบร่างใน `sessionStorage`
- รูปโปรไฟล์แสดงใน Topbar, Profile, Owner Picker, Customer List/Detail, Daily Report, Manager Review และ Admin User List
- ไฟล์รูปโปรไฟล์ไม่บังคับอัตราส่วน 1:1; UI ครอบภาพด้วย `object-fit: cover`
- สี Accent มีผลกับ Navigation, Topbar, ปุ่ม, Panel, Card, Badge, Tag, Form Selection, AG Grid, Pagination, Loading และ Chart Palette
- สี Success, Warning และ Danger ยังคงแยกจาก Accent เพื่อรักษาความหมายของสถานะ
- ผู้ใช้แก้ชื่อที่แสดง Theme และ Avatar ของตนเองได้ แต่ `position` แก้ได้เฉพาะ Admin
- Hardening RPC เดิม `update_my_profile_details` ไม่ให้ Client รุ่นเก่าเปลี่ยนตำแหน่ง
- เพิ่ม `update_my_profile_display_name` สำหรับแก้ชื่อที่แสดงของตนเอง
- เพิ่ม `admin_save_master_item_v3` รองรับกลุ่ม `sales`
- ปรับหน้า Master Data เป็น Compact List บน Desktop และ Compact Card Row บน Mobile
- เพิ่ม Migration, Verify, Rollback และ Operational Reset สำหรับเวอร์ชันนี้
- Cache Busting และ Internal Version Stamp เป็น `0.10.0-sales-notes-profile-theme`

### 0.9.0-customer-accounts-report-groups

- เพิ่มบัญชีผู้ใช้งานลูกค้าหลายรายการ
- เพิ่ม Draft ผ่าน `sessionStorage`
- เพิ่มหลายลูกค้าต่อ Daily Report Item และกลุ่มลูกค้าระดับรายงาน
- แก้ Master Save ไม่ให้ Native Refresh

## 1. Current system scope

ระบบปัจจุบันรองรับ:

1. Supabase Auth และ Session
2. Role `admin`, `manager`, `user`
3. Customer CRUD แบบ Soft Delete
4. Customer Create/Detail/Edit ตามโครงสร้าง 6 ส่วน
5. เซลล์หนึ่งรายการต่อลูกค้า
6. จำนวนผู้ใช้งานลูกค้าแบบกรอกเอง ตั้งแต่ 1 ขึ้นไป
7. ผู้รับผิดชอบหลายคนและผู้รับผิดชอบหลักหนึ่งคน
8. ผู้ติดต่อหลายคนและผู้ติดต่อหลักหนึ่งคน
9. บัญชีผู้ใช้งานลูกค้าหลายรายการ
10. โน้ตลูกค้าหลายรายการ
11. Module และ Feature หลายรายการต่อลูกค้า
12. Daily Report หนึ่งฉบับต่อผู้ใช้ต่อวัน
13. หลายลูกค้าต่อ Daily Report Item
14. กลุ่มลูกค้าระดับรายงานสำหรับใช้ซ้ำหลายข้อ
15. Manager Acknowledge / Request Revision
16. Profile avatar, display name, admin-managed position และ Theme
17. Admin Branding และ Master Data
18. Excel Export เฉพาะข้อมูลที่ผ่านตัวกรอง โดยไม่รวม Credential
19. Customer Audit จาก Database Trigger โดยไม่ทำสำเนา Credential

ทรัพยากรที่ยกเลิกและไม่มีในระบบ:

- External website links
- Customer operations
- Customer activity history

## 2. Repository and deployment artifacts

### Runtime repository

```text
README.md
index.html
script.js
style.css
```

### SQL artifacts

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
007_customer_accounts_report_groups.sql
007_customer_accounts_report_groups_verify.sql
007_customer_accounts_report_groups_rollback.sql
008_sales_notes_profile_theme.sql
008_sales_notes_profile_theme_verify.sql
008_sales_notes_profile_theme_rollback.sql
reset_usage_data_scope_a_v0.10.0.sql
```

## 3. Roles and permissions

| Resource / Action | Admin | Manager | User |
|---|---:|---:|---:|
| อ่านลูกค้าที่ยังไม่ถูกลบ | Yes | Yes | Yes |
| สร้าง/แก้ไขลูกค้า | Yes | Yes | Yes |
| Soft Delete ลูกค้า | Yes | Yes | Yes |
| อ่าน/แก้บัญชีผู้ใช้งานลูกค้า | Yes | Yes | Yes |
| อ่าน/เพิ่ม/แก้/ลบโน้ตลูกค้า | Yes | Yes | Yes |
| อ่านรายงานของตนเอง | Yes | Yes | Yes |
| อ่านรายงานทั้งหมด | Yes | Yes | No |
| Acknowledge / Request revision | Yes | Yes | No |
| แก้ชื่อที่แสดงของตนเอง | Yes | Yes | Yes |
| แก้ Theme/Avatar ของตนเอง | Yes | Yes | Yes |
| แก้ตำแหน่งของตนเอง | Yes | No | No |
| แก้ชื่อ/ตำแหน่ง/Role/Active ของผู้อื่น | Yes | No | No |
| จัดการ Branding | Yes | No | No |
| จัดการ Master Data | Yes | No | No |

กฎสำคัญ:

- `profiles.id` หรือ `user_id` เป็น Source of Truth
- บัญชีต้องมี `profiles.is_active = true`
- มี Active Manager ได้ไม่เกินหนึ่งบัญชี
- Admin เปลี่ยน Role หรือปิดบัญชีตัวเองผ่าน Admin RPC ไม่ได้
- ทุก Active Role เห็นลูกค้าทั้งหมดและแก้ลูกค้าที่ยังไม่ถูกลบได้
- Browser ใช้ Publishable/Anon Key เท่านั้น ไม่มี `service_role` ใน Frontend

## 4. Customer model

### 4.1 โครงสร้าง 6 ส่วน

1. **ข้อมูลพื้นฐาน**
   - ชื่อนิติบุคคล *
   - ชื่อย่อ
   - เลขประจำตัวผู้เสียภาษี *
   - จำนวนรถ *
   - จำนวนผู้ใช้งานลูกค้า * — จำนวนเต็ม `1–999999`
   - สถานะบัญชี *
   - เซลล์ — เลือกได้หนึ่งรายการจาก Master `sales`

2. **สถานะและวันที่**
   - สถานะการนำเข้าข้อมูล
   - ขั้นตอนเริ่มใช้งาน
   - ระดับความสนใจ
   - วันที่เริ่มใช้งานจริง
   - วันที่เริ่มวางบิล

3. **ผู้รับผิดชอบ**
   - ผู้รับผิดชอบ 0 คนขึ้นไป
   - ผู้รับผิดชอบหลักไม่เกินหนึ่งคน
   - UI แสดง Avatar, ชื่อและตำแหน่ง

4. **ผู้ติดต่อและผู้ใช้งาน**
   - ผู้ติดต่อ 0 คนขึ้นไป
   - บัญชีผู้ใช้งานลูกค้า 0 บัญชีขึ้นไป
   - บัญชีประกอบด้วยอีเมล รหัสผ่าน PIN และหมายเหตุ

5. **โมดูลและฟังก์ชัน**
   - Module 0 รายการขึ้นไป
   - Feature 0 รายการขึ้นไป

6. **สัญญาและการอบรม**
   - ประเภทสัญญา *
   - จำนวนครั้งสอนใช้งานนอกสถานที่

หลัง 6 ส่วนมี Section **โน้ตลูกค้า** รองรับหลายรายการ พร้อมผู้สร้าง ผู้แก้ไข และเวลาแก้ไขล่าสุด

### 4.2 Save behavior

- Create ใช้ `create_customer_complete_v3` บันทึก Core, Owners, Contacts, Customer Accounts, Modules, Features และ Notes ใน Transaction เดียว
- Edit บันทึกตามลำดับ Core → Owners → Modules/Features → Contacts → Customer Accounts → Notes
- Edit เป็น Sequential Save หากส่วนหลังล้มเหลว ส่วนก่อนหน้าอาจบันทึกแล้ว
- Soft Delete ใช้ `archive_customer`
- หลัง Soft Delete สำเร็จ Frontend ลบข้อมูลจาก State และ Grid ทันที
- Credential ไม่ถูก Export และไม่ถูกบันทึกใน Customer Audit Log

### 4.3 Draft persistence

- ใช้ `sessionStorage` แยกตาม Browser Tab, User และ Customer
- เก็บค่าฟอร์ม Owner/Module/Feature, ผู้ติดต่อ, บัญชีผู้ใช้งาน และโน้ต
- Draft อาจมี Password/PIN แบบข้อความปกติตามข้อมูลที่ผู้ใช้กรอก
- ล้าง Draft เมื่อ Save สำเร็จ, Cancel หรือ Logout
- Auth Token Refresh ไม่ Render Route ใหม่
- ปิด Browser Tab แล้ว Browser จะล้าง `sessionStorage`

## 5. Customer List, filters and Excel

คอลัมน์เริ่มต้น:

1. ลูกค้า / ชื่อย่อ
2. สถานะบัญชี
3. ขั้นตอนเริ่มใช้งาน
4. สถานะการนำเข้าข้อมูล
5. ประเภทสัญญา
6. จำนวนรถ
7. ผู้รับผิดชอบหลักพร้อม Avatar
8. เซลล์
9. จำนวนผู้ใช้งานลูกค้าที่กรอก
10. จำนวนบัญชีผู้ใช้งานที่บันทึกไว้
11. วันที่เริ่มใช้งานจริง
12. อัปเดตล่าสุด
13. การกระทำ

ตัวกรองรองรับ Search, Account Status, Owner, Onboarding, Import, Engagement, Contract, Sales, Module, Feature, Fleet Range และ Date Range

Excel รวม Sales, จำนวนผู้ใช้งานที่กรอก และจำนวนบัญชีที่สร้าง แต่ไม่รวม `password_text` หรือ `pin_text`

## 6. Daily Report model

- หนึ่ง User มี Report ได้หนึ่งฉบับต่อ `work_date`
- Report Item อยู่ใน Section `today` หรือ `tomorrow`
- Item หนึ่งข้อเชื่อมลูกค้าได้ 0 คนขึ้นไป
- Report หนึ่งฉบับมีกลุ่มลูกค้าระดับรายงานได้หนึ่งชุด
- Item เลือกใช้กลุ่มรายงานหรือเลือกลูกค้าเฉพาะ Item ได้
- การเปลี่ยนกลุ่มหรือ Item เพิ่ม `daily_reports.content_version`
- Manager ต้องส่ง `expected_content_version` เมื่อ Acknowledge หรือ Request Revision
- Report ที่ `acknowledged` ถูกล็อก
- หน้า Daily Report, Manager List และ Manager Review แสดง Avatar ของผู้จัดทำ

## 7. Master Data

| Group | Storage | Used by |
|---|---|---|
| `modules` | `modules` | Customer modules |
| `features` | `features` | Customer features |
| `onboarding_stage` | `master_options` | Customer onboarding |
| `import_status` | `master_options` | Customer import status |
| `engagement_level` | `master_options` | Customer engagement |
| `contract_type` | `master_options` | Customer contract |
| `sales` | `master_options` | Customer sales assignment |

กฎ:

- Module/Feature Code ใช้ `a-z`, `0-9`, `_`
- Master Value ห้ามว่างและยาวไม่เกิน 100 ตัวอักษร
- `sort_order` เป็นจำนวนเต็ม `1–9999`
- `sort_order` ห้ามซ้ำภายในกลุ่ม
- Code/Value ห้ามซ้ำภายในกลุ่ม
- รายการที่ถูกใช้งานแล้วให้ปิด `is_active` แทนการลบ
- Frontend เขียนผ่าน `admin_save_master_item_v3`
- หน้า Master Data เป็น Compact List และไม่ Render ทั้ง Route หลังบันทึก

Migration 008 ไม่สร้าง Sales Seed เนื่องจากรายชื่อเซลล์เป็นข้อมูลเฉพาะองค์กร Admin ต้องเพิ่มรายการก่อนนำไปเลือกให้ลูกค้า

## 8. Current database schema

### 8.1 `profiles`

| Column | Type | Null | Notes |
|---|---|---:|---|
| `id` | `uuid` | No | PK, FK → `auth.users.id` |
| `display_name` | `text` | No | 1–200; เจ้าของบัญชีแก้ได้ |
| `email` | `text` | No | Unique lowercase |
| `position` | `text` | Yes | 1–200; Admin แก้ได้เท่านั้น |
| `role` | `text` | No | admin/manager/user |
| `is_active` | `boolean` | No | |
| `theme_mode` | `text` | No | light/dark/system |
| `theme_accent` | `text` | No | HEX |
| `avatar_path` | `text` | Yes | Private Storage path |
| timestamps | `timestamptz` | No | |

### 8.2 `customers`

| Column | Type | Null | Notes |
|---|---|---:|---|
| `id` | `uuid` | No | PK |
| `legacy_customer_id` | `text` | Yes | Partial unique |
| `legal_name` | `text` | No | |
| `short_name` | `text` | Yes | |
| `tax_id` | `text` | No | Unique, 13 digits |
| `fleet_size` | `integer` | No | ≥ 0 |
| `customer_user_count` | `integer` | No | default 1, `1–999999` |
| `account_status` | `text` | No | active/inactive |
| `sales_code` | `text` | Yes | Active Master `sales` |
| `onboarding_stage` | `text` | Yes | Master |
| `import_status` | `text` | No | Master |
| `engagement_level` | `text` | Yes | Master |
| `start_date` | `date` | Yes | |
| `billing_date` | `date` | Yes | |
| `contract_type` | `text` | No | Master |
| `onsite_training_count` | `integer` | No | 0–999999 |
| archive/audit metadata | | | |

Indexes เพิ่มใน Migration 008:

- `customers_sales_code_idx`
- `customers_customer_user_count_idx`

### 8.3 Customer relation tables

- `customer_owners(customer_id, profile_id, is_primary, metadata)`
- `customer_contacts(id, customer_id, contact_name, position, phone, email, line_id, is_primary, is_active, metadata)`
- `customer_modules(customer_id, module_id, metadata)`
- `customer_features(customer_id, feature_id, metadata)`

### 8.4 `customer_user_accounts`

| Column | Type | Null | Notes |
|---|---|---:|---|
| `id` | `uuid` | No | PK |
| `customer_id` | `uuid` | No | FK → customers, cascade |
| `email` | `text` | No | Unique lowercase per customer |
| `password_text` | `text` | No | Plaintext, max 500 |
| `pin_text` | `text` | No | Plaintext, max 100 |
| `notes` | `text` | Yes | max 2000 |
| metadata | | | |

`customer_user_accounts` เป็นรายการบัญชีที่บันทึกไว้ ส่วน `customers.customer_user_count` เป็นจำนวนผู้ใช้งานจริงที่กรอกเอง ทั้งสองค่าไม่จำเป็นต้องเท่ากัน

### 8.5 `customer_notes`

| Column | Type | Null | Notes |
|---|---|---:|---|
| `id` | `uuid` | No | PK, default `gen_random_uuid()` |
| `customer_id` | `uuid` | No | FK → customers, cascade |
| `note_text` | `text` | No | Trimmed length 1–5000 |
| `created_at` | `timestamptz` | No | |
| `created_by` | `uuid` | No | FK → profiles |
| `updated_at` | `timestamptz` | No | |
| `updated_by` | `uuid` | No | FK → profiles |

RLS:

- Select: Active authenticated users
- Insert/Update/Delete: `app_private.can_edit_customer(customer_id)`
- Actor/timestamp ตั้งผ่าน `app_private.set_actor_timestamps()`

### 8.6 Daily Report tables

- `daily_reports`: Unique `(user_id, work_date)`, status workflow, `content_version`
- `daily_report_items`: today/tomorrow, detail, sort order, shared-group flag
- `daily_report_group_customers`: shared customer group
- `daily_report_item_customers`: explicit customers per item
- `daily_report_events`: immutable workflow events

### 8.7 Other tables

- `modules`
- `features`
- `master_options`
- `app_settings`
- `customer_audit_logs`

## 9. RPC and security boundary

Current RPCs used by this release:

- `create_customer_complete_v3`
- `save_customer_owners`
- `save_customer_contact`
- `archive_customer`
- `save_daily_report_customer_group`
- `save_daily_report_item_v2`
- `submit_daily_report`
- `acknowledge_daily_report`
- `request_daily_report_revision`
- `update_my_profile_display_name`
- `update_my_profile_details` — compatibility RPC; rejects position changes
- `update_my_profile_preferences`
- `update_my_avatar_path`
- `admin_update_profile_full`
- `admin_update_profile_avatar`
- `admin_save_master_item_v3`

Security rules:

- RLS เปิดทุกตารางที่ Frontend เข้าถึง
- Security-definer RPC ตรวจ Active User/Role ภายในและกำหนด `search_path`
- Browser ใช้ Publishable/Anon Key เท่านั้น
- Position เปลี่ยนผ่าน Admin RPC เท่านั้น
- Credential ไม่แสดงใน List, Excel, Toast หรือ Console โดยตั้งใจ
- Customer Notes ไม่บันทึก Password/PIN

## 10. Profile avatar and theme

- Avatar เก็บใน Private Bucket `app-profile-media`
- File upload รองรับ PNG, JPEG, WebP ไม่เกิน 3 MB
- ไม่ตรวจบังคับอัตราส่วนของไฟล์
- Signed URL ใช้สำหรับแสดงภาพตามสิทธิ์
- พื้นที่แสดงภาพใช้ `object-fit: cover`
- เมื่อไม่มีรูป ใช้อักษรย่อจากชื่อที่แสดง
- Accent สร้างตัวแปรสีเข้ม อ่อน Border, Shadow และ Contrast อัตโนมัติ
- Success/Warning/Danger ไม่ถูกเปลี่ยนตาม Accent

## 11. Environment

`script.js` มีเฉพาะ Public Browser Configuration:

```js
const SUPABASE_URL = "https://<project-ref>.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "<publishable-or-anon-key>";
```

ห้ามใส่ใน Frontend, README, Log หรือ Screenshot:

- Database password
- `service_role` key
- Access token / Refresh token
- Private API key

## 12. Installation and deployment

### Required order

1. สำรองฐานข้อมูล
2. รัน `008_sales_notes_profile_theme.sql`
3. รัน `008_sales_notes_profile_theme_verify.sql`
4. Deploy Runtime Files ทั้ง 4 ไฟล์พร้อมกัน
5. Hard Refresh Browser
6. เพิ่ม Sales Master อย่างน้อยหนึ่งรายการตามข้อมูลจริงขององค์กร
7. Smoke Test ด้วย Admin, Manager และ User

### Local static run

```bash
python3 -m http.server 8080
```

เปิด `http://localhost:8080` ห้ามใช้ `file://` เป็นผลทดสอบ Production

### Git deployment

```bash
git switch main
git pull --rebase origin main
git diff --check

git add README.md index.html script.js style.css
git commit -m "release: v0.10.0 sales notes profile theme"
git push origin main

git tag -a v0.10.0-sales-notes-profile-theme \
  -m "FI Customer Tracking v0.10.0 sales notes profile theme"
git push origin v0.10.0-sales-notes-profile-theme
```

### Post-deploy smoke test

Admin:

- สร้าง/แก้ Master เซลล์และตรวจว่าไม่ Refresh ทั้งหน้า
- แก้ตำแหน่งผู้ใช้
- เปลี่ยน Accent และตรวจ Navigation, Card, Grid, Pagination และ Chart
- เปลี่ยน Avatar รูปแนวนอน/แนวตั้ง

ทุก Role:

- สร้างลูกค้าด้วยจำนวนผู้ใช้งานอย่างน้อย 1
- เลือกเซลล์
- เพิ่ม แก้ และลบโน้ต
- ตรวจ Draft หลังสลับ Browser Tab
- ตรวจ Customer List, Detail และ Excel
- ตรวจ Avatar ใน Owner และ Daily Report

## 13. Rollback

1. Deploy Frontend `v0.9.0-customer-accounts-report-groups`
2. รัน `008_sales_notes_profile_theme_rollback.sql`
3. Hard Refresh

Rollback ลบถาวร:

- Customer Notes ทั้งหมด
- Sales Master และการเลือกเซลล์ของลูกค้า
- ค่า `customer_user_count`

Rollback คืนการแก้ตำแหน่งของตนเองตามพฤติกรรม v0.9.0 เพื่อให้ตรงกับ Frontend รุ่นเดิม ข้อมูลที่ถูกลบต้องกู้จาก Backup เท่านั้น

## 14. Operational reset

`reset_usage_data_scope_a_v0.10.0.sql` ล้าง Customer, Notes, Accounts, Audit และ Daily Reports แต่เก็บ:

- `auth.users`
- `profiles`
- Modules, Features และ Master Data รวม Sales
- Branding, `app_settings`
- Storage files
- Migration history

## 15. Known limitations

- Edit Customer เป็น Sequential Save ไม่ใช่ Transaction รวม
- `sales_code` เป็นค่าว่างได้ เพื่อรองรับลูกค้าเดิมและกรณียังไม่สร้าง Sales Master
- จำนวนผู้ใช้งานลูกค้าที่กรอกอาจต่างจากจำนวนบัญชีที่สร้างไว้โดยตั้งใจ
- Password/PIN ของบัญชีผู้ใช้งานลูกค้าเป็น Plaintext ตาม Requirement
- Signed Avatar URL มีอายุจำกัดและต้องสร้างใหม่เมื่อโหลดข้อมูล
- SQL/RLS ต้องทดสอบกับ Supabase Project จริงหลัง Deploy
