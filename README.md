# FI Customer Tracking Web App

> **Current version:** `0.9.0-customer-accounts-report-groups`  
> **Base version:** `0.8.0-customer-data-restructure`  
> **Runtime:** GitHub Pages + Plain HTML/CSS/JavaScript + Supabase Auth/PostgreSQL/Storage  
> **Repository runtime files:** `README.md`, `index.html`, `script.js`, `style.css`

## Release status

เวอร์ชันนี้เพิ่มบัญชีผู้ใช้งานของลูกค้าแบบหลายรายการ, ปรับ Customer List, แก้ Master Module ให้บันทึกผ่าน RPC รุ่นใหม่โดยไม่เกิด Native Form Refresh, เก็บแบบร่างฟอร์มลูกค้าใน `sessionStorage` และปรับ Daily Report ให้รองรับหลายลูกค้าต่อรายการพร้อมกลุ่มลูกค้าระดับรายงาน

ต้องรัน Migration `007_customer_accounts_report_groups` ก่อน Deploy Frontend ชุดนี้

> **คำเตือนด้านข้อมูลลับ:** ตาม Business Requirement ที่ยืนยันแล้ว `customer_user_accounts.password_text` และ `pin_text` เก็บเป็นข้อความปกติในฐานข้อมูล ไม่เข้ารหัสและไม่ Hash ข้อมูลดังกล่าวจึงต้องถูกจำกัดด้วย RLS, การควบคุมบัญชีฐานข้อมูล, Backup Access และ Operational Policy ห้ามนำสองคอลัมน์นี้ไปใส่ใน Excel Export, Log หรือ Screenshot

## Changelog

### 0.9.0-customer-accounts-report-groups

- เพิ่ม Section ย่อย `ผู้ใช้งานลูกค้า` ภายใต้ส่วน `ผู้ติดต่อและผู้ใช้งาน`
- ลูกค้าหนึ่งรายมีผู้ใช้งานได้หลายบัญชี แต่ละบัญชีมีอีเมล รหัสผ่าน PIN และหมายเหตุ
- อีเมลผู้ใช้งานลูกค้าห้ามซ้ำภายในลูกค้ารายเดียวกัน
- หน้า Create บันทึกบัญชีผู้ใช้งานลูกค้าร่วมกับข้อมูลลูกค้าผ่าน `create_customer_complete_v2` ใน Transaction เดียว
- หน้า Edit รองรับเพิ่ม แก้ และลบบัญชีผู้ใช้งานลูกค้า
- Customer List แสดงคอลัมน์หลัก: ลูกค้า, สถานะบัญชี, ขั้นตอนเริ่มใช้งาน, สถานะนำเข้า, สัญญา, จำนวนรถ, ผู้รับผิดชอบหลัก, จำนวนผู้ใช้งานลูกค้า, วันที่เริ่มใช้งานจริง, อัปเดตล่าสุด และการกระทำ
- Excel Export เพิ่มผู้รับผิดชอบหลักและจำนวนผู้ใช้งานลูกค้า โดยไม่ Export รหัสผ่านหรือ PIN
- แก้ Master `โมดูล` และกลุ่มอื่นให้บันทึกผ่าน `admin_save_master_item_v2`
- แก้ Root Cause ที่ Hidden Field ชื่อ `id` บดบัง Property `form.id` จน Global Submit Handler ไม่รู้จักฟอร์มและ Browser ส่งฟอร์มแบบ Native
- เปลี่ยน Hidden Field เป็น `item_id`; Global Submit Handler อ่าน ID ด้วย `getAttribute("id")` และเรียก `preventDefault()` ก่อนเริ่มงาน Async จึงไม่ Refresh หน้า
- การบันทึก Master อัปเดตเฉพาะ State และรายการปัจจุบัน ไม่ Render หน้าทั้งหน้าใหม่
- แก้ Auth `TOKEN_REFRESHED` ไม่ให้ Render Route ใหม่ จึงไม่ล้างข้อมูลฟอร์มเมื่อสลับ Browser Tab
- ฟอร์ม Create/Edit ลูกค้าเก็บแบบร่างใน `sessionStorage` ของ Browser Tab ปัจจุบัน
- กู้คืนข้อมูลฟอร์ม ผู้ติดต่อ และผู้ใช้งานลูกค้าหลัง Route ถูก Render ใหม่
- ล้างแบบร่างเมื่อบันทึกสำเร็จ กดยกเลิก หรือ Logout
- Daily Report แต่ละรายการเลือกลูกค้าได้หลายราย
- เพิ่มกลุ่มลูกค้าระดับรายงาน เลือกครั้งเดียวแล้วให้หลายรายการใช้ร่วมกัน
- รายการรายงานเลือกได้ว่าจะใช้กลุ่มรายงานหรือเลือกลูกค้าเฉพาะรายการ
- อัปเดตหน้ารายงานของผู้ใช้, Manager Review, Print/PDF และ Content Version
- เพิ่ม Migration, Verify และ Rollback `007_customer_accounts_report_groups`
- Cache Busting และ Internal Version Stamp เป็น `0.9.0-customer-accounts-report-groups`

### 0.8.0-customer-data-restructure

- ปรับข้อมูลลูกค้าเป็น 6 ส่วน
- เพิ่มประเภทสัญญาและจำนวนครั้งสอนใช้งานนอกสถานที่
- เพิ่มตำแหน่งและชื่อที่แสดงของ Profile
- เพิ่ม Date-range Modal
- ลบ External Links, Customer Operations และ Customer Activities
- บังคับลำดับ Master เป็น `1–9999` และห้ามซ้ำในกลุ่ม

## 1. Current system scope

ระบบปัจจุบันรองรับ:

1. Supabase Auth และ Session
2. Role `admin`, `manager`, `user`
3. Customer CRUD แบบ Soft Delete
4. Customer Create/Detail/Edit ตามโครงสร้าง 6 ส่วน
5. ผู้รับผิดชอบหลายคนและผู้รับผิดชอบหลักหนึ่งคน
6. ผู้ติดต่อหลายคนและผู้ติดต่อหลักหนึ่งคน
7. ผู้ใช้งานลูกค้าหลายบัญชีต่อหนึ่งลูกค้า
8. Module และ Feature หลายรายการต่อลูกค้า
9. Daily Report หนึ่งฉบับต่อผู้ใช้ต่อวัน
10. หลายลูกค้าต่อ Daily Report Item
11. กลุ่มลูกค้าระดับรายงานสำหรับใช้ซ้ำหลายข้อ
12. Manager Acknowledge / Request Revision
13. Profile avatar, display name, position และ Theme
14. Admin Branding และ Master Data
15. Excel Export เฉพาะข้อมูลที่ผ่านตัวกรองและไม่รวม Credential
16. Customer Audit จาก Database Trigger โดยไม่ทำสำเนา Credential

ทรัพยากรที่ถูกยกเลิกและไม่มีในระบบ:

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
```

## 3. Roles and permissions

| Resource / Action | Admin | Manager | User |
|---|---:|---:|---:|
| อ่านลูกค้าที่ยังไม่ถูกลบ | Yes | Yes | Yes |
| สร้าง/แก้ไขลูกค้า | Yes | Yes | Yes |
| Soft Delete ลูกค้า | Yes | Yes | Yes |
| อ่าน/แก้บัญชีผู้ใช้งานลูกค้า | Yes | Yes | Yes |
| อ่านรายงานของตนเอง | Yes | Yes | Yes |
| อ่านรายงานทั้งหมด | Yes | Yes | No |
| Acknowledge / Request revision | Yes | Yes | No |
| จัดการ Role/Active ของบัญชีอื่น | Yes | No | No |
| แก้ชื่อที่แสดง/ตำแหน่งตนเอง | Yes | Yes | Yes |
| แก้ชื่อที่แสดง/ตำแหน่งผู้อื่น | Yes | No | No |
| จัดการ Branding | Yes | No | No |
| จัดการ Master Data | Yes | No | No |

กฎสำคัญ:

- `profiles.id` หรือ `user_id` เป็น Source of Truth
- บัญชีต้องมี `is_active = true`
- มี Active Manager ได้ไม่เกินหนึ่งบัญชี
- ทุก Active Role มีสิทธิ์ดูและแก้ลูกค้าที่ยังไม่ถูกลบ รวมถึงบัญชีผู้ใช้งานลูกค้า
- ไม่มี `service_role` key ใน Frontend

## 4. Customer model

### 4.1 โครงสร้าง 6 ส่วน

1. **ข้อมูลพื้นฐาน**
   - ชื่อนิติบุคคล *
   - ชื่อย่อ
   - เลขประจำตัวผู้เสียภาษี *
   - จำนวนรถ *
   - สถานะบัญชี *

2. **สถานะและวันที่**
   - สถานะการนำเข้าข้อมูล
   - ขั้นตอนเริ่มใช้งาน
   - ระดับความสนใจ
   - วันที่เริ่มใช้งานจริง
   - วันที่เริ่มวางบิล

3. **ผู้รับผิดชอบ**
   - ผู้รับผิดชอบ 0 คนขึ้นไป
   - ผู้รับผิดชอบหลักไม่เกินหนึ่งคน

4. **ผู้ติดต่อและผู้ใช้งาน**
   - ผู้ติดต่อ 0 คนขึ้นไป
   - ผู้ใช้งานลูกค้า 0 บัญชีขึ้นไป
   - บัญชีผู้ใช้งานประกอบด้วยอีเมล รหัสผ่าน PIN และหมายเหตุ

5. **โมดูลและฟังก์ชัน**
   - Module 0 รายการขึ้นไป
   - Feature 0 รายการขึ้นไป

6. **สัญญาและการอบรม**
   - ประเภทสัญญา *
   - จำนวนครั้งสอนใช้งานนอกสถานที่

### 4.2 Save behavior

- Create ใช้ `create_customer_complete_v2` บันทึก Core, Owners, Contacts, Customer Accounts, Modules และ Features ใน Transaction เดียว
- Edit บันทึกตามลำดับ Core → Owners → Modules/Features → Contacts → Customer Accounts
- Edit เป็น Sequential Save หากส่วนหลังล้มเหลวส่วนก่อนหน้าอาจบันทึกแล้ว
- Soft Delete ใช้ `archive_customer`
- หลัง Soft Delete สำเร็จ Frontend ลบข้อมูลออกจาก State และ Grid ทันที
- Credential ไม่ถูก Export และไม่ถูกบันทึกใน Customer Audit Log

### 4.3 Draft persistence

- ใช้ `sessionStorage` แยกตาม Browser Tab, User และ Customer
- เก็บค่าฟอร์ม Owner/Module/Feature, ผู้ติดต่อ และบัญชีผู้ใช้งานลูกค้า
- แบบร่างอาจมีรหัสผ่านและ PIN แบบข้อความปกติตามค่าที่ผู้ใช้กรอก
- ล้างเมื่อ Save สำเร็จ, Cancel หรือ Logout
- Auth Token Refresh ไม่ Render Route ใหม่
- ปิด Browser Tab แล้ว `sessionStorage` จะถูกล้างโดย Browser

## 5. Customer List and Excel

คอลัมน์เริ่มต้น:

1. ลูกค้า / ชื่อย่อ
2. สถานะบัญชี
3. ขั้นตอนเริ่มใช้งาน
4. สถานะการนำเข้าข้อมูล
5. ประเภทสัญญา
6. จำนวนรถ
7. ผู้รับผิดชอบหลัก
8. จำนวนผู้ใช้งานลูกค้า
9. วันที่เริ่มใช้งานจริง
10. อัปเดตล่าสุด
11. การกระทำ

Excel ประกอบด้วยข้อมูลลูกค้า, ผู้รับผิดชอบ, Module/Feature, สัญญา และจำนวนผู้ใช้งานลูกค้า แต่ไม่รวม `password_text` และ `pin_text`

## 6. Daily Report model

- หนึ่ง User มี Report ได้หนึ่งฉบับต่อ `work_date`
- Report Item อยู่ใน Section `today` หรือ `tomorrow`
- Item หนึ่งข้อเชื่อมลูกค้าได้ 0 คนขึ้นไป
- Report หนึ่งฉบับมีกลุ่มลูกค้าระดับรายงานได้หนึ่งชุด
- Item เลือกได้:
  - ใช้กลุ่มลูกค้าของรายงาน หรือ
  - เลือกลูกค้าเฉพาะ Item หลายราย
- การเปลี่ยนกลุ่มหรือ Item เพิ่ม `daily_reports.content_version`
- Manager ต้องส่ง `expected_content_version` เมื่อ Acknowledge หรือ Request Revision
- Report ที่ `acknowledged` ถูกล็อก

## 7. Master Data

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

- Module/Feature Code ใช้ `a-z`, `0-9`, `_`
- `sort_order` เป็นจำนวนเต็ม `1–9999`
- `sort_order` ห้ามซ้ำภายในกลุ่ม
- Code/Value ห้ามซ้ำ
- รายการที่ถูกใช้งานแล้วให้ปิดใช้งานแทนการลบ
- Frontend เขียนผ่าน `admin_save_master_item_v2`
- Submit Handler ป้องกัน Native Browser Submit ก่อนเริ่ม Async

## 8. Current database schema

### 8.1 `profiles`

| Column | Type | Null | Notes |
|---|---|---:|---|
| `id` | `uuid` | No | PK, FK → auth.users |
| `display_name` | `text` | No | 1–200 |
| `email` | `text` | No | Unique lowercase |
| `position` | `text` | Yes | 1–200 |
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
| `legal_name` | `text` | No | |
| `short_name` | `text` | Yes | |
| `tax_id` | `text` | No | Unique 13 digits |
| `fleet_size` | `integer` | No | ≥ 0 |
| `account_status` | `text` | No | active/inactive |
| `onboarding_stage` | `text` | Yes | Master |
| `import_status` | `text` | No | Master |
| `engagement_level` | `text` | Yes | Master |
| `start_date` | `date` | Yes | |
| `billing_date` | `date` | Yes | |
| `contract_type` | `text` | No | Master |
| `onsite_training_count` | `integer` | No | 0–999999 |
| archive and audit metadata | | | |

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
| `created_at` / `updated_at` | `timestamptz` | No | |
| `created_by` / `updated_by` | `uuid` | No | FK → profiles |

RLS:

- Active Role อ่านได้
- Insert/Update/Delete ต้องผ่าน `app_private.can_edit_customer(customer_id)`
- ไม่มี Audit Trigger เพื่อหลีกเลี่ยงการทำสำเนา Credential เพิ่มใน Audit Table

### 8.5 Daily Report tables

`daily_reports`

- Unique `(user_id, work_date)`
- Status: `draft`, `submitted`, `acknowledged`, `revision_required`
- `content_version` สำหรับ Concurrency

`daily_report_items`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `report_id` | `uuid` | FK → daily_reports |
| `section` | `text` | today/tomorrow |
| `detail` | `text` | 1–5000 |
| `sort_order` | `integer` | ≥ 0 |
| `use_report_customer_group` | `boolean` | default false |
| timestamps | `timestamptz` | |

`daily_report_group_customers`

- PK `(report_id, customer_id)`
- Shared group for a report

`daily_report_item_customers`

- PK `(item_id, customer_id)`
- Explicit customers for an item
- Used only when `use_report_customer_group = false`

`daily_report_events`

- Immutable workflow events

### 8.6 Other current tables

- `modules`
- `features`
- `master_options`
- `app_settings`
- `customer_audit_logs`

## 9. RPC and security boundary

Current RPCs used by this release:

- `create_customer_complete_v2`
- `save_customer_owners`
- `save_customer_contact`
- `archive_customer`
- `save_daily_report_customer_group`
- `save_daily_report_item_v2`
- `submit_daily_report`
- `acknowledge_daily_report`
- `request_daily_report_revision`
- `update_my_profile_details`
- `update_my_profile_preferences`
- `update_my_avatar_path`
- `admin_update_profile_full`
- `admin_update_profile_avatar`
- `admin_save_master_item_v2`

Security rules:

- RLS เปิดทุกตารางที่ Frontend เข้าถึง
- Security-definer RPC ตรวจ Active User/Role ภายใน
- Browser ใช้ Publishable/Anon Key เท่านั้น
- Credential ไม่แสดงใน Customer List, Excel, Toast หรือ Console โดยตั้งใจ
- Error Message ไม่ควรเปิดเผย Payload หรือ Secret

## 10. Environment

`script.js` มีเฉพาะ Public Browser Configuration:

```js
const SUPABASE_URL = "https://<project-ref>.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "<publishable-or-anon-key>";
```

ห้ามใส่ใน Frontend หรือ README:

- Database password
- `service_role` key
- Access token / Refresh token
- Private API key

## 11. Installation and deployment

### Required order

1. สำรองฐานข้อมูล
2. รัน `007_customer_accounts_report_groups.sql`
3. รัน `007_customer_accounts_report_groups_verify.sql`
4. Deploy Runtime Files ทั้ง 4 ไฟล์พร้อมกัน
5. Hard Refresh Browser
6. Smoke Test ด้วย Admin, Manager และ User

### Static local run

```bash
python3 -m http.server 8080
```

### Git push

```bash
git switch main
git pull --rebase origin main
git diff --check

git add README.md index.html script.js style.css
git commit -m "release: v0.9.0 customer accounts and report groups"
git push origin main

git tag -a v0.9.0-customer-accounts-report-groups \
  -m "FI Customer Tracking v0.9.0"
git push origin v0.9.0-customer-accounts-report-groups
```

## 12. Rollback

1. Deploy Frontend `0.8.0-customer-data-restructure`
2. สำรอง:
   - `customer_user_accounts`
   - `daily_report_group_customers`
   - `daily_report_item_customers`
3. รัน `007_customer_accounts_report_groups_rollback.sql`

Rollback:

- ลบบัญชีผู้ใช้งานลูกค้าทั้งหมด
- ลบกลุ่มลูกค้าระดับรายงาน
- Item ที่มีหลายลูกค้าจะเหลือลูกค้าเพียงหนึ่งราย โดยเลือก UUID แรกตามลำดับ
- ไม่สามารถคืนข้อมูลใหม่ทั้งหมดได้หากไม่มี Backup

## 13. Test checklist

### Static checks

- `node --check script.js`
- HTML ID uniqueness
- HTML label/field targets
- CSS brace balance
- Version/Cache Busting consistency
- ZIP integrity
- SQL quote/dollar-quote/parenthesis balance
- ตรวจว่าไม่มี `service_role`

### Mocked browser smoke tests

- Master Module Add/Edit เรียก `admin_save_master_item_v2` โดย Route เดิมไม่เปลี่ยนและไม่มี Native Refresh
- Customer User Account เพิ่มเข้า Draft ได้ พร้อม Password/PIN/หมายเหตุ
- Customer Create ส่ง `p_customer_accounts` ไป `create_customer_complete_v2`
- Token Refresh ไม่ล้างค่าฟอร์มและ Draft ยังคงอยู่ใน `sessionStorage`
- Daily Report ส่งลูกค้าหลายรายต่อ Item และส่ง Shared Report Group ผ่าน RPC ที่ถูกต้อง

### Runtime checks required on real Supabase

- Admin เพิ่ม/แก้ Module และ Master ทุกกลุ่ม
- Create Customer พร้อมผู้ติดต่อและผู้ใช้งานหลายบัญชี
- Edit/Delete Customer Account
- สลับ Browser Tab แล้วแบบร่างไม่หาย
- Cancel/Logout แล้วแบบร่างถูกล้าง
- Daily Report Item เลือกลูกค้าหลายราย
- Shared Report Customer Group ใช้กับหลายข้อ
- Manager Review และ Print แสดงลูกค้าครบ
- Acknowledge/Revision Content Version
- RLS ด้วย Admin/Manager/User

## 14. Known limitations

- Credential ถูกเก็บเป็น Plaintext ตาม Requirement จึงมีความเสี่ยงสูงกว่าการใช้ Secret Manager หรือ Encryption
- `sessionStorage` เก็บ Draft เฉพาะ Browser Tab ปัจจุบันและไม่ Sync ข้ามอุปกรณ์
- Customer Edit เป็น Sequential Save ไม่ใช่ Transaction รวม
- Runtime ต้องทดสอบกับ Supabase Project จริงหลังรัน Migration
