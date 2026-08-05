# FI Customer Tracking Web App

> **Current version:** `0.13.0-list-settings-excel-split-manager-review`
> **Base version:** `0.12.0-customer-excel-report-security-fee`
> **Runtime:** GitHub Pages + Plain HTML/CSS/JavaScript + Supabase Auth/PostgreSQL/Storage
> **Repository runtime files:** `README.md`, `index.html`, `script.js`, `style.css`

## Release status

เวอร์ชัน `0.13.0-list-settings-excel-split-manager-review` เพิ่มการตั้งค่าตารางข้อมูลลูกค้าแบบส่วนกลางโดย Admin, แยก Excel สำหรับอ่าน/ใช้งานทั่วไปออกจาก Template สำหรับอัปเดตข้อมูล และปรับ Role `manager` ให้ทำหน้าที่ตรวจรายงานเท่านั้น

ต้องรัน Migration `011_customer_list_settings_excel_split_manager_review` และ Verify ให้ผ่านก่อน Deploy Frontend ชุดนี้ โดย Migration ต้องพบ `010_customer_excel_report_security_fee` แล้ว

Migration เพิ่มค่าตั้งต้นใน `app_settings` สำหรับคอลัมน์ที่แสดงและการเรียงข้อมูลของ Customer List ไม่มีการแก้หรือลบข้อมูลลูกค้า รายงาน หรือ Credential เดิม

> **คำเตือนด้านข้อมูลลับ:** `customer_user_accounts.password_text` และ `pin_text` ยังคงเก็บเป็นข้อความปกติตาม Business Requirement เดิม ทั้ง Excel ทั่วไปและ Template สำหรับอัปเดตจะไม่ส่งออกค่าจริงของสองคอลัมน์นี้ ห้ามนำ Credential ไปใส่ใน Log, Toast, Screenshot, Public Repository หรือระบบวิเคราะห์ภายนอก

## Changelog

### 0.13.0-list-settings-excel-split-manager-review

- เพิ่ม Global Customer List Settings ใน `app_settings`
- Admin เลือกคอลัมน์ที่แสดงและจัดลำดับคอลัมน์สำหรับผู้ใช้ทุก Role
- Admin กำหนด Default Sort Column และทิศทาง `asc`/`desc`
- บังคับให้มีคอลัมน์ข้อมูลอย่างน้อยหนึ่งคอลัมน์ และ Sort Column ต้องเป็นคอลัมน์ที่แสดง
- คอลัมน์ `การกระทำ` แสดงเสมอและไม่อยู่ในค่าตั้งต้น
- เพิ่ม Dialog `ตั้งค่าตาราง` แบบ Responsive พร้อมเปิด/ปิดคอลัมน์ เลื่อนลำดับ คืนค่าเริ่มต้น และบันทึก
- เปลี่ยนปุ่ม Export ทั่วไปเป็น `Excel`
- Excel ทั่วไปใช้ข้อมูลตาม Tab, Search, Filter, Sort และคอลัมน์ที่แสดงใน Customer List
- Excel ทั่วไปเป็นไฟล์อ่านง่าย ประกอบด้วย Sheet `ข้อมูลลูกค้า` และ `ข้อมูลรายงาน`
- แยก Admin Update Template ออกเป็นปุ่ม `ดาวน์โหลดไฟล์สำหรับอัปเดต`
- ปุ่ม `อัปเดตจาก Excel` ยังคงรับเฉพาะ Update Template และใช้ Preview/Stale Protection เดิม
- Role `manager` ไม่สามารถสร้าง แก้ หรือส่ง Daily Report
- Admin และ User ยังสร้าง แก้ และส่ง Daily Report ของตนเองได้
- Manager ใช้หน้า `รายงานของทีม` เพื่อดู รับทราบ หรือส่งกลับแก้ไขเท่านั้น
- ปิดสิทธิ์ Manager ทั้ง Navigation, Route, Dashboard, RLS และ Report RPC
- Migration ปฏิเสธการติดตั้งหากพบรายงานที่มี Manager เป็นเจ้าของ เพื่อไม่แก้ประวัติโดยเงียบ
- เพิ่ม Migration, Verify, Rollback และ Operational Reset สำหรับ `v0.13.0`
- Cache Busting และ Internal Version Stamp เป็น `0.13.0-list-settings-excel-split-manager-review`

### 0.12.0-customer-excel-report-security-fee

- เพิ่ม `customers.monthly_service_fee numeric(14,2)` เป็นค่าบริการต่อเดือน หน่วยบาท
- ค่าบริการเป็น Optional, เว้นว่างหรือ `0` ได้ และห้ามติดลบ
- เพิ่มค่าบริการใน Create, Edit, Detail, Customer List, Excel Export/Import และ Customer Audit
- เปลี่ยน Customer Excel เป็น Workbook หลาย Sheet: Instructions, Customers, Owners, Contacts, Customer Accounts, Modules, Features, Notes, Audit Logs และ Master Reference
- Workbook ส่งออกลูกค้าที่ยังไม่ถูก Soft Delete ทั้งสถานะใช้งานและไม่ใช้งาน
- ไม่ส่งออก Password/PIN; แสดงเฉพาะ `has_password` และ `has_pin`
- เพิ่ม Admin-only Excel Update พร้อม Preview, Validation, Formula Rejection และ Stale Update Protection
- Excel Update แก้ได้เฉพาะข้อมูลเดิมใน Customers, Contacts, Customer Accounts และ Notes; ห้ามเพิ่ม ห้ามลบ และห้ามย้าย Child Row ไปยังลูกค้ารายอื่น
- Excel Update บันทึกผ่าน `admin_update_customers_from_excel_v1` ใน Transaction เดียว
- Admin, Manager และ User สร้าง/แก้/ส่ง Daily Report ของตนเองได้
- Daily Report สถานะ `draft` เห็นเฉพาะเจ้าของ แม้ผู้เปิดเป็น Admin หรือ Manager
- หน้า Team Report โหลดเฉพาะ `submitted`, `revision_required` และ `acknowledged`
- Customer Picker ในรายงานแสดงเฉพาะลูกค้า `active` และใช้ชื่อนิติบุคคลเป็นชื่อหลัก
- ลูกค้า inactive ที่อยู่ในรายงานเดิมยังแสดงเป็นประวัติ แต่ต้องนำออกก่อนบันทึกหรือส่งรายงานใหม่
- Backend ตรวจสถานะลูกค้าซ้ำใน Save Group, Save Item และ Submit Report
- Dashboard และกราฟลูกค้านับเฉพาะลูกค้า `active`
- เพิ่ม `create_customer_complete_v4` และ `save_daily_report_item_v3`
- เพิ่ม Migration, Verify, Rollback และ Operational Reset สำหรับ `v0.12.0`
- Cache Busting และ Internal Version Stamp เป็น `0.12.0-customer-excel-report-security-fee`

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
6. Admin กำหนดคอลัมน์และ Default Sort ของ Customer List เป็นค่ากลางสำหรับทุก Role
7. เซลล์หนึ่งรายการต่อลูกค้า
8. จำนวนผู้ใช้งานลูกค้าแบบกรอกเอง ตั้งแต่ 1 ขึ้นไป
9. ค่าบริการต่อเดือนแบบ Optional หน่วยบาท
10. ผู้รับผิดชอบหลายคนและผู้รับผิดชอบหลักหนึ่งคน
11. ผู้ติดต่อหลายคนและผู้ติดต่อหลักหนึ่งคน
12. บัญชีผู้ใช้งานลูกค้าหลายรายการ
13. โน้ตลูกค้าหลายรายการ
14. Module และ Feature หลายรายการต่อลูกค้า
15. Daily Report หนึ่งฉบับต่อเจ้าของต่อวันสำหรับ Admin และ User
16. Manager ตรวจ รับทราบ หรือส่งกลับ Daily Report ของทีม แต่เขียนรายงานไม่ได้
17. Dropdown Multi-select สำหรับกลุ่มลูกค้าระดับรายงานและลูกค้าเฉพาะรายการ
18. เลือกลูกค้าในรายงานได้เฉพาะลูกค้าสถานะ `active`
19. Daily Report Draft เป็นข้อมูลส่วนตัวของเจ้าของ
20. Excel รายการลูกค้าแบบอ่านง่ายตามหน้าจอ
21. Admin Update Template และ Admin Excel Update เฉพาะข้อมูลเดิม
22. Profile avatar, display name, admin-managed position และ Theme
23. Admin Branding และ Master Data
24. Hard Delete Master ที่ไม่ใช่ Global และยังไม่ถูกใช้งาน
25. Customer Audit จาก Database Trigger โดยไม่ทำสำเนา Credential

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
010_customer_excel_report_security_fee.sql
010_customer_excel_report_security_fee_verify.sql
010_customer_excel_report_security_fee_rollback.sql
011_customer_list_settings_excel_split_manager_review.sql
011_customer_list_settings_excel_split_manager_review_verify.sql
011_customer_list_settings_excel_split_manager_review_rollback.sql
reset_usage_data_scope_a_v0.13.0.sql
```

## 3. Roles and permissions

| Resource / Action | Admin | Manager | User |
|---|---:|---:|---:|
| อ่านลูกค้าที่ยังไม่ถูกลบ | Yes | Yes | Yes |
| สร้าง/แก้ไขลูกค้า | Yes | Yes | Yes |
| Soft Delete ลูกค้า | Yes | Yes | Yes |
| อ่าน/แก้บัญชีผู้ใช้งานลูกค้า | Yes | Yes | Yes |
| อ่าน/เพิ่ม/แก้/ลบโน้ตลูกค้า | Yes | Yes | Yes |
| สร้าง/แก้/ส่งรายงานของตนเอง | Yes | No | Yes |
| อ่าน Draft ของตนเอง | Yes | No | Yes |
| อ่าน Draft ของผู้อื่น | No | No | No |
| อ่านรายงานผู้อื่นหลังส่ง | Yes | Yes | No |
| Acknowledge / Request revision | Yes | Yes | No |
| ส่งออก Excel รายการลูกค้า | Yes | Yes | Yes |
| ดาวน์โหลด Template สำหรับอัปเดต | Yes | No | No |
| นำ Excel กลับมาอัปเดตข้อมูลเดิม | Yes | No | No |
| ตั้งค่าคอลัมน์และ Default Sort ของ Customer List | Yes | No | No |
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
- Admin และ User เท่านั้นที่เป็นเจ้าของ Daily Report ใหม่ได้
- Manager ไม่มีเมนูหรือ Route สำหรับเขียนรายงาน และ Database ปฏิเสธการ Insert/Edit/Submit
- Daily Report Draft อ่านได้เฉพาะเจ้าของ
- Admin/Manager เห็นรายงานผู้อื่นเมื่อสถานะเป็น `submitted`, `revision_required` หรือ `acknowledged`
- Browser ใช้ Publishable/Anon Key เท่านั้น ไม่มี `service_role` ใน Frontend
- Customer List Settings แก้ผ่าน Admin RPC เท่านั้น
- Browser ไม่มีสิทธิ์ Direct DELETE ตาราง Master; ต้องผ่าน Guarded RPC เท่านั้น
- Excel Update ต้องผ่าน `admin_update_customers_from_excel_v1`; Frontend ซ่อนปุ่มจาก Role อื่นและ RPC ตรวจ Admin ซ้ำ

## 4. Customer model

### 4.1 โครงสร้าง 6 ส่วน

1. **ข้อมูลพื้นฐาน**
   - ชื่อนิติบุคคล *
   - ชื่อย่อ
   - เลขประจำตัวผู้เสียภาษี *
   - จำนวนรถ *
   - จำนวนผู้ใช้งานลูกค้า * — จำนวนเต็ม `1–999999`
   - ค่าบริการต่อเดือน — Optional, หน่วยบาท, `0` ได้, ทศนิยมไม่เกิน 2 ตำแหน่ง
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

- Create ใช้ `create_customer_complete_v4` บันทึก Core, ค่าบริการ, Owners, Contacts, Customer Accounts, Modules, Features และ Notes ใน Transaction เดียว
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

จำนวนบน Tab นับจากลูกค้าที่ยังไม่ถูก Soft Delete ทั้งหมดและไม่เปลี่ยนตาม Search/Filter

### Global Customer List Settings

Admin เปิด Dialog `ตั้งค่าตาราง` เพื่อกำหนดค่ากลางสำหรับทุก Role:

- เลือกคอลัมน์ข้อมูลที่แสดง
- จัดลำดับคอลัมน์ด้วยปุ่มขึ้น/ลง
- เลือก Default Sort Column
- เลือกทิศทาง `น้อย → มาก` หรือ `มาก → น้อย`
- คืนค่าเริ่มต้นก่อนบันทึกได้

ข้อบังคับ:

- ต้องแสดงคอลัมน์ข้อมูลอย่างน้อยหนึ่งคอลัมน์
- Default Sort Column ต้องเป็นคอลัมน์ที่เปิดแสดง
- คอลัมน์ `การกระทำ` แสดงเสมอ ตรึงด้านขวา และซ่อนไม่ได้
- User สามารถ Sort/ย้ายคอลัมน์ชั่วคราวใน AG Grid ได้ แต่ไม่เปลี่ยนค่ากลาง
- ค่ากลางถูกเก็บใน `app_settings` และแก้ผ่าน Admin RPC เท่านั้น

คอลัมน์ที่ Admin เลือกได้:

- ชื่อนิติบุคคล
- ชื่อย่อ
- เลขประจำตัวผู้เสียภาษี
- จำนวนรถ
- ผู้รับผิดชอบ
- โมดูล
- ฟังก์ชัน
- สัญญา
- เซลล์
- ค่าบริการต่อเดือน
- จำนวนผู้ใช้งานลูกค้า
- จำนวนบัญชีที่บันทึก
- สอนใช้งานนอกสถานที่
- สถานะบัญชี
- ขั้นตอนเริ่มใช้งาน
- สถานะการนำเข้าข้อมูล
- ระดับความสนใจ
- วันที่เริ่มใช้งานจริง
- วันที่เริ่มวางบิล
- อัปเดตล่าสุด
- แก้ไขล่าสุดโดย

ตัวกรองรองรับ Search, Owner, Onboarding, Import, Engagement, Contract, Sales, Module, Feature, Fleet Range และ Date Range ส่วนสถานะบัญชีควบคุมผ่าน Tab

### Excel สำหรับอ่านและใช้งานทั่วไป

ปุ่ม `Excel` แสดงสำหรับทุก Role และสร้างไฟล์ที่เหมาะกับการอ่าน วิเคราะห์ หรือนำไปใช้งานต่อ:

- ใช้เฉพาะ Tab ปัจจุบัน
- ใช้ Search และ Advanced Filter ปัจจุบัน
- ใช้ลำดับ Sort ปัจจุบันของ AG Grid
- ใช้คอลัมน์ที่ Admin เปิดแสดงและลำดับคอลัมน์ปัจจุบัน
- ไม่รวมคอลัมน์ `การกระทำ`
- ไม่รวม UUID, Row Version, Password, PIN, Token หรือ Secret
- Sheet `ข้อมูลลูกค้า` เป็นตารางหลัก
- Sheet `ข้อมูลรายงาน` แสดงวันส่งออก จำนวนรายการ คอลัมน์ การเรียง และเงื่อนไขตัวกรอง

### Admin Update Template

Admin มีปุ่ม `ดาวน์โหลดไฟล์สำหรับอัปเดต` แยกจาก Excel ทั่วไป

Template ประกอบด้วย:

| Sheet | เนื้อหา | Import |
|---|---|---|
| `Instructions` | Template Version และกฎการใช้งาน | Read-only |
| `Customers` | ข้อมูลหลัก สถานะ วันที่ สัญญา ค่าบริการ และ Audit metadata | Update existing |
| `Owners` | ผู้รับผิดชอบและผู้รับผิดชอบหลัก | Read-only |
| `Contacts` | ผู้ติดต่อ | Update existing |
| `Customer Accounts` | Email, Notes, `has_password`, `has_pin` | Update Email/Notes |
| `Modules` | Module ที่ผูกกับลูกค้า | Read-only |
| `Features` | Feature ที่ผูกกับลูกค้า | Read-only |
| `Notes` | โน้ตลูกค้า | Update existing |
| `Audit Logs` | ประวัติการแก้ข้อมูลลูกค้า | Read-only |
| `Master Reference` | Code/Value ที่ใช้กรอกข้อมูล | Read-only |

Template ไม่ส่งออก `password_text`, `pin_text`, Token หรือ Secret

### Admin Excel Update

- ปุ่ม `อัปเดตจาก Excel` แสดงเฉพาะ Admin
- รองรับเฉพาะ `.xlsx` ที่สร้างจาก `ดาวน์โหลดไฟล์สำหรับอัปเดต`
- Template Version ปัจจุบันคือ `fi-customer-update-v1`
- อัปเดตได้เฉพาะ Row เดิมใน `Customers`, `Contacts`, `Customer Accounts`, `Notes`
- ห้ามสร้างลูกค้า/Child Row ใหม่
- ห้ามลบ Row และไม่ตีความ Row ที่หายไปว่าเป็นการลบ
- ห้ามเปลี่ยน `customer_id`
- จับคู่ด้วย UUID เท่านั้น
- ตรวจ Formula ใน Sheet ที่แก้ไขได้และปฏิเสธทั้งไฟล์
- ตรวจ Header, UUID, Master Value, Tax ID, Email, วันที่, จำนวน, Boolean และค่าบริการ
- ตรวจ `updated_at` ระดับ Row เพื่อป้องกันไฟล์เก่าเขียนทับข้อมูลใหม่
- แสดง Preview ค่าเดิม/ค่าใหม่ก่อนยืนยัน
- บันทึกทุก Row ผ่าน `admin_update_customers_from_excel_v1` ใน Transaction เดียว
- หาก Row ใดผิดหรือ Stale จะ Rollback ทั้งชุด
- Password/PIN เป็น Read-only นอก Workbook และ RPC ปฏิเสธ Payload ที่มีสอง Field นี้

## 6. Daily Report model

- Admin และ User มี Report ของตนเองได้หนึ่งฉบับต่อ `work_date`
- Manager ไม่มีสิทธิ์สร้าง แก้ หรือส่ง Daily Report
- Manager ใช้หน้า `รายงานของทีม` เพื่อดู รับทราบ หรือส่งกลับแก้ไขเท่านั้น
- Frontend ไม่แสดงเมนูเขียนรายงานให้ Manager และ Route Guard เปลี่ยนเส้นทางออก
- RLS/Policy และ Report RPC ปฏิเสธ Manager แม้เรียก API โดยตรง
- Report Item อยู่ใน Section `today` หรือ `tomorrow`
- Item หนึ่งข้อเชื่อมลูกค้าได้ 0 คนขึ้นไป
- Report หนึ่งฉบับมีกลุ่มลูกค้าระดับรายงานได้หนึ่งชุด
- Item เลือกใช้กลุ่มรายงานหรือเลือกลูกค้าเฉพาะ Item ได้
- Customer Picker ทั้งสองตำแหน่งเป็น Dropdown Multi-select ชุดเดียวกัน
- Picker แสดง `legal_name` เป็นชื่อหลักและใช้ `short_name` เป็นข้อมูลรองเท่านั้น
- Picker แสดงให้เลือกเฉพาะลูกค้า `account_status = active` และ `is_archived = false`
- ลูกค้า inactive ที่อยู่ในรายงานเดิมยังแสดงชื่อเพื่อรักษาประวัติ
- ลูกค้า inactive หรือ Soft Delete ต้องถูกนำออกก่อน Save Group, Save Item หรือ Submit
- Backend ตรวจสถานะลูกค้าซ้ำ ไม่พึ่งการกรองใน Frontend
- Draft เห็นเฉพาะเจ้าของรายงาน
- Admin/Manager เห็นรายงานผู้อื่นหลังสถานะเปลี่ยนเป็น `submitted`
- หน้า Team Report ไม่มีตัวกรอง Draft และ Query เฉพาะ `submitted`, `revision_required`, `acknowledged`
- การเปลี่ยนกลุ่มหรือ Item เพิ่ม `daily_reports.content_version`
- Manager/Admin ต้องส่ง `expected_content_version` เมื่อ Acknowledge หรือ Request Revision
- Report ที่ `acknowledged` ถูกล็อก
- Print และ Manager Review ใช้ชื่อนิติบุคคล
- Dashboard ของ Manager แสดงเฉพาะงานตรวจรายงาน ไม่มีส่วนรายงานประจำวันของตนเอง
- Dashboard ลูกค้าและกราฟนับเฉพาะลูกค้าสถานะใช้งาน

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
| `monthly_service_fee` | `numeric(14,2)` | Yes | บาท/เดือน, `NULL` หรือ `0` ได้, ห้ามติดลบ |
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

Indexes:

- `customers_sales_code_idx`
- `customers_customer_user_count_idx`
- `customers_monthly_service_fee_idx` — Partial index เฉพาะค่าที่ไม่เป็น `NULL`

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

`app_settings`

| Column | Type | Notes |
|---|---|---|
| `id` | `integer` | Singleton row `1` |
| Branding fields | | Login image, favicon และ metadata |
| `customer_list_columns` | `jsonb` | Array ชื่อคอลัมน์ที่แสดง; ไม่ว่าง ไม่ซ้ำ และอยู่ใน Whitelist |
| `customer_list_sort_column` | `text` | ต้องอยู่ใน Whitelist และอยู่ใน `customer_list_columns` |
| `customer_list_sort_direction` | `text` | `asc` หรือ `desc` |
| actor/timestamps | | |

ค่าเริ่มต้นของ Customer List:

```text
legal_name
fleet_size
module_text
contract_text
sales_text
monthly_service_fee
customer_user_count
onsite_training_count
import_text
engagement_text
updated_at
updated_by_name
```

Default Sort คือ `updated_at desc`

ตารางอื่น:

- `customer_audit_logs`

## 9. RPC and security boundary

Current RPCs used by this release:

- `create_customer_complete_v4`
- `save_customer_owners`
- `save_customer_contact`
- `archive_customer`
- `save_daily_report_customer_group`
- `save_daily_report_item_v3`
- `submit_daily_report`
- `acknowledge_daily_report`
- `request_daily_report_revision`
- `customer_accounts_export_safe_v1`
- `admin_update_customers_from_excel_v1`
- `admin_update_customer_list_settings_v1`
- `update_my_profile_display_name`
- `update_my_profile_details` — Compatibility RPC; rejects position changes
- `update_my_profile_preferences`
- `update_my_avatar_path`
- `admin_update_profile_full`
- `admin_update_profile_avatar`
- `admin_save_master_item_v3`
- `admin_master_item_usage_v1`
- `admin_delete_master_item_v1`

Compatibility RPC ที่ยังคงอยู่:

- `create_customer_complete_v3`
- `save_daily_report_item_v2` — ถูก Hardening ให้ตรวจลูกค้า active เช่นเดียวกับ v3

Security rules:

- RLS เปิดทุกตารางที่ Frontend เข้าถึง
- `app_private.can_read_daily_report` อนุญาตเจ้าของเสมอ และอนุญาต Admin/Manager เฉพาะรายงานที่ไม่ใช่ Draft
- `app_private.can_edit_daily_report` อนุญาตเฉพาะ Active Admin/User ที่เป็นเจ้าของและสถานะยังแก้ได้
- `daily_reports_insert_own` อนุญาตเฉพาะ Admin/User สร้าง Draft ของตนเอง
- `submit_daily_report` ตรวจ Role ซ้ำและปฏิเสธ Manager
- Security-definer RPC ตรวจ Active User/Role ภายในและกำหนด `search_path`
- Report RPC ตรวจ `account_status = active` และ `is_archived = false`
- Customer List Settings ตรวจ Whitelist, Duplicate, Empty List, Sort Column และ Sort Direction ทั้ง Constraint และ RPC
- `admin_update_customer_list_settings_v1` ตรวจ Admin และ Browser ไม่มี Direct UPDATE Grant สำหรับค่าตั้งต้นใหม่
- `customer_accounts_export_safe_v1` ส่งออกเฉพาะ Email/Notes และ Boolean `has_password`/`has_pin` โดยไม่คืนค่า Credential
- Excel Update RPC ตรวจ Admin, Template, Existing ID, Parent ID, Row Version และ Validation ภายใน Transaction
- Excel Update ปฏิเสธลูกค้าและ Child Row ที่ Parent ถูก Soft Delete
- Excel Update ไม่มี Insert/Delete Statement และไม่แตะ Password/PIN
- Browser ไม่มี Direct DELETE Grant/Policy สำหรับ Master Data
- Anon ไม่มีสิทธิ์ Execute Admin Excel/List Settings/Master Delete RPC
- Browser ใช้ Publishable/Anon Key เท่านั้น
- Position เปลี่ยนผ่าน Admin RPC เท่านั้น
- Credential ไม่แสดงใน List, Excel, Template, Toast หรือ Console โดยตั้งใจ

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
2. ยืนยันว่า Migration `010_customer_excel_report_security_fee` ติดตั้งแล้ว
3. ยืนยันว่าไม่มี Daily Report ที่มีเจ้าของ Role `manager`
4. รัน `011_customer_list_settings_excel_split_manager_review.sql`
5. รัน `011_customer_list_settings_excel_split_manager_review_verify.sql`
6. ตรวจว่า `failed_checks = 0`
7. Deploy Runtime Files ทั้ง 4 ไฟล์พร้อมกัน
8. Hard Refresh Browser
9. Smoke Test ด้วย Admin, Manager และ User

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
git commit -m "release: v0.13.0 list settings excel split manager review"
git push origin main

git tag -a v0.13.0-list-settings-excel-split-manager-review \
  -m "FI Customer Tracking v0.13.0 list settings excel split manager review"
git push origin v0.13.0-list-settings-excel-split-manager-review
```

### Post-deploy smoke test

Admin:

- เปิด `ตั้งค่าตาราง` เลือก/ซ่อน/จัดลำดับคอลัมน์และกำหนด Default Sort
- ตรวจค่าที่บันทึกหลัง Reload และตรวจว่าทุก Role เห็นค่าเดียวกัน
- ทดสอบไม่เลือกคอลัมน์เลย และเลือก Sort Column ที่ถูกซ่อน ต้องถูกปฏิเสธ
- กด `Excel` และตรวจว่าไฟล์ใช้ Tab, Filter, Sort และคอลัมน์ที่แสดง
- กด `ดาวน์โหลดไฟล์สำหรับอัปเดต` และตรวจว่าเป็น Template หลาย Sheet
- แก้ Customer/Contact/Account Notes/Customer Note แล้ว Import
- ตรวจ Preview และยืนยันว่า Database เปลี่ยนครบใน Transaction เดียว
- ทดสอบ UUID ปลอม, Row ใหม่, Formula, Master ปลอม และไฟล์ Stale
- ยืนยันว่า Manager/User ไม่เห็นปุ่มตั้งค่าและปุ่ม Update Template/Import

Manager:

- ไม่เห็นเมนู `รายงานประจำวันของฉัน`
- เปิด Route `#/daily-report` โดยตรงแล้วต้องถูก Redirect
- เรียก Insert/Edit/Submit รายงานโดยตรงแล้ว Database ต้องปฏิเสธ
- เปิด `รายงานของทีม`, Review, Acknowledge และ Request Revision ได้

User:

- สร้าง แก้ และส่ง Daily Report ของตนเองได้
- ไม่เห็น Draft ของผู้อื่น
- ไม่เห็นปุ่มตั้งค่าตาราง, Update Template หรือ Import

ทุก Role:

- ตรวจ Picker ว่าไม่แสดงลูกค้า inactive
- ตรวจรายงานเก่ายังแสดงชื่อนิติบุคคลของลูกค้า inactive
- ตรวจ Customer List, Search, Filter, Status Tab, Grid Sort และ Regular Excel
- ตรวจว่า Excel ไม่มี Password/PIN หรือ UUID สำหรับ Update

Regression:

- Customer Create/Edit/Detail/List/Soft Delete
- ค่าบริการและ Customer Audit
- Master Data Save/Usage/Delete/Global Icon
- Profile/Avatar/Theme/Brand
- Daily Report Draft/Submit/Revision/Acknowledge/Print
- Responsive Desktop/Tablet/Mobile

## 13. Rollback

1. สำรองฐานข้อมูล
2. Deploy Frontend `v0.12.0-customer-excel-report-security-fee`
3. รัน `011_customer_list_settings_excel_split_manager_review_rollback.sql`
4. Hard Refresh

Rollback จะ:

- ลบ `admin_update_customer_list_settings_v1`
- ลบคอลัมน์ Customer List Settings และ Constraints จาก `app_settings`
- คืนสิทธิ์เขียน Daily Report แบบ `v0.12.0` ซึ่ง Admin/Manager/User เขียนรายงานของตนเองได้
- คืน `app_private.can_edit_daily_report`, Insert Policy และ `submit_daily_report` เวอร์ชันเดิม
- เก็บ Customer, Contact, Account, Note, Fee และ Report Row เดิมไว้

> ค่าคอลัมน์และ Default Sort ที่ Admin ตั้งไว้จะหายเมื่อ Rollback การคืนค่าต้องอาศัย Backup หรือกำหนดใหม่หลังอัปเกรดอีกครั้ง

## 14. Operational reset

ใช้ `reset_usage_data_scope_a_v0.13.0.sql` เมื่อต้องการล้างข้อมูลใช้งานทั้งหมด

ลบ:

- Customers รวมค่าบริการและ Child Rows
- Contacts, Owners, Accounts, Notes, Module/Feature links และ Audit Logs
- Daily Reports, Items, Events และ Customer links

เก็บ:

- `auth.users`
- `profiles`
- Master Data และ Global markers
- Branding/App Settings
- Global Customer List Columns และ Default Sort
- Storage
- Migration History

Reset ไม่มี `CASCADE` หากมีตารางใหม่อ้างอิงข้อมูลโดยไม่อยู่ในรายการ คำสั่งจะล้มเหลวและ Rollback เพื่อป้องกันการลบเกินขอบเขต

## 15. Known limitations

- Edit Customer ปกติยังเป็น Sequential Save ไม่ใช่ Transaction รวม; Admin Excel Update เป็น Transaction เดียว
- Excel ทั่วไปเป็น Flat Customer List ตามหน้าจอ ไม่ใช่ไฟล์สำหรับนำกลับเข้า Database
- Excel ทั่วไปไม่รวม Child Sheet, UUID, Row Version, Password หรือ PIN
- Admin Update Template รองรับการแก้ Row เดิมใน Customers, Contacts, Customer Accounts และ Notes เท่านั้น
- Owners, Modules, Features, Audit Logs และ Master Reference เป็น Read-only ใน Update Template
- Excel Import ไม่เพิ่ม ไม่ลบ และไม่ย้าย Child Row ไปยังลูกค้ารายอื่น
- Excel Import ไม่แก้ Password/PIN
- การแก้หลายแถวที่มี Row ใด Stale หรือไม่ผ่าน Validation จะ Rollback ทั้งชุด
- Customer List Setting เป็นค่ากลางเดียวสำหรับทุก Role ยังไม่มี Personal View ต่อผู้ใช้
- คอลัมน์ `การกระทำ` แสดงเสมอและไม่สามารถปรับลำดับจาก Dialog ได้
- `sales_code` เป็นค่าว่างได้ เพื่อรองรับลูกค้าเดิมและกรณียังไม่สร้าง Sales Master
- จำนวนผู้ใช้งานลูกค้าที่กรอกอาจต่างจากจำนวนบัญชีที่สร้างไว้โดยตั้งใจ
- Password/PIN ของบัญชีผู้ใช้งานลูกค้าเป็น Plaintext ตาม Requirement
- Signed Avatar URL มีอายุจำกัดและต้องสร้างใหม่เมื่อโหลดข้อมูล
- จำนวนบน Customer Status Tab เป็นจำนวนรวมก่อนใช้ Search/Advanced Filter
- Master ที่ถูก Hard Delete ไม่สามารถ Undo ได้โดยไม่มี Backup
- Admin สามารถ Review รายงานของตนเองหลังส่งได้ เนื่องจากยังไม่มี Separation-of-Duties Rule
- Manager เป็น Review-only และไม่มี Daily Report ของตนเอง
- SQL/RLS, Concurrency และ Transaction ต้องทดสอบกับ Supabase Project จริงหลัง Deploy

