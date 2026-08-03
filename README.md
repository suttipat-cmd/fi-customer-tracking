# FI Customer Tracking Web App

> **Current version:** `0.11.0-master-delete-customer-tabs-report-picker`
> **Base version:** `0.10.0-sales-notes-profile-theme`
> **Runtime:** GitHub Pages + Plain HTML/CSS/JavaScript + Supabase Auth/PostgreSQL/Storage
> **Repository runtime files:** `README.md`, `index.html`, `script.js`, `style.css`

## Release status

เวอร์ชันนี้เพิ่มการลบ Master Data ที่ยังไม่ถูกใช้งานแบบ Hard Delete ผ่าน RPC ที่ตรวจสิทธิ์และการอ้างอิง, แสดงไอคอนลูกโลกสำหรับ Global/Default Master ที่ห้ามลบ, ปรับ Customer List เป็น Tab ตามสถานะบัญชีพร้อมคอลัมน์ชุดใหม่ และเปลี่ยนการเลือกลูกค้าใน Daily Report เป็น Dropdown Multi-select ทั้งระดับรายงานและระดับรายการ

ต้องรัน Migration `009_master_delete_customer_tabs_report_picker` และ Verify ให้ผ่านก่อน Deploy Frontend ชุดนี้

Migration เพิ่ม `is_system` ให้ `modules`, `features` และ `master_options`, ยกเลิก Direct DELETE ของ Master จาก Browser และบังคับให้ลบผ่าน `admin_delete_master_item_v1` เท่านั้น โดยข้อมูลลูกค้าและรายงานเดิมไม่ถูกแก้ไข

> **คำเตือนด้านข้อมูลลับ:** `customer_user_accounts.password_text` และ `pin_text` ยังคงเก็บเป็นข้อความปกติตาม Business Requirement เดิม ห้ามนำสองคอลัมน์นี้ไปใส่ใน Excel, Log, Toast, Screenshot หรือระบบวิเคราะห์ภายนอก และต้องจำกัดสิทธิ์ฐานข้อมูลกับ Backup อย่างเข้มงวด

## Changelog

### 0.11.0-master-delete-customer-tabs-report-picker

- เพิ่ม `is_system` ใน `modules`, `features` และ `master_options`
- ตรวจว่า Master ตั้งต้น/Global ที่ระบบต้องใช้มีอยู่ครบ จากนั้น Mark และแสดงไอคอนลูกโลกแทนปุ่มลบ
- Master ที่ไม่ใช่ Global และไม่มีข้อมูลอ้างอิงแสดงปุ่ม `ลบ`
- ลบ Master แบบ Hard Delete ผ่าน `admin_delete_master_item_v1`
- Backend ตรวจ Admin, Global flag และ Usage ซ้ำภายใน Transaction ก่อนลบ
- Master Option แบบ Text Reference ล็อกตาราง `customers` ระหว่างตรวจและลบเพื่อกัน Race Condition
- ยกเลิก Direct DELETE ของ `modules`, `features` และ `master_options` จาก Browser
- เพิ่ม `admin_master_item_usage_v1` สำหรับโหลดจำนวนข้อมูลอ้างอิงโดยไม่ทำ N+1 Query
- Customer List แยก Tab `ใช้งาน` และ `ไม่ใช้งาน` พร้อมจำนวน โดยเปิด Tab `ใช้งาน` เป็นค่าเริ่มต้น
- ปรับ Customer List เป็น 12 คอลัมน์ตาม Current Requirement
- Excel Export ใช้ข้อมูลจาก Tab และตัวกรองปัจจุบัน พร้อมคอลัมน์เดียวกับ List ที่เกี่ยวข้อง
- เปลี่ยน Customer Picker ใน Daily Report เป็น Dropdown Multi-select
- ใช้ Dropdown Multi-select ชุดเดียวกันทั้งกลุ่มลูกค้าระดับรายงานและลูกค้าเฉพาะรายการ
- Multi-select รองรับค้นหา เลือกทั้งหมด ล้างค่า จำนวนที่เลือก และ Scroll ภายใน
- เพิ่ม Migration, Verify, Rollback และ Operational Reset `v0.11.0`
- Cache Busting และ Internal Version Stamp เป็น `0.11.0-master-delete-customer-tabs-report-picker`

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
5. Customer List แยก Tab ตามสถานะบัญชี
6. เซลล์หนึ่งรายการต่อลูกค้า
7. จำนวนผู้ใช้งานลูกค้าแบบกรอกเอง ตั้งแต่ 1 ขึ้นไป
8. ผู้รับผิดชอบหลายคนและผู้รับผิดชอบหลักหนึ่งคน
9. ผู้ติดต่อหลายคนและผู้ติดต่อหลักหนึ่งคน
10. บัญชีผู้ใช้งานลูกค้าหลายรายการ
11. โน้ตลูกค้าหลายรายการ
12. Module และ Feature หลายรายการต่อลูกค้า
13. Daily Report หนึ่งฉบับต่อผู้ใช้ต่อวัน
14. Dropdown Multi-select สำหรับกลุ่มลูกค้าระดับรายงานและลูกค้าเฉพาะรายการ
15. หลายลูกค้าต่อ Daily Report Item
16. Manager Acknowledge / Request Revision
17. Profile avatar, display name, admin-managed position และ Theme
18. Admin Branding และ Master Data
19. Hard Delete Master ที่ไม่ใช่ Global และยังไม่ถูกใช้งาน
20. Excel Export เฉพาะข้อมูลที่ผ่าน Tab/ตัวกรอง โดยไม่รวม Credential
21. Customer Audit จาก Database Trigger โดยไม่ทำสำเนา Credential

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
009_master_delete_customer_tabs_report_picker.sql
009_master_delete_customer_tabs_report_picker_verify.sql
009_master_delete_customer_tabs_report_picker_rollback.sql
reset_usage_data_scope_a_v0.11.0.sql
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
| เพิ่ม/แก้/ปิด Master Data | Yes | No | No |
| ลบ Master ที่ไม่ใช่ Global และไม่มีการใช้งาน | Yes | No | No |

กฎสำคัญ:

- `profiles.id` หรือ `user_id` เป็น Source of Truth
- บัญชีต้องมี `profiles.is_active = true`
- มี Active Manager ได้ไม่เกินหนึ่งบัญชี
- Admin เปลี่ยน Role หรือปิดบัญชีตัวเองผ่าน Admin RPC ไม่ได้
- ทุก Active Role เห็นลูกค้าทั้งหมดและแก้ลูกค้าที่ยังไม่ถูกลบได้
- Browser ใช้ Publishable/Anon Key เท่านั้น ไม่มี `service_role` ใน Frontend
- Browser ไม่มีสิทธิ์ Direct DELETE ตาราง Master; ต้องผ่าน Guarded RPC เท่านั้น

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

Customer List แยกตาม `customers.account_status`:

- `ใช้งาน (จำนวน)` — Tab เริ่มต้น
- `ไม่ใช้งาน (จำนวน)`

จำนวนบน Tab นับจากลูกค้าที่ยังไม่ถูก Soft Delete ทั้งหมดและไม่เปลี่ยนตาม Search/Filter ส่วนข้อมูลในตารางและ Excel ใช้ Tab กับตัวกรองปัจจุบัน

คอลัมน์ตามลำดับ:

1. ชื่อนิติบุคคล
2. จำนวนรถ
3. โมดูล
4. สัญญา
5. เซลล์
6. จำนวนผู้ใช้งานลูกค้า
7. สอนใช้งานนอกสถานที่ (ครั้ง)
8. สถานะการนำเข้าข้อมูล
9. ระดับความสนใจ
10. อัปเดตล่าสุด
11. แก้ไขล่าสุดโดย
12. การกระทำ

ตัวกรองรองรับ Search, Owner, Onboarding, Import, Engagement, Contract, Sales, Module, Feature, Fleet Range และ Date Range ส่วนสถานะบัญชีควบคุมผ่าน Tab

Excel ใช้แถวที่ผ่าน Tab, Search, Filter และ Sort ปัจจุบัน ไม่รวมคอลัมน์การกระทำ และไม่รวม `password_text` หรือ `pin_text`

## 6. Daily Report model

- หนึ่ง User มี Report ได้หนึ่งฉบับต่อ `work_date`
- Report Item อยู่ใน Section `today` หรือ `tomorrow`
- Item หนึ่งข้อเชื่อมลูกค้าได้ 0 คนขึ้นไป
- Report หนึ่งฉบับมีกลุ่มลูกค้าระดับรายงานได้หนึ่งชุด
- Item เลือกใช้กลุ่มรายงานหรือเลือกลูกค้าเฉพาะ Item ได้
- Customer Picker ทั้งสองตำแหน่งเป็น Dropdown Multi-select ชุดเดียวกัน
- Multi-select แสดงจำนวนที่เลือก รองรับค้นหา เลือกทั้งหมด ล้างค่า และ Scroll ภายใน
- รายการ Checkbox ไม่กินพื้นที่หน้าจอขณะ Dropdown ปิด
- การเปลี่ยนกลุ่มหรือ Item เพิ่ม `daily_reports.content_version`
- Manager ต้องส่ง `expected_content_version` เมื่อ Acknowledge หรือ Request Revision
- Report ที่ `acknowledged` ถูกล็อก
- หน้า Daily Report, Manager List และ Manager Review แสดง Avatar ของผู้จัดทำ

## 7. Master Data

| Group | Storage | Used by |
|---|---|---|
| `modules` | `modules` | `customer_modules.module_id` |
| `features` | `features` | `customer_features.feature_id` |
| `onboarding_stage` | `master_options` | `customers.onboarding_stage` |
| `import_status` | `master_options` | `customers.import_status` |
| `engagement_level` | `master_options` | `customers.engagement_level` |
| `contract_type` | `master_options` | `customers.contract_type` |
| `sales` | `master_options` | `customers.sales_code` |

กฎทั่วไป:

- Module/Feature Code ใช้ `a-z`, `0-9`, `_`
- Master Value ห้ามว่างและยาวไม่เกิน 100 ตัวอักษร
- `sort_order` เป็นจำนวนเต็ม `1–9999` และห้ามซ้ำภายในกลุ่ม
- Code/Value ห้ามซ้ำภายในกลุ่ม
- Frontend เพิ่ม/แก้ผ่าน `admin_save_master_item_v3`
- หน้า Master Data เป็น Compact List และไม่ Render ทั้ง Route หลังบันทึก

กฎการลบ:

- `is_system = true` คือ Global/Default Master แสดงไอคอนลูกโลกและห้ามลบ
- รายการที่มี Usage มากกว่า `0` ไม่แสดงปุ่มลบ
- รายการที่ `is_system = false` และ Usage เท่ากับ `0` แสดงปุ่ม `ลบ`
- การลบเป็น Hard Delete และหายจากฐานข้อมูลจริง
- Frontend โหลด Usage ผ่าน `admin_master_item_usage_v1`
- การลบต้องผ่าน `admin_delete_master_item_v1`; RPC ตรวจ Admin, Global flag และ Usage ซ้ำ
- Usage นับรวมลูกค้าที่ Soft Delete แล้ว เพราะข้อมูลอ้างอิงยังอยู่
- `modules`/`features` มี FK `ON DELETE RESTRICT`
- `master_options` เป็น Text Reference จึง Lock ตาราง `customers` ระหว่างตรวจและลบ
- Direct DELETE ของ Master จาก Browser ถูก Revoke

Global/Default ที่ Migration 009 ต้องพบและ Mark:

- Modules: `erp`, `maintenance`, `ai`
- Features: `project`, `live_entry`
- Onboarding: `to_do`, `pending_data`, `onboarding`, `training_completed`, `go_live`
- Import: `waiting`, `in_process`, `done`
- Engagement: `interest`, `neutral`
- Contract: `monthly`, `annual`
- Sales ไม่มี Global Seed

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

### 8.7 Master and other tables

`modules`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `code` | `text` | Unique |
| `name` | `text` | |
| `sort_order` | `integer` | Unique, `1–9999` |
| `is_active` | `boolean` | |
| `is_system` | `boolean` | default false; Global rows cannot be deleted |
| timestamps | `timestamptz` | |

`features` มีโครงสร้าง Master เดียวกับ `modules` โดยใช้ `customer_features` เป็นตารางอ้างอิง

`master_options`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `group_key` | `text` | Controlled group |
| `option_value` | `text` | Unique ภายในกลุ่ม |
| `display_name` | `text` | |
| `sort_order` | `integer` | Unique ภายในกลุ่ม |
| `is_active` | `boolean` | |
| `is_system` | `boolean` | default false; Global rows cannot be deleted |
| actor/timestamps | | |

ตารางอื่น:

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
- `admin_master_item_usage_v1`
- `admin_delete_master_item_v1`

Security rules:

- RLS เปิดทุกตารางที่ Frontend เข้าถึง
- Security-definer RPC ตรวจ Active User/Role ภายในและกำหนด `search_path`
- `admin_master_item_usage_v1` และ `admin_delete_master_item_v1` ตรวจ `app_private.is_admin()`
- Browser ไม่มี Direct DELETE Grant/Policy สำหรับ Master Data
- Anon ไม่มีสิทธิ์ Execute Master Delete RPC
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
2. ยืนยันว่า Migration `008_sales_notes_profile_theme` ติดตั้งแล้ว
3. รัน `009_master_delete_customer_tabs_report_picker.sql`
4. รัน `009_master_delete_customer_tabs_report_picker_verify.sql`
5. Deploy Runtime Files ทั้ง 4 ไฟล์พร้อมกัน
6. Hard Refresh Browser
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
git commit -m "release: v0.11.0 master delete customer tabs report picker"
git push origin main

git tag -a v0.11.0-master-delete-customer-tabs-report-picker   -m "FI Customer Tracking v0.11.0 master delete customer tabs report picker"
git push origin v0.11.0-master-delete-customer-tabs-report-picker
```

### Post-deploy smoke test

Admin:

- เปิด Master ทุกกลุ่มและตรวจไอคอนลูกโลกของ Global/Default
- สร้าง Master ใหม่ที่ยังไม่ใช้ แล้วลบและยืนยันว่าหายจากฐานข้อมูล
- นำ Master ใหม่ไปผูกกับลูกค้า แล้วตรวจว่าไม่แสดงปุ่มลบ
- ทดสอบ Race/Permission โดยยืนยันว่า RPC ปฏิเสธรายการที่ถูกใช้งานและบัญชีที่ไม่ใช่ Admin

ทุก Role:

- เปิด Customer List แล้วตรวจ Tab `ใช้งาน` เป็นค่าเริ่มต้น
- สลับ Tab และตรวจจำนวนกับข้อมูลใน Grid
- ตรวจ 12 คอลัมน์ Search Filter Sort และ Excel
- เปิด Daily Report แล้วทดสอบ Dropdown Multi-select ทั้งระดับรายงานและระดับรายการ
- ทดสอบ Search, เลือกทั้งหมด, ล้างค่า, Save, Submit, Print และ Manager Review

## 13. Rollback

1. Deploy Frontend `v0.10.0-sales-notes-profile-theme`
2. รัน `009_master_delete_customer_tabs_report_picker_rollback.sql`
3. Hard Refresh

Rollback จะ:

- ลบ RPC Usage/Delete ของ Migration 009
- ลบคอลัมน์ `is_system`
- คืน RLS Policy ของ `modules` และ `features` ตาม `v0.10.0` โดยยังคงไม่มี Direct DELETE Grant สำหรับ Browser
- เก็บ Master Data ทุกแถวไว้

Master ที่ถูก Hard Delete ไปแล้วก่อน Rollback จะไม่ถูกสร้างกลับ ต้องกู้จาก Backup หรือสร้างใหม่ด้วย Admin

## 14. Operational reset

`reset_usage_data_scope_a_v0.11.0.sql` ล้าง Customer, Notes, Accounts, Audit และ Daily Reports แต่เก็บ:

- `auth.users`
- `profiles`
- Modules, Features และ Master Data รวม Sales กับ `is_system`
- Branding, `app_settings`
- Storage files
- Migration history

Reset ไม่ใช้ `CASCADE` และตรวจ Migration 009 ก่อนทำงาน

## 15. Known limitations

- Edit Customer เป็น Sequential Save ไม่ใช่ Transaction รวม
- `sales_code` เป็นค่าว่างได้ เพื่อรองรับลูกค้าเดิมและกรณียังไม่สร้าง Sales Master
- จำนวนผู้ใช้งานลูกค้าที่กรอกอาจต่างจากจำนวนบัญชีที่สร้างไว้โดยตั้งใจ
- Password/PIN ของบัญชีผู้ใช้งานลูกค้าเป็น Plaintext ตาม Requirement
- Signed Avatar URL มีอายุจำกัดและต้องสร้างใหม่เมื่อโหลดข้อมูล
- จำนวนบน Customer Status Tab เป็นจำนวนรวมก่อนใช้ Search/Advanced Filter
- Master ที่ถูก Hard Delete ไม่สามารถ Undo ได้โดยไม่มี Backup
- Migration 009 ไม่สร้าง Global/Default ที่หายไป และจะหยุดพร้อม Rollback หากรายการตั้งต้นที่จำเป็นไม่ครบ
- SQL/RLS และ Concurrency ต้องทดสอบกับ Supabase Project จริงหลัง Deploy
