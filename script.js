(() => {
  "use strict";

  const APP_VERSION = "0.13.0-list-settings-excel-split-manager-review";
  window.FI_APP_VERSION = APP_VERSION;

  // Public browser configuration only. Never place a database password,
  // secret key, or service_role key in this file.
  const SUPABASE_URL = "https://edewezrgycqvhdtlprsw.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkZXdlenJneWNxdmhkdGxwcnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1Njc5NTIsImV4cCI6MjEwMTE0Mzk1Mn0.QPEkfCaRMOn77d_q5612MA1n-5EpJ7myiUdBpCFqQX8";

  const PUBLIC_MEDIA_BUCKET = "app-public-media";
  const AVATAR_BUCKET = "app-profile-media";
  const DEFAULT_FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%232f68e6'/%3E%3Cpath d='M17 18h31v9H27v8h17v9H27v13H17z' fill='white'/%3E%3C/svg%3E";
  const MASTER_GROUPS = {
    modules: { label: "โมดูล", source: "modules" },
    features: { label: "ฟังก์ชัน", source: "features" },
    onboarding_stage: { label: "ขั้นตอนเริ่มใช้งาน", source: "master_options" },
    import_status: { label: "สถานะการนำเข้าข้อมูล", source: "master_options" },
    engagement_level: { label: "ระดับความสนใจ", source: "master_options" },
    contract_type: { label: "ประเภทสัญญา", source: "master_options" },
    sales: { label: "เซลล์", source: "master_options" }
  };

  const CUSTOMER_LIST_COLUMN_CATALOG = [
    { key: "legal_name", label: "ชื่อนิติบุคคล", description: "แสดงชื่อย่อเป็นข้อมูลรองเมื่อมีค่า" },
    { key: "short_name", label: "ชื่อย่อ", description: "ชื่อย่อแบบคอลัมน์แยก" },
    { key: "tax_id", label: "เลขประจำตัวผู้เสียภาษี", description: "เลข 13 หลัก" },
    { key: "fleet_size", label: "จำนวนรถ", description: "จำนวนรถของลูกค้า" },
    { key: "owner_text", label: "ผู้รับผิดชอบ", description: "ผู้รับผิดชอบทั้งหมดและผู้รับผิดชอบหลัก" },
    { key: "module_text", label: "โมดูล", description: "โมดูลที่ลูกค้าใช้งาน" },
    { key: "feature_text", label: "ฟังก์ชัน", description: "ฟังก์ชันที่ลูกค้าใช้งาน" },
    { key: "contract_text", label: "สัญญา", description: "ประเภทสัญญา" },
    { key: "sales_text", label: "เซลล์", description: "เซลล์ผู้ดูแลลูกค้า" },
    { key: "monthly_service_fee", label: "ค่าบริการต่อเดือน", description: "หน่วยบาท" },
    { key: "customer_user_count", label: "จำนวนผู้ใช้งานลูกค้า", description: "จำนวนผู้ใช้งานที่กรอกไว้" },
    { key: "saved_account_count", label: "จำนวนบัญชีที่บันทึก", description: "จำนวนบัญชีผู้ใช้งานลูกค้าที่มีในระบบ" },
    { key: "onsite_training_count", label: "สอนใช้งานนอกสถานที่", description: "จำนวนครั้ง" },
    { key: "account_status_text", label: "สถานะบัญชี", description: "ใช้งานหรือไม่ใช้งาน" },
    { key: "onboarding_text", label: "ขั้นตอนเริ่มใช้งาน", description: "สถานะ Onboarding" },
    { key: "import_text", label: "สถานะการนำเข้าข้อมูล", description: "สถานะ Import" },
    { key: "engagement_text", label: "ระดับความสนใจ", description: "ระดับ Engagement" },
    { key: "start_date", label: "วันที่เริ่มใช้งานจริง", description: "วันที่ Go Live" },
    { key: "billing_date", label: "วันที่เริ่มวางบิล", description: "วันที่เริ่ม Billing" },
    { key: "updated_at", label: "อัปเดตล่าสุด", description: "วันและเวลาที่แก้ไขล่าสุด" },
    { key: "updated_by_name", label: "แก้ไขล่าสุดโดย", description: "ชื่อผู้แก้ไขล่าสุด" }
  ];

  const DEFAULT_CUSTOMER_LIST_COLUMNS = [
    "legal_name",
    "fleet_size",
    "module_text",
    "contract_text",
    "sales_text",
    "monthly_service_fee",
    "customer_user_count",
    "onsite_training_count",
    "import_text",
    "engagement_text",
    "updated_at",
    "updated_by_name"
  ];
  const DEFAULT_CUSTOMER_LIST_SORT_COLUMN = "updated_at";
  const DEFAULT_CUSTOMER_LIST_SORT_DIRECTION = "desc";
  const CUSTOMER_LIST_COLUMN_KEYS = new Set(CUSTOMER_LIST_COLUMN_CATALOG.map((column) => column.key));

  const LABELS = {
    role: { admin: "ผู้ดูแลระบบ", manager: "ผู้จัดการ", user: "ผู้ใช้งาน" },
    account_status: { active: "ใช้งาน", inactive: "ไม่ใช้งาน" },
    onboarding_stage: {
      to_do: "ต้องดำเนินการ",
      pending_data: "รอข้อมูล",
      onboarding: "เริ่มใช้งาน",
      training_completed: "อบรมแล้ว",
      go_live: "เริ่มใช้งานจริง"
    },
    import_status: { waiting: "รอดำเนินการ", in_process: "กำลังดำเนินการ", done: "เสร็จแล้ว" },
    engagement_level: { interest: "สนใจ", neutral: "ทั่วไป" },
    contract_type: { monthly: "รายเดือน", annual: "รายปี" },
    report_status: {
      draft: "ฉบับร่าง",
      submitted: "ส่งแล้ว",
      acknowledged: "รับทราบแล้ว",
      revision_required: "ส่งกลับให้แก้ไข"
    },
    event_type: {
      created: "สร้างรายงาน",
      submitted: "ส่งรายงาน",
      resubmitted: "ส่งรายงานอีกครั้ง",
      acknowledged: "ผู้จัดการรับทราบ",
      revision_requested: "ส่งกลับให้แก้ไข"
    }
  };

  const state = {
    client: null,
    session: null,
    profile: null,
    profiles: [],
    customers: [],
    customerOwners: [],
    customerModules: [],
    customerFeatures: [],
    customerAccounts: [],
    customerNotes: [],
    masterUsage: new Map(),
    modules: [],
    features: [],
    masterOptions: [],
    systemSettings: {
      id: 1,
      login_image_path: null,
      favicon_path: null,
      customer_list_columns: [...DEFAULT_CUSTOMER_LIST_COLUMNS],
      customer_list_sort_column: DEFAULT_CUSTOMER_LIST_SORT_COLUMN,
      customer_list_sort_direction: DEFAULT_CUSTOMER_LIST_SORT_DIRECTION,
      updated_at: null
    },
    customerListSettingsAvailable: true,
    customerListSettingsDraft: null,
    currentCustomer: null,
    currentCustomerData: null,
    currentDailyReport: null,
    currentDailyItems: [],
    currentDailyItemCustomers: [],
    currentDailyGroupCustomerIds: [],
    managerReports: [],
    reviewReport: null,
    customerEditDraft: null,
    filteredCustomerRows: [],
    filteredManagerRows: [],
    excelImportPreview: null,
    routeRenderToken: 0,
    authHandling: false,
    loadingCount: 0,
    configurationLoaded: false,
    publicSettingsLoaded: false,
    grids: {
      customers: null,
      managerReports: null,
      users: null
    },
    charts: [],
    dashboardChartData: null,
    ui: {
      themePreviewDirty: false,
      currentRouteName: null,
      customerFilters: {
        search: "",
        accountTab: "active",
        owner: "",
        onboarding: "",
        importStatus: "",
        engagement: "",
        contractType: "",
        salesCode: "",
        moduleId: "",
        featureId: "",
        fleetMin: "",
        fleetMax: "",
        startFrom: "",
        startTo: "",
        billingFrom: "",
        billingTo: "",
        advancedOpen: false
      },
      managerFilters: {
        date: "",
        userId: "",
        status: ""
      },
      profileDrafts: new Map(),
      customerDraftSaveTimer: null,
      dateRangeDraft: {
        kind: null,
        from: "",
        to: "",
        preset: ""
      }
    }
  };

  const el = {
    loginView: document.getElementById("login-view"),
    appView: document.getElementById("app-view"),
    loginForm: document.getElementById("login-form"),
    loginButton: document.getElementById("login-button"),
    configWarning: document.getElementById("config-warning"),
    mainContent: document.getElementById("main-content"),
    mainNav: document.getElementById("main-nav"),
    sidebar: document.getElementById("sidebar"),
    topbarPageLabel: document.getElementById("topbar-page-label"),
    currentUserName: document.getElementById("current-user-name"),
    currentUserRole: document.getElementById("current-user-role"),
    currentUserAvatar: document.getElementById("current-user-avatar"),
    loginBrandingMedia: document.getElementById("login-branding-media"),
    loginBrandingFallback: document.getElementById("login-branding-fallback"),
    appFavicon: document.getElementById("app-favicon"),
    avatarDialog: document.getElementById("avatar-dialog"),
    avatarForm: document.getElementById("avatar-form"),
    avatarDialogTitle: document.getElementById("avatar-dialog-title"),
    avatarPreview: document.getElementById("avatar-preview"),
    avatarFile: document.getElementById("avatar-file"),
    avatarRemoveButton: document.getElementById("avatar-remove-button"),
    avatarSaveButton: document.getElementById("avatar-save-button"),
    dateRangeDialog: document.getElementById("date-range-dialog"),
    dateRangeForm: document.getElementById("date-range-form"),
    dateRangeTitle: document.getElementById("date-range-title"),
    dateRangeFromDisplay: document.getElementById("date-range-from-display"),
    dateRangeFrom: document.getElementById("date-range-from"),
    dateRangeToDisplay: document.getElementById("date-range-to-display"),
    dateRangeTo: document.getElementById("date-range-to"),
    loadingOverlay: document.getElementById("loading-overlay"),
    loadingText: document.getElementById("loading-text"),
    contactDialog: document.getElementById("contact-dialog"),
    contactForm: document.getElementById("contact-form"),
    customerUserDialog: document.getElementById("customer-user-dialog"),
    customerUserForm: document.getElementById("customer-user-form"),
    customerUserDialogTitle: document.getElementById("customer-user-dialog-title"),
    customerNoteDialog: document.getElementById("customer-note-dialog"),
    customerNoteForm: document.getElementById("customer-note-form"),
    customerNoteDialogTitle: document.getElementById("customer-note-dialog-title"),
    reportDialog: document.getElementById("report-dialog"),
    reportDialogContent: document.getElementById("report-dialog-content"),
    revisionDialog: document.getElementById("revision-dialog"),
    revisionForm: document.getElementById("revision-form"),
    confirmDialog: document.getElementById("confirm-dialog"),
    confirmTitle: document.getElementById("confirm-title"),
    confirmMessage: document.getElementById("confirm-message"),
    confirmOkButton: document.getElementById("confirm-ok-button"),
    customerExcelImportFile: document.getElementById("customer-excel-import-file"),
    excelImportDialog: document.getElementById("excel-import-dialog"),
    excelImportDialogContent: document.getElementById("excel-import-dialog-content"),
    excelImportConfirmButton: document.getElementById("excel-import-confirm-button"),
    customerListSettingsDialog: document.getElementById("customer-list-settings-dialog"),
    customerListSettingsColumns: document.getElementById("customer-list-settings-columns"),
    customerListSortColumn: document.getElementById("customer-list-sort-column"),
    customerListSortDirection: document.getElementById("customer-list-sort-direction"),
    customerListSettingsSaveButton: document.getElementById("customer-list-settings-save-button"),
    toastRegion: document.getElementById("toast-region"),
    printRoot: document.getElementById("print-root")
  };

  function h(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function nullable(value) {
    const trimmed = String(value ?? "").trim();
    return trimmed === "" ? null : trimmed;
  }

  function defaultCustomerListSettings() {
    return {
      customer_list_columns: [...DEFAULT_CUSTOMER_LIST_COLUMNS],
      customer_list_sort_column: DEFAULT_CUSTOMER_LIST_SORT_COLUMN,
      customer_list_sort_direction: DEFAULT_CUSTOMER_LIST_SORT_DIRECTION
    };
  }

  function normalizeCustomerListSettings(settings = {}) {
    const rawColumns = Array.isArray(settings.customer_list_columns)
      ? settings.customer_list_columns
      : [];
    const columns = [...new Set(
      rawColumns
        .map((value) => String(value || "").trim())
        .filter((value) => CUSTOMER_LIST_COLUMN_KEYS.has(value))
    )];
    const safeColumns = columns.length ? columns : [...DEFAULT_CUSTOMER_LIST_COLUMNS];
    const requestedSort = String(settings.customer_list_sort_column || "").trim();
    const sortColumn = safeColumns.includes(requestedSort)
      ? requestedSort
      : (safeColumns.includes(DEFAULT_CUSTOMER_LIST_SORT_COLUMN)
        ? DEFAULT_CUSTOMER_LIST_SORT_COLUMN
        : safeColumns[0]);
    const sortDirection = settings.customer_list_sort_direction === "asc" ? "asc" : "desc";
    return {
      customer_list_columns: safeColumns,
      customer_list_sort_column: sortColumn,
      customer_list_sort_direction: sortDirection
    };
  }

  function currentCustomerListSettings() {
    return normalizeCustomerListSettings(state.systemSettings || defaultCustomerListSettings());
  }

  function customerListColumnMeta(key) {
    return CUSTOMER_LIST_COLUMN_CATALOG.find((column) => column.key === key) || null;
  }

  function canWriteOwnDailyReport() {
    return ["admin", "user"].includes(state.profile?.role);
  }

  function assertCanWriteOwnDailyReport() {
    if (!canWriteOwnDailyReport()) {
      throw new Error("Manager cannot write daily reports");
    }
  }

  function createDraftKey() {
    if (typeof window.crypto?.randomUUID === "function") {
      return `new-${window.crypto.randomUUID()}`;
    }
    const randomPart = Math.random().toString(36).slice(2, 12);
    return `new-${Date.now().toString(36)}-${randomPart}`;
  }
  function label(group, value) {
    if (value === null || value === undefined || value === "") return "-";
    const masterGroup = ["onboarding_stage", "import_status", "engagement_level", "contract_type", "sales"].includes(group)
      ? group
      : null;
    if (masterGroup) {
      const option = state.masterOptions.find((item) =>
        item.group_key === masterGroup && item.option_value === String(value)
      );
      if (option?.display_name) return option.display_name;
    }
    return LABELS[group]?.[value] ?? String(value);
  }

  function masterOptions(groupKey, { includeInactive = false, currentValue = null } = {}) {
    return state.masterOptions
      .filter((item) =>
        item.group_key === groupKey
        && (includeInactive || item.is_active || item.option_value === currentValue)
      )
      .sort((a, b) =>
        Number(a.sort_order || 0) - Number(b.sort_order || 0)
        || String(a.display_name).localeCompare(String(b.display_name), "th")
      );
  }

  function masterOptionHtml(groupKey, currentValue = "", { allowBlank = true } = {}) {
    const rows = masterOptions(groupKey, { currentValue });
    return `${allowBlank ? '<option value="">ไม่ระบุ</option>' : ""}${rows.map((item) => `
      <option value="${h(item.option_value)}" ${String(currentValue || "") === String(item.option_value) ? "selected" : ""}>
        ${h(item.display_name)}${!item.is_active ? " (ปิดใช้งาน)" : ""}
      </option>
    `).join("")}`;
  }

  function icon(name) {
    const paths = {
      dashboard: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/>',
      customers: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h4M7 16h6"/>',
      report: '<path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4M9 11h6M9 15h6"/>',
      team: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M16 11a4 4 0 0 1 4 4v2"/>',
      users: '<circle cx="9" cy="7" r="4"/><path d="M2 21v-2a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v2M17 5h5M19.5 2.5v5"/>',
      profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
      building: '<path d="M4 21V4h11v17M15 9h5v12M8 8h3M8 12h3M8 16h3M18 13h.01M18 17h.01"/>',
      rocket: '<path d="M4 13c-1 1-2 4-2 4s3-1 4-2M14 3c4-1 7 0 7 0s1 3 0 7l-6 6-7-7z"/><path d="m9 15-1 5 5-1M15 9h.01"/>',
      import: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 21h16"/>',
      archive: '<path d="M3 6h18M5 6v14h14V6M9 10h6"/><path d="M4 3h16v3H4z"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      refresh: '<path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M6.5 8a7 7 0 0 1 11-2l2.5 3M4 15l2.5 3a7 7 0 0 0 11-2"/>',
      chevronLeft: '<path d="m15 18-6-6 6-6"/>',
      chevronRight: '<path d="m9 18 6-6-6-6"/>',
      calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
      palette: '<path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 0-10z"/><path d="M7.5 10h.01M9 6.5h.01M14 6.5h.01"/>',
      edit: '<path d="m4 20 4.5-1 10-10a2 2 0 0 0-3-3l-10 10z"/><path d="m14.5 7.5 3 3"/>',
      eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
      download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 21h16"/>',
      save: '<path d="M5 3h12l2 2v16H5z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>',
      delete: '<path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/>',
      globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
      settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9A1.7 1.7 0 0 0 21 10h.1v4H21a1.7 1.7 0 0 0-1.6 1z"/>',
      link: '<path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1"/>',
      database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7"/>',
      image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 15-5-5L5 20"/>',
      camera: '<path d="M4 7h3l2-3h6l2 3h3v13H4z"/><circle cx="12" cy="13" r="4"/>',
      external: '<path d="M14 3h7v7M10 14 21 3"/><path d="M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6"/>'
    };
    const body = paths[name] || paths.dashboard;
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  }


  function userInitials(name) {
    const parts = String(name || "FI").trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase() || "FI";
  }

  function pageHeader(title, description = "", actions = "", breadcrumbs = []) {
    const crumbs = [
      '<a href="#/dashboard">หน้าหลัก</a>',
      ...breadcrumbs.map((crumb) => crumb.href
        ? `<a href="${h(crumb.href)}">${h(crumb.label)}</a>`
        : `<span>${h(crumb.label)}</span>`)
    ];
    return `
      <div class="page-header">
        <div class="page-heading">
          <nav class="breadcrumb" aria-label="ลำดับหน้า">
            ${crumbs.map((crumb, index) => `${index ? '<span class="breadcrumb-separator">/</span>' : ""}${crumb}`).join("")}
          </nav>
          <h1>${h(title)}</h1>
          ${description ? `<p class="muted">${h(description)}</p>` : ""}
        </div>
        ${actions ? `<div class="page-actions">${actions}</div>` : ""}
      </div>`;
  }

  function paginationMeta(total, page, pageSize) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = total ? (safePage - 1) * pageSize + 1 : 0;
    const end = Math.min(total, safePage * pageSize);
    return { totalPages, page: safePage, start, end };
  }


  function bangkokDate(offsetDays = 0) {
    const now = new Date();
    const bangkok = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
    bangkok.setDate(bangkok.getDate() + offsetDays);
    const year = bangkok.getFullYear();
    const month = String(bangkok.getMonth() + 1).padStart(2, "0");
    const day = String(bangkok.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  function normalizeError(error) {
    const message = error?.message || String(error || "เกิดข้อผิดพลาด");
    const known = [
      ["customer_user_accounts_customer_email_uq", "อีเมลผู้ใช้งานลูกค้านี้มีอยู่แล้ว"],
      ["Customer account emails are required and must be unique", "อีเมลผู้ใช้งานลูกค้าต้องไม่ว่างและห้ามซ้ำ"],
      ["Customer account email is invalid", "รูปแบบอีเมลผู้ใช้งานลูกค้าไม่ถูกต้อง"],
      ["Customer user count must be between 1 and 999999", "จำนวนผู้ใช้งานลูกค้าต้องเป็นจำนวนเต็มตั้งแต่ 1 ถึง 999999"],
      ["Monthly service fee must be nonnegative", "ค่าบริการต้องเป็นจำนวนเงินไม่ติดลบและมีทศนิยมไม่เกิน 2 ตำแหน่ง"],
      ["Excel import payload", "รูปแบบข้อมูลนำเข้าจาก Excel ไม่ถูกต้อง"],
      ["Excel import stale", "ข้อมูลในระบบถูกแก้หลังส่งออก กรุณาส่งออก Excel ใหม่"],
      ["Selected report customers must be active", "รายงานมีลูกค้าที่ไม่อยู่ในสถานะใช้งาน กรุณานำออกก่อนส่ง"],
      ["Manager cannot write daily reports", "บัญชีผู้จัดการมีสิทธิ์ตรวจรายงานเท่านั้น ไม่สามารถเขียนหรือส่งรายงานได้"],
      ["Customer list settings", "การตั้งค่าตารางลูกค้าไม่ถูกต้อง"],
      ["Admin permission required", "รายการนี้ทำได้เฉพาะผู้ดูแลระบบ"],
      ["Migration 011_customer_list_settings_excel_split_manager_review", "ฐานข้อมูลยังไม่ได้ติดตั้ง Migration 011"],
      ["Migration 010_customer_excel_report_security_fee", "ฐานข้อมูลยังไม่ได้ติดตั้ง Migration 010"],
      ["Invalid sales master", "เซลล์ที่เลือกไม่ถูกต้องหรือถูกปิดใช้งาน"],
      ["Customer note text is required", "กรุณาระบุรายละเอียดโน้ตลูกค้า"],
      ["Only admin can update profile position", "ตำแหน่งแก้ไขได้เฉพาะผู้ดูแลระบบ"],
      ["System master item cannot be deleted", "ข้อมูลส่วนกลางไม่สามารถลบได้"],
      ["Master item is in use", "รายการนี้ถูกใช้งานแล้วและไม่สามารถลบได้"],
      ["Master item not found", "ไม่พบข้อมูลตัวเลือกที่ต้องการ"],
      ["Migration 009_master_delete_customer_tabs_report_picker", "ฐานข้อมูลยังไม่ได้ติดตั้ง Migration 009"],
      ["Every selected customer must be active", "ลูกค้าที่เลือกบางรายการไม่พร้อมใช้งาน กรุณาโหลดข้อมูลใหม่"],
      ["customers_tax_id", "เลขประจำตัวผู้เสียภาษีนี้มีอยู่แล้ว"],
      ["master_options_group_sort_order_uq", "ลำดับการแสดงนี้ถูกใช้งานแล้วในหมวดเดียวกัน"],
      ["modules_sort_order_uq", "ลำดับการแสดงของโมดูลนี้ถูกใช้งานแล้ว"],
      ["features_sort_order_uq", "ลำดับการแสดงของฟังก์ชันนี้ถูกใช้งานแล้ว"],
      ["Sort order is already used", "ลำดับการแสดงนี้ถูกใช้งานแล้วในหมวดเดียวกัน"],
      ["Sort order must be between 1 and 9999", "ลำดับการแสดงต้องเป็นจำนวนเต็มตั้งแต่ 1 ถึง 9999"],
      ["Invalid contract type", "ประเภทสัญญาไม่ถูกต้องหรือถูกนำออกจากข้อมูลตัวเลือกกลาง"],
      ["Invalid login credentials", "อีเมลหรือรหัสผ่านไม่ถูกต้อง"],
      ["Email not confirmed", "บัญชียังไม่ได้ยืนยันอีเมล"],
      ["Only one active manager is allowed", "ระบบอนุญาตให้มีผู้จัดการที่เปิดใช้งานได้เพียง 1 คน"],
      ["Daily report is locked", "รายงานนี้ถูกล็อกแล้ว"],
      ["Report content changed", "เนื้อหารายงานมีการเปลี่ยนแปลง กรุณาโหลดใหม่"],
      ["Add at least one report item", "กรุณาเพิ่มรายการอย่างน้อย 1 ข้อก่อนส่ง"],
      ["A revision reason is required", "กรุณาระบุเหตุผลที่ส่งกลับ"],
      ["permission denied", "คุณไม่มีสิทธิ์ทำรายการนี้"],
      ["row-level security", "คุณไม่มีสิทธิ์เข้าถึงหรือแก้ไขข้อมูลนี้"],
      ["You cannot edit this customer", "คุณไม่มีสิทธิ์แก้ไขลูกค้ารายนี้"],
      ["Primary owner must be included", "ผู้รับผิดชอบหลักต้องอยู่ในรายชื่อผู้รับผิดชอบ"],
      ["Every owner must be an active profile", "ผู้รับผิดชอบทุกคนต้องเป็นบัญชีที่เปิดใช้งาน"],
      ["Contact name is required", "กรุณาระบุชื่อผู้ติดต่อ"],
      ["Customer contact not found", "ไม่พบข้อมูลผู้ติดต่อ"],
      ["duplicate key value", "ข้อมูลซ้ำกับรายการที่มีอยู่แล้ว"],
      ["Failed to fetch", "เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ"],
      ["JWT expired", "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่"],
      ["Could not find the function", "ระบบฐานข้อมูลยังติดตั้งส่วนที่จำเป็นไม่ครบ"]
    ];
    const match = known.find(([needle]) => message.includes(needle));
    if (match) return match[1];
    if (/[ก-๙]/.test(message)) return message;
    return error?.code
      ? `เกิดข้อผิดพลาด (${String(error.code)})`
      : "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง";
  }

  function showToast(message, type = "success") {
    const node = document.createElement("div");
    node.className = `toast ${type}`;
    node.textContent = message;
    el.toastRegion.appendChild(node);
    window.setTimeout(() => node.remove(), 4500);
  }

  function showError(error, fallback = "ทำรายการไม่สำเร็จ") {
    console.error(error);
    showToast(`${fallback}: ${normalizeError(error)}`, "error");
  }

  function setLoading(active, text = "กำลังโหลด...") {
    if (active) {
      state.loadingCount += 1;
      el.loadingText.textContent = text;
    } else {
      state.loadingCount = Math.max(0, state.loadingCount - 1);
    }
    const visible = state.loadingCount > 0;
    el.loadingOverlay.classList.toggle("hidden", !visible);
    document.body.classList.toggle("global-loading", visible);
  }

  function setButtonBusy(button, busy, busyText = "กำลังบันทึก...") {
    if (!button) return;
    if (busy) {
      if (!button.dataset.originalHtml) button.dataset.originalHtml = button.innerHTML;
      button.innerHTML = `<span class="spinner spinner-button" aria-hidden="true"></span><span>${h(busyText)}</span>`;
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
    } else {
      if (button.dataset.originalHtml) button.innerHTML = button.dataset.originalHtml;
      button.disabled = false;
      button.removeAttribute("aria-busy");
      delete button.dataset.originalHtml;
    }
  }


  function openDialog(dialog) {
    if (dialog && !dialog.open) dialog.showModal();
  }

  function closeDialog(dialog) {
    if (dialog?.open) dialog.close();
  }

  function confirmAction(message, title = "ยืนยันรายการ", dangerText = "ยืนยัน") {
    return new Promise((resolve) => {
      el.confirmTitle.textContent = title;
      el.confirmMessage.textContent = message;
      el.confirmOkButton.textContent = dangerText;
      const onClose = () => {
        el.confirmDialog.removeEventListener("close", onClose);
        resolve(el.confirmDialog.returnValue === "confirm");
      };
      el.confirmDialog.addEventListener("close", onClose);
      openDialog(el.confirmDialog);
    });
  }

  function isConfigured() {
    return (
      SUPABASE_URL.startsWith("https://") &&
      !SUPABASE_URL.includes("YOUR_PROJECT_REF") &&
      SUPABASE_PUBLISHABLE_KEY &&
      !SUPABASE_PUBLISHABLE_KEY.includes("YOUR_PUBLISHABLE_KEY")
    );
  }

  function normalizeHex(value, fallback = "#2f68e6") {
    const candidate = String(value || "").trim();
    if (/^#[0-9a-f]{6}$/i.test(candidate)) return candidate.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(candidate)) {
      return `#${candidate.slice(1).split("").map((char) => char + char).join("")}`.toLowerCase();
    }
    return fallback;
  }

  function hexToRgb(value) {
    const hex = normalizeHex(value).slice(1);
    return {
      r: Number.parseInt(hex.slice(0, 2), 16),
      g: Number.parseInt(hex.slice(2, 4), 16),
      b: Number.parseInt(hex.slice(4, 6), 16)
    };
  }

  function rgbToHex({ r, g, b }) {
    const channel = (value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0");
    return `#${channel(r)}${channel(g)}${channel(b)}`;
  }

  function mixHex(source, target, weight) {
    const a = hexToRgb(source);
    const b = hexToRgb(target);
    const ratio = Math.max(0, Math.min(1, Number(weight)));
    return rgbToHex({
      r: a.r + (b.r - a.r) * ratio,
      g: a.g + (b.g - a.g) * ratio,
      b: a.b + (b.b - a.b) * ratio
    });
  }

  function rgbaFromHex(value, alpha) {
    const { r, g, b } = hexToRgb(value);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function contrastTextForHex(value) {
    const { r, g, b } = hexToRgb(value);
    const channels = [r, g, b].map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    return luminance > 0.52 ? "#111827" : "#ffffff";
  }

  function resolvedThemeMode(mode = state.profile?.theme_mode || "light") {
    if (mode === "system") {
      return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return mode === "dark" ? "dark" : "light";
  }

  function applyThemePreferences(preferences = {}, options = {}) {
    const mode = preferences.theme_mode || state.profile?.theme_mode || "light";
    const accent = normalizeHex(preferences.theme_accent || state.profile?.theme_accent || "#2f68e6");
    const resolved = resolvedThemeMode(mode);
    const root = document.documentElement;
    const surface = resolved === "dark" ? "#161c28" : "#ffffff";
    const background = resolved === "dark" ? "#0f141d" : "#f5f7fb";
    const textOnAccent = contrastTextForHex(accent);
    const hover = mixHex(accent, resolved === "dark" ? "#ffffff" : "#000000", 0.16);
    const strong = mixHex(accent, resolved === "dark" ? "#ffffff" : "#000000", 0.28);
    const soft = mixHex(accent, surface, resolved === "dark" ? 0.80 : 0.90);
    const softer = mixHex(accent, surface, resolved === "dark" ? 0.90 : 0.96);
    const border = mixHex(accent, surface, resolved === "dark" ? 0.58 : 0.72);

    root.dataset.theme = resolved;
    document.body.dataset.agThemeMode = resolved;
    root.style.setProperty("--primary", accent);
    root.style.setProperty("--primary-hover", hover);
    root.style.setProperty("--primary-strong", strong);
    root.style.setProperty("--primary-soft", soft);
    root.style.setProperty("--primary-softer", softer);
    root.style.setProperty("--primary-border", border);
    root.style.setProperty("--primary-contrast", textOnAccent);
    root.style.setProperty("--primary-shadow", rgbaFromHex(accent, resolved === "dark" ? 0.34 : 0.22));
    root.style.setProperty("--primary-glow", rgbaFromHex(accent, resolved === "dark" ? 0.24 : 0.13));
    root.style.setProperty("--focus", rgbaFromHex(accent, resolved === "dark" ? 0.34 : 0.22));
    root.style.setProperty("--brand-blue", accent);
    root.style.setProperty("--brand-blue-strong", strong);
    root.style.setProperty("--brand-cyan", mixHex(accent, "#2dcfc6", 0.48));
    root.style.setProperty("--brand-mint", mixHex(accent, "#35dfa0", 0.58));
    root.style.setProperty("--theme-surface", surface);
    root.style.setProperty("--theme-background", background);

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute("content", accent);

    if (options.preview) state.ui.themePreviewDirty = true;
    refreshDynamicTheme();
  }

  function resetThemePreview() {
    state.ui.themePreviewDirty = false;
    applyThemePreferences({
      theme_mode: state.profile?.theme_mode || "light",
      theme_accent: state.profile?.theme_accent || "#2f68e6"
    });
  }

  function getCssVar(name, fallback) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  }

  function formatMoney(value) {
    if (value === null || value === undefined || value === "") return "-";
    const number = Number(value);
    if (!Number.isFinite(number)) return "-";
    return `${number.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท`;
  }

  function formatDate(value) {
    if (!value) return "-";
    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  function formatDateTime(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Bangkok",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(date);
    const part = (type) => parts.find((item) => item.type === type)?.value || "";
    return `${part("day")}/${part("month")}/${part("year")} ${part("hour")}:${part("minute")}`;
  }

  function parseDisplayDate(value) {
    const match = String(value || "").trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    if (year < 1900 || year > 2200) return null;
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) return null;
    return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function maskDateValue(value) {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }

function dateControlHtml({
  id,
  name = id,
  label: fieldLabel,
  value = "",
  required = false,
  help = ""
}) {
  const displayId = `${id}-display`;
  const helpId = `${id}-help`;
  const describedBy = help ? ` aria-describedby="${h(helpId)}"` : "";
  return `
    <div class="form-field date-field">
      <label for="${h(displayId)}">
        <span class="field-label">${h(fieldLabel)}${required ? ' <span class="required">*</span>' : ""}</span>
        <div class="date-control" data-date-control>
          <input id="${h(displayId)}" data-date-display type="text" inputmode="numeric"
                 autocomplete="off" placeholder="01/01/2026" maxlength="10"
                 value="${value ? h(formatDate(value)) : ""}"${describedBy}
                 ${required ? "required" : ""}>
          <button type="button" class="date-picker-button" data-action="open-date-picker"
                  aria-label="เปิดปฏิทินสำหรับ ${h(fieldLabel)}">${icon("calendar")}</button>
          <input id="${h(id)}" name="${h(name)}" data-date-native class="native-date-picker"
                 type="date" value="${h(value || "")}" tabindex="-1" aria-hidden="true">
        </div>
        ${help ? `<small id="${h(helpId)}" class="field-help">${h(help)}</small>` : ""}
      </label>
    </div>`;
}

  function syncDateControlFromDisplay(display, notify = false) {
    const control = display.closest("[data-date-control]");
    const native = control?.querySelector("[data-date-native]");
    if (!native) return false;
    display.value = maskDateValue(display.value);
    const empty = display.value.trim() === "";
    const iso = parseDisplayDate(display.value);
    const valid = empty || Boolean(iso);
    display.setCustomValidity(valid ? "" : "กรุณากรอกวันที่รูปแบบ DD/MM/YYYY ที่ถูกต้อง");
    if (valid) {
      const nextValue = iso || "";
      const changed = native.value !== nextValue;
      native.value = nextValue;
      if (notify && changed) {
        native.dispatchEvent(new CustomEvent("datevaluechange", { bubbles: true }));
      }
    }
    return valid;
  }

  function syncDateControlFromNative(native, notify = true) {
    const display = native.closest("[data-date-control]")?.querySelector("[data-date-display]");
    if (!display) return;
    display.value = native.value ? formatDate(native.value) : "";
    display.setCustomValidity("");
    if (notify) native.dispatchEvent(new CustomEvent("datevaluechange", { bubbles: true }));
  }

  function validateDateControls(scope = document) {
    const displays = [...scope.querySelectorAll("[data-date-display]")];
    const valid = displays.every((display) => syncDateControlFromDisplay(display, false));
    if (!valid) displays.find((display) => !display.checkValidity())?.reportValidity();
    return valid;
  }

  function dateValue(scope, nameOrId) {
    const native = scope.querySelector(`[data-date-native][name="${CSS.escape(nameOrId)}"]`)
      || scope.querySelector(`#${CSS.escape(nameOrId)}[data-date-native]`);
    return native?.value || null;
  }

  function dateRangeConfig(kind) {
    const configs = {
      start: {
        title: "ช่วงวันที่เริ่มใช้งานจริง",
        fromKey: "startFrom",
        toKey: "startTo"
      },
      billing: {
        title: "ช่วงวันที่เริ่มวางบิล",
        fromKey: "billingFrom",
        toKey: "billingTo"
      }
    };
    return configs[kind] || null;
  }

  function isoDate(year, month, day) {
    return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
  }

  function dateRangePresetValues(preset) {
    const [year, month] = bangkokDate().split("-").map(Number);
    if (preset === "this_month") {
      return {
        from: isoDate(year, month, 1),
        to: isoDate(year, month + 1, 0)
      };
    }
    if (preset === "last_month") {
      return {
        from: isoDate(year, month - 1, 1),
        to: isoDate(year, month, 0)
      };
    }
    if (preset === "this_year") {
      return { from: isoDate(year, 1, 1), to: isoDate(year, 12, 31) };
    }
    if (preset === "last_year") {
      return { from: isoDate(year - 1, 1, 1), to: isoDate(year - 1, 12, 31) };
    }
    return { from: "", to: "" };
  }

  function dateRangeButtonText(kind) {
    const config = dateRangeConfig(kind);
    if (!config) return "เลือกช่วงวันที่";
    const from = state.ui.customerFilters[config.fromKey];
    const to = state.ui.customerFilters[config.toKey];
    if (!from && !to) return "ทั้งหมด";
    if (from && to) return `${formatDate(from)} – ${formatDate(to)}`;
    if (from) return `ตั้งแต่ ${formatDate(from)}`;
    return `ถึง ${formatDate(to)}`;
  }

  function setDateRangeDialogValues(from = "", to = "") {
    if (el.dateRangeFrom) {
      el.dateRangeFrom.value = from || "";
      syncDateControlFromNative(el.dateRangeFrom, false);
    }
    if (el.dateRangeTo) {
      el.dateRangeTo.value = to || "";
      syncDateControlFromNative(el.dateRangeTo, false);
    }
  }

  function updateDateRangePresetButtons() {
    document.querySelectorAll("[data-action='select-date-range-preset']").forEach((button) => {
      button.classList.toggle("active", button.dataset.preset === state.ui.dateRangeDraft.preset);
    });
  }

  function openDateRangeDialog(kind) {
    const config = dateRangeConfig(kind);
    if (!config || !el.dateRangeDialog) return;
    const from = state.ui.customerFilters[config.fromKey] || "";
    const to = state.ui.customerFilters[config.toKey] || "";
    state.ui.dateRangeDraft = { kind, from, to, preset: "" };
    if (el.dateRangeTitle) el.dateRangeTitle.textContent = config.title;
    setDateRangeDialogValues(from, to);
    updateDateRangePresetButtons();
    openDialog(el.dateRangeDialog);
  }

  function selectDateRangePreset(preset) {
    const values = dateRangePresetValues(preset);
    state.ui.dateRangeDraft = {
      ...state.ui.dateRangeDraft,
      ...values,
      preset
    };
    setDateRangeDialogValues(values.from, values.to);
    updateDateRangePresetButtons();
  }

  function clearDateRangeDraft() {
    state.ui.dateRangeDraft = {
      ...state.ui.dateRangeDraft,
      from: "",
      to: "",
      preset: ""
    };
    setDateRangeDialogValues("", "");
    updateDateRangePresetButtons();
  }

  function renderDateRangeButtons() {
    ["start", "billing"].forEach((kind) => {
      const text = document.querySelector(`[data-date-range-label="${kind}"]`);
      if (text) text.textContent = dateRangeButtonText(kind);
    });
  }

  function saveDateRange(event) {
    event.preventDefault();
    const config = dateRangeConfig(state.ui.dateRangeDraft.kind);
    if (!config || !el.dateRangeForm) return;
    if (!validateDateControls(el.dateRangeForm) || !el.dateRangeForm.reportValidity()) return;

    const from = el.dateRangeFrom?.value || "";
    const to = el.dateRangeTo?.value || "";
    if (from && to && from > to) {
      showToast("วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด", "error");
      el.dateRangeFromDisplay?.focus();
      return;
    }

    state.ui.customerFilters[config.fromKey] = from;
    state.ui.customerFilters[config.toKey] = to;
    closeDialog(el.dateRangeDialog);
    renderDateRangeButtons();
    renderCustomerTable();
  }

  function setElementBusy(node, busy, message = "กำลังประมวลผล...") {
    if (!node) return;
    node.classList.toggle("is-busy", busy);
    node.setAttribute("aria-busy", String(busy));
    let overlay = node.querySelector(":scope > .section-loading");
    if (busy && !overlay) {
      overlay = document.createElement("div");
      overlay.className = "section-loading";
      overlay.innerHTML = `<span class="spinner spinner-small" aria-hidden="true"></span><span>${h(message)}</span>`;
      node.appendChild(overlay);
    } else if (!busy && overlay) {
      overlay.remove();
    }
  }


  async function withGlobalLoading(text, task) {
    setLoading(true, text);
    try {
      return await task();
    } finally {
      setLoading(false);
    }
  }

  function renderPageSkeleton(labelText = "กำลังโหลดข้อมูล") {
    el.mainContent.innerHTML = `
      <div class="page-skeleton" role="status" aria-live="polite">
        <span class="sr-only">${h(labelText)}</span>
        <div class="skeleton skeleton-heading"></div>
        <div class="skeleton-grid">
          <div class="skeleton skeleton-card"></div>
          <div class="skeleton skeleton-card"></div>
          <div class="skeleton skeleton-card"></div>
        </div>
        <div class="skeleton skeleton-panel"></div>
      </div>`;
  }

  function destroyDynamicComponents() {
    Object.keys(state.grids).forEach((key) => {
      try {
        state.grids[key]?.destroy?.();
      } catch (error) {
        console.warn("AG Grid cleanup failed", error);
      }
      state.grids[key] = null;
    });
    state.charts.forEach((chart) => {
      try {
        chart?.destroy?.();
      } catch (error) {
        console.warn("AG Charts cleanup failed", error);
      }
    });
    state.charts = [];
    state.dashboardChartData = null;
    state.ui.profileDrafts.clear();
  }

  function renderComponentError(container, title, message, retry = false) {
    if (!container) return;
    container.removeAttribute("aria-busy");
    container.dataset.componentState = "error";
    container.innerHTML = `
      <div class="dependency-error" role="alert">
        <strong>${h(title)}</strong>
        <span>${h(message)}</span>
        ${retry ? '<button class="btn btn-secondary btn-small" data-action="refresh-route">ลองใหม่</button>' : ""}
      </div>`;
  }

  function createCommunityGrid(container, gridOptions, key) {
    if (!container) return null;
    if (!window.agGrid?.createGrid) {
      renderComponentError(
        container,
        "โหลดตารางข้อมูลไม่สำเร็จ",
        "กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่",
        true
      );
      return null;
    }

    const {
      onGridReady: userOnGridReady,
      onFirstDataRendered: userOnFirstDataRendered,
      ...customOptions
    } = gridOptions || {};

    const markReady = () => {
      container.removeAttribute("aria-busy");
      container.dataset.componentState = "ready";
    };

    const options = {
      defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 110
      },
      animateRows: false,
      rowHeight: 52,
      headerHeight: 44,
      pagination: true,
      paginationPageSize: 20,
      paginationPageSizeSelector: [10, 20, 50, 100],
      suppressCellFocus: false,
      suppressCsvExport: true,
      ensureDomOrder: true,
      overlayLoadingTemplate: '<div class="ag-overlay-message"><span class="spinner spinner-small"></span><span>กำลังโหลดข้อมูล...</span></div>',
      overlayNoRowsTemplate: '<div class="ag-overlay-message">ไม่พบข้อมูลที่ตรงกับเงื่อนไข</div>',
      localeText: {
        page: "หน้า",
        more: "เพิ่มเติม",
        to: "ถึง",
        of: "จาก",
        next: "ถัดไป",
        last: "หน้าสุดท้าย",
        first: "หน้าแรก",
        previous: "ก่อนหน้า",
        loadingOoo: "กำลังโหลด...",
        noRowsToShow: "ไม่พบข้อมูล",
        searchOoo: "ค้นหา...",
        filterOoo: "กรอง...",
        equals: "เท่ากับ",
        notEqual: "ไม่เท่ากับ",
        lessThan: "น้อยกว่า",
        greaterThan: "มากกว่า",
        lessThanOrEqual: "น้อยกว่าหรือเท่ากับ",
        greaterThanOrEqual: "มากกว่าหรือเท่ากับ",
        inRange: "อยู่ระหว่าง",
        inRangeStart: "จาก",
        inRangeEnd: "ถึง",
        contains: "มีคำว่า",
        notContains: "ไม่มีคำว่า",
        startsWith: "ขึ้นต้นด้วย",
        endsWith: "ลงท้ายด้วย",
        blank: "ว่าง",
        notBlank: "ไม่ว่าง",
        andCondition: "และ",
        orCondition: "หรือ",
        applyFilter: "นำตัวกรองไปใช้",
        clearFilter: "ล้าง",
        resetFilter: "คืนค่า",
        cancelFilter: "ยกเลิก",
        selectAll: "เลือกทั้งหมด",
        selectAllSearchResults: "เลือกผลการค้นหาทั้งหมด",
        blanks: "ค่าว่าง",
        pinColumn: "ตรึงคอลัมน์",
        pinLeft: "ตรึงด้านซ้าย",
        pinRight: "ตรึงด้านขวา",
        noPin: "ไม่ตรึง",
        autosizeThisColumn: "ปรับความกว้างคอลัมน์นี้",
        autosizeAllColumns: "ปรับความกว้างทุกคอลัมน์",
        resetColumns: "คืนค่าคอลัมน์",
        copy: "คัดลอก",
        copyWithHeaders: "คัดลอกพร้อมหัวตาราง",
        paste: "วาง",
        export: "ส่งออก",
        columns: "คอลัมน์",
        filters: "ตัวกรอง",
        textFilter: "ตัวกรองข้อความ",
        numberFilter: "ตัวกรองตัวเลข",
        dateFilter: "ตัวกรองวันที่"
      },
      ...customOptions,
      onGridReady: (event) => {
        markReady();
        userOnGridReady?.(event);
      },
      onFirstDataRendered: (event) => {
        markReady();
        userOnFirstDataRendered?.(event);
      }
    };

    try {
      // AG Grid appends its own DOM. Remove the temporary spinner first,
      // otherwise the placeholder remains visible behind the completed grid.
      container.replaceChildren();
      container.setAttribute("aria-busy", "true");
      container.dataset.componentState = "loading";

      const api = window.agGrid.createGrid(container, options);
      state.grids[key] = api;

      // createGrid is synchronous, while the first paint is deferred.
      // This fallback prevents aria-busy from becoming stale if an AG event
      // is skipped because the route changes during initialization.
      window.requestAnimationFrame(() => {
        if (state.grids[key] === api && container.isConnected) markReady();
      });
      return api;
    } catch (error) {
      state.grids[key] = null;
      console.error("AG Grid initialization failed", error);
      renderComponentError(
        container,
        "สร้างตารางไม่สำเร็จ",
        normalizeError(error),
        true
      );
      return null;
    }
  }

  function createCommunityChart(container, options) {
    if (!container) return null;
    if (!window.agCharts?.AgCharts?.create) {
      renderComponentError(
        container,
        "โหลดกราฟไม่สำเร็จ",
        "กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่"
      );
      return null;
    }

    try {
      // AG Charts also appends a canvas to the supplied container.
      // Clear the temporary loading node before creating the chart.
      container.replaceChildren();
      container.setAttribute("aria-busy", "true");
      container.dataset.componentState = "loading";

      const palette = chartPalette();
      const chart = window.agCharts.AgCharts.create({
        container,
        autoSize: true,
        background: { fill: getCssVar("--surface", "#ffffff") },
        theme: {
          baseTheme: resolvedThemeMode() === "dark" ? "ag-default-dark" : "ag-default",
          palette: {
            fills: palette,
            strokes: palette
          },
          params: {
            backgroundColor: getCssVar("--surface", "#ffffff"),
            foregroundColor: getCssVar("--text", "#172033"),
            accentColor: palette[0]
          }
        },
        ...options
      });

      state.charts.push(chart);
      window.requestAnimationFrame(() => {
        if (container.isConnected) {
          container.removeAttribute("aria-busy");
          container.dataset.componentState = "ready";
        }
      });
      return chart;
    } catch (error) {
      console.error("AG Charts initialization failed", error);
      renderComponentError(
        container,
        "สร้างกราฟไม่สำเร็จ",
        normalizeError(error)
      );
      return null;
    }
  }

  function chartPalette() {
    const accent = normalizeHex(state.ui.themePreviewDirty
      ? getCssVar("--primary", "#2f68e6")
      : state.profile?.theme_accent || "#2f68e6");
    return [
      accent,
      mixHex(accent, "#2dcfc6", 0.55),
      "#16845b",
      "#d49118",
      "#c93f4a",
      mixHex(accent, "#7c3aed", 0.55)
    ];
  }

function renderDashboardCharts(data = state.dashboardChartData) {
  if (!data) return;
  state.charts.forEach((chart) => {
    try { chart?.destroy?.(); } catch (error) { console.warn(error); }
  });
  state.charts = [];

  const palette = chartPalette();
  createCommunityChart(document.getElementById("onboarding-chart"), {
    data: data.onboarding,
    series: [{
      type: "bar",
      xKey: "label",
      yKey: "count",
      yName: "ลูกค้า",
      fill: palette[0],
      stroke: palette[0],
      label: { enabled: true }
    }],
    legend: { enabled: false },
    axes: [
      { type: "category", position: "left" },
      { type: "number", position: "bottom", min: 0, nice: true }
    ]
  });

  createCommunityChart(document.getElementById("import-chart"), {
    data: data.importStatus,
    series: [{
      type: "donut",
      angleKey: "count",
      calloutLabelKey: "label",
      sectorLabelKey: "count",
      innerRadiusRatio: 0.62
    }],
    legend: { position: "bottom" }
  });
}

  function refreshDynamicTheme() {
    Object.values(state.grids).forEach((api) => {
      try {
        api?.refreshCells?.({ force: true });
        api?.redrawRows?.();
      } catch (error) {
        console.warn("AG Grid theme refresh failed", error);
      }
    });
    if (state.dashboardChartData && document.getElementById("onboarding-chart")) {
      renderDashboardCharts(state.dashboardChartData);
    }
  }

  function statusBadgeNode(text, status) {
    const node = document.createElement("span");
    node.className = "status-badge";
    node.dataset.status = status || "";
    node.textContent = text || "-";
    return node;
  }

  function iconActionButtonNode({
    label: buttonLabel,
    action,
    id,
    iconName,
    variant = "secondary"
  }) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `grid-action-button grid-action-${variant}`;
    button.dataset.action = action;
    if (id) button.dataset.id = id;
    button.setAttribute("aria-label", buttonLabel);
    button.title = buttonLabel;
    button.innerHTML = icon(iconName);
    return button;
  }

  function iconActionLinkNode({
    label: linkLabel,
    href,
    iconName,
    variant = "secondary"
  }) {
    const link = document.createElement("a");
    link.className = `grid-action-button grid-action-${variant}`;
    link.href = href;
    link.setAttribute("aria-label", linkLabel);
    link.title = linkLabel;
    link.innerHTML = icon(iconName);
    return link;
  }



  const CUSTOMER_EXCEL_TEMPLATE_VERSION = "fi-customer-update-v1";
  const CUSTOMER_EXCEL_EDITABLE_SHEETS = ["Customers", "Contacts", "Customer Accounts", "Notes"];

  function excelSafeValue(value) {
    if (value === null || value === undefined) return "";
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "object") return excelSafeValue(JSON.stringify(value));
    if (typeof value !== "string") return value;
    const text = value.replace(/\u0000/g, "");
    return /^[=+\-@]/.test(text) ? `'${text}` : text;
  }

  function excelImportText(value) {
    const text = String(value ?? "").trim();
    return /^'[=+\-@]/.test(text) ? text.slice(1) : text;
  }

  function normalizeIsoTimestamp(value) {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
  }

  function validUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
  }

  function sameImportValue(a, b) {
    if ((a === null || a === undefined || a === "") && (b === null || b === undefined || b === "")) return true;
    if (typeof a === "number" || typeof b === "number") return Number(a) === Number(b);
    if (typeof a === "boolean" || typeof b === "boolean") return Boolean(a) === Boolean(b);
    return String(a) === String(b);
  }

  function workbookSheetFromRows(rows, columns) {
    const output = rows.map((row) => Object.fromEntries(
      columns.map((column) => [column.header, excelSafeValue(column.value(row))])
    ));
    const worksheet = window.XLSX.utils.json_to_sheet(output, {
      header: columns.map((column) => column.header),
      skipHeader: false
    });
    worksheet["!cols"] = columns.map((column) => ({ wch: column.width || 18 }));
    worksheet["!autofilter"] = rows.length
      ? { ref: `A1:${window.XLSX.utils.encode_col(columns.length - 1)}${rows.length + 1}` }
      : undefined;
    return worksheet;
  }

  function appendWorkbookSheet(workbook, name, rows, columns) {
    window.XLSX.utils.book_append_sheet(workbook, workbookSheetFromRows(rows, columns), name);
  }

  function jsonCell(value) {
    if (value === null || value === undefined) return "";
    try {
      return JSON.stringify(value);
    } catch (_error) {
      return String(value);
    }
  }


  async function fetchAllPaged(queryFactory, pageSize = 500) {
    const rows = [];
    for (let offset = 0; ; offset += pageSize) {
      const result = await queryFactory().range(offset, offset + pageSize - 1);
      if (result.error) throw result.error;
      const page = result.data || [];
      rows.push(...page);
      if (page.length < pageSize) break;
      if (rows.length > 100000) throw new Error("ข้อมูลส่งออกเกินขีดจำกัด 100,000 แถว");
    }
    return rows;
  }

  function chunkValues(values, size = 100) {
    const chunks = [];
    for (let index = 0; index < values.length; index += size) {
      chunks.push(values.slice(index, index + size));
    }
    return chunks;
  }

  async function fetchCustomerRelationRows(table, columns, customerIds, orders = []) {
    const rows = [];
    for (const customerIdChunk of chunkValues(customerIds)) {
      const chunkRows = await fetchAllPaged(() => {
        let query = state.client
          .from(table)
          .select(columns)
          .in("customer_id", customerIdChunk);
        orders.forEach((column) => {
          query = query.order(column, { ascending: true });
        });
        return query;
      });
      rows.push(...chunkRows);
    }
    return rows;
  }

  async function fetchCustomerWorkbookData() {
    await loadCommonData();
    const customers = await fetchAllPaged(() =>
      state.client
        .from("customers")
        .select("*")
        .eq("is_archived", false)
        .order("id", { ascending: true })
    );
    const customerIds = customers.map((customer) => customer.id);
    if (!customerIds.length) {
      return {
        customers: [], owners: [], contacts: [], accounts: [], notes: [],
        customerModules: [], customerFeatures: [], auditLogs: []
      };
    }

    const [
      owners,
      contacts,
      notes,
      customerModules,
      customerFeatures,
      auditLogs
    ] = await Promise.all([
      fetchCustomerRelationRows("customer_owners", "*", customerIds, ["customer_id", "profile_id"]),
      fetchCustomerRelationRows("customer_contacts", "*", customerIds, ["customer_id", "id"]),
      fetchCustomerRelationRows(
        "customer_notes",
        "id,customer_id,note_text,created_at,created_by,updated_at,updated_by",
        customerIds,
        ["customer_id", "id"]
      ),
      fetchCustomerRelationRows("customer_modules", "*", customerIds, ["customer_id", "module_id"]),
      fetchCustomerRelationRows("customer_features", "*", customerIds, ["customer_id", "feature_id"]),
      fetchCustomerRelationRows("customer_audit_logs", "*", customerIds, ["customer_id", "created_at", "id"])
    ]);

    const accounts = [];
    for (const customerIdChunk of chunkValues(customerIds)) {
      const chunkAccounts = await fetchAllPaged(() =>
        state.client.rpc("customer_accounts_export_safe_v1", {
          p_customer_ids: customerIdChunk
        })
      );
      accounts.push(...chunkAccounts);
    }

    return {
      customers,
      owners,
      contacts,
      accounts,
      notes,
      customerModules,
      customerFeatures,
      auditLogs
    };
  }

  function customerLegalNameFromData(customerId, data) {
    return data.customers.find((customer) => customer.id === customerId)?.legal_name || customerId || "-";
  }

  function profileEmail(profileId) {
    return state.profiles.find((profile) => profile.id === profileId)?.email || "";
  }

  function profileDisplayName(profileId) {
    return state.profiles.find((profile) => profile.id === profileId)?.display_name || "";
  }

  function customerListExcelColumnMap() {
    return {
      legal_name: { header: "ชื่อนิติบุคคล", width: 45, value: (row) => row.legal_name || "" },
      short_name: { header: "ชื่อย่อ", width: 24, value: (row) => row.short_name || "" },
      tax_id: { header: "เลขประจำตัวผู้เสียภาษี", width: 18, value: (row) => row.tax_id || "" },
      fleet_size: { header: "จำนวนรถ", width: 14, value: (row) => Number(row.fleet_size || 0) },
      owner_text: { header: "ผู้รับผิดชอบ", width: 34, value: (row) => row.owner_text === "-" ? "" : row.owner_text },
      module_text: { header: "โมดูล", width: 30, value: (row) => row.module_text === "-" ? "" : row.module_text },
      feature_text: { header: "ฟังก์ชัน", width: 30, value: (row) => row.feature_text === "-" ? "" : row.feature_text },
      contract_text: { header: "สัญญา", width: 18, value: (row) => row.contract_text === "-" ? "" : row.contract_text },
      sales_text: { header: "เซลล์", width: 24, value: (row) => row.sales_text === "-" ? "" : row.sales_text },
      monthly_service_fee: { header: "ค่าบริการต่อเดือน (บาท)", width: 24, value: (row) => row.monthly_service_fee ?? "" },
      customer_user_count: { header: "จำนวนผู้ใช้งานลูกค้า", width: 22, value: (row) => Number(row.customer_user_count || 0) },
      saved_account_count: { header: "จำนวนบัญชีที่บันทึก", width: 22, value: (row) => Number(row.saved_account_count || 0) },
      onsite_training_count: { header: "สอนใช้งานนอกสถานที่ (ครั้ง)", width: 28, value: (row) => Number(row.onsite_training_count || 0) },
      account_status_text: { header: "สถานะบัญชี", width: 16, value: (row) => row.account_status_text || "" },
      onboarding_text: { header: "ขั้นตอนเริ่มใช้งาน", width: 24, value: (row) => row.onboarding_text === "-" ? "" : row.onboarding_text },
      import_text: { header: "สถานะการนำเข้าข้อมูล", width: 24, value: (row) => row.import_text === "-" ? "" : row.import_text },
      engagement_text: { header: "ระดับความสนใจ", width: 20, value: (row) => row.engagement_text === "-" ? "" : row.engagement_text },
      start_date: { header: "วันที่เริ่มใช้งานจริง", width: 20, value: (row) => row.start_date ? formatDate(row.start_date) : "" },
      billing_date: { header: "วันที่เริ่มวางบิล", width: 20, value: (row) => row.billing_date ? formatDate(row.billing_date) : "" },
      updated_at: { header: "อัปเดตล่าสุด", width: 22, value: (row) => formatDateTime(row.updated_at) },
      updated_by_name: { header: "แก้ไขล่าสุดโดย", width: 24, value: (row) => row.updated_by_name === "-" ? "" : row.updated_by_name }
    };
  }

  function currentCustomerListColumnOrder() {
    const configured = currentCustomerListSettings().customer_list_columns;
    const columnState = state.grids.customers?.getColumnState?.() || [];
    const fromGrid = columnState
      .filter((column) => !column.hide && column.colId !== "actions" && CUSTOMER_LIST_COLUMN_KEYS.has(column.colId))
      .map((column) => column.colId);
    return fromGrid.length ? fromGrid : configured;
  }

  function currentCustomerListSortDescription() {
    const columnState = state.grids.customers?.getColumnState?.() || [];
    const sorted = columnState
      .filter((column) => ["asc", "desc"].includes(column.sort))
      .sort((a, b) => Number(a.sortIndex || 0) - Number(b.sortIndex || 0));
    if (!sorted.length) {
      const settings = currentCustomerListSettings();
      const meta = customerListColumnMeta(settings.customer_list_sort_column);
      return `${meta?.label || settings.customer_list_sort_column} (${settings.customer_list_sort_direction === "asc" ? "น้อยไปมาก" : "มากไปน้อย"})`;
    }
    return sorted.map((column) => {
      const meta = customerListColumnMeta(column.colId);
      return `${meta?.label || column.colId} (${column.sort === "asc" ? "น้อยไปมาก" : "มากไปน้อย"})`;
    }).join(", ");
  }

  function currentCustomerRowsForExcel() {
    const rows = [];
    state.grids.customers?.forEachNodeAfterFilterAndSort?.((node) => {
      if (node.data) rows.push(node.data);
    });
    if (!state.grids.customers && state.filteredCustomerRows?.length) {
      rows.push(...state.filteredCustomerRows);
    }
    return rows;
  }

  function customerExcelFilterDescription() {
    const filters = state.ui.customerFilters;
    const values = [
      ["สถานะบัญชี", filters.accountTab === "inactive" ? "ไม่ใช้งาน" : "ใช้งาน"],
      ["คำค้นหา", filters.search || "ทั้งหมด"],
      ["ผู้รับผิดชอบ", filters.owner === "unassigned" ? "ยังไม่มีผู้รับผิดชอบ" : (filters.owner ? profileName(filters.owner) : "ทั้งหมด")],
      ["ขั้นตอนเริ่มใช้งาน", filters.onboarding ? (filters.onboarding === "none" ? "ไม่ระบุ" : label("onboarding_stage", filters.onboarding)) : "ทั้งหมด"],
      ["สถานะนำเข้าข้อมูล", filters.importStatus ? label("import_status", filters.importStatus) : "ทั้งหมด"],
      ["ระดับความสนใจ", filters.engagement ? (filters.engagement === "none" ? "ไม่ระบุ" : label("engagement_level", filters.engagement)) : "ทั้งหมด"],
      ["ประเภทสัญญา", filters.contractType ? label("contract_type", filters.contractType) : "ทั้งหมด"],
      ["เซลล์", filters.salesCode ? (filters.salesCode === "none" ? "ไม่ระบุ" : label("sales", filters.salesCode)) : "ทั้งหมด"],
      ["จำนวนรถ", filters.fleetMin || filters.fleetMax ? `${filters.fleetMin || "0"} – ${filters.fleetMax || "ไม่จำกัด"}` : "ทั้งหมด"],
      ["วันที่เริ่มใช้งานจริง", filters.startFrom || filters.startTo ? `${filters.startFrom ? formatDate(filters.startFrom) : "ไม่จำกัด"} – ${filters.startTo ? formatDate(filters.startTo) : "ไม่จำกัด"}` : "ทั้งหมด"],
      ["วันที่เริ่มวางบิล", filters.billingFrom || filters.billingTo ? `${filters.billingFrom ? formatDate(filters.billingFrom) : "ไม่จำกัด"} – ${filters.billingTo ? formatDate(filters.billingTo) : "ไม่จำกัด"}` : "ทั้งหมด"]
    ];
    return values;
  }

  async function exportCustomersExcel() {
    if (!window.XLSX?.utils) throw new Error("โหลดเครื่องมือสร้างไฟล์ Excel ไม่สำเร็จ");
    const rows = currentCustomerRowsForExcel();
    if (!rows.length) {
      showToast("ไม่มีข้อมูลตามตัวกรองสำหรับส่งออก", "warning");
      return;
    }

    const columnMap = customerListExcelColumnMap();
    const columnKeys = currentCustomerListColumnOrder().filter((key) => columnMap[key]);
    if (!columnKeys.length) throw new Error("ไม่พบคอลัมน์สำหรับส่งออก");

    const workbook = window.XLSX.utils.book_new();
    workbook.Props = {
      Title: "FI Customer Tracking - Customer List",
      Subject: "Human-readable customer list export",
      Author: "FI Customer Tracking",
      CreatedDate: new Date()
    };

    appendWorkbookSheet(
      workbook,
      "ข้อมูลลูกค้า",
      rows,
      columnKeys.map((key) => ({ ...columnMap[key], key }))
    );

    const metadataRows = [
      { key: "วันที่ส่งออก", value: formatDateTime(new Date().toISOString()) },
      { key: "จำนวนรายการ", value: rows.length },
      { key: "คอลัมน์", value: columnKeys.map((key) => customerListColumnMeta(key)?.label || key).join(", ") },
      { key: "การเรียงข้อมูล", value: currentCustomerListSortDescription() },
      ...customerExcelFilterDescription().map(([key, value]) => ({ key, value }))
    ];
    appendWorkbookSheet(workbook, "ข้อมูลรายงาน", metadataRows, [
      { header: "รายการ", value: (row) => row.key, width: 28 },
      { header: "ค่า", value: (row) => row.value, width: 90 }
    ]);

    const statusLabel = state.ui.customerFilters.accountTab === "inactive" ? "ไม่ใช้งาน" : "ใช้งาน";
    window.XLSX.writeFile(
      workbook,
      `ข้อมูลลูกค้า-${statusLabel}-${bangkokDate()}.xlsx`,
      { compression: true, bookType: "xlsx" }
    );
  }

  async function exportCustomerUpdateTemplate() {
    if (!window.XLSX?.utils) throw new Error("โหลดเครื่องมือสร้างไฟล์ Excel ไม่สำเร็จ");
    const data = await fetchCustomerWorkbookData();
    if (!data.customers.length) {
      showToast("ไม่มีข้อมูลลูกค้าสำหรับส่งออก", "warning");
      return;
    }

    const workbook = window.XLSX.utils.book_new();
    workbook.Props = {
      Title: "FI Customer Tracking - Customer Data",
      Subject: "Admin customer update template",
      Author: "FI Customer Tracking",
      CreatedDate: new Date()
    };

    const instructions = [
      { key: "template_version", value: CUSTOMER_EXCEL_TEMPLATE_VERSION },
      { key: "application_version", value: APP_VERSION },
      { key: "exported_at", value: new Date().toISOString() },
      { key: "purpose", value: "Template สำหรับผู้ดูแลระบบใช้แก้ข้อมูลเดิมและนำกลับเข้า FI Customer Tracking เท่านั้น" },
      { key: "scope", value: "ลูกค้าที่ยังไม่ถูก Soft Delete ทั้งสถานะใช้งานและไม่ใช้งาน" },
      { key: "editable_sheets", value: CUSTOMER_EXCEL_EDITABLE_SHEETS.join(", ") },
      { key: "update_rule", value: "Admin อัปเดตข้อมูลเดิมเท่านั้น ห้ามเพิ่มแถวใหม่ ห้ามลบ และต้องเก็บ id/customer_id/updated_at เดิม" },
      { key: "stale_protection", value: "หากข้อมูลในระบบถูกแก้หลังส่งออก ระบบจะปฏิเสธแถวนั้นทั้งหมดและไม่บันทึกบางส่วน" },
      { key: "read_only_sheets", value: "Owners, Modules, Features, Audit Logs, Master Reference" },
      { key: "credentials", value: "ไม่ส่งออก Password/PIN และไม่รองรับการแก้ Password/PIN ผ่าน Excel" },
      { key: "formula_policy", value: "ห้ามใส่สูตรใน Sheet ที่แก้ไขได้ เพื่อป้องกัน Formula Injection" },
      { key: "date_format", value: "วันที่ใช้ YYYY-MM-DD และเวลารุ่นข้อมูลใช้ ISO-8601 ห้ามแก้ updated_at" },
      { key: "blank_rule", value: "ช่อง Optional ใช้ค่าว่างได้; monthly_service_fee ว่างหรือ 0 ได้ และห้ามติดลบ" }
    ];
    appendWorkbookSheet(workbook, "Instructions", instructions, [
      { header: "key", value: (row) => row.key, width: 24 },
      { header: "value", value: (row) => row.value, width: 100 }
    ]);

    appendWorkbookSheet(workbook, "Customers", data.customers, [
      { header: "__template_version", value: () => CUSTOMER_EXCEL_TEMPLATE_VERSION, width: 25 },
      { header: "id", value: (row) => row.id, width: 38 },
      { header: "legal_name", value: (row) => row.legal_name, width: 45 },
      { header: "short_name", value: (row) => row.short_name || "", width: 24 },
      { header: "tax_id", value: (row) => row.tax_id, width: 16 },
      { header: "fleet_size", value: (row) => Number(row.fleet_size || 0), width: 12 },
      { header: "customer_user_count", value: (row) => Number(row.customer_user_count || 1), width: 22 },
      { header: "account_status", value: (row) => row.account_status, width: 16 },
      { header: "sales_code", value: (row) => row.sales_code || "", width: 18 },
      { header: "onboarding_stage", value: (row) => row.onboarding_stage || "", width: 22 },
      { header: "import_status", value: (row) => row.import_status, width: 18 },
      { header: "engagement_level", value: (row) => row.engagement_level || "", width: 20 },
      { header: "start_date", value: (row) => row.start_date || "", width: 14 },
      { header: "billing_date", value: (row) => row.billing_date || "", width: 14 },
      { header: "contract_type", value: (row) => row.contract_type, width: 18 },
      { header: "onsite_training_count", value: (row) => Number(row.onsite_training_count || 0), width: 23 },
      { header: "monthly_service_fee", value: (row) => row.monthly_service_fee ?? "", width: 22 },
      { header: "created_at", value: (row) => row.created_at, width: 27 },
      { header: "created_by", value: (row) => row.created_by, width: 38 },
      { header: "created_by_name", value: (row) => profileDisplayName(row.created_by), width: 24 },
      { header: "updated_at", value: (row) => row.updated_at, width: 27 },
      { header: "updated_by", value: (row) => row.updated_by, width: 38 },
      { header: "updated_by_name", value: (row) => profileDisplayName(row.updated_by), width: 24 }
    ]);

    appendWorkbookSheet(workbook, "Owners", data.owners, [
      { header: "customer_id", value: (row) => row.customer_id, width: 38 },
      { header: "customer_legal_name", value: (row) => customerLegalNameFromData(row.customer_id, data), width: 45 },
      { header: "profile_id", value: (row) => row.profile_id, width: 38 },
      { header: "profile_name", value: (row) => profileDisplayName(row.profile_id), width: 24 },
      { header: "profile_email", value: (row) => profileEmail(row.profile_id), width: 32 },
      { header: "is_primary", value: (row) => Boolean(row.is_primary), width: 14 },
      { header: "created_at", value: (row) => row.created_at || "", width: 27 },
      { header: "updated_at", value: (row) => row.updated_at || "", width: 27 }
    ]);

    appendWorkbookSheet(workbook, "Contacts", data.contacts, [
      { header: "__template_version", value: () => CUSTOMER_EXCEL_TEMPLATE_VERSION, width: 25 },
      { header: "id", value: (row) => row.id, width: 38 },
      { header: "customer_id", value: (row) => row.customer_id, width: 38 },
      { header: "customer_legal_name", value: (row) => customerLegalNameFromData(row.customer_id, data), width: 45 },
      { header: "contact_name", value: (row) => row.contact_name, width: 28 },
      { header: "position", value: (row) => row.position || "", width: 24 },
      { header: "phone", value: (row) => row.phone || "", width: 20 },
      { header: "email", value: (row) => row.email || "", width: 32 },
      { header: "line_id", value: (row) => row.line_id || "", width: 22 },
      { header: "is_primary", value: (row) => Boolean(row.is_primary), width: 14 },
      { header: "is_active", value: (row) => Boolean(row.is_active), width: 14 },
      { header: "created_at", value: (row) => row.created_at, width: 27 },
      { header: "created_by", value: (row) => row.created_by, width: 38 },
      { header: "updated_at", value: (row) => row.updated_at, width: 27 },
      { header: "updated_by", value: (row) => row.updated_by, width: 38 }
    ]);

    appendWorkbookSheet(workbook, "Customer Accounts", data.accounts, [
      { header: "__template_version", value: () => CUSTOMER_EXCEL_TEMPLATE_VERSION, width: 25 },
      { header: "id", value: (row) => row.id, width: 38 },
      { header: "customer_id", value: (row) => row.customer_id, width: 38 },
      { header: "customer_legal_name", value: (row) => customerLegalNameFromData(row.customer_id, data), width: 45 },
      { header: "email", value: (row) => row.email, width: 34 },
      { header: "notes", value: (row) => row.notes || "", width: 45 },
      { header: "has_password", value: (row) => Boolean(row.has_password), width: 16 },
      { header: "has_pin", value: (row) => Boolean(row.has_pin), width: 12 },
      { header: "created_at", value: (row) => row.created_at, width: 27 },
      { header: "created_by", value: (row) => row.created_by, width: 38 },
      { header: "updated_at", value: (row) => row.updated_at, width: 27 },
      { header: "updated_by", value: (row) => row.updated_by, width: 38 }
    ]);

    appendWorkbookSheet(workbook, "Modules", data.customerModules, [
      { header: "customer_id", value: (row) => row.customer_id, width: 38 },
      { header: "customer_legal_name", value: (row) => customerLegalNameFromData(row.customer_id, data), width: 45 },
      { header: "module_id", value: (row) => row.module_id, width: 38 },
      { header: "module_code", value: (row) => state.modules.find((item) => item.id === row.module_id)?.code || "", width: 20 },
      { header: "module_name", value: (row) => state.modules.find((item) => item.id === row.module_id)?.name || "", width: 30 },
      { header: "created_at", value: (row) => row.created_at || "", width: 27 }
    ]);

    appendWorkbookSheet(workbook, "Features", data.customerFeatures, [
      { header: "customer_id", value: (row) => row.customer_id, width: 38 },
      { header: "customer_legal_name", value: (row) => customerLegalNameFromData(row.customer_id, data), width: 45 },
      { header: "feature_id", value: (row) => row.feature_id, width: 38 },
      { header: "feature_code", value: (row) => state.features.find((item) => item.id === row.feature_id)?.code || "", width: 20 },
      { header: "feature_name", value: (row) => state.features.find((item) => item.id === row.feature_id)?.name || "", width: 30 },
      { header: "created_at", value: (row) => row.created_at || "", width: 27 }
    ]);

    appendWorkbookSheet(workbook, "Notes", data.notes, [
      { header: "__template_version", value: () => CUSTOMER_EXCEL_TEMPLATE_VERSION, width: 25 },
      { header: "id", value: (row) => row.id, width: 38 },
      { header: "customer_id", value: (row) => row.customer_id, width: 38 },
      { header: "customer_legal_name", value: (row) => customerLegalNameFromData(row.customer_id, data), width: 45 },
      { header: "note_text", value: (row) => row.note_text, width: 70 },
      { header: "created_at", value: (row) => row.created_at, width: 27 },
      { header: "created_by", value: (row) => row.created_by, width: 38 },
      { header: "created_by_name", value: (row) => profileDisplayName(row.created_by), width: 24 },
      { header: "updated_at", value: (row) => row.updated_at, width: 27 },
      { header: "updated_by", value: (row) => row.updated_by, width: 38 },
      { header: "updated_by_name", value: (row) => profileDisplayName(row.updated_by), width: 24 }
    ]);

    appendWorkbookSheet(workbook, "Audit Logs", data.auditLogs, [
      { header: "id", value: (row) => row.id, width: 38 },
      { header: "customer_id", value: (row) => row.customer_id, width: 38 },
      { header: "customer_legal_name", value: (row) => customerLegalNameFromData(row.customer_id, data), width: 45 },
      { header: "action", value: (row) => row.action || row.operation || "", width: 16 },
      { header: "changed_by", value: (row) => row.changed_by || row.actor_id || row.created_by || "", width: 38 },
      { header: "changed_by_name", value: (row) => profileDisplayName(row.changed_by || row.actor_id || row.created_by), width: 24 },
      { header: "old_data", value: (row) => jsonCell(row.old_data || row.old_values), width: 80 },
      { header: "new_data", value: (row) => jsonCell(row.new_data || row.new_values), width: 80 },
      { header: "created_at", value: (row) => row.created_at, width: 27 }
    ]);

    const masterRows = [
      ...state.modules.map((item) => ({
        group_key: "modules", id: item.id, option_value: item.code,
        display_name: item.name, is_active: item.is_active, is_system: item.is_system
      })),
      ...state.features.map((item) => ({
        group_key: "features", id: item.id, option_value: item.code,
        display_name: item.name, is_active: item.is_active, is_system: item.is_system
      })),
      ...state.masterOptions.map((item) => ({
        group_key: item.group_key, id: item.id, option_value: item.option_value,
        display_name: item.display_name, is_active: item.is_active, is_system: item.is_system
      }))
    ];
    appendWorkbookSheet(workbook, "Master Reference", masterRows, [
      { header: "group_key", value: (row) => row.group_key, width: 24 },
      { header: "id", value: (row) => row.id, width: 38 },
      { header: "option_value", value: (row) => row.option_value, width: 24 },
      { header: "display_name", value: (row) => row.display_name, width: 34 },
      { header: "is_active", value: (row) => Boolean(row.is_active), width: 14 },
      { header: "is_system", value: (row) => Boolean(row.is_system), width: 14 }
    ]);

    window.XLSX.writeFile(
      workbook,
      `เทมเพลตอัปเดตข้อมูลลูกค้า-${bangkokDate()}.xlsx`,
      { compression: true, bookType: "xlsx" }
    );
  }

  function sheetRows(workbook, sheetName, requiredHeaders) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) throw new Error(`ไม่พบ Sheet “${sheetName}”`);
    for (const [address, cell] of Object.entries(sheet)) {
      if (!address.startsWith("!") && cell?.f) {
        throw new Error(`Sheet “${sheetName}” มีสูตรที่เซลล์ ${address} ซึ่งไม่อนุญาต`);
      }
    }
    const rows = window.XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
    const headers = window.XLSX.utils.sheet_to_json(sheet, { header: 1, range: 0, blankrows: false })[0] || [];
    const missing = requiredHeaders.filter((header) => !headers.includes(header));
    if (missing.length) {
      throw new Error(`Sheet “${sheetName}” ขาดคอลัมน์: ${missing.join(", ")}`);
    }
    return rows;
  }

  function excelBoolean(value, fieldName) {
    if (typeof value === "boolean") return value;
    const text = String(value ?? "").trim().toLowerCase();
    if (["true", "1", "yes", "y", "ใช่"].includes(text)) return true;
    if (["false", "0", "no", "n", "ไม่"].includes(text)) return false;
    throw new Error(`${fieldName} ต้องเป็น TRUE หรือ FALSE`);
  }

  function excelOptionalText(value, maxLength, fieldName) {
    const text = excelImportText(value);
    if (!text) return null;
    if (text.length > maxLength) throw new Error(`${fieldName} ยาวเกิน ${maxLength} ตัวอักษร`);
    return text;
  }

  function excelRequiredText(value, maxLength, fieldName) {
    const text = excelImportText(value);
    if (!text) throw new Error(`${fieldName} ห้ามว่าง`);
    if (text.length > maxLength) throw new Error(`${fieldName} ยาวเกิน ${maxLength} ตัวอักษร`);
    return text;
  }

  function excelInteger(value, min, max, fieldName) {
    const number = Number(String(value ?? "").replaceAll(",", "").trim());
    if (!Number.isInteger(number) || number < min || number > max) {
      throw new Error(`${fieldName} ต้องเป็นจำนวนเต็ม ${min}–${max}`);
    }
    return number;
  }

  function excelOptionalMoney(value, fieldName) {
    const text = String(value ?? "").replaceAll(",", "").trim();
    if (!text) return null;
    if (!/^\d+(?:\.\d{1,2})?$/.test(text)) {
      throw new Error(`${fieldName} ต้องเป็นตัวเลขไม่ติดลบและมีทศนิยมไม่เกิน 2 ตำแหน่ง`);
    }
    const number = Number(text);
    if (!Number.isFinite(number) || number < 0 || number > 999999999999.99) {
      throw new Error(`${fieldName} อยู่นอกช่วงที่รองรับ`);
    }
    return Math.round(number * 100) / 100;
  }

  function excelOptionalDate(value, fieldName) {
    const text = String(value ?? "").trim();
    if (!text) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error(`${fieldName} ต้องใช้รูปแบบ YYYY-MM-DD`);
    const date = new Date(`${text}T00:00:00Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text) {
      throw new Error(`${fieldName} ไม่ใช่วันที่ที่ถูกต้อง`);
    }
    return text;
  }

  function excelRowVersion(value, fieldName) {
    const text = String(value ?? "").trim();
    if (!text || Number.isNaN(new Date(text).getTime())) {
      throw new Error(`${fieldName} ไม่ใช่ ISO timestamp ที่ถูกต้อง`);
    }
    return normalizeIsoTimestamp(text);
  }

  function pushFieldChanges(changes, resource, id, customerName, current, next, fields) {
    const changedFields = {};
    fields.forEach((field) => {
      if (!sameImportValue(current[field], next[field])) {
        changedFields[field] = next[field];
        changes.push({
          resource,
          id,
          customerName,
          field,
          oldValue: current[field],
          newValue: next[field]
        });
      }
    });
    return changedFields;
  }

  async function prepareCustomerExcelImport(file) {
    if (state.profile?.role !== "admin") throw new Error("เฉพาะผู้ดูแลระบบเท่านั้นที่นำเข้า Excel ได้");
    if (!file || !/\.xlsx$/i.test(file.name)) throw new Error("รองรับเฉพาะไฟล์ .xlsx");
    if (file.size > 15 * 1024 * 1024) throw new Error("ไฟล์ต้องมีขนาดไม่เกิน 15 MB");
    if (!window.XLSX?.read) throw new Error("โหลดเครื่องมืออ่าน Excel ไม่สำเร็จ");

    const arrayBuffer = await file.arrayBuffer();
    const workbook = window.XLSX.read(arrayBuffer, { type: "array", cellDates: false });
    const instructionRows = sheetRows(workbook, "Instructions", ["key", "value"]);
    const metadata = Object.fromEntries(instructionRows.map((row) => [String(row.key), String(row.value)]));
    if (metadata.template_version !== CUSTOMER_EXCEL_TEMPLATE_VERSION) {
      throw new Error(`Template Version ไม่ตรง ระบบต้องการ ${CUSTOMER_EXCEL_TEMPLATE_VERSION}`);
    }

    const customerRows = sheetRows(workbook, "Customers", [
      "__template_version", "id", "legal_name", "short_name", "tax_id", "fleet_size",
      "customer_user_count", "account_status", "sales_code", "onboarding_stage",
      "import_status", "engagement_level", "start_date", "billing_date",
      "contract_type", "onsite_training_count", "monthly_service_fee", "updated_at"
    ]);
    const contactRows = sheetRows(workbook, "Contacts", [
      "__template_version", "id", "customer_id", "contact_name", "position", "phone",
      "email", "line_id", "is_primary", "is_active", "updated_at"
    ]);
    const accountRows = sheetRows(workbook, "Customer Accounts", [
      "__template_version", "id", "customer_id", "email", "notes",
      "has_password", "has_pin", "updated_at"
    ]);
    const noteRows = sheetRows(workbook, "Notes", [
      "__template_version", "id", "customer_id", "note_text", "updated_at"
    ]);

    const data = await fetchCustomerWorkbookData();
    const customerMap = new Map(data.customers.map((row) => [row.id, row]));
    const contactMap = new Map(data.contacts.map((row) => [row.id, row]));
    const accountMap = new Map(data.accounts.map((row) => [row.id, row]));
    const noteMap = new Map(data.notes.map((row) => [row.id, row]));
    const errors = [];
    const changes = [];
    const payload = { template_version: CUSTOMER_EXCEL_TEMPLATE_VERSION, customers: [], contacts: [], accounts: [], notes: [] };

    const ensureTemplate = (row, sheetName, rowNumber) => {
      if (String(row.__template_version || "") !== CUSTOMER_EXCEL_TEMPLATE_VERSION) {
        throw new Error(`${sheetName} แถว ${rowNumber}: Template Version ไม่ตรง`);
      }
    };

    const customerSeen = new Set();
    customerRows.forEach((row, index) => {
      const rowNumber = index + 2;
      try {
        ensureTemplate(row, "Customers", rowNumber);
        const id = String(row.id || "").trim();
        if (!validUuid(id)) throw new Error(`Customers แถว ${rowNumber}: id ไม่ถูกต้อง`);
        if (customerSeen.has(id)) throw new Error(`Customers แถว ${rowNumber}: id ซ้ำ`);
        customerSeen.add(id);
        const current = customerMap.get(id);
        if (!current) throw new Error(`Customers แถว ${rowNumber}: ไม่พบลูกค้าเดิม ห้ามเพิ่มลูกค้าใหม่`);

        const next = {
          legal_name: excelRequiredText(row.legal_name, 500, `Customers แถว ${rowNumber} legal_name`),
          short_name: excelOptionalText(row.short_name, 300, `Customers แถว ${rowNumber} short_name`),
          tax_id: String(row.tax_id || "").trim(),
          fleet_size: excelInteger(row.fleet_size, 0, 999999999, `Customers แถว ${rowNumber} fleet_size`),
          customer_user_count: excelInteger(row.customer_user_count, 1, 999999, `Customers แถว ${rowNumber} customer_user_count`),
          account_status: String(row.account_status || "").trim(),
          sales_code: excelOptionalText(row.sales_code, 100, `Customers แถว ${rowNumber} sales_code`),
          onboarding_stage: excelOptionalText(row.onboarding_stage, 100, `Customers แถว ${rowNumber} onboarding_stage`),
          import_status: excelRequiredText(row.import_status, 100, `Customers แถว ${rowNumber} import_status`),
          engagement_level: excelOptionalText(row.engagement_level, 100, `Customers แถว ${rowNumber} engagement_level`),
          start_date: excelOptionalDate(row.start_date, `Customers แถว ${rowNumber} start_date`),
          billing_date: excelOptionalDate(row.billing_date, `Customers แถว ${rowNumber} billing_date`),
          contract_type: excelRequiredText(row.contract_type, 100, `Customers แถว ${rowNumber} contract_type`),
          onsite_training_count: excelInteger(row.onsite_training_count, 0, 999999, `Customers แถว ${rowNumber} onsite_training_count`),
          monthly_service_fee: excelOptionalMoney(row.monthly_service_fee, `Customers แถว ${rowNumber} monthly_service_fee`)
        };
        if (!/^\d{13}$/.test(next.tax_id)) throw new Error(`Customers แถว ${rowNumber}: tax_id ต้องเป็นตัวเลข 13 หลัก`);
        if (!["active", "inactive"].includes(next.account_status)) throw new Error(`Customers แถว ${rowNumber}: account_status ไม่ถูกต้อง`);

        const masterValues = {
          sales: next.sales_code,
          onboarding_stage: next.onboarding_stage,
          import_status: next.import_status,
          engagement_level: next.engagement_level,
          contract_type: next.contract_type
        };
        Object.entries(masterValues).forEach(([groupKey, value]) => {
          if (!value) return;
          const option = state.masterOptions.find((item) => item.group_key === groupKey && item.option_value === value);
          if (!option) throw new Error(`Customers แถว ${rowNumber}: ไม่พบ Master ${groupKey}=${value}`);
          if (!option.is_active && current[{
            sales: "sales_code", onboarding_stage: "onboarding_stage",
            import_status: "import_status", engagement_level: "engagement_level",
            contract_type: "contract_type"
          }[groupKey]] !== value) {
            throw new Error(`Customers แถว ${rowNumber}: Master ${groupKey}=${value} ถูกปิดใช้งาน`);
          }
        });

        const changedFields = pushFieldChanges(
          changes, "Customers", id, current.legal_name, current, next,
          ["legal_name", "short_name", "tax_id", "fleet_size", "customer_user_count",
            "account_status", "sales_code", "onboarding_stage", "import_status",
            "engagement_level", "start_date", "billing_date", "contract_type",
            "onsite_training_count", "monthly_service_fee"]
        );
        if (Object.keys(changedFields).length) {
          const expectedUpdatedAt = excelRowVersion(row.updated_at, `Customers แถว ${rowNumber} updated_at`);
          if (expectedUpdatedAt !== normalizeIsoTimestamp(current.updated_at)) {
            throw new Error(`Customers แถว ${rowNumber}: ข้อมูลถูกแก้หลังส่งออก กรุณาส่งออกไฟล์ใหม่`);
          }
          payload.customers.push({ id, expected_updated_at: expectedUpdatedAt, ...next });
        }
      } catch (error) {
        errors.push(error.message);
      }
    });

    const contactSeen = new Set();
    const prospectiveContacts = data.contacts.map((row) => ({ ...row }));
    contactRows.forEach((row, index) => {
      const rowNumber = index + 2;
      try {
        ensureTemplate(row, "Contacts", rowNumber);
        const id = String(row.id || "").trim();
        const customerId = String(row.customer_id || "").trim();
        if (!validUuid(id) || !validUuid(customerId)) throw new Error(`Contacts แถว ${rowNumber}: id/customer_id ไม่ถูกต้อง`);
        if (contactSeen.has(id)) throw new Error(`Contacts แถว ${rowNumber}: id ซ้ำ`);
        contactSeen.add(id);
        const current = contactMap.get(id);
        if (!current) throw new Error(`Contacts แถว ${rowNumber}: ไม่พบผู้ติดต่อเดิม ห้ามเพิ่มแถวใหม่`);
        if (current.customer_id !== customerId) throw new Error(`Contacts แถว ${rowNumber}: ห้ามเปลี่ยน customer_id`);

        const next = {
          contact_name: excelRequiredText(row.contact_name, 300, `Contacts แถว ${rowNumber} contact_name`),
          position: excelOptionalText(row.position, 300, `Contacts แถว ${rowNumber} position`),
          phone: excelOptionalText(row.phone, 100, `Contacts แถว ${rowNumber} phone`),
          email: excelOptionalText(row.email, 320, `Contacts แถว ${rowNumber} email`),
          line_id: excelOptionalText(row.line_id, 200, `Contacts แถว ${rowNumber} line_id`),
          is_primary: excelBoolean(row.is_primary, `Contacts แถว ${rowNumber} is_primary`),
          is_active: excelBoolean(row.is_active, `Contacts แถว ${rowNumber} is_active`)
        };
        if (next.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) {
          throw new Error(`Contacts แถว ${rowNumber}: email ไม่ถูกต้อง`);
        }

        const changedFields = pushFieldChanges(
          changes, "Contacts", id, customerLegalNameFromData(customerId, data), current, next,
          ["contact_name", "position", "phone", "email", "line_id", "is_primary", "is_active"]
        );
        const prospective = prospectiveContacts.find((item) => item.id === id);
        Object.assign(prospective, next);
        if (Object.keys(changedFields).length) {
          const expectedUpdatedAt = excelRowVersion(row.updated_at, `Contacts แถว ${rowNumber} updated_at`);
          if (expectedUpdatedAt !== normalizeIsoTimestamp(current.updated_at)) {
            throw new Error(`Contacts แถว ${rowNumber}: ข้อมูลถูกแก้หลังส่งออก กรุณาส่งออกไฟล์ใหม่`);
          }
          payload.contacts.push({ id, customer_id: customerId, expected_updated_at: expectedUpdatedAt, ...next });
        }
      } catch (error) {
        errors.push(error.message);
      }
    });

    const primaryByCustomer = new Map();
    prospectiveContacts.filter((row) => row.is_active && row.is_primary).forEach((row) => {
      primaryByCustomer.set(row.customer_id, (primaryByCustomer.get(row.customer_id) || 0) + 1);
    });
    [...primaryByCustomer.entries()].filter(([, count]) => count > 1).forEach(([customerId]) => {
      errors.push(`Contacts: ลูกค้า ${customerLegalNameFromData(customerId, data)} มีผู้ติดต่อหลักที่เปิดใช้งานมากกว่า 1 ราย`);
    });

    const accountSeen = new Set();
    const prospectiveAccounts = data.accounts.map((row) => ({ ...row }));
    accountRows.forEach((row, index) => {
      const rowNumber = index + 2;
      try {
        ensureTemplate(row, "Customer Accounts", rowNumber);
        const id = String(row.id || "").trim();
        const customerId = String(row.customer_id || "").trim();
        if (!validUuid(id) || !validUuid(customerId)) throw new Error(`Customer Accounts แถว ${rowNumber}: id/customer_id ไม่ถูกต้อง`);
        if (accountSeen.has(id)) throw new Error(`Customer Accounts แถว ${rowNumber}: id ซ้ำ`);
        accountSeen.add(id);
        const current = accountMap.get(id);
        if (!current) throw new Error(`Customer Accounts แถว ${rowNumber}: ไม่พบบัญชีเดิม ห้ามเพิ่มแถวใหม่`);
        if (current.customer_id !== customerId) throw new Error(`Customer Accounts แถว ${rowNumber}: ห้ามเปลี่ยน customer_id`);

        const hasPassword = excelBoolean(row.has_password, `Customer Accounts แถว ${rowNumber} has_password`);
        const hasPin = excelBoolean(row.has_pin, `Customer Accounts แถว ${rowNumber} has_pin`);
        if (hasPassword !== Boolean(current.has_password) || hasPin !== Boolean(current.has_pin)) {
          throw new Error(`Customer Accounts แถว ${rowNumber}: has_password/has_pin เป็นข้อมูลอ่านอย่างเดียว`);
        }
        const next = {
          email: excelRequiredText(row.email, 320, `Customer Accounts แถว ${rowNumber} email`).toLowerCase(),
          notes: excelOptionalText(row.notes, 2000, `Customer Accounts แถว ${rowNumber} notes`)
        };
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) {
          throw new Error(`Customer Accounts แถว ${rowNumber}: email ไม่ถูกต้อง`);
        }
        const changedFields = pushFieldChanges(
          changes, "Customer Accounts", id, customerLegalNameFromData(customerId, data), current, next,
          ["email", "notes"]
        );
        Object.assign(prospectiveAccounts.find((item) => item.id === id), next);
        if (Object.keys(changedFields).length) {
          const expectedUpdatedAt = excelRowVersion(row.updated_at, `Customer Accounts แถว ${rowNumber} updated_at`);
          if (expectedUpdatedAt !== normalizeIsoTimestamp(current.updated_at)) {
            throw new Error(`Customer Accounts แถว ${rowNumber}: ข้อมูลถูกแก้หลังส่งออก กรุณาส่งออกไฟล์ใหม่`);
          }
          payload.accounts.push({ id, customer_id: customerId, expected_updated_at: expectedUpdatedAt, ...next });
        }
      } catch (error) {
        errors.push(error.message);
      }
    });

    const emailKeys = new Set();
    prospectiveAccounts.forEach((row) => {
      const key = `${row.customer_id}:${String(row.email || "").trim().toLowerCase()}`;
      if (emailKeys.has(key)) {
        errors.push(`Customer Accounts: อีเมล ${row.email} ซ้ำภายในลูกค้ารายเดียวกัน`);
      }
      emailKeys.add(key);
    });

    const noteSeen = new Set();
    noteRows.forEach((row, index) => {
      const rowNumber = index + 2;
      try {
        ensureTemplate(row, "Notes", rowNumber);
        const id = String(row.id || "").trim();
        const customerId = String(row.customer_id || "").trim();
        if (!validUuid(id) || !validUuid(customerId)) throw new Error(`Notes แถว ${rowNumber}: id/customer_id ไม่ถูกต้อง`);
        if (noteSeen.has(id)) throw new Error(`Notes แถว ${rowNumber}: id ซ้ำ`);
        noteSeen.add(id);
        const current = noteMap.get(id);
        if (!current) throw new Error(`Notes แถว ${rowNumber}: ไม่พบโน้ตเดิม ห้ามเพิ่มแถวใหม่`);
        if (current.customer_id !== customerId) throw new Error(`Notes แถว ${rowNumber}: ห้ามเปลี่ยน customer_id`);
        const next = {
          note_text: excelRequiredText(row.note_text, 5000, `Notes แถว ${rowNumber} note_text`)
        };
        const changedFields = pushFieldChanges(
          changes, "Notes", id, customerLegalNameFromData(customerId, data), current, next, ["note_text"]
        );
        if (Object.keys(changedFields).length) {
          const expectedUpdatedAt = excelRowVersion(row.updated_at, `Notes แถว ${rowNumber} updated_at`);
          if (expectedUpdatedAt !== normalizeIsoTimestamp(current.updated_at)) {
            throw new Error(`Notes แถว ${rowNumber}: ข้อมูลถูกแก้หลังส่งออก กรุณาส่งออกไฟล์ใหม่`);
          }
          payload.notes.push({ id, customer_id: customerId, expected_updated_at: expectedUpdatedAt, ...next });
        }
      } catch (error) {
        errors.push(error.message);
      }
    });

    const prospectiveTaxIds = new Map();
    data.customers.forEach((row) => {
      const patch = payload.customers.find((item) => item.id === row.id);
      const taxId = patch?.tax_id || row.tax_id;
      if (prospectiveTaxIds.has(taxId) && prospectiveTaxIds.get(taxId) !== row.id) {
        errors.push(`Customers: เลขประจำตัวผู้เสียภาษี ${taxId} ซ้ำ`);
      }
      prospectiveTaxIds.set(taxId, row.id);
    });

    if (changes.length > 5000) errors.push("ไฟล์มีการเปลี่ยนแปลงเกิน 5,000 ช่อง กรุณาแบ่งอัปเดตเป็นหลายครั้ง");
    return {
      fileName: file.name,
      payload,
      changes,
      errors: [...new Set(errors)],
      counts: {
        customers: payload.customers.length,
        contacts: payload.contacts.length,
        accounts: payload.accounts.length,
        notes: payload.notes.length
      }
    };
  }

  function displayImportValue(value) {
    if (value === null || value === undefined || value === "") return "ว่าง";
    if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
    if (typeof value === "object") return jsonCell(value);
    return String(value);
  }

  function renderCustomerExcelImportPreview(preview) {
    state.excelImportPreview = preview;
    if (!el.excelImportDialogContent || !el.excelImportConfirmButton) return;
    const hasErrors = preview.errors.length > 0;
    const hasChanges = preview.changes.length > 0;
    el.excelImportConfirmButton.disabled = hasErrors || !hasChanges;
    el.excelImportDialogContent.innerHTML = `
      <div class="excel-import-summary">
        <div class="card"><strong>${preview.changes.length.toLocaleString("th-TH")}</strong><span>ช่องที่เปลี่ยน</span></div>
        <div class="card"><strong>${preview.counts.customers.toLocaleString("th-TH")}</strong><span>ลูกค้า</span></div>
        <div class="card"><strong>${preview.counts.contacts.toLocaleString("th-TH")}</strong><span>ผู้ติดต่อ</span></div>
        <div class="card"><strong>${preview.counts.accounts.toLocaleString("th-TH")}</strong><span>บัญชีลูกค้า</span></div>
        <div class="card"><strong>${preview.counts.notes.toLocaleString("th-TH")}</strong><span>โน้ต</span></div>
      </div>
      <p class="muted">ไฟล์: ${h(preview.fileName)}</p>
      ${hasErrors ? `
        <div class="alert alert-danger">
          <strong>ไม่สามารถนำเข้าได้ (${preview.errors.length.toLocaleString("th-TH")} ข้อ)</strong>
          <ul class="excel-import-errors">
            ${preview.errors.slice(0, 100).map((message) => `<li>${h(message)}</li>`).join("")}
          </ul>
          ${preview.errors.length > 100 ? `<p>แสดง 100 ข้อแรกจาก ${preview.errors.length.toLocaleString("th-TH")} ข้อ</p>` : ""}
        </div>` : ""}
      ${!hasErrors && !hasChanges ? `
        <div class="alert alert-info">ไม่พบข้อมูลที่เปลี่ยนจากฐานข้อมูลปัจจุบัน</div>` : ""}
      ${preview.changes.length ? `
        <div class="table-wrap excel-import-preview-table">
          <table>
            <thead><tr><th>ประเภท</th><th>ลูกค้า</th><th>ฟิลด์</th><th>ค่าเดิม</th><th>ค่าใหม่</th></tr></thead>
            <tbody>
              ${preview.changes.slice(0, 300).map((change) => `
                <tr>
                  <td>${h(change.resource)}</td>
                  <td>${h(change.customerName)}</td>
                  <td><code>${h(change.field)}</code></td>
                  <td>${h(displayImportValue(change.oldValue))}</td>
                  <td>${h(displayImportValue(change.newValue))}</td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${preview.changes.length > 300 ? `<p class="muted">แสดง 300 รายการแรกจาก ${preview.changes.length.toLocaleString("th-TH")} รายการ</p>` : ""}
      ` : ""}
    `;
    openDialog(el.excelImportDialog);
  }

  async function openCustomerExcelImport() {
    if (state.profile?.role !== "admin") {
      showToast("เฉพาะผู้ดูแลระบบเท่านั้นที่นำเข้า Excel ได้", "error");
      return;
    }
    state.excelImportPreview = null;
    if (el.customerExcelImportFile) {
      el.customerExcelImportFile.value = "";
      el.customerExcelImportFile.click();
    }
  }

  async function handleCustomerExcelImportFile(file) {
    setLoading(true, "กำลังตรวจสอบไฟล์ Excel...");
    try {
      const preview = await prepareCustomerExcelImport(file);
      renderCustomerExcelImportPreview(preview);
    } catch (error) {
      state.excelImportPreview = null;
      if (el.excelImportConfirmButton) el.excelImportConfirmButton.disabled = true;
      if (el.excelImportDialogContent) {
        el.excelImportDialogContent.innerHTML = `
          <div class="alert alert-danger"><strong>ตรวจสอบไฟล์ไม่ผ่าน</strong><span>${h(normalizeError(error))}</span></div>`;
      }
      openDialog(el.excelImportDialog);
      showError(error, "ตรวจสอบไฟล์ Excel ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  function closeCustomerExcelImport() {
    state.excelImportPreview = null;
    if (el.customerExcelImportFile) el.customerExcelImportFile.value = "";
    if (el.excelImportConfirmButton) el.excelImportConfirmButton.disabled = true;
    closeDialog(el.excelImportDialog);
  }

  async function confirmCustomerExcelImport(button) {
    const preview = state.excelImportPreview;
    if (!preview || preview.errors.length || !preview.changes.length) return;
    const ok = await confirmAction(
      `ยืนยันอัปเดต ${preview.changes.length.toLocaleString("th-TH")} ช่องหรือไม่? ระบบจะบันทึกทั้งหมดใน Transaction เดียว`,
      "ยืนยันอัปเดตจาก Excel",
      "อัปเดตข้อมูล"
    );
    if (!ok) return;

    setButtonBusy(button, true, "กำลังอัปเดต...");
    setLoading(true, "กำลังอัปเดตข้อมูลจาก Excel...");
    try {
      const { data, error } = await state.client.rpc("admin_update_customers_from_excel_v1", {
        p_payload: preview.payload
      });
      if (error) throw error;
      closeCustomerExcelImport();
      clearCustomerCaches();
      await loadCustomers(true);
      showToast(`อัปเดตข้อมูลจาก Excel สำเร็จ ${Number(data?.updated_rows || preview.changes.length).toLocaleString("th-TH")} แถว`);
      if (parseRoute().name === "customers") await renderCustomersPage();
    } catch (error) {
      showError(error, "อัปเดตข้อมูลจาก Excel ไม่สำเร็จ");
    } finally {
      setLoading(false);
      setButtonBusy(button, false);
    }
  }

function exportRowsToExcel(rows, columns, fileName, sheetName) {
  if (!rows.length) {
    showToast("ไม่มีข้อมูลสำหรับส่งออก", "warning");
    return;
  }
  if (!window.XLSX?.utils) {
    throw new Error("โหลดเครื่องมือสร้างไฟล์ Excel ไม่สำเร็จ");
  }
  const output = rows.map((row) => Object.fromEntries(
    columns.map((column) => [column.header, excelSafeValue(column.value(row))])
  ));
  const worksheet = window.XLSX.utils.json_to_sheet(output);
  worksheet["!cols"] = columns.map((column) => ({ wch: column.width || 18 }));
  const workbook = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  window.XLSX.writeFile(workbook, fileName, { compression: true });
}
  

function exportManagerReportsExcel() {
  const rows = [];
  state.grids.managerReports?.forEachNodeAfterFilterAndSort?.((node) => {
    if (node.data) rows.push(node.data);
  });
  if (!state.grids.managerReports && state.filteredManagerRows?.length) {
    rows.push(...state.filteredManagerRows);
  }
  exportRowsToExcel(rows, [
    { header: "วันที่", value: (row) => formatDate(row.work_date), width: 14 },
    { header: "ผู้ใช้งาน", value: (row) => row.user_name || "-", width: 24 },
    { header: "สถานะ", value: (row) => row.status_text || "-", width: 22 },
    { header: "รุ่นเนื้อหา", value: (row) => Number(row.content_version || 0), width: 14 },
    { header: "ส่งเมื่อ", value: (row) => formatDateTime(row.submitted_at), width: 20 },
    { header: "อัปเดตล่าสุด", value: (row) => formatDateTime(row.updated_at), width: 20 }
  ], `รายงานทีม-${bangkokDate()}.xlsx`, "รายงานทีม");
}

async function runExcelExport(button, exporter) {
  setButtonBusy(button, true, "กำลังสร้างไฟล์...");
  try {
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
    await exporter();
  } catch (error) {
    showError(error, "สร้างไฟล์ Excel ไม่สำเร็จ");
  } finally {
    setButtonBusy(button, false);
  }
}


  function publicMediaUrl(path, version = null) {
    if (!path || !state.client) return "";
    const { data } = state.client.storage.from(PUBLIC_MEDIA_BUCKET).getPublicUrl(path);
    const url = data?.publicUrl || "";
    if (!url) return "";
    return version ? `${url}?v=${encodeURIComponent(version)}` : url;
  }

  async function createAvatarSignedUrl(path) {
    if (!path || !state.client || !state.session) return "";
    const { data, error } = await state.client.storage
      .from(AVATAR_BUCKET)
      .createSignedUrl(path, 60 * 60);
    if (error) {
      console.warn("สร้างลิงก์รูปโปรไฟล์ไม่สำเร็จ", error);
      return "";
    }
    return data?.signedUrl || data?.signedURL || "";
  }

  async function hydrateProfileAvatarUrls(profiles) {
    return Promise.all((profiles || []).map(async (profile) => ({
      ...profile,
      avatar_signed_url: profile.avatar_path
        ? await createAvatarSignedUrl(profile.avatar_path)
        : ""
    })));
  }

  function avatarUrl(profile) {
    return profile?.avatar_signed_url || "";
  }

  function avatarMarkup(profile, className = "user-avatar", fallbackName = "") {
    const url = avatarUrl(profile);
    const initials = userInitials(profile?.display_name || fallbackName || "FI");
    if (url) {
      return `<span class="${h(className)} has-image"><img src="${h(url)}" alt="รูปโปรไฟล์ของ ${h(profile?.display_name || fallbackName || "ผู้ใช้งาน")}"></span>`;
    }
    return `<span class="${h(className)}">${h(initials)}</span>`;
  }

  function profileById(profileId) {
    return state.profiles.find((profile) => profile.id === profileId) || null;
  }
function profileIdentityMarkup(profile, options = {}) {
    const {
      avatarClass = "profile-avatar-small",
      showPosition = true,
      subtitle = null,
      fallbackName = "ไม่พบผู้ใช้งาน",
      extraClass = ""
    } = options;
    const displayName = profile?.display_name || fallbackName;
    const secondary = subtitle ?? (showPosition ? (profile?.position || "ไม่ระบุตำแหน่ง") : "");
    return `
      <span class="profile-identity ${h(extraClass)}">
        ${avatarMarkup(profile, avatarClass, displayName)}
        <span class="profile-identity-copy">
          <strong>${h(displayName)}</strong>
          ${secondary ? `<small>${h(secondary)}</small>` : ""}
        </span>
      </span>`;
  }

  function profileIdentityNode(profile, options = {}) {
    const {
      avatarClass = "profile-avatar-small",
      showPosition = true,
      subtitle = null,
      fallbackName = "ไม่พบผู้ใช้งาน",
      extraClass = ""
    } = options;
    const wrapper = document.createElement("span");
    wrapper.className = `profile-identity ${extraClass}`.trim();

    const avatar = document.createElement("span");
    avatar.className = avatarClass;
    renderAvatarInto(avatar, profile, profile?.display_name || fallbackName);

    const copy = document.createElement("span");
    copy.className = "profile-identity-copy";
    const name = document.createElement("strong");
    name.textContent = profile?.display_name || fallbackName;
    copy.append(name);
    const secondary = subtitle ?? (showPosition ? (profile?.position || "ไม่ระบุตำแหน่ง") : "");
    if (secondary) {
      const detail = document.createElement("small");
      detail.textContent = secondary;
      copy.append(detail);
    }
    wrapper.append(avatar, copy);
    return wrapper;
  }

  function renderAvatarInto(node, profile, fallbackName = "") {
    if (!node) return;
    const url = avatarUrl(profile);
    node.classList.toggle("has-image", Boolean(url));
    node.replaceChildren();
    if (url) {
      const image = document.createElement("img");
      image.src = url;
      image.alt = `รูปโปรไฟล์ของ ${profile?.display_name || fallbackName || "ผู้ใช้งาน"}`;
      node.append(image);
    } else {
      node.textContent = userInitials(profile?.display_name || fallbackName || "FI");
    }
  }


  function mediaMimeTypeFromPath(path) {
    const cleanPath = String(path || "").split(/[?#]/, 1)[0].toLowerCase();
    if (cleanPath.endsWith(".ico")) return "image/x-icon";
    if (cleanPath.endsWith(".webp")) return "image/webp";
    if (cleanPath.endsWith(".jpg") || cleanPath.endsWith(".jpeg")) return "image/jpeg";
    if (cleanPath.endsWith(".svg")) return "image/svg+xml";
    return "image/png";
  }

function applySystemBranding() {
    const settings = state.systemSettings || {};
    const loginUrl = publicMediaUrl(settings.login_image_path, settings.updated_at || APP_VERSION);
    if (el.loginBrandingMedia) {
      el.loginBrandingMedia.style.backgroundImage = loginUrl ? `url("${loginUrl.replaceAll('"', "%22")}")` : "";
      el.loginBrandingMedia.classList.toggle("has-custom-image", Boolean(loginUrl));
    }
    if (el.loginBrandingFallback) {
      el.loginBrandingFallback.classList.toggle("hidden", Boolean(loginUrl));
    }
    if (el.appFavicon) {
      const faviconUrl = publicMediaUrl(settings.favicon_path, settings.updated_at || APP_VERSION);
      el.appFavicon.href = faviconUrl || DEFAULT_FAVICON;
      el.appFavicon.type = settings.favicon_path
        ? mediaMimeTypeFromPath(settings.favicon_path)
        : "image/svg+xml";
    }
  }

  async function loadPublicSettings(force = false) {
    if (!state.client || (state.publicSettingsLoaded && !force)) return true;

    const fullColumns = [
      "id",
      "login_image_path",
      "favicon_path",
      "customer_list_columns",
      "customer_list_sort_column",
      "customer_list_sort_direction",
      "updated_at"
    ].join(",");

    try {
      let result = await state.client
        .from("app_settings")
        .select(fullColumns)
        .eq("id", 1)
        .maybeSingle();

      const missingCustomerListColumns = result.error
        && /customer_list_columns|customer_list_sort_column|customer_list_sort_direction/i
          .test(result.error.message || "");

      if (missingCustomerListColumns) {
        state.customerListSettingsAvailable = false;
        result = await state.client
          .from("app_settings")
          .select("id,login_image_path,favicon_path,updated_at")
          .eq("id", 1)
          .maybeSingle();
      } else {
        state.customerListSettingsAvailable = true;
      }

      if (result.error) {
        const missingTable = /relation .*app_settings.*does not exist|Could not find the table/i
          .test(result.error.message || "");
        if (!missingTable) {
          console.warn("โหลดการตั้งค่าระบบไม่สำเร็จ จึงใช้ค่าเริ่มต้น", result.error);
          state.publicSettingsLoaded = false;
        } else {
          state.publicSettingsLoaded = true;
        }
        applySystemBranding();
        return false;
      }

      const listSettings = normalizeCustomerListSettings(result.data || {});
      state.systemSettings = {
        id: 1,
        login_image_path: null,
        favicon_path: null,
        updated_at: null,
        ...(result.data || {}),
        ...listSettings
      };
      state.publicSettingsLoaded = true;
      applySystemBranding();
      return true;
    } catch (error) {
      console.warn("โหลดการตั้งค่าระบบไม่สำเร็จ จึงใช้ค่าเริ่มต้น", error);
      state.publicSettingsLoaded = false;
      state.systemSettings = {
        ...state.systemSettings,
        ...defaultCustomerListSettings()
      };
      applySystemBranding();
      return false;
    }
  }


  function renderCustomerListSettingsEditor() {
    const draft = state.customerListSettingsDraft;
    if (!draft || !el.customerListSettingsColumns) return;

    if (!draft.columns.length) {
      draft.columns = [...DEFAULT_CUSTOMER_LIST_COLUMNS];
    }
    if (!draft.columns.includes(draft.sortColumn)) {
      draft.sortColumn = draft.columns[0];
    }
    draft.sortDirection = draft.sortDirection === "asc" ? "asc" : "desc";

    const selected = new Set(draft.columns);
    const orderedRows = [
      ...draft.columns.map(customerListColumnMeta).filter(Boolean),
      ...CUSTOMER_LIST_COLUMN_CATALOG.filter((column) => !selected.has(column.key))
    ];
    const selectedCount = draft.columns.length;

    el.customerListSettingsColumns.innerHTML = orderedRows.map((column) => {
      const checked = selected.has(column.key);
      const selectedIndex = draft.columns.indexOf(column.key);
      return `
        <div class="customer-list-setting-row ${checked ? "is-selected" : ""}" data-column-key="${h(column.key)}">
          <label class="customer-list-setting-toggle">
            <input type="checkbox" data-customer-list-column-toggle="${h(column.key)}" ${checked ? "checked" : ""}>
            <span>
              <strong>${h(column.label)}</strong>
              <small>${h(column.description)}</small>
            </span>
          </label>
          <div class="customer-list-setting-order" aria-label="จัดลำดับ ${h(column.label)}">
            <button type="button" class="icon-button icon-button-small"
                    data-action="move-customer-list-column" data-column-key="${h(column.key)}" data-direction="up"
                    aria-label="เลื่อน ${h(column.label)} ขึ้น"
                    ${!checked || selectedIndex <= 0 ? "disabled" : ""}>↑</button>
            <button type="button" class="icon-button icon-button-small"
                    data-action="move-customer-list-column" data-column-key="${h(column.key)}" data-direction="down"
                    aria-label="เลื่อน ${h(column.label)} ลง"
                    ${!checked || selectedIndex < 0 || selectedIndex >= selectedCount - 1 ? "disabled" : ""}>↓</button>
          </div>
        </div>`;
    }).join("");

    if (el.customerListSortColumn) {
      el.customerListSortColumn.innerHTML = draft.columns.map((key) => {
        const meta = customerListColumnMeta(key);
        return `<option value="${h(key)}" ${key === draft.sortColumn ? "selected" : ""}>${h(meta?.label || key)}</option>`;
      }).join("");
    }
    if (el.customerListSortDirection) {
      el.customerListSortDirection.value = draft.sortDirection;
    }

    const countNode = document.getElementById("customer-list-settings-count");
    if (countNode) countNode.textContent = `${selectedCount.toLocaleString("th-TH")} คอลัมน์`;
  }

  function openCustomerListSettings() {
    if (state.profile?.role !== "admin") {
      showToast("เฉพาะผู้ดูแลระบบเท่านั้นที่ตั้งค่าตารางได้", "error");
      return;
    }
    if (!state.customerListSettingsAvailable) {
      throw new Error("Migration 011_customer_list_settings_excel_split_manager_review is required");
    }

    const current = currentCustomerListSettings();
    state.customerListSettingsDraft = {
      columns: [...current.customer_list_columns],
      sortColumn: current.customer_list_sort_column,
      sortDirection: current.customer_list_sort_direction
    };
    renderCustomerListSettingsEditor();
    openDialog(el.customerListSettingsDialog);
  }

  function setCustomerListColumnEnabled(key, enabled) {
    const draft = state.customerListSettingsDraft;
    if (!draft || !CUSTOMER_LIST_COLUMN_KEYS.has(key)) return;

    const exists = draft.columns.includes(key);
    if (enabled && !exists) {
      draft.columns.push(key);
    } else if (!enabled && exists) {
      if (draft.columns.length <= 1) {
        showToast("ต้องแสดงอย่างน้อย 1 คอลัมน์", "warning");
        renderCustomerListSettingsEditor();
        return;
      }
      draft.columns = draft.columns.filter((columnKey) => columnKey !== key);
      if (draft.sortColumn === key) draft.sortColumn = draft.columns[0];
    }
    renderCustomerListSettingsEditor();
  }

  function moveCustomerListColumn(key, direction) {
    const draft = state.customerListSettingsDraft;
    if (!draft) return;
    const index = draft.columns.indexOf(key);
    if (index < 0) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= draft.columns.length) return;
    [draft.columns[index], draft.columns[targetIndex]] = [draft.columns[targetIndex], draft.columns[index]];
    renderCustomerListSettingsEditor();
  }

  function syncCustomerListSettingsDraftFromControls() {
    const draft = state.customerListSettingsDraft;
    if (!draft) return;
    const sortColumn = el.customerListSortColumn?.value || draft.columns[0];
    draft.sortColumn = draft.columns.includes(sortColumn) ? sortColumn : draft.columns[0];
    draft.sortDirection = el.customerListSortDirection?.value === "asc" ? "asc" : "desc";
  }

  function resetCustomerListSettingsDraft() {
    state.customerListSettingsDraft = {
      columns: [...DEFAULT_CUSTOMER_LIST_COLUMNS],
      sortColumn: DEFAULT_CUSTOMER_LIST_SORT_COLUMN,
      sortDirection: DEFAULT_CUSTOMER_LIST_SORT_DIRECTION
    };
    renderCustomerListSettingsEditor();
  }

  async function saveCustomerListSettings(button) {
    if (state.profile?.role !== "admin") {
      showToast("เฉพาะผู้ดูแลระบบเท่านั้นที่ตั้งค่าตารางได้", "error");
      return;
    }
    syncCustomerListSettingsDraftFromControls();
    const draft = state.customerListSettingsDraft;
    if (!draft?.columns?.length) {
      showToast("ต้องแสดงอย่างน้อย 1 คอลัมน์", "error");
      return;
    }

    setButtonBusy(button, true, "กำลังบันทึก...");
    try {
      const { data, error } = await state.client.rpc("admin_update_customer_list_settings_v1", {
        p_columns: draft.columns,
        p_sort_column: draft.sortColumn,
        p_sort_direction: draft.sortDirection
      });
      if (error) throw error;

      const savedSettings = Array.isArray(data) ? data[0] : data;
      if (!savedSettings?.id) {
        throw new Error("ฐานข้อมูลไม่ส่งการตั้งค่าตารางที่บันทึกกลับมา");
      }
      const normalized = normalizeCustomerListSettings(savedSettings);
      state.systemSettings = {
        ...state.systemSettings,
        ...savedSettings,
        ...normalized
      };
      state.customerListSettingsDraft = null;
      closeDialog(el.customerListSettingsDialog);
      showToast("บันทึกการตั้งค่าตารางสำหรับผู้ใช้ทุกคนแล้ว");
      if (parseRoute().name === "customers") {
        await renderCustomersPage();
      }
    } catch (error) {
      showError(error, "บันทึกการตั้งค่าตารางไม่สำเร็จ");
    } finally {
      setButtonBusy(button, false);
    }
  }

  function fileExtension(file) {
    const map = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
      "image/x-icon": "ico",
      "image/vnd.microsoft.icon": "ico"
    };
    return map[file?.type] || String(file?.name || "").split(".").pop()?.toLowerCase() || "bin";
  }

  function imageDimensions(file) {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        const result = { width: image.naturalWidth, height: image.naturalHeight };
        URL.revokeObjectURL(objectUrl);
        resolve(result);
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("ไม่สามารถอ่านไฟล์รูปภาพได้"));
      };
      image.src = objectUrl;
    });
  }

  async function validateImageFile(file, {
    maxBytes,
    allowedTypes,
    requireSquare = false
  }) {
    if (!file) throw new Error("กรุณาเลือกไฟล์รูปภาพ");
    if (!allowedTypes.includes(file.type)) {
      throw new Error("ชนิดไฟล์ไม่รองรับ");
    }
    if (file.size > maxBytes) {
      throw new Error(`ขนาดไฟล์ต้องไม่เกิน ${(maxBytes / 1024 / 1024).toFixed(0)} MB`);
    }
    if (requireSquare && file.type !== "image/x-icon" && file.type !== "image/vnd.microsoft.icon") {
      const { width, height } = await imageDimensions(file);
      if (!width || !height || Math.abs(width - height) > 2) {
        throw new Error("รูปภาพต้องมีอัตราส่วน 1:1");
      }
    }
  }

  async function uploadMedia(file, folder, bucket = PUBLIC_MEDIA_BUCKET) {
    const extension = fileExtension(file);
    const random = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const path = `${folder}/${random}.${extension}`;
    const { error } = await state.client.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false
      });
    if (error) throw error;
    return path;
  }

  async function removeMedia(path, bucket = PUBLIC_MEDIA_BUCKET) {
    if (!path) return;
    const { error } = await state.client.storage.from(bucket).remove([path]);
    if (error) console.warn("ลบไฟล์เดิมไม่สำเร็จ", error);
  }

  function refreshProfileReferences(profileId, patch) {
    state.profiles = state.profiles.map((profile) => profile.id === profileId ? { ...profile, ...patch } : profile);
    if (state.profile?.id === profileId) {
      state.profile = { ...state.profile, ...patch };
      renderAvatarInto(el.currentUserAvatar, state.profile);
    }
  }

  function openAvatarEditor(profileId = state.profile?.id) {
    const profile = state.profiles.find((item) => item.id === profileId)
      || (state.profile?.id === profileId ? state.profile : null);
    if (!profile) {
      showToast("ไม่พบข้อมูลผู้ใช้งาน", "error");
      return;
    }
    if (profileId !== state.profile?.id && state.profile?.role !== "admin") {
      showToast("คุณไม่มีสิทธิ์เปลี่ยนรูปของบัญชีนี้", "error");
      return;
    }
    el.avatarForm.reset();
    el.avatarForm.elements.profile_id.value = profileId;
    el.avatarDialogTitle.textContent = profileId === state.profile?.id
      ? "เปลี่ยนรูปโปรไฟล์"
      : `เปลี่ยนรูปของ ${profile.display_name}`;
    renderAvatarInto(el.avatarPreview, profile);
    el.avatarRemoveButton.disabled = !profile.avatar_path;
    openDialog(el.avatarDialog);
  }

  async function saveAvatar(event) {
    event.preventDefault();
    const profileId = String(el.avatarForm.elements.profile_id.value || "");
    const profile = state.profiles.find((item) => item.id === profileId)
      || (state.profile?.id === profileId ? state.profile : null);
    const file = el.avatarFile.files?.[0];
    if (!profile || !file) {
      showToast("กรุณาเลือกไฟล์รูปภาพ", "warning");
      return;
    }
    setButtonBusy(el.avatarSaveButton, true, "กำลังอัปโหลด...");
    try {
      await validateImageFile(file, {
        maxBytes: 3 * 1024 * 1024,
        allowedTypes: ["image/png", "image/jpeg", "image/webp"],
        requireSquare: false
      });
      const nextPath = await uploadMedia(file, `avatars/${profileId}`, AVATAR_BUCKET);
      const nextSignedUrl = await createAvatarSignedUrl(nextPath);
      const rpcName = profileId === state.profile.id
        ? "update_my_avatar_path"
        : "admin_update_profile_avatar";
      const args = profileId === state.profile.id
        ? { p_avatar_path: nextPath }
        : { p_profile_id: profileId, p_avatar_path: nextPath };
      const { data, error } = await state.client.rpc(rpcName, args);
      if (error) {
        await removeMedia(nextPath, AVATAR_BUCKET);
        throw error;
      }
      const previousPath = profile.avatar_path;
      const updatedAt = data?.updated_at || new Date().toISOString();
      refreshProfileReferences(profileId, {
        avatar_path: nextPath,
        avatar_signed_url: nextSignedUrl,
        updated_at: updatedAt
      });
      await removeMedia(previousPath, AVATAR_BUCKET);
      closeDialog(el.avatarDialog);
      showToast("บันทึกรูปโปรไฟล์แล้ว");
      if (parseRoute().name === "profile") await renderProfilePage();
      if (parseRoute().name === "admin-users") await renderAdminUsersPage();
    } catch (error) {
      showError(error, "บันทึกรูปโปรไฟล์ไม่สำเร็จ");
    } finally {
      setButtonBusy(el.avatarSaveButton, false);
    }
  }

  async function removeAvatar() {
    const profileId = String(el.avatarForm.elements.profile_id.value || "");
    const profile = state.profiles.find((item) => item.id === profileId)
      || (state.profile?.id === profileId ? state.profile : null);
    if (!profile?.avatar_path) return;
    const confirmed = await confirmAction(
      "ต้องการลบรูปโปรไฟล์นี้หรือไม่",
      "ลบรูปโปรไฟล์",
      "ลบรูป"
    );
    if (!confirmed) return;
    setButtonBusy(el.avatarRemoveButton, true, "กำลังลบ...");
    try {
      const rpcName = profileId === state.profile.id
        ? "update_my_avatar_path"
        : "admin_update_profile_avatar";
      const args = profileId === state.profile.id
        ? { p_avatar_path: null }
        : { p_profile_id: profileId, p_avatar_path: null };
      const { data, error } = await state.client.rpc(rpcName, args);
      if (error) throw error;
      const previousPath = profile.avatar_path;
      refreshProfileReferences(profileId, {
        avatar_path: null,
        avatar_signed_url: "",
        updated_at: data?.updated_at || new Date().toISOString()
      });
      await removeMedia(previousPath, AVATAR_BUCKET);
      closeDialog(el.avatarDialog);
      showToast("ลบรูปโปรไฟล์แล้ว");
      if (parseRoute().name === "profile") await renderProfilePage();
      if (parseRoute().name === "admin-users") await renderAdminUsersPage();
    } catch (error) {
      showError(error, "ลบรูปโปรไฟล์ไม่สำเร็จ");
    } finally {
      setButtonBusy(el.avatarRemoveButton, false);
    }
  }

  function brandingPreview(path, fallbackLabel) {
    const url = publicMediaUrl(path, state.systemSettings?.updated_at || APP_VERSION);
    return url
      ? `<img src="${h(url)}" alt="${h(fallbackLabel)}">`
      : `<div class="media-preview-empty">${icon("image")}<span>ยังไม่ได้ตั้งค่ารูปภาพ</span></div>`;
  }

  function updateBrandingControls(kind) {
    const isLogin = kind === "login";
    const column = isLogin ? "login_image_path" : "favicon_path";
    const preview = document.getElementById(isLogin ? "login-image-preview" : "favicon-image-preview");
    const input = document.getElementById(isLogin ? "login-image-file" : "favicon-image-file");
    const removeButton = document.querySelector(`[data-action="remove-branding-image"][data-kind="${kind}"]`);

    if (preview) {
      preview.innerHTML = brandingPreview(
        state.systemSettings?.[column],
        isLogin ? "ภาพหน้าเข้าสู่ระบบ" : "ไอคอนแท็บเบราว์เซอร์"
      );
    }
    if (input) input.value = "";
    if (removeButton) removeButton.disabled = !state.systemSettings?.[column];
  }


  async function renderSystemSettingsPage() {
    await loadPublicSettings(true);
    const settings = state.systemSettings || {};
    el.mainContent.innerHTML = `
      ${pageHeader(
        "ตั้งค่าภาพระบบ",
        "จัดการภาพหน้าเข้าสู่ระบบและไอคอนแท็บเบราว์เซอร์",
        "",
        [{ label: "ตั้งค่าภาพระบบ" }]
      )}
      <div class="settings-card-grid">
        <section class="panel media-setting-card">
          <div class="panel-header">
            <div>
              <h2>ภาพหน้าเข้าสู่ระบบ</h2>
              <p class="muted">แสดงในพื้นที่ด้านซ้ายของหน้าเข้าสู่ระบบ</p>
            </div>
          </div>
          <div class="panel-body">
            <div id="login-image-preview" class="media-preview media-preview-square">
              ${brandingPreview(settings.login_image_path, "ภาพหน้าเข้าสู่ระบบ")}
            </div>
            <label for="login-image-file">
              <span class="field-label">เลือกไฟล์รูปภาพ</span>
              <input id="login-image-file" type="file" accept="image/png,image/jpeg,image/webp">
            </label>
            <small class="field-help">รองรับ PNG, JPEG หรือ WebP ขนาดไม่เกิน 5 MB ระบบจะแสดงผลแบบครอบภาพในกรอบ 1:1</small>
          </div>
          <div class="panel-footer-actions panel-footer-actions-between">
            <button type="button" class="btn btn-danger" data-action="remove-branding-image" data-kind="login" ${settings.login_image_path ? "" : "disabled"}>ลบรูป</button>
            <button type="button" class="btn btn-primary" data-action="save-branding-image" data-kind="login">${icon("save")} บันทึก</button>
          </div>
        </section>

        <section class="panel media-setting-card">
          <div class="panel-header">
            <div>
              <h2>ไอคอนแท็บเบราว์เซอร์</h2>
              <p class="muted">ใช้เป็นไอคอนของเว็บไซต์บนแท็บและรายการโปรด</p>
            </div>
          </div>
          <div class="panel-body">
            <div id="favicon-image-preview" class="media-preview media-preview-favicon">
              ${brandingPreview(settings.favicon_path, "ไอคอนแท็บเบราว์เซอร์")}
            </div>
            <label for="favicon-image-file">
              <span class="field-label">เลือกไฟล์ไอคอน</span>
              <input id="favicon-image-file" type="file" accept="image/png,image/webp,image/x-icon,image/vnd.microsoft.icon">
            </label>
            <small class="field-help">รองรับ PNG, WebP หรือ ICO ขนาดไม่เกิน 1 MB และควรเป็นภาพ 1:1</small>
          </div>
          <div class="panel-footer-actions panel-footer-actions-between">
            <button type="button" class="btn btn-danger" data-action="remove-branding-image" data-kind="favicon" ${settings.favicon_path ? "" : "disabled"}>ลบไอคอน</button>
            <button type="button" class="btn btn-primary" data-action="save-branding-image" data-kind="favicon">${icon("save")} บันทึก</button>
          </div>
        </section>
      </div>`;
  }

  async function saveBrandingImage(kind, button) {
    const isLogin = kind === "login";
    const input = document.getElementById(isLogin ? "login-image-file" : "favicon-image-file");
    const file = input?.files?.[0];
    if (!file) {
      showToast("กรุณาเลือกไฟล์รูปภาพ", "warning");
      return;
    }

    setButtonBusy(button, true, "กำลังอัปโหลด...");
    try {
      await validateImageFile(file, {
        maxBytes: isLogin ? 5 * 1024 * 1024 : 1024 * 1024,
        allowedTypes: isLogin
          ? ["image/png", "image/jpeg", "image/webp"]
          : ["image/png", "image/webp", "image/x-icon", "image/vnd.microsoft.icon"],
        requireSquare: !isLogin
      });

      const nextPath = await uploadMedia(
        file,
        isLogin ? "branding/login" : "branding/favicon",
        PUBLIC_MEDIA_BUCKET
      );
      const column = isLogin ? "login_image_path" : "favicon_path";
      const previousPath = state.systemSettings?.[column] || null;

      const { data, error } = await state.client
        .from("app_settings")
        .update({ [column]: nextPath })
        .eq("id", 1)
        .select("id,login_image_path,favicon_path,customer_list_columns,customer_list_sort_column,customer_list_sort_direction,updated_at")
        .single();

      if (error) {
        await removeMedia(nextPath);
        throw error;
      }

      state.systemSettings = {
        ...data,
        ...normalizeCustomerListSettings(data || {})
      };
      state.publicSettingsLoaded = true;
      applySystemBranding();
      updateBrandingControls(kind);
      await removeMedia(previousPath);
      showToast("บันทึกรูปภาพแล้ว");
    } catch (error) {
      showError(error, "บันทึกรูปภาพไม่สำเร็จ");
    } finally {
      setButtonBusy(button, false);
    }
  }

  async function removeBrandingImage(kind, button = null) {
    const isLogin = kind === "login";
    const column = isLogin ? "login_image_path" : "favicon_path";
    const previousPath = state.systemSettings?.[column] || null;
    if (!previousPath) return;

    const confirmed = await confirmAction(
      isLogin ? "ต้องการลบภาพหน้าเข้าสู่ระบบหรือไม่" : "ต้องการลบไอคอนแท็บเบราว์เซอร์หรือไม่",
      "ยืนยันการลบ",
      "ลบ"
    );
    if (!confirmed) return;

    setButtonBusy(button, true, "กำลังลบ...");
    try {
      const { data, error } = await state.client
        .from("app_settings")
        .update({ [column]: null })
        .eq("id", 1)
        .select("id,login_image_path,favicon_path,customer_list_columns,customer_list_sort_column,customer_list_sort_direction,updated_at")
        .single();

      if (error) throw error;

      state.systemSettings = {
        ...data,
        ...normalizeCustomerListSettings(data || {})
      };
      state.publicSettingsLoaded = true;
      applySystemBranding();
      updateBrandingControls(kind);
      await removeMedia(previousPath);
      showToast("ลบรูปภาพแล้ว");
    } finally {
      setButtonBusy(button, false);
    }
  }
  async function loadMasterGroupData(groupKey) {
    const config = MASTER_GROUPS[groupKey];
    if (!config) throw new Error("ไม่พบหมวดข้อมูลตัวเลือกกลาง");

    if (config.source === "modules" || config.source === "features") {
      const result = await state.client
        .from(config.source)
        .select("id,code,name,is_active,sort_order,is_system")
        .order("sort_order")
        .order("name");
      if (result.error) throw result.error;

      const rows = (result.data || []).map((item) => ({
        ...item,
        sort_order: Number(item.sort_order),
        is_system: Boolean(item.is_system)
      }));
      if (config.source === "modules") state.modules = rows;
      else state.features = rows;
      return rows;
    }

    const { data, error } = await state.client
      .from("master_options")
      .select("id,group_key,option_value,display_name,sort_order,is_active,is_system,created_at,updated_at")
      .eq("group_key", groupKey)
      .order("sort_order")
      .order("display_name");
    if (error) throw error;

    state.masterOptions = [
      ...state.masterOptions.filter((item) => item.group_key !== groupKey),
      ...(data || []).map((item) => ({ ...item, is_system: Boolean(item.is_system) }))
    ];
    return data || [];
  }

  function masterUsageKey(groupKey, itemId) {
    return `${groupKey}:${itemId}`;
  }

  async function loadMasterUsage(groupKey) {
    const { data, error } = await state.client.rpc("admin_master_item_usage_v1", {
      p_group_key: groupKey
    });
    if (error) throw error;

    [...state.masterUsage.keys()]
      .filter((key) => key.startsWith(`${groupKey}:`))
      .forEach((key) => state.masterUsage.delete(key));

    (data || []).forEach((item) => {
      state.masterUsage.set(masterUsageKey(groupKey, item.id), {
        usage_count: Number(item.usage_count || 0),
        is_system: Boolean(item.is_system)
      });
    });
  }

  function masterUsageFor(groupKey, itemId) {
    return state.masterUsage.get(masterUsageKey(groupKey, itemId)) || {
      usage_count: 0,
      is_system: false
    };
  }

  function masterRows(groupKey) {
    const config = MASTER_GROUPS[groupKey];
    if (!config) return [];
    if (config.source === "modules") {
      return state.modules.map((item) => ({
        id: item.id,
        option_value: item.code,
        display_name: item.name,
        sort_order: Number(item.sort_order),
        is_active: item.is_active,
        is_system: Boolean(item.is_system),
        source: "modules"
      }));
    }
    if (config.source === "features") {
      return state.features.map((item) => ({
        id: item.id,
        option_value: item.code,
        display_name: item.name,
        sort_order: Number(item.sort_order),
        is_active: item.is_active,
        is_system: Boolean(item.is_system),
        source: "features"
      }));
    }
    return state.masterOptions
      .filter((item) => item.group_key === groupKey)
      .map((item) => ({
        ...item,
        sort_order: Number(item.sort_order),
        is_system: Boolean(item.is_system),
        source: "master_options"
      }));
  }

  function nextMasterSortOrder(groupKey) {
    const used = new Set(masterRows(groupKey).map((item) => Number(item.sort_order)));
    let candidate = 10;
    while (used.has(candidate) && candidate < 9999) candidate += 10;
    if (candidate <= 9999 && !used.has(candidate)) return candidate;

    candidate = 1;
    while (used.has(candidate) && candidate < 9999) candidate += 1;
    return Math.min(candidate, 9999);
  }

  function masterSortOrderAvailable(groupKey, sortOrder, excludedId = null) {
    return !masterRows(groupKey).some((item) =>
      item.id !== excludedId && Number(item.sort_order) === Number(sortOrder)
    );
  }
function masterListHtml(groupKey) {
    const rows = masterRows(groupKey).sort((a, b) =>
      Number(a.sort_order || 0) - Number(b.sort_order || 0)
      || String(a.display_name).localeCompare(String(b.display_name), "th")
    );
    if (!rows.length) return '<div class="empty-state compact"><strong>ยังไม่มีรายการ</strong></div>';
    return `
      <div class="master-compact-list" role="table" aria-label="รายการ ${h(MASTER_GROUPS[groupKey]?.label || "ข้อมูลตัวเลือกกลาง")}">
        <div class="master-compact-header" role="row">
          <span role="columnheader">รายการ</span>
          <span role="columnheader">รหัส</span>
          <span role="columnheader">สถานะ</span>
          <span role="columnheader">ลำดับ</span>
          <span role="columnheader" class="text-right">จัดการ</span>
        </div>
        ${rows.map((item) => {
          const usage = masterUsageFor(groupKey, item.id);
          const isSystem = Boolean(item.is_system || usage.is_system);
          const usageCount = Number(usage.usage_count || 0);
          const deleteControl = isSystem
            ? `<span class="master-global-indicator" title="ข้อมูลส่วนกลาง ไม่สามารถลบได้"
                     aria-label="ข้อมูลส่วนกลาง ไม่สามารถลบได้">${icon("globe")}</span>`
            : usageCount === 0
              ? `<button type="button" class="btn btn-danger btn-small"
                         data-action="delete-master-option" data-id="${h(item.id)}"
                         data-group="${h(groupKey)}">${icon("delete")} ลบ</button>`
              : `<span class="master-usage-indicator" title="มีข้อมูลอ้างอิง ${usageCount.toLocaleString("th-TH")} รายการ">
                   ใช้งานแล้ว ${usageCount.toLocaleString("th-TH")}
                 </span>`;
          return `
            <div class="master-compact-row" role="row">
              <strong class="master-compact-name" role="cell">${h(item.display_name)}</strong>
              <code class="master-compact-code" role="cell">${h(item.option_value)}</code>
              <span role="cell">
                <span class="status-badge" data-status="${item.is_active ? "active" : "inactive"}">
                  ${item.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                </span>
              </span>
              <span role="cell"><span class="tag">ลำดับ ${Number(item.sort_order || 0)}</span></span>
              <span role="cell" class="master-compact-action">
                <button type="button" class="btn btn-secondary btn-small"
                        data-action="edit-master-option" data-id="${h(item.id)}"
                        data-group="${h(groupKey)}">${icon("edit")} แก้ไข</button>
                ${deleteControl}
              </span>
            </div>`;
        }).join("")}
      </div>`;
  }

  function renderMasterDataList(groupKey) {
    const rows = masterRows(groupKey);
    const count = document.getElementById("master-option-count");
    const list = document.getElementById("master-option-list");
    if (count) count.textContent = `${rows.length.toLocaleString("th-TH")} รายการ`;
    if (list) list.innerHTML = masterListHtml(groupKey);
  }
  async function renderMasterDataPage(groupKey = null) {
    const selectedGroup = MASTER_GROUPS[groupKey] ? groupKey : Object.keys(MASTER_GROUPS)[0];
    await Promise.all([
      loadMasterGroupData(selectedGroup),
      loadMasterUsage(selectedGroup)
    ]);

    const config = MASTER_GROUPS[selectedGroup];
    const rows = masterRows(selectedGroup);
    const isCodeGroup = config.source === "modules" || config.source === "features";
    const codePattern = isCodeGroup ? "[A-Za-z0-9_]+" : ".+";
    const codeTitle = isCodeGroup
      ? "ใช้ตัวอักษรอังกฤษ ตัวเลข และขีดล่างเท่านั้น"
      : "ระบุรหัสค่าความยาวไม่เกิน 100 ตัวอักษร";
    const nextOrder = nextMasterSortOrder(selectedGroup);

    el.mainContent.innerHTML = `
      ${pageHeader(
        "ข้อมูลตัวเลือกกลาง",
        "จัดการรายการที่ใช้เป็นตัวเลือกในฟอร์มของระบบ",
        "",
        [{ label: "ข้อมูลตัวเลือกกลาง" }]
      )}
      <section class="panel master-toolbar-panel">
        <div class="panel-body">
          <label class="master-group-select">
            <span class="field-label">หมวดข้อมูล</span>
            <select id="master-group-select">
              ${Object.entries(MASTER_GROUPS).map(([key, item]) => `
                <option value="${h(key)}" ${selectedGroup === key ? "selected" : ""}>${h(item.label)}</option>
              `).join("")}
            </select>
          </label>
        </div>
      </section>
      <div class="settings-two-column">
        <form id="master-option-form" class="panel" data-group="${h(selectedGroup)}" novalidate>
          <div class="panel-header"><h2>${h(config.label)}</h2></div>
          <div class="panel-body">
            <input name="item_id" type="hidden">
            <label>
              <span class="field-label">รหัสค่า <span class="required">*</span></span>
              <input name="option_value" maxlength="100" pattern="${h(codePattern)}"
                     title="${h(codeTitle)}" autocomplete="off" required>
            </label>
            <label>
              <span class="field-label">ชื่อที่แสดง <span class="required">*</span></span>
              <input name="display_name" maxlength="200" required>
            </label>
            <label>
              <span class="field-label">ลำดับการแสดง <span class="required">*</span></span>
              <input name="sort_order" type="number" min="1" max="9999" step="1"
                     value="${nextOrder}" required>
              <small class="field-help">ต้องมากกว่า 0 และห้ามซ้ำภายในหมวดเดียวกัน</small>
            </label>
            <label class="check-label">
              <input name="is_active" type="checkbox" checked>
              <span>เปิดใช้งาน</span>
            </label>
          </div>
          <div class="panel-footer-actions">
            <button type="button" class="btn btn-secondary" data-action="reset-master-option-form">ล้างฟอร์ม</button>
            <button id="master-option-save-button" type="submit" class="btn btn-primary">${icon("save")} บันทึก</button>
          </div>
        </form>
        <section class="panel">
          <div class="panel-header">
            <h2>รายการ ${h(config.label)}</h2>
            <span id="master-option-count" class="muted">${rows.length.toLocaleString("th-TH")} รายการ</span>
          </div>
          <div id="master-option-list" class="panel-body master-list-panel-body" aria-live="polite">${masterListHtml(selectedGroup)}</div>
        </section>
      </div>`;
  }
  function resetMasterOptionForm() {
    const form = document.getElementById("master-option-form");
    if (!form) return;
    const groupKey = form.dataset.group;
    form.reset();
    form.elements.item_id.value = "";
    form.elements.sort_order.value = String(nextMasterSortOrder(groupKey));
    form.elements.is_active.checked = true;
    form.elements.option_value.disabled = false;
    form.elements.option_value.setCustomValidity("");
    form.elements.sort_order.setCustomValidity("");
  }
  function editMasterOption(id, groupKey) {
    const item = masterRows(groupKey).find((row) => row.id === id);
    const form = document.getElementById("master-option-form");
    if (!item || !form) return;
    form.elements.item_id.value = item.id;
    form.elements.option_value.value = item.option_value;
    form.elements.option_value.disabled = true;
    form.elements.display_name.value = item.display_name;
    form.elements.sort_order.value = String(item.sort_order);
    form.elements.is_active.checked = Boolean(item.is_active);
    form.elements.sort_order.setCustomValidity("");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    form.elements.display_name.focus();
  }
  async function saveMasterOption(event) {
    event.preventDefault();
    const form = event.target;
    const groupKey = form.dataset.group;
    const config = MASTER_GROUPS[groupKey];
    if (!config) return;

    const button = document.getElementById("master-option-save-button");
    const data = new FormData(form);
    const id = String(data.get("item_id") || "");
    const rawOptionValue = String(form.elements.option_value.value || "").trim();
    const optionValue = config.source === "modules" || config.source === "features"
      ? rawOptionValue.toLowerCase()
      : rawOptionValue;
    const sortOrder = Number(data.get("sort_order"));

    form.elements.sort_order.setCustomValidity("");
    if (!Number.isInteger(sortOrder) || sortOrder < 1 || sortOrder > 9999) {
      form.elements.sort_order.setCustomValidity("ลำดับการแสดงต้องเป็นจำนวนเต็มตั้งแต่ 1 ถึง 9999");
    } else if (!masterSortOrderAvailable(groupKey, sortOrder, id || null)) {
      form.elements.sort_order.setCustomValidity("ลำดับนี้ถูกใช้งานแล้วในหมวดเดียวกัน");
    }

    if (!form.reportValidity()) return;

    setButtonBusy(button, true, "กำลังบันทึก...");
    try {
      const { data: saved, error } = await state.client.rpc("admin_save_master_item_v3", {
        p_group_key: groupKey,
        p_item_id: id || null,
        p_option_value: optionValue,
        p_display_name: String(data.get("display_name") || "").trim(),
        p_sort_order: sortOrder,
        p_is_active: data.get("is_active") === "on"
      });
      if (error) throw error;

      const savedRow = Array.isArray(saved) ? saved[0] : saved;
      if (!savedRow?.id) throw new Error("ฐานข้อมูลไม่ส่งข้อมูลรายการที่บันทึกกลับมา");
      const existingRow = id ? masterRows(groupKey).find((item) => item.id === id) : null;
      const isSystem = Boolean(existingRow?.is_system);

      if (config.source === "modules") {
        const row = {
          id: savedRow.id,
          code: savedRow.option_value,
          name: savedRow.display_name,
          sort_order: Number(savedRow.sort_order),
          is_active: Boolean(savedRow.is_active),
          is_system: isSystem
        };
        state.modules = id
          ? state.modules.map((item) => item.id === id ? row : item)
          : [...state.modules, row];
      } else if (config.source === "features") {
        const row = {
          id: savedRow.id,
          code: savedRow.option_value,
          name: savedRow.display_name,
          sort_order: Number(savedRow.sort_order),
          is_active: Boolean(savedRow.is_active),
          is_system: isSystem
        };
        state.features = id
          ? state.features.map((item) => item.id === id ? row : item)
          : [...state.features, row];
      } else {
        const row = {
          id: savedRow.id,
          group_key: groupKey,
          option_value: savedRow.option_value,
          display_name: savedRow.display_name,
          sort_order: Number(savedRow.sort_order),
          is_active: Boolean(savedRow.is_active),
          is_system: isSystem,
          created_at: savedRow.created_at || null,
          updated_at: savedRow.updated_at || null
        };
        state.masterOptions = id
          ? state.masterOptions.map((item) => item.id === id ? row : item)
          : [...state.masterOptions, row];
      }

      if (!state.masterUsage.has(masterUsageKey(groupKey, savedRow.id))) {
        state.masterUsage.set(masterUsageKey(groupKey, savedRow.id), {
          usage_count: 0,
          is_system: false
        });
      }
      resetMasterOptionForm();
      renderMasterDataList(groupKey);
      showToast(id ? "แก้ไขรายการแล้ว" : "เพิ่มรายการแล้ว");
    } catch (error) {
      showError(error, "บันทึกข้อมูลตัวเลือกไม่สำเร็จ");
    } finally {
      setButtonBusy(button, false);
    }
  }

  async function deleteMasterOption(itemId, groupKey, button) {
    const item = masterRows(groupKey).find((row) => row.id === itemId);
    if (!item) throw new Error("Master item not found");

    const usage = masterUsageFor(groupKey, itemId);
    if (item.is_system || usage.is_system) {
      showToast("ข้อมูลส่วนกลางไม่สามารถลบได้", "warning");
      return;
    }
    if (Number(usage.usage_count || 0) > 0) {
      showToast("รายการนี้ถูกใช้งานแล้วและไม่สามารถลบได้", "warning");
      return;
    }

    const confirmed = await confirmAction(
      `ลบ “${item.display_name}” ออกจากฐานข้อมูลถาวรหรือไม่?`,
      "ลบข้อมูลตัวเลือกกลาง",
      "ลบถาวร"
    );
    if (!confirmed) return;

    setButtonBusy(button, true, "กำลังลบ...");
    try {
      const { error } = await state.client.rpc("admin_delete_master_item_v1", {
        p_group_key: groupKey,
        p_item_id: itemId
      });
      if (error) throw error;

      const source = MASTER_GROUPS[groupKey]?.source;
      if (source === "modules") {
        state.modules = state.modules.filter((row) => row.id !== itemId);
      } else if (source === "features") {
        state.features = state.features.filter((row) => row.id !== itemId);
      } else {
        state.masterOptions = state.masterOptions.filter((row) => row.id !== itemId);
      }
      state.masterUsage.delete(masterUsageKey(groupKey, itemId));

      const form = document.getElementById("master-option-form");
      if (form?.elements.item_id?.value === itemId) resetMasterOptionForm();
      renderMasterDataList(groupKey);
      showToast("ลบข้อมูลตัวเลือกออกจากฐานข้อมูลแล้ว");
    } catch (error) {
      try {
        await loadMasterUsage(groupKey);
        renderMasterDataList(groupKey);
      } catch (refreshError) {
        console.warn("รีเฟรชสถานะการใช้งาน Master ไม่สำเร็จ", refreshError);
      }
      showError(error, "ลบข้อมูลตัวเลือกไม่สำเร็จ");
    } finally {
      setButtonBusy(button, false);
    }
  }

  async function init() {
    applyThemePreferences({ theme_mode: "light", theme_accent: "#2f68e6" });
    bindGlobalEvents();

    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    media?.addEventListener?.("change", () => {
      if ((state.profile?.theme_mode || "light") === "system") {
        applyThemePreferences(state.profile || {});
      }
    });

    if (!isConfigured()) {
      el.configWarning.classList.remove("hidden");
      el.loginButton.disabled = true;
      return;
    }

    if (!window.supabase?.createClient) {
      el.configWarning.classList.remove("hidden");
      el.configWarning.textContent = "โหลด Supabase JavaScript Client ไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต";
      el.loginButton.disabled = true;
      return;
    }

    state.client = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );

    await loadPublicSettings();

    state.client.auth.onAuthStateChange((event, session) => {
      if (
        event === "TOKEN_REFRESHED"
        && session
        && state.session?.user?.id === session.user.id
        && state.profile
      ) {
        state.session = session;
        return;
      }
      window.setTimeout(() => handleSession(session), 0);
    });

    const { data, error } = await state.client.auth.getSession();
    if (error) {
      showError(error, "ตรวจสอบ Session ไม่สำเร็จ");
      return;
    }
    await handleSession(data.session);
  }

async function handleSession(session) {
  if (state.authHandling) return;
  state.authHandling = true;
  try {
    if (!session) {
      clearAllCustomerDraftStorage();
      state.session = null;
      state.profile = null;
      destroyDynamicComponents();
      applyThemePreferences({ theme_mode: "light", theme_accent: "#2f68e6" });
      showLogin();
      return;
    }

    const sameUser = state.session?.user?.id === session.user.id && state.profile;
    state.session = session;
    if (sameUser) {
      return;
    }

    let profileResult = await state.client
      .from("profiles")
      .select("id,display_name,email,position,role,is_active,theme_mode,theme_accent,avatar_path,created_at,updated_at")
      .eq("id", session.user.id)
      .single();

    if (
      profileResult.error &&
      /position|theme_mode|theme_accent|avatar_path|column .* does not exist/i.test(profileResult.error.message || "")
    ) {
      profileResult = await state.client
        .from("profiles")
        .select("id,display_name,email,role,is_active,theme_mode,theme_accent,avatar_path,created_at,updated_at")
        .eq("id", session.user.id)
        .single();

      if (
        profileResult.error &&
        /theme_mode|theme_accent|avatar_path|column .* does not exist/i.test(profileResult.error.message || "")
      ) {
        profileResult = await state.client
          .from("profiles")
          .select("id,display_name,email,role,is_active,created_at,updated_at")
          .eq("id", session.user.id)
          .single();
      }

      if (!profileResult.error) {
        profileResult.data.theme_mode = profileResult.data.theme_mode || "light";
        profileResult.data.theme_accent = profileResult.data.theme_accent || "#2f68e6";
        profileResult.data.avatar_path = null;
        profileResult.data.position = profileResult.data.position || null;
        showToast("ยังไม่ได้ติดตั้งการตั้งค่าระบบเวอร์ชันล่าสุด จึงใช้ค่าเริ่มต้นชั่วคราว", "warning");
      }
    }

    if (profileResult.error) throw profileResult.error;
    const profile = profileResult.data;
    if (!profile.is_active) {
      await state.client.auth.signOut();
      showLogin();
      showToast("บัญชีนี้ถูกปิดการใช้งาน", "error");
      return;
    }
    state.profile = {
      ...profile,
      theme_mode: profile.theme_mode || "light",
      theme_accent: normalizeHex(profile.theme_accent || "#2f68e6")
    };
    applyThemePreferences(state.profile);
    await loadCommonData(true);

    showApp();
    if (!location.hash || location.hash === "#/") {
      location.hash = "#/dashboard";
    } else {
      await renderRoute();
    }
  } catch (error) {
    showError(error, "โหลดข้อมูลผู้ใช้ไม่สำเร็จ");
    await state.client?.auth.signOut();
    showLogin();
  } finally {
    state.authHandling = false;
  }
}


  function showLogin() {
    el.appView.classList.add("hidden");
    el.loginView.classList.remove("hidden");
    el.loginForm.reset();
    applySystemBranding();
  }
  function showApp() {
    el.loginView.classList.add("hidden");
    el.appView.classList.remove("hidden");
    el.currentUserName.textContent = state.profile?.display_name || "-";
    el.currentUserRole.textContent = state.profile?.position || "ไม่ระบุตำแหน่ง";
    renderAvatarInto(el.currentUserAvatar, state.profile);
    applyThemePreferences(state.profile || {});
    const collapsed = window.localStorage.getItem("fi-sidebar-collapsed") === "true";
    el.appView.classList.toggle("sidebar-collapsed", collapsed && window.innerWidth > 820);
    renderNavigation();
  }
function renderNavigation() {
  const role = state.profile?.role;
  const groups = [
    {
      label: "พื้นที่ทำงาน",
      items: [
        { route: "dashboard", icon: "dashboard", label: "ภาพรวม", roles: ["admin", "manager", "user"] },
        { route: "customers", icon: "customers", label: "ข้อมูลลูกค้า", roles: ["admin", "manager", "user"] }
      ]
    },
    {
      label: "รายงาน",
      items: [
        { route: "daily-report", icon: "report", label: "รายงานประจำวันของฉัน", roles: ["admin", "user"] },
        { route: "manager-reports", icon: "team", label: "รายงานของทีม", roles: ["admin", "manager"] }
      ]
    },
    {
      label: "การดูแลระบบ",
      items: [
        { route: "admin-users", icon: "users", label: "จัดการผู้ใช้", roles: ["admin"] },
        { route: "system-settings", icon: "image", label: "ตั้งค่าภาพระบบ", roles: ["admin"] },
        { route: "master-data", icon: "database", label: "ข้อมูลตัวเลือกกลาง", roles: ["admin"] }
      ]
    },
    {
      label: "บัญชีผู้ใช้งาน",
      items: [
        { route: "profile", icon: "profile", label: "ข้อมูลส่วนตัวและรูปแบบสี", roles: ["admin", "manager", "user"] }
      ]
    }
  ];

  const active = parseRoute().name;
  el.mainNav.innerHTML = groups.map((group) => {
    const visible = group.items.filter((item) => item.roles.includes(role));
    if (!visible.length) return "";
    return `
      <div class="nav-group">
        <span class="nav-group-label">${h(group.label)}</span>
        ${visible.map((item) => `
          <a class="nav-link ${active === item.route ? "active" : ""}" href="#/${item.route}"
             ${active === item.route ? 'aria-current="page"' : ""}
             title="${h(item.label)}">
            <span class="nav-icon">${icon(item.icon)}</span>
            <span>${h(item.label)}</span>
          </a>
        `).join("")}
      </div>`;
  }).join("");
}

  function parseRoute() {
    const raw = location.hash.replace(/^#\/?/, "");
    const parts = raw.split("/").filter(Boolean);
    return {
      name: parts[0] || "dashboard",
      id: parts[1] || null,
      mode: parts[2] || null,
      parts
    };
  }
function routeAllowed(routeName) {
  const role = state.profile?.role;
  const rules = {
    dashboard: ["admin", "manager", "user"],
    customers: ["admin", "manager", "user"],
    customer: ["admin", "manager", "user"],
    profile: ["admin", "manager", "user"],
    "daily-report": ["admin", "user"],
    "manager-reports": ["admin", "manager"],
    "admin-users": ["admin"],
    "system-settings": ["admin"],
    "master-data": ["admin"]
  };
  return rules[routeName]?.includes(role) ?? false;
}

  async function renderRoute() {
    if (!state.profile) return;
    const token = ++state.routeRenderToken;
    const route = parseRoute();
    const pageLabels = {
      dashboard: "ภาพรวม",
      customers: route.id === "new" ? "เพิ่มลูกค้า" : "ข้อมูลลูกค้า",
      customer: route.mode === "edit" ? "แก้ไขลูกค้า" : "รายละเอียดลูกค้า",
      profile: "ข้อมูลส่วนตัวและรูปแบบสี",
      "daily-report": "รายงานประจำวัน",
      "manager-reports": "รายงานของทีม",
      "admin-users": "จัดการผู้ใช้",
      "system-settings": "ตั้งค่าภาพระบบ",
      "master-data": "ข้อมูลตัวเลือกกลาง"
    };

    if (
      state.ui.currentRouteName === "profile" &&
      route.name !== "profile" &&
      state.ui.themePreviewDirty
    ) {
      resetThemePreview();
    }

    state.ui.currentRouteName = route.name;
    destroyDynamicComponents();
    renderNavigation();
    el.sidebar.classList.remove("open");
    document.querySelector(".sidebar-backdrop")?.classList.add("hidden");

    if (!routeAllowed(route.name)) {
      location.hash = "#/dashboard";
      return;
    }

    if (el.topbarPageLabel) {
      el.topbarPageLabel.textContent = pageLabels[route.name] || "ระบบติดตามลูกค้า FI";
    }

    renderPageSkeleton(`กำลังโหลด${pageLabels[route.name] || "ข้อมูล"}`);
    setLoading(true, `กำลังโหลด${pageLabels[route.name] || "ข้อมูล"}...`);

    try {
      switch (route.name) {
        case "dashboard":
          await renderDashboard();
          break;
        case "customers":
          if (route.id === "new") await renderCustomerCreatePage();
          else await renderCustomersPage();
          break;
        case "customer":
          if (!route.id) {
            location.hash = "#/customers";
            return;
          }
          if (route.mode === "edit") await renderCustomerEditPage(route.id);
          else await renderCustomerDetail(route.id);
          break;
        case "profile":
          await renderProfilePage();
          break;
        case "daily-report":
          await renderDailyReportPage();
          break;
        case "manager-reports":
          await renderManagerReportsPage();
          break;
        case "admin-users":
          await renderAdminUsersPage();
          break;
        case "system-settings":
          await renderSystemSettingsPage();
          break;
        case "master-data":
          await renderMasterDataPage(route.id);
          break;
        default:
          location.hash = "#/dashboard";
          return;
      }

      if (token === state.routeRenderToken) {
        document.title = "ระบบติดตามลูกค้า";
        el.mainContent.focus({ preventScroll: true });
      }
    } catch (error) {
      showError(error, "โหลดหน้าไม่สำเร็จ");
      el.mainContent.innerHTML = `
        <div class="dependency-error" role="alert">
          <strong>โหลดข้อมูลไม่สำเร็จ</strong>
          <span>${h(normalizeError(error))}</span>
          <button class="btn btn-secondary btn-small" data-action="refresh-route">ลองใหม่</button>
        </div>`;
    } finally {
      setLoading(false);
    }
  }
  async function loadCommonData(force = false) {
    if (!force && state.configurationLoaded) return;

    let profilesResult = await state.client
      .from("profiles")
      .select("id,display_name,email,position,role,is_active,theme_mode,theme_accent,avatar_path,created_at,updated_at")
      .order("display_name");

    if (
      profilesResult.error
      && /position|theme_mode|theme_accent|avatar_path|column .* does not exist/i.test(profilesResult.error.message || "")
    ) {
      profilesResult = await state.client
        .from("profiles")
        .select("id,display_name,email,role,is_active,theme_mode,theme_accent,avatar_path,created_at,updated_at")
        .order("display_name");
      if (
        profilesResult.error
        && /theme_mode|theme_accent|avatar_path|column .* does not exist/i.test(profilesResult.error.message || "")
      ) {
        profilesResult = await state.client
          .from("profiles")
          .select("id,display_name,email,role,is_active,created_at,updated_at")
          .order("display_name");
      }
      if (!profilesResult.error) {
        profilesResult.data = (profilesResult.data || []).map((profile) => ({
          ...profile,
          position: null,
          theme_mode: profile.theme_mode || "light",
          theme_accent: profile.theme_accent || "#2f68e6",
          avatar_path: profile.avatar_path || null
        }));
      }
    }

    let modulesResult = await state.client
      .from("modules")
      .select("id,code,name,is_active,sort_order,is_system")
      .order("sort_order")
      .order("name");
    if (modulesResult.error && /sort_order|column .* does not exist/i.test(modulesResult.error.message || "")) {
      modulesResult = await state.client.from("modules").select("id,code,name,is_active").order("name");
    }

    let featuresResult = await state.client
      .from("features")
      .select("id,code,name,is_active,sort_order,is_system")
      .order("sort_order")
      .order("name");
    if (featuresResult.error && /sort_order|column .* does not exist/i.test(featuresResult.error.message || "")) {
      featuresResult = await state.client.from("features").select("id,code,name,is_active").order("name");
    }

    const masterResult = await state.client
      .from("master_options")
      .select("id,group_key,option_value,display_name,sort_order,is_active,is_system,created_at,updated_at")
      .order("group_key")
      .order("sort_order")
      .order("display_name");

    if (profilesResult.error) throw profilesResult.error;
    if (modulesResult.error) throw modulesResult.error;
    if (featuresResult.error) throw featuresResult.error;

    const fallbackRows = [
      ...Object.entries(LABELS.onboarding_stage).map(([option_value, display_name], index) => ({
        id: `fallback-onboarding-${option_value}`,
        group_key: "onboarding_stage",
        option_value,
        display_name,
        sort_order: (index + 1) * 10,
        is_active: true
      })),
      ...Object.entries(LABELS.import_status).map(([option_value, display_name], index) => ({
        id: `fallback-import-${option_value}`,
        group_key: "import_status",
        option_value,
        display_name,
        sort_order: (index + 1) * 10,
        is_active: true
      })),
      ...Object.entries(LABELS.engagement_level).map(([option_value, display_name], index) => ({
        id: `fallback-engagement-${option_value}`,
        group_key: "engagement_level",
        option_value,
        display_name,
        sort_order: (index + 1) * 10,
        is_active: true
      })),
      ...Object.entries(LABELS.contract_type).map(([option_value, display_name], index) => ({
        id: `fallback-contract-${option_value}`,
        group_key: "contract_type",
        option_value,
        display_name,
        sort_order: (index + 1) * 10,
        is_active: true
      }))
    ];

    const preparedProfiles = (profilesResult.data || []).map((profile) => ({
      ...profile,
      position: profile.position || null,
      theme_mode: profile.theme_mode || "light",
      theme_accent: normalizeHex(profile.theme_accent || "#2f68e6"),
      avatar_path: profile.avatar_path || null
    }));
    state.profiles = await hydrateProfileAvatarUrls(preparedProfiles);
    if (state.profile?.id) {
      const currentProfile = state.profiles.find((profile) => profile.id === state.profile.id);
      if (currentProfile) state.profile = { ...state.profile, ...currentProfile };
    }

    state.modules = (modulesResult.data || []).map((item, index) => ({
      ...item,
      sort_order: Number(item.sort_order || index + 1),
      is_system: Boolean(item.is_system)
    }));
    state.features = (featuresResult.data || []).map((item, index) => ({
      ...item,
      sort_order: Number(item.sort_order || index + 1),
      is_system: Boolean(item.is_system)
    }));
    state.masterOptions = masterResult.error
      ? fallbackRows.map((item) => ({ ...item, is_system: true }))
      : (masterResult.data || []).map((item) => ({ ...item, is_system: Boolean(item.is_system) }));
    state.configurationLoaded = true;
  }

async function loadCustomers(force = false) {
  if (!force && state.customers.length) return;

  const customers = await fetchAllPaged(() =>
    state.client
      .from("customers")
      .select("id,legacy_customer_id,legal_name,short_name,tax_id,fleet_size,customer_user_count,monthly_service_fee,account_status,onboarding_stage,import_status,engagement_level,sales_code,start_date,billing_date,contract_type,onsite_training_count,is_archived,archived_at,archived_by,created_at,created_by,updated_at,updated_by")
      .eq("is_archived", false)
      .order("updated_at", { ascending: false })
      .order("id", { ascending: true })
  );

  state.customers = customers;
  const customerIds = customers.map((customer) => customer.id);
  if (!customerIds.length) {
    state.customerOwners = [];
    state.customerModules = [];
    state.customerFeatures = [];
    state.customerAccounts = [];
    return;
  }

  const [owners, modules, features, accounts] = await Promise.all([
    fetchCustomerRelationRows("customer_owners", "customer_id,profile_id,is_primary", customerIds, ["customer_id", "profile_id"]),
    fetchCustomerRelationRows("customer_modules", "customer_id,module_id", customerIds, ["customer_id", "module_id"]),
    fetchCustomerRelationRows("customer_features", "customer_id,feature_id", customerIds, ["customer_id", "feature_id"]),
    fetchCustomerRelationRows("customer_user_accounts", "id,customer_id", customerIds, ["customer_id", "id"])
  ]);

  state.customerOwners = owners;
  state.customerModules = modules;
  state.customerFeatures = features;
  state.customerAccounts = accounts;
}


  function profileName(id) {
    return profileById(id)?.display_name || "-";
  }

  function ownerNames(customerId) {
    return state.customerOwners
      .filter((owner) => owner.customer_id === customerId)
      .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
      .map((owner) => `${profileName(owner.profile_id)}${owner.is_primary ? " ★" : ""}`);
  }

async function renderDashboard() {
  await Promise.all([loadCommonData(), loadCustomers(true)]);
  const customers = state.customers.filter((customer) =>
    !customer.is_archived && customer.account_status === "active"
  );
  const goLive = customers.filter((customer) => customer.onboarding_stage === "go_live").length;
  const importPending = customers.filter((customer) => customer.import_status !== "done").length;
  const updatedAt = formatDateTime(new Date().toISOString());
  const today = bangkokDate();

  let ownReport = null;
  if (canWriteOwnDailyReport()) {
    const ownResult = await state.client
      .from("daily_reports")
      .select("id,status,work_date,user_id,updated_at,last_revision_reason")
      .eq("user_id", state.profile.id)
      .eq("work_date", today)
      .order("updated_at", { ascending: false })
      .maybeSingle();
    if (ownResult.error) throw ownResult.error;
    ownReport = ownResult.data || null;
  }

  let teamReports = [];
  if (["admin", "manager"].includes(state.profile.role)) {
    const teamResult = await state.client
      .from("daily_reports")
      .select("id,status,work_date,user_id,updated_at,last_revision_reason")
      .eq("work_date", today)
      .in("status", ["submitted", "acknowledged", "revision_required"])
      .order("updated_at", { ascending: false })
      .limit(1000);
    if (teamResult.error) throw teamResult.error;
    teamReports = teamResult.data || [];
  }

  const onboardingOrder = masterOptions("onboarding_stage", { includeInactive: true }).map((item) => item.option_value);
  const onboarding = onboardingOrder.map((key) => ({
    key,
    label: label("onboarding_stage", key),
    count: customers.filter((customer) => customer.onboarding_stage === key).length
  }));
  const noStage = customers.filter((customer) => !customer.onboarding_stage).length;
  if (noStage) onboarding.unshift({ key: "unknown", label: "ไม่ระบุ", count: noStage });

  const importStatus = masterOptions("import_status", { includeInactive: true }).map((item) => item.option_value).map((key) => ({
    key,
    label: label("import_status", key),
    count: customers.filter((customer) => customer.import_status === key).length
  }));

  state.dashboardChartData = { onboarding, importStatus };

  const ownReportPanel = canWriteOwnDailyReport() ? `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>รายงานประจำวันของฉัน</h2>
          <p class="muted">บันทึกงานวันนี้และแผนงานวันพรุ่งนี้</p>
        </div>
        ${ownReport ? `<span class="status-badge" data-status="${h(ownReport.status)}">${h(label("report_status", ownReport.status))}</span>` : ""}
      </div>
      <div class="panel-body">
        ${ownReport ? `
          ${ownReport.last_revision_reason && ownReport.status === "revision_required"
            ? `<div class="alert alert-danger"><strong>รายงานถูกส่งกลับ:</strong>&nbsp;${h(ownReport.last_revision_reason)}</div>`
            : ""}
          <div class="toolbar-summary">
            <span>อัปเดตล่าสุด ${h(formatDateTime(ownReport.updated_at))}</span>
            <a class="btn btn-primary" href="#/daily-report">เปิดรายงาน</a>
          </div>
        ` : `
          <div class="empty-state">
            <strong>ยังไม่มีรายงานสำหรับวันนี้</strong>
            <span>ผู้ดูแลระบบและผู้ใช้งานสามารถเขียนรายงานได้ และ Draft จะเห็นเฉพาะเจ้าของ</span>
            <a class="btn btn-primary" href="#/daily-report">${icon("plus")} เริ่มเขียนรายงาน</a>
          </div>
        `}
      </div>
    </section>` : "";

  const teamPanel = ["admin", "manager"].includes(state.profile.role) ? (() => {
    const pending = teamReports.filter((report) => report.status === "submitted").length;
    const acknowledged = teamReports.filter((report) => report.status === "acknowledged").length;
    const revision = teamReports.filter((report) => report.status === "revision_required").length;
    return `
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>รายงานของทีมวันนี้</h2>
            <p class="muted">แสดงเฉพาะรายงานที่ถูกส่งแล้ว Draft ของผู้อื่นจะไม่ถูกโหลด</p>
          </div>
          <a class="btn btn-secondary btn-small" href="#/manager-reports">ดูทั้งหมด</a>
        </div>
        <div class="panel-body">
          <div class="cards-grid cards-grid-3">
            <div class="card stat-card">
              <div class="stat-card-header">
                <span class="stat-label">รอรับทราบ</span>
                <span class="stat-icon">${icon("clock")}</span>
              </div>
              <span class="stat-value">${pending}</span>
              <span class="stat-meta">รายงานที่ส่งแล้ว</span>
            </div>
            <div class="card stat-card">
              <div class="stat-card-header">
                <span class="stat-label">รับทราบแล้ว</span>
                <span class="stat-icon">${icon("check")}</span>
              </div>
              <span class="stat-value">${acknowledged}</span>
              <span class="stat-meta">รายงานที่ล็อกเรียบร้อย</span>
            </div>
            <div class="card stat-card">
              <div class="stat-card-header">
                <span class="stat-label">ส่งกลับแก้ไข</span>
                <span class="stat-icon">${icon("refresh")}</span>
              </div>
              <span class="stat-value">${revision}</span>
              <span class="stat-meta">รอเจ้าของแก้ไขและส่งใหม่</span>
            </div>
          </div>
        </div>
      </section>`;
  })() : "";

  el.mainContent.innerHTML = `
    ${pageHeader("ภาพรวม", `ข้อมูลล่าสุด ณ ${updatedAt}`)}
    <section class="cards-grid cards-grid-3" style="margin-bottom:20px">
      <div class="card stat-card">
        <div class="stat-card-header">
          <span class="stat-label">ลูกค้าที่ใช้งาน</span>
          <span class="stat-icon">${icon("building")}</span>
        </div>
        <span class="stat-value">${customers.length}</span>
        <span class="stat-meta">ไม่รวมลูกค้าสถานะไม่ใช้งานและ Soft Delete</span>
      </div>
      <div class="card stat-card">
        <div class="stat-card-header">
          <span class="stat-label">เริ่มใช้งานจริง</span>
          <span class="stat-icon">${icon("rocket")}</span>
        </div>
        <span class="stat-value">${goLive}</span>
        <span class="stat-meta">ลูกค้าที่ใช้งานและอยู่ขั้น Go Live</span>
      </div>
      <div class="card stat-card">
        <div class="stat-card-header">
          <span class="stat-label">นำเข้าข้อมูลยังไม่เสร็จ</span>
          <span class="stat-icon">${icon("import")}</span>
        </div>
        <span class="stat-value">${importPending}</span>
        <span class="stat-meta">เฉพาะลูกค้าที่ใช้งาน</span>
      </div>
    </section>

    <section class="chart-grid chart-grid-2" aria-label="กราฟสรุป">
      <article class="panel chart-panel">
        <div class="panel-header">
          <div><h2>สถานะการเริ่มใช้งาน</h2><p class="muted">เฉพาะลูกค้าที่ใช้งาน</p></div>
        </div>
        <div id="onboarding-chart" class="chart-container">
          <div class="chart-loading"><span class="spinner"></span><span>กำลังสร้างกราฟ...</span></div>
        </div>
      </article>
      <article class="panel chart-panel">
        <div class="panel-header">
          <div><h2>สถานะการนำเข้าข้อมูล</h2><p class="muted">เฉพาะลูกค้าที่ใช้งาน</p></div>
        </div>
        <div id="import-chart" class="chart-container">
          <div class="chart-loading"><span class="spinner"></span><span>กำลังสร้างกราฟ...</span></div>
        </div>
      </article>
    </section>

    <div class="dashboard-report-panels">
      ${ownReportPanel}
      ${teamPanel}
    </div>`;

  window.requestAnimationFrame(() => renderDashboardCharts(state.dashboardChartData));
}
  function customerAccountCounts() {
    return state.customers.reduce((counts, customer) => {
      if (customer.account_status === "inactive") counts.inactive += 1;
      else counts.active += 1;
      return counts;
    }, { active: 0, inactive: 0 });
  }

  function renderCustomerAccountTabs() {
    const counts = customerAccountCounts();
    const current = state.ui.customerFilters.accountTab === "inactive" ? "inactive" : "active";
    document.querySelectorAll("[data-customer-account-tab]").forEach((button) => {
      const status = button.dataset.customerAccountTab;
      const active = status === current;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
      const count = status === "inactive" ? counts.inactive : counts.active;
      const countNode = button.querySelector("[data-tab-count]");
      if (countNode) countNode.textContent = count.toLocaleString("th-TH");
    });
  }

  async function renderCustomersPage() {
    try { state.grids.customers?.destroy?.(); } catch (error) { console.warn(error); }
    state.grids.customers = null;
    await Promise.all([loadCommonData(), loadCustomers(true)]);
    const filters = state.ui.customerFilters;
    if (!["active", "inactive"].includes(filters.accountTab)) filters.accountTab = "active";
    const counts = customerAccountCounts();

    el.mainContent.innerHTML = `
      ${pageHeader(
        "ข้อมูลลูกค้า",
        "ค้นหา กรอง และจัดการข้อมูลลูกค้า",
        `<a class="btn btn-primary" href="#/customers/new">${icon("plus")} เพิ่มลูกค้า</a>`,
        [{ label: "ข้อมูลลูกค้า" }]
      )}
      <section class="panel">
        <div class="customer-account-tabs" role="tablist" aria-label="กรองตามสถานะบัญชี">
          <button type="button" role="tab" class="customer-account-tab ${filters.accountTab === "active" ? "active" : ""}"
                  aria-selected="${filters.accountTab === "active"}"
                  data-action="set-customer-account-tab" data-customer-account-tab="active">
            ใช้งาน <span class="customer-account-tab-count" data-tab-count>${counts.active.toLocaleString("th-TH")}</span>
          </button>
          <button type="button" role="tab" class="customer-account-tab ${filters.accountTab === "inactive" ? "active" : ""}"
                  aria-selected="${filters.accountTab === "inactive"}"
                  data-action="set-customer-account-tab" data-customer-account-tab="inactive">
            ไม่ใช้งาน <span class="customer-account-tab-count" data-tab-count>${counts.inactive.toLocaleString("th-TH")}</span>
          </button>
        </div>
        <div class="toolbar">
          <div class="toolbar-row">
            <div class="toolbar-field toolbar-search">
              <label for="customer-search">ค้นหา</label>
              <input id="customer-search" type="search"
                     placeholder="ชื่อบริษัท ชื่อย่อ เลขประจำตัวผู้เสียภาษี ผู้รับผิดชอบ หรือเซลล์"
                     autocomplete="off" value="${h(filters.search)}">
            </div>
            <div class="toolbar-field">
              <label for="customer-owner-filter">ผู้รับผิดชอบ</label>
              <select id="customer-owner-filter">
                <option value="">ทั้งหมด</option>
                <option value="unassigned" ${filters.owner === "unassigned" ? "selected" : ""}>ยังไม่มีผู้รับผิดชอบ</option>
                ${state.profiles.filter((profile) => profile.is_active).map((profile) => `
                  <option value="${h(profile.id)}" ${filters.owner === profile.id ? "selected" : ""}>
                    ${h(profile.display_name)}
                  </option>
                `).join("")}
              </select>
            </div>
            <div class="toolbar-actions customer-toolbar-actions">
              <button class="btn btn-secondary" data-action="reset-customer-filters">
                ${icon("refresh")} ล้างตัวกรอง
              </button>
              <button class="btn btn-secondary" data-action="export-customers-excel"
                      title="ส่งออกข้อมูลตาม Tab ตัวกรอง การเรียง และคอลัมน์ที่แสดง">
                ${icon("download")} Excel
              </button>
              ${state.profile?.role === "admin" ? `
                <span class="toolbar-action-separator" aria-hidden="true"></span>
                <button class="btn btn-secondary" data-action="open-customer-list-settings">
                  ${icon("settings")} ตั้งค่าตาราง
                </button>
                <button class="btn btn-secondary" data-action="download-customer-update-template"
                        title="ดาวน์โหลด Template สำหรับแก้ไขข้อมูลเดิมและนำกลับเข้าระบบ">
                  ${icon("download")} ดาวน์โหลดไฟล์สำหรับอัปเดต
                </button>
                <button class="btn btn-secondary" data-action="import-customers-excel">
                  ${icon("import")} อัปเดตจาก Excel
                </button>` : ""}
            </div>
          </div>

          <details id="customer-advanced-filters" class="advanced-filters" ${filters.advancedOpen ? "open" : ""}>
            <summary>ตัวกรองเพิ่มเติม</summary>
            <div class="advanced-filter-grid">
              <label>
                ขั้นตอนเริ่มใช้งาน
                <select id="customer-onboarding-filter">
                  <option value="">ทั้งหมด</option>
                  <option value="none" ${filters.onboarding === "none" ? "selected" : ""}>ไม่ระบุ</option>
                  ${masterOptions("onboarding_stage").map((item) => `
                    <option value="${h(item.option_value)}" ${filters.onboarding === item.option_value ? "selected" : ""}>
                      ${h(item.display_name)}
                    </option>
                  `).join("")}
                </select>
              </label>
              <label>
                สถานะการนำเข้าข้อมูล
                <select id="customer-import-filter">
                  <option value="">ทั้งหมด</option>
                  ${masterOptions("import_status").map((item) => `
                    <option value="${h(item.option_value)}" ${filters.importStatus === item.option_value ? "selected" : ""}>
                      ${h(item.display_name)}
                    </option>
                  `).join("")}
                </select>
              </label>
              <label>
                ระดับความสนใจ
                <select id="customer-engagement-filter">
                  <option value="">ทั้งหมด</option>
                  <option value="none" ${filters.engagement === "none" ? "selected" : ""}>ไม่ระบุ</option>
                  ${masterOptions("engagement_level").map((item) => `
                    <option value="${h(item.option_value)}" ${filters.engagement === item.option_value ? "selected" : ""}>
                      ${h(item.display_name)}
                    </option>
                  `).join("")}
                </select>
              </label>
              <label>
                ประเภทสัญญา
                <select id="customer-contract-filter">
                  <option value="">ทั้งหมด</option>
                  ${masterOptions("contract_type").map((item) => `
                    <option value="${h(item.option_value)}" ${filters.contractType === item.option_value ? "selected" : ""}>
                      ${h(item.display_name)}
                    </option>
                  `).join("")}
                </select>
              </label>
              <label>
                เซลล์
                <select id="customer-sales-filter">
                  <option value="">ทั้งหมด</option>
                  <option value="none" ${filters.salesCode === "none" ? "selected" : ""}>ไม่ระบุ</option>
                  ${masterOptions("sales").map((item) => `
                    <option value="${h(item.option_value)}" ${filters.salesCode === item.option_value ? "selected" : ""}>
                      ${h(item.display_name)}
                    </option>
                  `).join("")}
                </select>
              </label>
              <label>
                โมดูล
                <select id="customer-module-filter">
                  <option value="">ทั้งหมด</option>
                  ${state.modules.filter((item) => item.is_active).map((item) => `
                    <option value="${h(item.id)}" ${filters.moduleId === item.id ? "selected" : ""}>${h(item.name)}</option>
                  `).join("")}
                </select>
              </label>
              <label>
                ฟังก์ชัน
                <select id="customer-feature-filter">
                  <option value="">ทั้งหมด</option>
                  ${state.features.filter((item) => item.is_active).map((item) => `
                    <option value="${h(item.id)}" ${filters.featureId === item.id ? "selected" : ""}>${h(item.name)}</option>
                  `).join("")}
                </select>
              </label>
              <label>
                จำนวนรถขั้นต่ำ
                <input id="customer-fleet-min" type="number" min="0" step="1" value="${h(filters.fleetMin)}">
              </label>
              <label>
                จำนวนรถสูงสุด
                <input id="customer-fleet-max" type="number" min="0" step="1" value="${h(filters.fleetMax)}">
              </label>
              <div class="date-range-filter-field">
                <span class="field-label">วันที่เริ่มใช้งานจริง</span>
                <button type="button" class="date-range-trigger" data-action="open-date-range-filter" data-kind="start">
                  ${icon("calendar")}
                  <span data-date-range-label="start">${h(dateRangeButtonText("start"))}</span>
                </button>
              </div>
              <div class="date-range-filter-field">
                <span class="field-label">วันที่เริ่มวางบิล</span>
                <button type="button" class="date-range-trigger" data-action="open-date-range-filter" data-kind="billing">
                  ${icon("calendar")}
                  <span data-date-range-label="billing">${h(dateRangeButtonText("billing"))}</span>
                </button>
              </div>
            </div>
          </details>
        </div>
        <div class="grid-status-row">
          <span id="customer-grid-count" class="muted">กำลังเตรียมข้อมูล...</span>
          <span class="muted">คอลัมน์และการเรียงเริ่มต้นเป็นค่ากลางจากผู้ดูแลระบบ ผู้ใช้ยังปรับตารางชั่วคราวได้</span>
        </div>
        <div id="customer-grid" class="ag-grid-shell" aria-label="รายชื่อลูกค้า">
          <div class="chart-loading"><span class="spinner"></span><span>กำลังสร้างตาราง...</span></div>
        </div>
      </section>`;

    renderCustomerTable();
    renderDateRangeButtons();
  }

function customerListColumnDefinitions(mobile) {
  return {
    legal_name: {
      colId: "legal_name",
      headerName: "ชื่อนิติบุคคล",
      field: "legal_name",
      minWidth: 260,
      flex: 1.6,
      cellRenderer: (params) => {
        const wrapper = document.createElement("div");
        wrapper.className = "grid-primary-cell";
        const title = document.createElement("strong");
        title.textContent = params.value || "-";
        wrapper.append(title);
        if (params.data.short_name) {
          const secondary = document.createElement("span");
          secondary.className = "grid-secondary";
          secondary.textContent = params.data.short_name;
          wrapper.append(secondary);
        }
        return wrapper;
      }
    },
    short_name: {
      colId: "short_name",
      headerName: "ชื่อย่อ",
      field: "short_name",
      minWidth: 170,
      valueFormatter: (params) => params.value || "-"
    },
    tax_id: {
      colId: "tax_id",
      headerName: "เลขประจำตัวผู้เสียภาษี",
      field: "tax_id",
      minWidth: 185,
      filter: "agTextColumnFilter"
    },
    fleet_size: {
      colId: "fleet_size",
      headerName: "จำนวนรถ",
      field: "fleet_size",
      minWidth: 110,
      maxWidth: 125,
      type: "numericColumn",
      filter: "agNumberColumnFilter",
      valueFormatter: (params) => Number(params.value || 0).toLocaleString("th-TH")
    },
    owner_text: {
      colId: "owner_text",
      headerName: "ผู้รับผิดชอบ",
      field: "owner_text",
      minWidth: 200,
      flex: 1
    },
    module_text: {
      colId: "module_text",
      headerName: "โมดูล",
      field: "module_text",
      minWidth: 190,
      flex: 1
    },
    feature_text: {
      colId: "feature_text",
      headerName: "ฟังก์ชัน",
      field: "feature_text",
      minWidth: 190,
      flex: 1
    },
    contract_text: {
      colId: "contract_text",
      headerName: "สัญญา",
      field: "contract_text",
      minWidth: 125
    },
    sales_text: {
      colId: "sales_text",
      headerName: "เซลล์",
      field: "sales_text",
      minWidth: 150
    },
    monthly_service_fee: {
      colId: "monthly_service_fee",
      headerName: "ค่าบริการต่อเดือน",
      field: "monthly_service_fee",
      minWidth: 165,
      type: "numericColumn",
      filter: "agNumberColumnFilter",
      valueFormatter: (params) => formatMoney(params.value)
    },
    customer_user_count: {
      colId: "customer_user_count",
      headerName: "จำนวนผู้ใช้งานลูกค้า",
      field: "customer_user_count",
      minWidth: 175,
      maxWidth: 195,
      type: "numericColumn",
      filter: "agNumberColumnFilter",
      valueFormatter: (params) => `${Number(params.value || 1).toLocaleString("th-TH")} คน`
    },
    saved_account_count: {
      colId: "saved_account_count",
      headerName: "จำนวนบัญชีที่บันทึก",
      field: "saved_account_count",
      minWidth: 170,
      maxWidth: 190,
      type: "numericColumn",
      filter: "agNumberColumnFilter",
      valueFormatter: (params) => `${Number(params.value || 0).toLocaleString("th-TH")} บัญชี`
    },
    onsite_training_count: {
      colId: "onsite_training_count",
      headerName: "สอนใช้งานนอกสถานที่ (ครั้ง)",
      field: "onsite_training_count",
      minWidth: 205,
      maxWidth: 225,
      type: "numericColumn",
      filter: "agNumberColumnFilter",
      valueFormatter: (params) => Number(params.value || 0).toLocaleString("th-TH")
    },
    account_status_text: {
      colId: "account_status_text",
      headerName: "สถานะบัญชี",
      field: "account_status_text",
      minWidth: 140,
      cellRenderer: (params) => statusBadgeNode(params.value, params.data.account_status)
    },
    onboarding_text: {
      colId: "onboarding_text",
      headerName: "ขั้นตอนเริ่มใช้งาน",
      field: "onboarding_text",
      minWidth: 175
    },
    import_text: {
      colId: "import_text",
      headerName: "สถานะการนำเข้าข้อมูล",
      field: "import_text",
      minWidth: 180,
      cellRenderer: (params) => statusBadgeNode(params.value, params.data.import_status)
    },
    engagement_text: {
      colId: "engagement_text",
      headerName: "ระดับความสนใจ",
      field: "engagement_text",
      minWidth: 150
    },
    start_date: {
      colId: "start_date",
      headerName: "วันที่เริ่มใช้งานจริง",
      field: "start_date",
      minWidth: 170,
      valueFormatter: (params) => formatDate(params.value)
    },
    billing_date: {
      colId: "billing_date",
      headerName: "วันที่เริ่มวางบิล",
      field: "billing_date",
      minWidth: 165,
      valueFormatter: (params) => formatDate(params.value)
    },
    updated_at: {
      colId: "updated_at",
      headerName: "อัปเดตล่าสุด",
      field: "updated_at",
      minWidth: 175,
      valueFormatter: (params) => formatDateTime(params.value)
    },
    updated_by_name: {
      colId: "updated_by_name",
      headerName: "แก้ไขล่าสุดโดย",
      field: "updated_by_name",
      minWidth: 180
    }
  };
}

function customerListActionsColumn() {
  return {
    headerName: "การกระทำ",
    colId: "actions",
    pinned: "right",
    width: 142,
    minWidth: 142,
    maxWidth: 142,
    sortable: false,
    filter: false,
    resizable: false,
    suppressHeaderMenuButton: true,
    cellRenderer: (params) => {
      const wrapper = document.createElement("div");
      wrapper.className = "grid-actions grid-actions-compact";
      wrapper.append(
        iconActionLinkNode({
          label: "ดูรายละเอียดลูกค้า",
          href: `#/customer/${params.data.id}`,
          iconName: "eye"
        }),
        iconActionLinkNode({
          label: "แก้ไขข้อมูลลูกค้า",
          href: `#/customer/${params.data.id}/edit`,
          iconName: "edit"
        }),
        iconActionButtonNode({
          label: "ลบลูกค้า",
          action: "delete-customer",
          id: params.data.id,
          iconName: "delete",
          variant: "danger"
        })
      );
      return wrapper;
    }
  };
}

function renderCustomerTable() {
  const container = document.getElementById("customer-grid");
  if (!container) return;

  const filters = state.ui.customerFilters;
  filters.accountTab = filters.accountTab === "inactive" ? "inactive" : "active";
  filters.search = document.getElementById("customer-search")?.value.trim() || filters.search || "";
  filters.owner = document.getElementById("customer-owner-filter")?.value || "";
  filters.onboarding = document.getElementById("customer-onboarding-filter")?.value || "";
  filters.importStatus = document.getElementById("customer-import-filter")?.value || "";
  filters.engagement = document.getElementById("customer-engagement-filter")?.value || "";
  filters.contractType = document.getElementById("customer-contract-filter")?.value || "";
  filters.salesCode = document.getElementById("customer-sales-filter")?.value || "";
  filters.moduleId = document.getElementById("customer-module-filter")?.value || "";
  filters.featureId = document.getElementById("customer-feature-filter")?.value || "";
  filters.fleetMin = document.getElementById("customer-fleet-min")?.value || "";
  filters.fleetMax = document.getElementById("customer-fleet-max")?.value || "";
  filters.advancedOpen = Boolean(document.getElementById("customer-advanced-filters")?.open);

  const query = filters.search.toLowerCase();
  const minimumFleet = filters.fleetMin === "" ? null : Number(filters.fleetMin);
  const maximumFleet = filters.fleetMax === "" ? null : Number(filters.fleetMax);

  const rows = state.customers
    .filter((customer) => {
      const owners = state.customerOwners.filter((item) => item.customer_id === customer.id);
      const moduleIds = state.customerModules
        .filter((item) => item.customer_id === customer.id)
        .map((item) => item.module_id);
      const featureIds = state.customerFeatures
        .filter((item) => item.customer_id === customer.id)
        .map((item) => item.feature_id);
      const ownerText = owners.map((item) => profileName(item.profile_id)).join(" ");
      const salesText = label("sales", customer.sales_code);
      const haystack = `${customer.legal_name} ${customer.short_name || ""} ${customer.tax_id} ${ownerText} ${salesText}`.toLowerCase();
      const ownerMatch = !filters.owner
        || (filters.owner === "unassigned" && owners.length === 0)
        || owners.some((item) => item.profile_id === filters.owner);
      const onboardingMatch = !filters.onboarding
        || (filters.onboarding === "none"
          ? !customer.onboarding_stage
          : customer.onboarding_stage === filters.onboarding);
      const engagementMatch = !filters.engagement
        || (filters.engagement === "none"
          ? !customer.engagement_level
          : customer.engagement_level === filters.engagement);
      const salesMatch = !filters.salesCode
        || (filters.salesCode === "none"
          ? !customer.sales_code
          : customer.sales_code === filters.salesCode);
      const fleet = Number(customer.fleet_size || 0);

      return (
        customer.account_status === filters.accountTab
        && (!query || haystack.includes(query))
        && ownerMatch
        && onboardingMatch
        && (!filters.importStatus || customer.import_status === filters.importStatus)
        && engagementMatch
        && (!filters.contractType || customer.contract_type === filters.contractType)
        && salesMatch
        && (!filters.moduleId || moduleIds.includes(filters.moduleId))
        && (!filters.featureId || featureIds.includes(filters.featureId))
        && (minimumFleet === null || fleet >= minimumFleet)
        && (maximumFleet === null || fleet <= maximumFleet)
        && (!filters.startFrom || (customer.start_date && customer.start_date >= filters.startFrom))
        && (!filters.startTo || (customer.start_date && customer.start_date <= filters.startTo))
        && (!filters.billingFrom || (customer.billing_date && customer.billing_date >= filters.billingFrom))
        && (!filters.billingTo || (customer.billing_date && customer.billing_date <= filters.billingTo))
      );
    })
    .map((customer) => {
      const moduleNames = state.customerModules
        .filter((item) => item.customer_id === customer.id)
        .map((item) => state.modules.find((module) => module.id === item.module_id)?.name)
        .filter(Boolean);
      const featureNames = state.customerFeatures
        .filter((item) => item.customer_id === customer.id)
        .map((item) => state.features.find((feature) => feature.id === item.feature_id)?.name)
        .filter(Boolean);
      return {
        ...customer,
        owner_text: ownerNames(customer.id).join(", ") || "-",
        sales_text: label("sales", customer.sales_code),
        customer_user_count: Number(customer.customer_user_count || 1),
        saved_account_count: state.customerAccounts.filter((item) => item.customer_id === customer.id).length,
        monthly_service_fee: customer.monthly_service_fee === null || customer.monthly_service_fee === undefined
          ? null
          : Number(customer.monthly_service_fee),
        module_text: moduleNames.join(", ") || "-",
        feature_text: featureNames.join(", ") || "-",
        account_status_text: label("account_status", customer.account_status),
        onboarding_text: label("onboarding_stage", customer.onboarding_stage),
        import_text: label("import_status", customer.import_status),
        engagement_text: label("engagement_level", customer.engagement_level),
        contract_text: label("contract_type", customer.contract_type),
        updated_by_name: profileName(customer.updated_by)
      };
    });

  state.filteredCustomerRows = rows;
  renderCustomerAccountTabs();
  const countNode = document.getElementById("customer-grid-count");
  if (countNode) {
    const tabLabel = filters.accountTab === "inactive" ? "ไม่ใช้งาน" : "ใช้งาน";
    countNode.textContent = `${rows.length.toLocaleString("th-TH")} รายการในสถานะ ${tabLabel}`;
  }

  if (state.grids.customers) {
    state.grids.customers.setGridOption("rowData", rows);
    return;
  }

  const mobile = window.innerWidth < 760;
  const listSettings = currentCustomerListSettings();
  const availableDefinitions = customerListColumnDefinitions(mobile);
  const configuredColumns = listSettings.customer_list_columns
    .filter((key) => availableDefinitions[key])
    .map((key) => {
      const definition = { ...availableDefinitions[key] };
      if (key === listSettings.customer_list_sort_column) {
        definition.sort = listSettings.customer_list_sort_direction;
        definition.sortIndex = 0;
      }
      return definition;
    });

  createCommunityGrid(container, {
    rowData: rows,
    getRowId: (params) => params.data.id,
    columnDefs: [...configuredColumns, customerListActionsColumn()]
  }, "customers");
}

  function customerCoreFields(customer = null) {
    const c = customer || {};
    const defaultImportStatus = c.import_status
      || masterOptions("import_status")[0]?.option_value
      || "waiting";
    return `
      <section id="customer-basic-section" class="panel edit-section">
        <div class="panel-header"><h2>1. ข้อมูลพื้นฐาน</h2></div>
        <div class="panel-body">
          <div class="form-grid">
            <label class="span-2">
              <span class="field-label">ชื่อนิติบุคคล <span class="required">*</span></span>
              <input name="legal_name" maxlength="500" value="${h(c.legal_name || "")}" required>
            </label>
            <label>
              <span class="field-label">ชื่อย่อ</span>
              <input name="short_name" maxlength="300" value="${h(c.short_name || "")}">
            </label>
            <label>
              <span class="field-label">เลขประจำตัวผู้เสียภาษี <span class="required">*</span></span>
              <input name="tax_id" inputmode="numeric" pattern="[0-9]{13}" minlength="13" maxlength="13"
                     value="${h(c.tax_id || "")}" placeholder="ตัวเลข 13 หลัก" required>
            </label>
            <label>
              <span class="field-label">จำนวนรถ <span class="required">*</span></span>
              <input name="fleet_size" type="number" min="0" step="1" value="${h(c.fleet_size ?? 0)}" required>
            </label>
            <label>
              <span class="field-label">จำนวนผู้ใช้งานลูกค้า <span class="required">*</span></span>
              <input name="customer_user_count" type="number" min="1" max="999999" step="1"
                     value="${h(c.customer_user_count ?? 1)}" required>
              <small class="field-help">จำนวนผู้ใช้งานจริงที่ลูกค้าแจ้ง ต้องตั้งแต่ 1 ขึ้นไป และไม่ผูกกับจำนวนบัญชีที่สร้าง</small>
            </label>
            <label>
              <span class="field-label">ค่าบริการต่อเดือน (บาท)</span>
              <input name="monthly_service_fee" type="number" min="0" max="999999999999.99" step="0.01"
                     value="${h(c.monthly_service_fee ?? "")}" placeholder="เว้นว่างได้ หรือกรอก 0">
              <small class="field-help">จำนวนเงินต่อเดือน หน่วยบาท รองรับทศนิยมไม่เกิน 2 ตำแหน่ง</small>
            </label>
            <label>
              <span class="field-label">สถานะบัญชี <span class="required">*</span></span>
              <select name="account_status" required>
                <option value="active" ${(c.account_status || "active") === "active" ? "selected" : ""}>ใช้งาน</option>
                <option value="inactive" ${c.account_status === "inactive" ? "selected" : ""}>ไม่ใช้งาน</option>
              </select>
            </label>
            <label>
              <span class="field-label">เซลล์</span>
              <select name="sales_code">
                ${masterOptionHtml("sales", c.sales_code || "")}
              </select>
            </label>
          </div>
        </div>
      </section>

      <section id="customer-status-section" class="panel edit-section">
        <div class="panel-header"><h2>2. สถานะและวันที่</h2></div>
        <div class="panel-body">
          <div class="form-grid">
            <label>
              <span class="field-label">สถานะการนำเข้าข้อมูล <span class="required">*</span></span>
              <select name="import_status" required>
                ${masterOptionHtml("import_status", defaultImportStatus, { allowBlank: false })}
              </select>
            </label>
            <label>
              <span class="field-label">ขั้นตอนเริ่มใช้งาน</span>
              <select name="onboarding_stage">
                ${masterOptionHtml("onboarding_stage", c.onboarding_stage || "")}
              </select>
            </label>
            <label>
              <span class="field-label">ระดับความสนใจ</span>
              <select name="engagement_level">
                ${masterOptionHtml("engagement_level", c.engagement_level || "")}
              </select>
            </label>
            ${dateControlHtml({
              id: "customer-start-date",
              name: "start_date",
              label: "วันที่เริ่มใช้งานจริง",
              value: c.start_date || ""
            })}
            ${dateControlHtml({
              id: "customer-billing-date",
              name: "billing_date",
              label: "วันที่เริ่มวางบิล",
              value: c.billing_date || ""
            })}
          </div>
        </div>
      </section>
    `;
  }

  function customerContractSection(customer = null) {
    const c = customer || {};
    const defaultContractType = c.contract_type
      || masterOptions("contract_type")[0]?.option_value
      || "monthly";
    return `
      <section id="customer-contract-section" class="panel edit-section">
        <div class="panel-header"><h2>6. สัญญาและการอบรม</h2></div>
        <div class="panel-body">
          <div class="form-grid">
            <label>
              <span class="field-label">สัญญา <span class="required">*</span></span>
              <select name="contract_type" required>
                ${masterOptionHtml("contract_type", defaultContractType, { allowBlank: false })}
              </select>
            </label>
            <label>
              <span class="field-label">สอนใช้งานนอกสถานที่</span>
              <input name="onsite_training_count" type="number" min="0" max="999999" step="1"
                     value="${h(c.onsite_training_count ?? 0)}" required>
              <small class="field-help">จำนวนครั้ง ตั้งแต่ 0 ขึ้นไป</small>
            </label>
          </div>
        </div>
      </section>`;
  }

  function customerOwnerSection(data = {}, customerId = "") {
    const selectedOwnerIds = new Set((data.owners || []).map((row) => row.profile_id));
    const primaryOwner = (data.owners || []).find((row) => row.is_primary)?.profile_id || "";
    const profiles = state.profiles.filter((profile) => profile.is_active || selectedOwnerIds.has(profile.id));

    return `
      <section id="customer-owner-section" class="panel edit-section">
        <div class="panel-header"><h2>3. ผู้รับผิดชอบ</h2></div>
        <div class="panel-body">
          <div class="owner-grid">
            ${profiles.map((profile) => `
              <label class="choice-card owner-choice-card">
                <input type="checkbox" name="owner_id" value="${h(profile.id)}"
                       ${selectedOwnerIds.has(profile.id) ? "checked" : ""}>
                ${avatarMarkup(profile, "choice-avatar", profile.display_name)}
                <span class="choice-card-copy">
                  <strong>${h(profile.display_name)}</strong>
                  <small>${h(profile.position || "ไม่ระบุตำแหน่ง")}</small>
                </span>
              </label>
            `).join("") || '<p class="muted">ยังไม่มีผู้ใช้งานที่เปิดใช้งาน</p>'}
          </div>
          <label class="field-block">
            <span class="field-label">ผู้รับผิดชอบหลัก</span>
            <select name="primary_owner">
              <option value="">ไม่ระบุ</option>
              ${profiles.map((profile) => `
                <option value="${h(profile.id)}" ${profile.id === primaryOwner ? "selected" : ""}>
                  ${h(profile.display_name)}
                </option>
              `).join("")}
            </select>
          </label>
        </div>
      </section>`;
  }

function customerContactSection(customerId = "") {
  return `
    <section id="customer-contact-section" class="panel edit-section">
      <div class="panel-header"><h2>4. ผู้ติดต่อและผู้ใช้งาน</h2></div>
      <div class="panel-body">
        <div class="customer-subsection">
          <div class="subsection-header">
            <div>
              <h3>ผู้ติดต่อ</h3>
              <p class="muted">บุคคลสำหรับประสานงานกับลูกค้า</p>
            </div>
            <button type="button" class="btn btn-secondary btn-small"
                    data-action="open-contact-create" data-customer-id="${h(customerId)}">
              ${icon("plus")} เพิ่มผู้ติดต่อ
            </button>
          </div>
          <div id="customer-contact-list" class="stack"></div>
        </div>

        <div class="customer-subsection customer-user-subsection">
          <div class="subsection-header">
            <div>
              <h3>ผู้ใช้งานลูกค้า</h3>
              <p class="muted">รองรับหลายบัญชีต่อหนึ่งลูกค้า ข้อมูลรหัสผ่านและ PIN เป็นข้อมูลลับ</p>
            </div>
            <button type="button" class="btn btn-secondary btn-small"
                    data-action="open-customer-user-create" data-customer-id="${h(customerId)}">
              ${icon("plus")} เพิ่มผู้ใช้งาน
            </button>
          </div>
          <div id="customer-user-list" class="stack"></div>
        </div>
      </div>
    </section>`;
}

function customerNotesSection(customerId = "") {
  return `
    <section id="customer-notes-section" class="panel edit-section customer-notes-panel">
      <div class="panel-header">
        <div>
          <h2>โน้ตลูกค้า</h2>
          <p class="muted">บันทึกได้หลายรายการ พร้อมผู้บันทึกและเวลาที่แก้ไขล่าสุด</p>
        </div>
        <button type="button" class="btn btn-secondary btn-small"
                data-action="open-customer-note-create" data-customer-id="${h(customerId)}">
          ${icon("plus")} เพิ่มโน้ต
        </button>
      </div>
      <div class="panel-body">
        <div id="customer-note-list" class="customer-note-list"></div>
      </div>
    </section>`;
}

  function customerModuleFeatureSection(data = {}) {
    const moduleIds = data.moduleIds || [];
    const featureIds = data.featureIds || [];
    const modules = state.modules.filter((item) => item.is_active || moduleIds.includes(item.id));
    const features = state.features.filter((item) => item.is_active || featureIds.includes(item.id));

    return `
      <section id="customer-module-section" class="panel edit-section">
        <div class="panel-header"><h2>5. โมดูลและฟังก์ชัน</h2></div>
        <div class="panel-body">
          <h3>โมดูล</h3>
          <div class="choice-grid">
            ${modules.map((item) => `
              <label class="choice-card">
                <input type="checkbox" name="module_id" value="${h(item.id)}"
                       ${moduleIds.includes(item.id) ? "checked" : ""}>
                <span>${h(item.name)}${!item.is_active ? "<small>ปิดใช้งาน</small>" : ""}</span>
              </label>
            `).join("") || '<p class="muted">ยังไม่มีโมดูลที่เปิดใช้งาน</p>'}
          </div>
          <h3 class="section-subtitle">ฟังก์ชัน</h3>
          <div class="choice-grid">
            ${features.map((item) => `
              <label class="choice-card">
                <input type="checkbox" name="feature_id" value="${h(item.id)}"
                       ${featureIds.includes(item.id) ? "checked" : ""}>
                <span>${h(item.name)}${!item.is_active ? "<small>ปิดใช้งาน</small>" : ""}</span>
              </label>
            `).join("") || '<p class="muted">ยังไม่มีฟังก์ชันที่เปิดใช้งาน</p>'}
          </div>
        </div>
      </section>`;
  }

  function customerFormSections(data = {}) {
    const customer = data.customer || {};
    return `
      ${customerCoreFields(customer)}
      ${customerOwnerSection(data, customer.id || "")}
      ${customerContactSection(customer.id || "")}
      ${customerModuleFeatureSection(data)}
      ${customerContractSection(customer)}
      ${customerNotesSection(customer.id || "")}
    `;
  }

async function renderCustomerCreatePage() {
  await loadCommonData();
  const data = {
    customer: {
      id: null,
      account_status: "active",
      fleet_size: 0,
      customer_user_count: 1,
      sales_code: null,
      onsite_training_count: 0
    },
    owners: [],
    contacts: [],
    accounts: [],
    notes: [],
    moduleIds: [],
    featureIds: []
  };
  state.currentCustomer = null;
  state.currentCustomerData = data;
  state.customerEditDraft = createCustomerEditDraft(data);

  el.mainContent.innerHTML = `
    ${pageHeader(
      "เพิ่มลูกค้า",
      "กรอกข้อมูลลูกค้าให้ครบทุกส่วนก่อนบันทึก",
      "",
      [{ label: "ข้อมูลลูกค้า", href: "#/customers" }, { label: "เพิ่มลูกค้า" }]
    )}
    <form id="customer-core-form" data-mode="create" class="customer-form-page" novalidate>
      <div class="edit-sections">
        ${customerFormSections(data)}
      </div>
      <div class="sticky-form-actions">
        <a class="btn btn-secondary" href="#/customers" data-action="cancel-customer-edit"
           data-target="#/customers">ยกเลิก</a>
        <button id="customer-save-button" class="btn btn-primary" type="submit">
          ${icon("save")} บันทึก
        </button>
      </div>
    </form>`;

  renderCustomerDraftContacts();
  renderCustomerDraftAccounts();
  renderCustomerDraftNotes();
  const restored = restoreCustomerDraft(document.getElementById("customer-core-form"));
  if (restored) showToast("กู้คืนแบบร่างที่ยังไม่ได้บันทึกแล้ว", "warning");
}

function createCustomerEditDraft(data) {
  return {
    customerId: data.customer?.id || null,
    original: {
      ...data,
      moduleIds: [...(data.moduleIds || [])],
      featureIds: [...(data.featureIds || [])]
    },
    contacts: (data.contacts || []).map((contact) => ({
      ...contact,
      _key: contact.id || createDraftKey(),
      _isNew: !contact.id
    })),
    accounts: (data.accounts || []).map((account) => ({
      ...account,
      _key: account.id || createDraftKey(),
      _isNew: !account.id
    })),
    notes: (data.notes || []).map((note) => ({
      ...note,
      _key: note.id || createDraftKey(),
      _isNew: !note.id,
      _dirty: false
    })),
    deletedContactIds: new Set(),
    deletedAccountIds: new Set(),
    deletedNoteIds: new Set(),
    dirty: false
  };
}

function markCustomerEditDirty() {
  if (state.customerEditDraft) state.customerEditDraft.dirty = true;
}

function renderCustomerDraftContacts() {
  const container = document.getElementById("customer-contact-list");
  const draft = state.customerEditDraft;
  if (!container || !draft) return;
  container.innerHTML = draft.contacts.map((contact) => `
    <article class="list-card">
      <div class="list-card-header">
        <div>
          <strong>${h(contact.contact_name)}</strong>
          ${contact.is_primary ? '<span class="tag">ผู้ติดต่อหลัก</span>' : ""}
          ${!contact.is_active ? '<span class="status-badge" data-status="inactive">ปิดใช้งาน</span>' : ""}
          <div class="muted">${h(contact.position || "-")}</div>
          <div>${h(contact.phone || "-")} · ${h(contact.email || "-")} · ไอดีไลน์: ${h(contact.line_id || "-")}</div>
        </div>
        <div class="list-card-actions">
          <button type="button" class="btn btn-secondary btn-small" data-action="edit-contact" data-id="${h(contact._key)}">แก้ไข</button>
          <button type="button" class="btn btn-danger btn-small" data-action="delete-contact" data-id="${h(contact._key)}">ลบ</button>
        </div>
      </div>
    </article>
  `).join("") || '<div class="empty-state compact"><strong>ยังไม่มีผู้ติดต่อ</strong></div>';
}

function maskedSecret(value) {
  const text = String(value || "");
  if (!text) return "-";
  return "•".repeat(Math.min(Math.max(text.length, 4), 12));
}

function renderCustomerDraftAccounts() {
  const container = document.getElementById("customer-user-list");
  const draft = state.customerEditDraft;
  if (!container || !draft) return;
  container.innerHTML = draft.accounts.map((account) => `
    <article class="list-card customer-user-card">
      <div class="list-card-header">
        <div>
          <strong>${h(account.email || "-")}</strong>
          <div class="customer-secret-summary">
            <span>รหัสผ่าน <code>${h(maskedSecret(account.password_text))}</code></span>
            <span>PIN <code>${h(maskedSecret(account.pin_text))}</code></span>
          </div>
          ${account.notes ? `<div class="muted">${h(account.notes)}</div>` : ""}
        </div>
        <div class="list-card-actions">
          <button type="button" class="btn btn-secondary btn-small" data-action="edit-customer-user" data-id="${h(account._key)}">แก้ไข</button>
          <button type="button" class="btn btn-danger btn-small" data-action="delete-customer-user" data-id="${h(account._key)}">ลบ</button>
        </div>
      </div>
    </article>
  `).join("") || '<div class="empty-state compact"><strong>ยังไม่มีผู้ใช้งานลูกค้า</strong></div>';
}


function noteAuthorProfile(note) {
  return profileById(note?.updated_by || note?.created_by) || state.profile || null;
}

function renderCustomerDraftNotes() {
  const container = document.getElementById("customer-note-list");
  const draft = state.customerEditDraft;
  if (!container || !draft) return;
  const rows = [...draft.notes].sort((a, b) =>
    String(b.updated_at || b.created_at || "").localeCompare(String(a.updated_at || a.created_at || ""))
  );
  container.innerHTML = rows.map((note) => {
    const author = noteAuthorProfile(note);
    const timestamp = note.updated_at || note.created_at;
    return `
      <article class="customer-note-card">
        <div class="customer-note-meta">
          ${profileIdentityMarkup(author, {
            avatarClass: "profile-avatar-note",
            fallbackName: state.profile?.display_name || "ผู้ใช้งาน"
          })}
          <span class="muted">${timestamp ? h(formatDateTime(timestamp)) : "ยังไม่บันทึก"}</span>
        </div>
        <div class="customer-note-text">${h(note.note_text || "").replaceAll("\n", "<br>")}</div>
        <div class="customer-note-actions">
          <button type="button" class="btn btn-secondary btn-small"
                  data-action="edit-customer-note" data-id="${h(note._key)}">แก้ไข</button>
          <button type="button" class="btn btn-danger btn-small"
                  data-action="delete-customer-note" data-id="${h(note._key)}">ลบ</button>
        </div>
      </article>`;
  }).join("") || '<div class="empty-state compact"><strong>ยังไม่มีโน้ตลูกค้า</strong></div>';
}

function openCustomerNoteForm(note = null, customerId = "") {
  const form = el.customerNoteForm;
  if (!form) return;
  form.reset();
  form.elements.id.value = note?._key || "";
  form.elements.customer_id.value = customerId || state.customerEditDraft?.customerId || "";
  form.elements.note_text.value = note?.note_text || "";
  if (el.customerNoteDialogTitle) {
    el.customerNoteDialogTitle.textContent = note ? "แก้ไขโน้ตลูกค้า" : "เพิ่มโน้ตลูกค้า";
  }
  openDialog(el.customerNoteDialog);
  window.setTimeout(() => form.elements.note_text.focus(), 0);
}

function saveCustomerNoteDraft(event) {
  event.preventDefault();
  const form = event.target;
  const draft = state.customerEditDraft;
  if (!draft || !form.reportValidity()) return;

  const data = new FormData(form);
  const key = String(data.get("id") || "");
  const noteText = String(data.get("note_text") || "").trim();
  if (!noteText) {
    form.elements.note_text.setCustomValidity("กรุณาระบุรายละเอียดโน้ต");
    form.elements.note_text.reportValidity();
    return;
  }
  form.elements.note_text.setCustomValidity("");

  const existing = draft.notes.find((note) => note._key === key);
  const now = new Date().toISOString();
  const next = {
    id: key && !key.startsWith("new-") ? key : null,
    customer_id: String(data.get("customer_id") || draft.customerId || ""),
    note_text: noteText,
    created_at: existing?.created_at || now,
    created_by: existing?.created_by || state.profile?.id || null,
    updated_at: now,
    updated_by: state.profile?.id || null,
    _key: key || createDraftKey(),
    _isNew: !key || key.startsWith("new-"),
    _dirty: true
  };

  if (key) {
    draft.notes = draft.notes.map((note) => note._key === key ? next : note);
  } else {
    draft.notes.unshift(next);
  }
  draft.dirty = true;
  renderCustomerDraftNotes();
  scheduleCustomerDraftSave();
  closeDialog(el.customerNoteDialog);
  showToast(key ? "แก้ไขโน้ตในแบบร่างแล้ว" : "เพิ่มโน้ตในแบบร่างแล้ว");
}

async function deleteCustomerNoteDraft(noteKey) {
  const draft = state.customerEditDraft;
  const note = draft?.notes.find((item) => item._key === noteKey);
  if (!draft || !note) return;
  const ok = await confirmAction("นำโน้ตรายการนี้ออกหรือไม่?", "ลบโน้ตลูกค้า", "ลบ");
  if (!ok) return;

  draft.notes = draft.notes.filter((item) => item._key !== noteKey);
  if (!note._isNew && note.id) draft.deletedNoteIds.add(note.id);
  draft.dirty = true;
  renderCustomerDraftNotes();
  scheduleCustomerDraftSave();
  showToast("นำโน้ตออกจากแบบร่างแล้ว กรุณากดบันทึก");
}

function openCustomerUserForm(account = null, customerId = "") {
  const form = el.customerUserForm;
  if (!form) return;
  form.reset();
  form.elements.email.setCustomValidity("");
  form.elements.id.value = account?._key || "";
  form.elements.customer_id.value = customerId || state.customerEditDraft?.customerId || "";
  form.elements.email.value = account?.email || "";
  form.elements.password_text.value = account?.password_text || "";
  form.elements.pin_text.value = account?.pin_text || "";
  form.elements.notes.value = account?.notes || "";
  if (el.customerUserDialogTitle) {
    el.customerUserDialogTitle.textContent = account ? "แก้ไขผู้ใช้งานลูกค้า" : "เพิ่มผู้ใช้งานลูกค้า";
  }
  openDialog(el.customerUserDialog);
  window.setTimeout(() => form.elements.email.focus(), 0);
}

function saveCustomerUserDraft(event) {
  event.preventDefault();
  const form = event.target;
  const draft = state.customerEditDraft;
  if (!draft || !form.reportValidity()) return;

  const data = new FormData(form);
  const key = String(data.get("id") || "");
  const email = String(data.get("email") || "").trim().toLowerCase();
  const duplicate = draft.accounts.some((item) =>
    item._key !== key && String(item.email || "").trim().toLowerCase() === email
  );
  if (duplicate) {
    form.elements.email.setCustomValidity("อีเมลนี้มีอยู่แล้วในลูกค้ารายนี้");
    form.elements.email.reportValidity();
    return;
  }
  form.elements.email.setCustomValidity("");

  const next = {
    id: key && !key.startsWith("new-") ? key : null,
    _key: key || createDraftKey(),
    _isNew: !key || key.startsWith("new-"),
    email,
    password_text: String(data.get("password_text") || ""),
    pin_text: String(data.get("pin_text") || ""),
    notes: nullable(data.get("notes"))
  };

  if (key) {
    draft.accounts = draft.accounts.map((item) => item._key === key ? next : item);
  } else {
    draft.accounts.push(next);
  }
  draft.dirty = true;
  renderCustomerDraftAccounts();
  scheduleCustomerDraftSave();
  closeDialog(el.customerUserDialog);
  showToast(key ? "แก้ไขผู้ใช้งานในแบบร่างแล้ว" : "เพิ่มผู้ใช้งานในแบบร่างแล้ว");
}

async function deleteCustomerUserDraft(accountKey) {
  const draft = state.customerEditDraft;
  const account = draft?.accounts.find((item) => item._key === accountKey);
  if (!draft || !account) return;
  const ok = await confirmAction(`นำผู้ใช้งาน “${account.email || "-"}” ออกจากรายการหรือไม่?`, "นำผู้ใช้งานออก", "นำออก");
  if (!ok) return;

  draft.accounts = draft.accounts.filter((item) => item._key !== accountKey);
  if (!account._isNew && account.id) draft.deletedAccountIds.add(account.id);
  draft.dirty = true;
  renderCustomerDraftAccounts();
  scheduleCustomerDraftSave();
  showToast("นำผู้ใช้งานออกจากแบบร่างแล้ว กรุณากดบันทึก");
}

const CUSTOMER_DRAFT_PREFIX = "fi-customer-draft:";

function customerDraftStorageKey(customerId = state.customerEditDraft?.customerId || "new") {
  const userId = state.profile?.id || "anonymous";
  return `${CUSTOMER_DRAFT_PREFIX}${userId}:${customerId || "new"}`;
}

function clearCustomerDraftStorage(customerId = state.customerEditDraft?.customerId || "new") {
  try {
    window.sessionStorage.removeItem(customerDraftStorageKey(customerId));
  } catch (error) {
    console.warn("Clear customer draft failed", error);
  }
}

function clearAllCustomerDraftStorage() {
  try {
    const keys = [];
    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const key = window.sessionStorage.key(index);
      if (key?.startsWith(CUSTOMER_DRAFT_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => window.sessionStorage.removeItem(key));
  } catch (error) {
    console.warn("Clear customer drafts failed", error);
  }
}

function customerFormDraftValues(form) {
  const values = {};
  const grouped = new Map();
  form.querySelectorAll("input[name], select[name], textarea[name]").forEach((field) => {
    if (field.type === "submit" || field.type === "button") return;
    if (!grouped.has(field.name)) grouped.set(field.name, []);
    grouped.get(field.name).push(field);
  });

  grouped.forEach((fields, name) => {
    const first = fields[0];
    if (first.type === "checkbox" || first.type === "radio") {
      values[name] = fields.filter((field) => field.checked).map((field) => field.value);
    } else if (first.multiple) {
      values[name] = [...first.selectedOptions].map((option) => option.value);
    } else {
      values[name] = first.value;
    }
  });
  return values;
}

function persistCustomerDraft() {
  const form = document.querySelector("#customer-core-form, #customer-edit-form");
  const draft = state.customerEditDraft;
  if (!form || !draft || !draft.dirty) return;

  const payload = {
    version: APP_VERSION,
    customerId: draft.customerId || null,
    savedAt: new Date().toISOString(),
    values: customerFormDraftValues(form),
    contacts: draft.contacts.map(({ _key, _isNew, ...contact }) => ({ ...contact, _key, _isNew })),
    accounts: draft.accounts.map(({ _key, _isNew, ...account }) => ({ ...account, _key, _isNew })),
    notes: draft.notes.map(({ _key, _isNew, ...note }) => ({ ...note, _key, _isNew })),
    deletedContactIds: [...draft.deletedContactIds],
    deletedAccountIds: [...draft.deletedAccountIds],
    deletedNoteIds: [...draft.deletedNoteIds]
  };
  try {
    window.sessionStorage.setItem(customerDraftStorageKey(draft.customerId || "new"), JSON.stringify(payload));
  } catch (error) {
    console.warn("Persist customer draft failed", error);
  }
}

function scheduleCustomerDraftSave() {
  window.clearTimeout(state.ui.customerDraftSaveTimer);
  state.ui.customerDraftSaveTimer = window.setTimeout(persistCustomerDraft, 250);
}

function applyCustomerDraftValues(form, values = {}) {
  Object.entries(values).forEach(([name, stored]) => {
    const fields = [...form.querySelectorAll(`[name="${CSS.escape(name)}"]`)];
    if (!fields.length) return;
    const first = fields[0];
    if (first.type === "checkbox" || first.type === "radio") {
      const selected = new Set(Array.isArray(stored) ? stored.map(String) : []);
      fields.forEach((field) => {
        field.checked = selected.has(String(field.value));
      });
    } else if (first.multiple) {
      const selected = new Set(Array.isArray(stored) ? stored.map(String) : []);
      [...first.options].forEach((option) => {
        option.selected = selected.has(String(option.value));
      });
    } else {
      first.value = stored ?? "";
      if (first.matches("[data-date-native]")) syncDateControlFromNative(first, false);
    }
  });
}

function restoreCustomerDraft(form) {
  const draft = state.customerEditDraft;
  if (!form || !draft) return false;
  try {
    const raw = window.sessionStorage.getItem(customerDraftStorageKey(draft.customerId || "new"));
    if (!raw) return false;
    const stored = JSON.parse(raw);
    if ((stored.customerId || null) !== (draft.customerId || null)) return false;

    applyCustomerDraftValues(form, stored.values || {});
    draft.contacts = (stored.contacts || []).map((contact) => ({
      ...contact,
      _key: contact._key || contact.id || createDraftKey(),
      _isNew: contact._isNew ?? !contact.id
    }));
    draft.accounts = (stored.accounts || []).map((account) => ({
      ...account,
      _key: account._key || account.id || createDraftKey(),
      _isNew: account._isNew ?? !account.id
    }));
    draft.notes = (stored.notes || []).map((note) => ({
      ...note,
      _key: note._key || note.id || createDraftKey(),
      _isNew: note._isNew ?? !note.id,
      _dirty: note._dirty ?? Boolean(note._isNew ?? !note.id)
    }));
    draft.deletedContactIds = new Set(stored.deletedContactIds || []);
    draft.deletedAccountIds = new Set(stored.deletedAccountIds || []);
    draft.deletedNoteIds = new Set(stored.deletedNoteIds || []);
    draft.dirty = true;
    renderCustomerDraftContacts();
    renderCustomerDraftAccounts();
    renderCustomerDraftNotes();
    return true;
  } catch (error) {
    console.warn("Restore customer draft failed", error);
    return false;
  }
}

async function renderCustomerEditPage(customerId) {
  const data = await loadCustomerDetail(customerId);
  state.currentCustomer = data.customer;
  state.currentCustomerData = data;
  state.customerEditDraft = createCustomerEditDraft(data);
  const c = data.customer;

  el.mainContent.innerHTML = `
    ${pageHeader(
      `แก้ไข: ${c.legal_name}`,
      "",
      "",
      [
        { label: "ข้อมูลลูกค้า", href: "#/customers" },
        { label: c.short_name || c.legal_name, href: `#/customer/${h(c.id)}` },
        { label: "แก้ไข" }
      ]
    )}

    <form id="customer-edit-form" data-customer-id="${h(c.id)}" class="customer-form-page" novalidate>
      <div class="edit-sections">
        ${customerFormSections(data)}
      </div>
      <div class="sticky-form-actions">
        <a class="btn btn-secondary" href="#/customer/${h(c.id)}" data-action="cancel-customer-edit"
           data-target="#/customer/${h(c.id)}">ยกเลิก</a>
        <button id="customer-save-button" class="btn btn-primary" type="submit">
          ${icon("save")} บันทึก
        </button>
      </div>
    </form>`;

  renderCustomerDraftContacts();
  renderCustomerDraftAccounts();
  renderCustomerDraftNotes();
  const restored = restoreCustomerDraft(document.getElementById("customer-edit-form"));
  if (restored) showToast("กู้คืนแบบร่างที่ยังไม่ได้บันทึกแล้ว", "warning");
}

  function openCustomerForm(customer = null) {
    location.hash = customer?.id ? `#/customer/${customer.id}/edit` : "#/customers/new";
  }

function collectCustomerFormState(formElement) {
  const draft = state.customerEditDraft;
  if (!draft) {
    showToast("ไม่พบแบบร่างข้อมูลลูกค้า", "error");
    return null;
  }

  const form = new FormData(formElement);
  const ownerIds = form.getAll("owner_id").map(String);
  const primaryOwnerId = nullable(form.get("primary_owner"));
  if (primaryOwnerId && !ownerIds.includes(primaryOwnerId)) {
    showToast("ผู้รับผิดชอบหลักต้องอยู่ในรายชื่อผู้รับผิดชอบที่เลือก", "error");
    return null;
  }

  const primaryContacts = draft.contacts.filter((contact) => contact.is_primary && contact.is_active);
  if (primaryContacts.length > 1) {
    showToast("กำหนดผู้ติดต่อหลักที่เปิดใช้งานได้เพียงหนึ่งคน", "error");
    return null;
  }

  const normalizedEmails = draft.accounts.map((account) => String(account.email || "").trim().toLowerCase());
  if (normalizedEmails.some((email) => !email)) {
    showToast("ผู้ใช้งานลูกค้าทุกรายต้องระบุอีเมล", "error");
    return null;
  }
  if (new Set(normalizedEmails).size !== normalizedEmails.length) {
    showToast("อีเมลผู้ใช้งานลูกค้าห้ามซ้ำภายในลูกค้ารายเดียวกัน", "error");
    return null;
  }

  const customerUserCount = Number(form.get("customer_user_count"));
  if (!Number.isInteger(customerUserCount) || customerUserCount < 1 || customerUserCount > 999999) {
    showToast("จำนวนผู้ใช้งานลูกค้าต้องเป็นจำนวนเต็มตั้งแต่ 1 ถึง 999999", "error");
    formElement.elements.customer_user_count?.focus();
    return null;
  }

  const onsiteTrainingCount = Number(form.get("onsite_training_count") || 0);
  if (!Number.isInteger(onsiteTrainingCount) || onsiteTrainingCount < 0 || onsiteTrainingCount > 999999) {
    showToast("จำนวนครั้งสอนใช้งานนอกสถานที่ต้องเป็นจำนวนเต็มตั้งแต่ 0 ถึง 999999", "error");
    return null;
  }

  const feeRaw = String(form.get("monthly_service_fee") ?? "").trim();
  const monthlyServiceFee = feeRaw === "" ? null : Number(feeRaw);
  if (
    monthlyServiceFee !== null
    && (!/^\d+(?:\.\d{1,2})?$/.test(feeRaw)
      || !Number.isFinite(monthlyServiceFee)
      || monthlyServiceFee < 0
      || monthlyServiceFee > 999999999999.99)
  ) {
    showToast("ค่าบริการต้องเป็นจำนวนเงินไม่ติดลบและมีทศนิยมไม่เกิน 2 ตำแหน่ง", "error");
    formElement.elements.monthly_service_fee?.focus();
    return null;
  }

  return {
    core: {
      legal_name: String(form.get("legal_name") || "").trim(),
      short_name: nullable(form.get("short_name")),
      tax_id: String(form.get("tax_id") || "").trim(),
      fleet_size: Number(form.get("fleet_size") || 0),
      customer_user_count: customerUserCount,
      monthly_service_fee: monthlyServiceFee,
      account_status: form.get("account_status"),
      onboarding_stage: nullable(form.get("onboarding_stage")),
      import_status: form.get("import_status"),
      engagement_level: nullable(form.get("engagement_level")),
      sales_code: nullable(form.get("sales_code")),
      start_date: dateValue(formElement, "start_date"),
      billing_date: dateValue(formElement, "billing_date"),
      contract_type: form.get("contract_type"),
      onsite_training_count: onsiteTrainingCount
    },
    ownerIds,
    primaryOwnerId,
    moduleIds: form.getAll("module_id").map(String),
    featureIds: form.getAll("feature_id").map(String),
    contacts: draft.contacts.map((contact) => ({
      id: contact._isNew ? null : contact.id,
      contact_name: String(contact.contact_name || "").trim(),
      position: nullable(contact.position),
      phone: nullable(contact.phone),
      email: nullable(contact.email),
      line_id: nullable(contact.line_id),
      is_primary: Boolean(contact.is_primary),
      is_active: Boolean(contact.is_active)
    })),
    accounts: draft.accounts.map((account) => ({
      id: account._isNew ? null : account.id,
      email: String(account.email || "").trim().toLowerCase(),
      password_text: String(account.password_text || ""),
      pin_text: String(account.pin_text || ""),
      notes: nullable(account.notes)
    })),
    notes: draft.notes.map((note) => ({
      id: note._isNew ? null : note.id,
      note_text: String(note.note_text || "").trim()
    }))
  };
}

function clearCustomerCaches() {
  state.customers = [];
  state.customerOwners = [];
  state.customerModules = [];
  state.customerFeatures = [];
  state.customerAccounts = [];
  state.customerNotes = [];
  state.currentCustomer = null;
  state.currentCustomerData = null;
  state.customerEditDraft = null;
}

async function saveCustomer(event) {
  event.preventDefault();
  const formElement = event.target;
  if (!validateDateControls(formElement) || !formElement.reportValidity()) return;

  const collected = collectCustomerFormState(formElement);
  if (!collected) return;

  const button = formElement.querySelector('button[type="submit"]');
  setButtonBusy(button, true, "กำลังบันทึก...");
  setLoading(true, "กำลังสร้างข้อมูลลูกค้า...");

  try {
    const { data, error } = await state.client.rpc("create_customer_complete_v4", {
      p_customer: collected.core,
      p_owner_ids: collected.ownerIds,
      p_primary_owner_id: collected.primaryOwnerId,
      p_module_ids: collected.moduleIds,
      p_feature_ids: collected.featureIds,
      p_contacts: collected.contacts,
      p_customer_accounts: collected.accounts,
      p_customer_notes: collected.notes
    });
    if (error) throw error;

    const created = Array.isArray(data) ? data[0] : data;
    if (!created?.id) throw new Error("ฐานข้อมูลไม่ส่งข้อมูลลูกค้าที่สร้างกลับมา");

    clearCustomerDraftStorage("new");
    clearCustomerCaches();
    showToast("สร้างข้อมูลลูกค้าแล้ว");
    location.hash = `#/customer/${created.id}`;
  } catch (error) {
    showError(error, "สร้างข้อมูลลูกค้าไม่สำเร็จ");
  } finally {
    setLoading(false);
    setButtonBusy(button, false);
  }
}

async function saveCustomerRelations(table, key, customerId, originalIds, nextIds) {
  const original = new Set(originalIds);
  const next = new Set(nextIds);
  const additions = [...next].filter((id) => !original.has(id));
  const removals = [...original].filter((id) => !next.has(id));
  for (const id of removals) {
    const result = await state.client.from(table).delete().eq("customer_id", customerId).eq(key, id);
    if (result.error) throw result.error;
  }
  for (const id of additions) {
    const result = await state.client
      .from(table)
      .upsert(
        { customer_id: customerId, [key]: id },
        { onConflict: `customer_id,${key}`, ignoreDuplicates: true }
      );
    if (result.error) throw result.error;
  }
}

async function saveCustomerEdit(event) {
  event.preventDefault();
  const formElement = event.target;
  const draft = state.customerEditDraft;
  if (!draft || !validateDateControls(formElement) || !formElement.reportValidity()) return;

  const collected = collectCustomerFormState(formElement);
  if (!collected) return;

  const customerId = formElement.dataset.customerId;
  const button = formElement.querySelector('button[type="submit"]');
  setButtonBusy(button, true, "กำลังบันทึก...");
  setLoading(true, "กำลังบันทึกข้อมูลลูกค้า...");
  let currentStep = "ข้อมูลพื้นฐาน สถานะ และสัญญา";
  let completedSteps = 0;

  try {
    let result = await state.client
      .from("customers")
      .update(collected.core)
      .eq("id", customerId)
      .select()
      .single();
    if (result.error) throw result.error;
    completedSteps += 1;

    currentStep = "ผู้รับผิดชอบ";
    result = await state.client.rpc("save_customer_owners", {
      p_customer_id: customerId,
      p_owner_ids: collected.ownerIds,
      p_primary_owner_id: collected.primaryOwnerId
    });
    if (result.error) throw result.error;
    completedSteps += 1;

    currentStep = "โมดูลและฟังก์ชัน";
    await saveCustomerRelations(
      "customer_modules",
      "module_id",
      customerId,
      draft.original.moduleIds,
      collected.moduleIds
    );
    await saveCustomerRelations(
      "customer_features",
      "feature_id",
      customerId,
      draft.original.featureIds,
      collected.featureIds
    );
    draft.original.moduleIds = [...collected.moduleIds];
    draft.original.featureIds = [...collected.featureIds];
    completedSteps += 1;

    currentStep = "ผู้ติดต่อ";
    for (const contactId of [...draft.deletedContactIds]) {
      result = await state.client
        .from("customer_contacts")
        .delete()
        .eq("id", contactId)
        .eq("customer_id", customerId);
      if (result.error) throw result.error;
      draft.deletedContactIds.delete(contactId);
    }

    for (const contact of draft.contacts) {
      result = await state.client.rpc("save_customer_contact", {
        p_customer_id: customerId,
        p_contact_id: contact._isNew ? null : contact.id,
        p_contact_name: String(contact.contact_name || "").trim(),
        p_position: nullable(contact.position),
        p_phone: nullable(contact.phone),
        p_email: nullable(contact.email),
        p_line_id: nullable(contact.line_id),
        p_is_primary: Boolean(contact.is_primary),
        p_is_active: Boolean(contact.is_active)
      });
      if (result.error) throw result.error;
      const savedContact = Array.isArray(result.data) ? result.data[0] : result.data;
      if (contact._isNew && savedContact?.id) {
        contact.id = savedContact.id;
        contact._key = savedContact.id;
        contact._isNew = false;
      }
    }
    completedSteps += 1;

    currentStep = "ผู้ใช้งานลูกค้า";
    for (const accountId of [...draft.deletedAccountIds]) {
      result = await state.client
        .from("customer_user_accounts")
        .delete()
        .eq("id", accountId)
        .eq("customer_id", customerId);
      if (result.error) throw result.error;
      draft.deletedAccountIds.delete(accountId);
    }

    for (const account of draft.accounts) {
      const payload = {
        customer_id: customerId,
        email: String(account.email || "").trim().toLowerCase(),
        password_text: String(account.password_text || ""),
        pin_text: String(account.pin_text || ""),
        notes: nullable(account.notes)
      };
      if (account._isNew) {
        result = await state.client
          .from("customer_user_accounts")
          .insert(payload)
          .select("id,customer_id,email,password_text,pin_text,notes,created_at,updated_at")
          .single();
      } else {
        result = await state.client
          .from("customer_user_accounts")
          .update(payload)
          .eq("id", account.id)
          .eq("customer_id", customerId)
          .select("id,customer_id,email,password_text,pin_text,notes,created_at,updated_at")
          .single();
      }
      if (result.error) throw result.error;
      if (account._isNew && result.data?.id) {
        account.id = result.data.id;
        account._key = result.data.id;
        account._isNew = false;
      }
    }
    completedSteps += 1;

    currentStep = "โน้ตลูกค้า";
    for (const noteId of [...draft.deletedNoteIds]) {
      result = await state.client
        .from("customer_notes")
        .delete()
        .eq("id", noteId)
        .eq("customer_id", customerId);
      if (result.error) throw result.error;
      draft.deletedNoteIds.delete(noteId);
    }

    for (const note of draft.notes) {
      if (!note._isNew && !note._dirty) continue;
      const payload = {
        customer_id: customerId,
        note_text: String(note.note_text || "").trim()
      };
      if (note._isNew) {
        result = await state.client
          .from("customer_notes")
          .insert(payload)
          .select("id,customer_id,note_text,created_at,created_by,updated_at,updated_by")
          .single();
      } else {
        result = await state.client
          .from("customer_notes")
          .update(payload)
          .eq("id", note.id)
          .eq("customer_id", customerId)
          .select("id,customer_id,note_text,created_at,created_by,updated_at,updated_by")
          .single();
      }
      if (result.error) throw result.error;
      if (result.data?.id) {
        Object.assign(note, {
          ...result.data,
          _key: result.data.id,
          _isNew: false,
          _dirty: false
        });
      }
    }
    completedSteps += 1;

    clearCustomerDraftStorage(customerId);
    clearCustomerCaches();
    showToast("บันทึกข้อมูลลูกค้าครบแล้ว");
    location.hash = `#/customer/${customerId}`;
  } catch (error) {
    console.error(error);
    renderCustomerDraftContacts();
    renderCustomerDraftAccounts();
    renderCustomerDraftNotes();
    scheduleCustomerDraftSave();
    const note = completedSteps > 0 ? " ข้อมูลส่วนก่อนหน้าอาจถูกบันทึกแล้ว" : "";
    showToast(`บันทึกส่วน “${currentStep}” ไม่สำเร็จ: ${normalizeError(error)}${note}`, "error");
  } finally {
    setLoading(false);
    setButtonBusy(button, false);
  }
}
async function loadCustomerDetail(customerId) {
  await Promise.all([loadCommonData(), loadCustomers()]);
  let customer = state.customers.find((item) => item.id === customerId) || null;
  if (!customer) {
    const customerResult = await state.client
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .eq("is_archived", false)
      .single();
    if (customerResult.error) throw customerResult.error;
    customer = customerResult.data;
  }
  if (!customer) throw new Error("ไม่พบข้อมูลลูกค้า");

  const [
    ownersResult,
    contactsResult,
    modulesResult,
    featuresResult,
    accountsResult,
    notesResult
  ] = await Promise.all([
    state.client.from("customer_owners").select("*").eq("customer_id", customerId),
    state.client.from("customer_contacts").select("*").eq("customer_id", customerId)
      .order("is_primary", { ascending: false })
      .order("contact_name"),
    state.client.from("customer_modules").select("customer_id,module_id").eq("customer_id", customerId),
    state.client.from("customer_features").select("customer_id,feature_id").eq("customer_id", customerId),
    state.client.from("customer_user_accounts")
      .select("id,customer_id,email,password_text,pin_text,notes,created_at,created_by,updated_at,updated_by")
      .eq("customer_id", customerId)
      .order("email"),
    state.client.from("customer_notes")
      .select("id,customer_id,note_text,created_at,created_by,updated_at,updated_by")
      .eq("customer_id", customerId)
      .order("updated_at", { ascending: false })
  ]);

  [ownersResult, contactsResult, modulesResult, featuresResult, accountsResult, notesResult].forEach((result) => {
    if (result.error) throw result.error;
  });

  const notes = notesResult.data || [];
  state.customerNotes = [
    ...state.customerNotes.filter((item) => item.customer_id !== customerId),
    ...notes
  ];

  return {
    customer,
    owners: ownersResult.data || [],
    contacts: contactsResult.data || [],
    accounts: accountsResult.data || [],
    notes,
    moduleIds: (modulesResult.data || []).map((row) => row.module_id),
    featureIds: (featuresResult.data || []).map((row) => row.feature_id)
  };
}
async function renderCustomerDetail(customerId) {
  const data = await loadCustomerDetail(customerId);
  state.currentCustomer = data.customer;
  state.currentCustomerData = data;
  state.customerEditDraft = null;
  const c = data.customer;
  const ownerList = data.owners
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
    .map((owner) => ({
      profile: profileById(owner.profile_id),
      isPrimary: Boolean(owner.is_primary)
    }));
  const moduleNames = state.modules
    .filter((item) => data.moduleIds.includes(item.id))
    .map((item) => item.name);
  const featureNames = state.features
    .filter((item) => data.featureIds.includes(item.id))
    .map((item) => item.name);
  const createdBy = profileById(c.created_by);
  const updatedBy = profileById(c.updated_by);

  el.mainContent.innerHTML = `
    ${pageHeader(
      c.legal_name,
      c.short_name || c.tax_id,
      `<a class="btn btn-primary" href="#/customer/${h(c.id)}/edit">${icon("edit")} แก้ไข</a>
       <button class="btn btn-danger" data-action="delete-customer" data-id="${h(c.id)}">${icon("delete")} ลบ</button>`,
      [{ label: "ข้อมูลลูกค้า", href: "#/customers" }, { label: c.short_name || c.legal_name }]
    )}

    <div class="edit-sections detail-sections">
      <section class="panel edit-section">
        <div class="panel-header"><h2>1. ข้อมูลพื้นฐาน</h2></div>
        <div class="panel-body">
          <dl class="meta-list meta-list-2">
            <dt>ชื่อนิติบุคคล</dt><dd>${h(c.legal_name)}</dd>
            <dt>ชื่อย่อ</dt><dd>${h(c.short_name || "-")}</dd>
            <dt>เลขประจำตัวผู้เสียภาษี</dt><dd>${h(c.tax_id)}</dd>
            <dt>จำนวนรถ</dt><dd>${Number(c.fleet_size || 0).toLocaleString("th-TH")}</dd>
            <dt>จำนวนผู้ใช้งานลูกค้า</dt><dd>${Number(c.customer_user_count || 1).toLocaleString("th-TH")} คน</dd>
            <dt>ค่าบริการต่อเดือน</dt><dd>${formatMoney(c.monthly_service_fee)}</dd>
            <dt>บัญชีผู้ใช้งานที่บันทึกไว้</dt><dd>${data.accounts.length.toLocaleString("th-TH")} บัญชี</dd>
            <dt>เซลล์</dt><dd>${h(label("sales", c.sales_code))}</dd>
            <dt>สถานะบัญชี</dt>
            <dd><span class="status-badge" data-status="${h(c.account_status)}">${h(label("account_status", c.account_status))}</span></dd>
            <dt>สร้างโดย</dt>
            <dd>${profileIdentityMarkup(createdBy, {
              subtitle: formatDateTime(c.created_at),
              avatarClass: "profile-avatar-small"
            })}</dd>
            <dt>แก้ไขล่าสุดโดย</dt>
            <dd>${profileIdentityMarkup(updatedBy, {
              subtitle: formatDateTime(c.updated_at),
              avatarClass: "profile-avatar-small"
            })}</dd>
          </dl>
        </div>
      </section>

      <section class="panel edit-section">
        <div class="panel-header"><h2>2. สถานะและวันที่</h2></div>
        <div class="panel-body">
          <dl class="meta-list meta-list-2">
            <dt>สถานะการนำเข้าข้อมูล</dt>
            <dd><span class="status-badge" data-status="${h(c.import_status)}">${h(label("import_status", c.import_status))}</span></dd>
            <dt>ขั้นตอนเริ่มใช้งาน</dt><dd>${h(label("onboarding_stage", c.onboarding_stage))}</dd>
            <dt>ระดับความสนใจ</dt><dd>${h(label("engagement_level", c.engagement_level))}</dd>
            <dt>วันที่เริ่มใช้งานจริง</dt><dd>${h(formatDate(c.start_date))}</dd>
            <dt>วันที่เริ่มวางบิล</dt><dd>${h(formatDate(c.billing_date))}</dd>
          </dl>
        </div>
      </section>

      <section class="panel edit-section">
        <div class="panel-header"><h2>3. ผู้รับผิดชอบ</h2></div>
        <div class="panel-body">
          ${ownerList.length
            ? `<div class="profile-identity-list">${ownerList.map((owner) => `
                <div class="owner-detail-row">
                  ${profileIdentityMarkup(owner.profile, {
                    subtitle: owner.profile?.position || "ไม่ระบุตำแหน่ง",
                    avatarClass: "profile-avatar-grid"
                  })}
                  ${owner.isPrimary ? '<span class="tag">ผู้รับผิดชอบหลัก</span>' : ""}
                </div>
              `).join("")}</div>`
            : '<p class="muted">ยังไม่มีผู้รับผิดชอบ</p>'}
        </div>
      </section>

      <section class="panel edit-section">
        <div class="panel-header"><h2>4. ผู้ติดต่อและผู้ใช้งาน</h2></div>
        <div class="panel-body">
          <div class="customer-subsection">
            <div class="subsection-header"><div><h3>ผู้ติดต่อ</h3></div></div>
            <div class="detail-card-grid">
              ${data.contacts.map((contact) => `
                <article class="list-card">
                  <strong>${h(contact.contact_name)}</strong>
                  ${contact.is_primary ? '<span class="tag">ผู้ติดต่อหลัก</span>' : ""}
                  ${!contact.is_active ? '<span class="status-badge" data-status="inactive">ปิดใช้งาน</span>' : ""}
                  <div class="muted">${h(contact.position || "-")}</div>
                  <div>${h(contact.phone || "-")}</div>
                  <div>${h(contact.email || "-")}</div>
                  <div>ไอดีไลน์: ${h(contact.line_id || "-")}</div>
                </article>
              `).join("") || '<div class="empty-state compact"><strong>ยังไม่มีผู้ติดต่อ</strong></div>'}
            </div>
          </div>

          <div class="customer-subsection customer-user-subsection">
            <div class="subsection-header">
              <div>
                <h3>ผู้ใช้งานลูกค้า</h3>
                <p class="muted">จำนวนที่ระบุ ${Number(c.customer_user_count || 1).toLocaleString("th-TH")} คน · บันทึกบัญชีไว้ ${data.accounts.length.toLocaleString("th-TH")} บัญชี</p>
              </div>
            </div>
            <div class="detail-card-grid">
              ${data.accounts.map((account) => `
                <article class="list-card customer-user-detail-card">
                  <strong>${h(account.email)}</strong>
                  <dl class="credential-list">
                    <dt>รหัสผ่าน</dt><dd><code>${h(account.password_text || "-")}</code></dd>
                    <dt>PIN</dt><dd><code>${h(account.pin_text || "-")}</code></dd>
                    <dt>หมายเหตุ</dt><dd>${h(account.notes || "-")}</dd>
                  </dl>
                </article>
              `).join("") || '<div class="empty-state compact"><strong>ยังไม่มีบัญชีผู้ใช้งานลูกค้า</strong></div>'}
            </div>
          </div>
        </div>
      </section>

      <section class="panel edit-section">
        <div class="panel-header"><h2>5. โมดูลและฟังก์ชัน</h2></div>
        <div class="panel-body">
          <h3>โมดูล</h3>
          <div class="tag-list">
            ${moduleNames.length
              ? moduleNames.map((name) => `<span class="tag">${h(name)}</span>`).join("")
              : '<span class="muted">-</span>'}
          </div>
          <h3 class="section-subtitle">ฟังก์ชัน</h3>
          <div class="tag-list">
            ${featureNames.length
              ? featureNames.map((name) => `<span class="tag">${h(name)}</span>`).join("")
              : '<span class="muted">-</span>'}
          </div>
        </div>
      </section>

      <section class="panel edit-section">
        <div class="panel-header"><h2>6. สัญญาและการอบรม</h2></div>
        <div class="panel-body">
          <dl class="meta-list">
            <dt>สัญญา</dt><dd>${h(label("contract_type", c.contract_type))}</dd>
            <dt>สอนใช้งานนอกสถานที่</dt>
            <dd>${Number(c.onsite_training_count || 0).toLocaleString("th-TH")} ครั้ง</dd>
          </dl>
        </div>
      </section>

      <section class="panel edit-section customer-notes-panel">
        <div class="panel-header"><h2>โน้ตลูกค้า</h2><span class="tag">${data.notes.length.toLocaleString("th-TH")} รายการ</span></div>
        <div class="panel-body">
          <div class="customer-note-list">
            ${data.notes.length ? data.notes.map((note) => {
              const author = noteAuthorProfile(note);
              return `
                <article class="customer-note-card">
                  <div class="customer-note-header">
                    ${profileIdentityMarkup(author, {
                      subtitle: `แก้ไข ${formatDateTime(note.updated_at || note.created_at)}`,
                      avatarClass: "profile-avatar-note"
                    })}
                  </div>
                  <p>${h(note.note_text).replaceAll("\n", "<br>")}</p>
                </article>`;
            }).join("") : '<div class="empty-state compact"><strong>ยังไม่มีโน้ตลูกค้า</strong></div>'}
          </div>
        </div>
      </section>
    </div>`;
}

function openContactForm(contact = null, customerId = null) {
  el.contactForm.reset();
  const form = el.contactForm.elements;
  document.getElementById("contact-dialog-title").textContent = contact ? "แก้ไขผู้ติดต่อ" : "เพิ่มผู้ติดต่อ";
  form.id.value = contact?._key || contact?.id || "";
  form.customer_id.value = contact?.customer_id || customerId || state.currentCustomer?.id || "";
  form.contact_name.value = contact?.contact_name || "";
  form.position.value = contact?.position || "";
  form.phone.value = contact?.phone || "";
  form.email.value = contact?.email || "";
  form.line_id.value = contact?.line_id || "";
  form.is_primary.checked = Boolean(contact?.is_primary);
  form.is_active.checked = contact ? Boolean(contact.is_active) : true;
  openDialog(el.contactDialog);
}

async function saveContact(event) {
  event.preventDefault();
  if (!el.contactForm.reportValidity()) return;
  const draft = state.customerEditDraft;
  if (!draft) {
    showToast("ไม่พบแบบร่างการแก้ไขลูกค้า", "error");
    return;
  }

  const form = new FormData(el.contactForm);
  const key = nullable(form.get("id")) || createDraftKey();
  const isPrimary = form.get("is_primary") === "on";
  const contact = {
    id: key.startsWith("new-") ? null : key,
    customer_id: form.get("customer_id"),
    contact_name: String(form.get("contact_name") || "").trim(),
    position: nullable(form.get("position")),
    phone: nullable(form.get("phone")),
    email: nullable(form.get("email")),
    line_id: nullable(form.get("line_id")),
    is_primary: isPrimary,
    is_active: form.get("is_active") === "on",
    _key: key,
    _isNew: key.startsWith("new-")
  };

  if (isPrimary) {
    draft.contacts.forEach((item) => {
      item.is_primary = false;
    });
  }
  const index = draft.contacts.findIndex((item) => item._key === key);
  if (index >= 0) draft.contacts[index] = contact;
  else draft.contacts.push(contact);

  draft.dirty = true;
  closeDialog(el.contactDialog);
  renderCustomerDraftContacts();
  scheduleCustomerDraftSave();
  showToast("เพิ่มการเปลี่ยนแปลงผู้ติดต่อแล้ว กรุณากดบันทึก");
}
  async function renderProfilePage() {
    const profile = state.profile;
    const accent = normalizeHex(profile.theme_accent || "#2f68e6");
    const presets = [
      "#2563eb", "#2f68e6", "#0ea5e9", "#0891b2", "#0d9488", "#059669",
      "#16a34a", "#65a30d", "#ca8a04", "#ea580c", "#dc2626", "#e11d48",
      "#db2777", "#c026d3", "#9333ea", "#7c3aed", "#4f46e5", "#4338ca",
      "#334155", "#475569", "#0f766e", "#0369a1", "#1d4ed8", "#6d28d9"
    ];

    el.mainContent.innerHTML = `
      ${pageHeader(
        "ข้อมูลส่วนตัวและรูปแบบสี",
        "",
        "",
        [{ label: "ข้อมูลส่วนตัวและรูปแบบสี" }]
      )}

      <div class="profile-layout">
        <section class="panel profile-summary-card">
          <div class="profile-hero">
            ${avatarMarkup(profile, "profile-avatar-large")}
            <div class="profile-hero-copy">
              <h2>${h(profile.display_name)}</h2>
              <p>${h(profile.email)}</p>
              <span class="role-badge">${h(profile.position || "ไม่ระบุตำแหน่ง")}</span>
              <button type="button" class="btn btn-secondary btn-small"
                      data-action="open-avatar-editor" data-id="${h(profile.id)}">
                ${icon("camera")} เปลี่ยนรูปโปรไฟล์
              </button>
            </div>
          </div>
          <div class="panel-body">
            <dl class="meta-list">
              <dt>ชื่อที่แสดง</dt><dd>${h(profile.display_name)}</dd>
              <dt>อีเมล</dt><dd>${h(profile.email)}</dd>
              <dt>ตำแหน่ง</dt><dd>${h(profile.position || "-")}</dd>
              <dt>สถานะ</dt>
              <dd><span class="status-badge" data-status="${profile.is_active ? "active" : "inactive"}">
                ${profile.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
              </span></dd>
              <dt>สร้างบัญชี</dt><dd>${h(formatDateTime(profile.created_at))}</dd>
              <dt>อัปเดตล่าสุด</dt><dd>${h(formatDateTime(profile.updated_at))}</dd>
            </dl>
          </div>
        </section>

        <div class="profile-settings-stack">
          <form id="profile-details-form" class="panel" novalidate>
            <div class="panel-header"><h2>ข้อมูลส่วนตัว</h2></div>
            <div class="panel-body">
              <label>
                <span class="field-label">ชื่อที่แสดง <span class="required">*</span></span>
                <input name="display_name" maxlength="200" value="${h(profile.display_name)}" required>
              </label>
              <label>
                <span class="field-label">ตำแหน่ง</span>
                <input class="position-readonly" value="${h(profile.position || "ไม่ระบุตำแหน่ง")}" readonly
                       aria-describedby="profile-position-help">
                <small id="profile-position-help" class="field-help">แก้ไขได้โดยผู้ดูแลระบบเท่านั้น</small>
              </label>
              <label>
                <span class="field-label">อีเมล</span>
                <input value="${h(profile.email)}" disabled>
              </label>
            </div>
            <div class="panel-footer-actions">
              <button id="profile-details-save" type="submit" class="btn btn-primary">
                ${icon("save")} บันทึกข้อมูลส่วนตัว
              </button>
            </div>
          </form>

          <form id="profile-theme-form" class="panel theme-settings-card" novalidate>
            <div class="panel-header">
              <h2>ตั้งค่ารูปแบบสี</h2>
              <span class="theme-preview-dot" style="--preview-color:${h(accent)}" aria-hidden="true"></span>
            </div>
            <div class="panel-body">
              <fieldset class="theme-mode-group">
                <legend>โหมดการแสดงผล</legend>
                ${[
                  ["light", "สว่าง", "พื้นหลังสว่าง"],
                  ["dark", "มืด", "พื้นหลังสีเข้ม"],
                  ["system", "ตามอุปกรณ์", "ปรับตามค่าของอุปกรณ์"]
                ].map(([value, title, desc]) => `
                  <label class="theme-mode-card">
                    <input type="radio" name="theme_mode" value="${value}"
                           ${(profile.theme_mode || "light") === value ? "checked" : ""}>
                    <span><strong>${title}</strong><small>${desc}</small></span>
                  </label>
                `).join("")}
              </fieldset>

              <div class="form-section">
                <div class="form-section-heading"><h3>สีหลัก</h3></div>
                <div class="theme-color-editor">
                  <label class="native-color-label">
                    <span>เลือกสี</span>
                    <input id="theme-accent-picker" type="color" value="${h(accent)}" aria-label="เลือกสีหลัก">
                  </label>
                  <label>
                    <span class="field-label">รหัสสี <span class="required">*</span></span>
                    <input id="theme-accent-hex" name="theme_accent" type="text" value="${h(accent)}"
                           pattern="^#[0-9A-Fa-f]{6}$" maxlength="7" placeholder="#2f68e6" required>
                  </label>
                  <div class="theme-live-preview" style="--preview-accent:${h(accent)}">
                    <span class="theme-preview-swatch"></span>
                    <div><strong>ตัวอย่างสีหลัก</strong></div>
                  </div>
                </div>

                <div class="color-preset-grid" aria-label="สีสำเร็จรูป">
                  ${presets.map((color) => `
                    <button type="button" class="color-preset ${color === accent ? "active" : ""}"
                            style="--preset-color:${color}" data-action="select-theme-color"
                            data-color="${color}" aria-label="เลือกสี ${color}" title="${color}">
                      <span></span>
                    </button>
                  `).join("")}
                </div>
              </div>
            </div>
            <div class="panel-footer-actions">
              <button type="button" class="btn btn-secondary" data-action="reset-theme-preview">
                ${icon("refresh")} คืนค่าที่บันทึกไว้
              </button>
              <button id="profile-theme-save" type="submit" class="btn btn-primary">
                ${icon("save")} บันทึกรูปแบบสี
              </button>
            </div>
          </form>
        </div>
      </div>`;
  }

  async function saveMyProfileDetails(event) {
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;

    const button = document.getElementById("profile-details-save");
    const data = new FormData(form);
    setButtonBusy(button, true, "กำลังบันทึก...");
    setElementBusy(form, true, "กำลังบันทึกข้อมูลส่วนตัว...");

    try {
      const { data: updated, error } = await state.client.rpc("update_my_profile_display_name", {
        p_display_name: String(data.get("display_name") || "").trim()
      });
      if (error) throw error;

      const row = Array.isArray(updated) ? updated[0] : updated;
      state.profile = { ...state.profile, ...(row || {}) };
      state.profiles = state.profiles.map((profile) =>
        profile.id === state.profile.id ? { ...profile, ...(row || {}) } : profile
      );
      el.currentUserName.textContent = state.profile.display_name || "-";
      el.currentUserRole.textContent = state.profile.position || "ไม่ระบุตำแหน่ง";
      renderAvatarInto(el.currentUserAvatar, state.profile);
      showToast("บันทึกข้อมูลส่วนตัวแล้ว");
      await renderProfilePage();
    } catch (error) {
      showError(error, "บันทึกข้อมูลส่วนตัวไม่สำเร็จ");
    } finally {
      setElementBusy(form, false);
      setButtonBusy(button, false);
    }
  }

  function previewThemeFromProfileForm() {
    const form = document.getElementById("profile-theme-form");
    if (!form) return;
    const mode = form.querySelector('input[name="theme_mode"]:checked')?.value || "light";
    const hexInput = document.getElementById("theme-accent-hex");
    const accent = normalizeHex(hexInput?.value, state.profile?.theme_accent || "#2f68e6");
    if (hexInput && /^#[0-9a-f]{6}$/i.test(hexInput.value)) {
      applyThemePreferences({ theme_mode: mode, theme_accent: accent }, { preview: true });
      const dot = form.querySelector(".theme-preview-dot");
      const preview = form.querySelector(".theme-live-preview");
      if (dot) dot.style.setProperty("--preview-color", accent);
      if (preview) preview.style.setProperty("--preview-accent", accent);
      form.querySelectorAll(".color-preset").forEach((button) => {
        button.classList.toggle("active", button.dataset.color.toLowerCase() === accent);
      });
    }
  }

  async function saveMyProfilePreferences(event) {
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;
    const button = document.getElementById("profile-theme-save");
    const mode = form.querySelector('input[name="theme_mode"]:checked')?.value || "light";
    const accent = normalizeHex(document.getElementById("theme-accent-hex")?.value);

    setButtonBusy(button, true, "กำลังบันทึก...");
    setElementBusy(form, true, "กำลังบันทึกรูปแบบสี...");
    try {
      const { data, error } = await state.client.rpc("update_my_profile_preferences", {
        p_theme_mode: mode,
        p_theme_accent: accent
      });
      if (error) {
        if (/function .*update_my_profile_preferences.*does not exist|Could not find the function/i.test(error.message || "")) {
          throw new Error("ยังไม่ได้ติดตั้งส่วนตั้งค่ารูปแบบสี");
        }
        throw error;
      }

      state.profile = {
        ...state.profile,
        ...(data || {}),
        theme_mode: data?.theme_mode || mode,
        theme_accent: normalizeHex(data?.theme_accent || accent)
      };
      state.ui.themePreviewDirty = false;
      applyThemePreferences(state.profile);
      showToast("บันทึกรูปแบบสีแล้ว");
      await renderProfilePage();
    } catch (error) {
      showError(error, "บันทึกรูปแบบสีไม่สำเร็จ");
    } finally {
      setElementBusy(form, false);
      setButtonBusy(button, false);
    }
  }


async function loadReportCustomersByIds(customerIds = []) {
  const uniqueIds = [...new Set(customerIds.filter(validUuid))];
  const known = new Set(state.customers.map((customer) => customer.id));
  const missing = uniqueIds.filter((id) => !known.has(id));
  if (!missing.length) return;
  const { data, error } = await state.client
    .from("customers")
    .select("id,legal_name,short_name,account_status,is_archived,updated_at")
    .in("id", missing)
    .limit(1000);
  if (error) throw error;
  state.customers = [...state.customers, ...(data || []).filter((row) => !known.has(row.id))];
}

function validateSelectedReportCustomers(customerIds = []) {
  const invalid = customerIds.filter((customerId) => {
    const customer = state.customers.find((item) => item.id === customerId);
    return !customer || customer.is_archived || customer.account_status !== "active";
  });
  if (!invalid.length) return true;
  showToast(
    `ลูกค้าที่เลือก ${invalid.map(customerDisplayName).join(", ")} ไม่อยู่ในสถานะใช้งาน กรุณานำออกก่อนบันทึก`,
    "error"
  );
  return false;
}

function currentReportCustomerIds() {
  const ids = new Set(state.currentDailyGroupCustomerIds || []);
  (state.currentDailyItemCustomers || []).forEach((row) => ids.add(row.customer_id));
  return [...ids];
}

function invalidCurrentReportCustomerIds() {
  return currentReportCustomerIds().filter((customerId) => {
    const customer = state.customers.find((item) => item.id === customerId);
    return !customer || customer.is_archived || customer.account_status !== "active";
  });
}

function reportCustomerStateLabel(customer) {
  if (!customer) return "ไม่พบข้อมูล";
  if (customer.is_archived) return "ถูกลบ";
  if (customer.account_status !== "active") return "ไม่ใช้งาน";
  return "";
}

function customerDisplayName(customerId) {
  const customer = state.customers.find((item) => item.id === customerId);
  return customer?.legal_name || "ลูกค้าที่ไม่พบในระบบ";
}

function reportCustomerNames(customerIds = []) {
  return customerIds.map(customerDisplayName);
}

function reportItemCustomerIds(itemId, itemCustomerRows = state.currentDailyItemCustomers) {
  return itemCustomerRows
    .filter((row) => row.item_id === itemId)
    .map((row) => row.customer_id);
}

function reportCustomerMultiSelect(name, selectedIds = [], disabled = false, prefix = "report-customer") {
  const selected = new Set(selectedIds);
  const customers = state.customers
    .filter((customer) =>
      (!customer.is_archived && customer.account_status === "active")
      || selected.has(customer.id)
    )
    .sort((a, b) => a.legal_name.localeCompare(b.legal_name, "th"));
  const selectedCustomers = customers.filter((customer) => selected.has(customer.id));
  const selectedNames = selectedCustomers.map((customer) => customer.legal_name);
  const invalidSelectedCount = selectedCustomers.filter((customer) =>
    customer.is_archived || customer.account_status !== "active"
  ).length;
  const summary = selectedNames.length === 0
    ? "ยังไม่ได้เลือกลูกค้า"
    : selectedNames.length === 1
      ? selectedNames[0]
      : `เลือก ${selectedNames.length.toLocaleString("th-TH")} ราย · ${selectedNames.slice(0, 2).join(", ")}${selectedNames.length > 2 ? ` +${selectedNames.length - 2}` : ""}`;

  return `
    <details class="customer-multiselect ${disabled ? "is-disabled" : ""}" data-customer-multiselect
             ${disabled ? 'data-disabled="true"' : ""}>
      <summary aria-disabled="${disabled ? "true" : "false"}">
        <span class="customer-multiselect-summary" data-multiselect-summary>${h(summary)}</span>
        <span class="customer-multiselect-count ${invalidSelectedCount ? "has-warning" : ""}" data-multiselect-count>
          ${selectedNames.length.toLocaleString("th-TH")}
        </span>
      </summary>
      <div class="customer-multiselect-dropdown">
        <div class="customer-multiselect-toolbar">
          <input type="search" data-multiselect-search placeholder="ค้นหาชื่อนิติบุคคล..." autocomplete="off"
                 aria-label="ค้นหาลูกค้าในรายการ">
          <div class="customer-multiselect-actions">
            <button type="button" class="btn btn-tertiary btn-small"
                    data-action="select-all-report-customers" ${disabled ? "disabled" : ""}>เลือกทั้งหมด</button>
            <button type="button" class="btn btn-tertiary btn-small"
                    data-action="clear-report-customers" ${disabled ? "disabled" : ""}>ล้าง</button>
          </div>
        </div>
        <div class="customer-multiselect-options" role="group" aria-label="รายชื่อลูกค้าที่ใช้งาน">
          ${customers.map((customer) => {
            const id = `${prefix}-${customer.id}`;
            const statusText = reportCustomerStateLabel(customer);
            const invalid = Boolean(statusText);
            const searchText = `${customer.legal_name} ${customer.short_name || ""}`.toLowerCase();
            return `
              <label class="customer-multiselect-option ${invalid ? "is-invalid-customer" : ""}"
                     for="${h(id)}" data-search-text="${h(searchText)}">
                <input id="${h(id)}" type="checkbox" name="${h(name)}" value="${h(customer.id)}"
                       data-customer-multiselect-option
                       ${selected.has(customer.id) ? "checked" : ""} ${disabled ? "disabled" : ""}>
                <span>
                  <strong>${h(customer.legal_name)}</strong>
                  ${statusText
                    ? `<small><span class="text-danger">${h(statusText)} — ต้องนำออกก่อนส่ง</span></small>`
                    : ""}
                </span>
              </label>`;
          }).join("") || '<p class="muted customer-multiselect-empty">ยังไม่มีลูกค้าที่ใช้งาน</p>'}
        </div>
      </div>
    </details>`;
}

function updateCustomerMultiSelectSummary(scope) {
  const picker = scope?.matches?.("[data-customer-multiselect]")
    ? scope
    : scope?.closest?.("[data-customer-multiselect]");
  if (!picker) return;
  const selectedIds = [...picker.querySelectorAll("input[data-customer-multiselect-option]:checked")]
    .map((input) => input.value);
  const names = reportCustomerNames(selectedIds);
  const invalidCount = selectedIds.filter((customerId) => {
    const customer = state.customers.find((item) => item.id === customerId);
    return !customer || customer.is_archived || customer.account_status !== "active";
  }).length;
  const text = names.length === 0
    ? "ยังไม่ได้เลือกลูกค้า"
    : names.length === 1
      ? names[0]
      : `เลือก ${names.length.toLocaleString("th-TH")} ราย · ${names.slice(0, 2).join(", ")}${names.length > 2 ? ` +${names.length - 2}` : ""}`;
  const summary = picker.querySelector("[data-multiselect-summary]");
  const count = picker.querySelector("[data-multiselect-count]");
  if (summary) summary.textContent = text;
  if (count) {
    count.textContent = names.length.toLocaleString("th-TH");
    count.classList.toggle("has-warning", invalidCount > 0);
    count.title = invalidCount ? `มีลูกค้าที่ไม่พร้อมใช้งาน ${invalidCount} ราย` : "";
  }
}

function refreshAllCustomerMultiSelectSummaries() {
  document.querySelectorAll("[data-customer-multiselect]").forEach(updateCustomerMultiSelectSummary);
}

function filterCustomerMultiSelect(searchInput) {
  const picker = searchInput.closest("[data-customer-multiselect]");
  if (!picker) return;
  const query = searchInput.value.trim().toLowerCase();
  picker.querySelectorAll("[data-search-text]").forEach((option) => {
    option.classList.toggle("hidden", Boolean(query) && !option.dataset.searchText.includes(query));
  });
}

function setVisibleCustomerMultiSelectOptions(button, checked) {
  const picker = button.closest("[data-customer-multiselect]");
  if (!picker) return;
  picker.querySelectorAll(".customer-multiselect-option:not(.hidden) input[data-customer-multiselect-option]:not(:disabled)")
    .forEach((input) => {
      if (checked && input.closest(".is-invalid-customer")) return;
      input.checked = checked;
    });
  updateCustomerMultiSelectSummary(picker);
}

function checkedValues(scope, name) {
  return [...scope.querySelectorAll(`input[name="${CSS.escape(name)}"]:checked`)].map((input) => input.value);
}

function updateReportGroupUsageLabels() {
  const names = reportCustomerNames(state.currentDailyGroupCustomerIds);
  const text = names.length ? names.join(", ") : "ยังไม่ได้เลือกลูกค้าในกลุ่มรายงาน";
  document.querySelectorAll("[data-report-group-summary]").forEach((node) => {
    node.textContent = text;
  });
  const count = document.getElementById("report-group-customer-count");
  if (count) count.textContent = `${names.length.toLocaleString("th-TH")} ราย`;
}

function syncReportCustomerPicker(toggle) {
  const editor = toggle.closest(".report-item-editor");
  const picker = editor?.querySelector("[data-explicit-customer-picker]");
  if (!picker) return;
  const useGroup = toggle.checked;
  const summary = editor.querySelector("[data-report-group-summary]");
  picker.classList.toggle("hidden", useGroup);
  summary?.classList.toggle("hidden", !useGroup);
  const details = picker.matches("[data-customer-multiselect]")
    ? picker
    : picker.querySelector("[data-customer-multiselect]");
  if (useGroup && details) details.open = false;
  picker.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.disabled = useGroup || toggle.disabled;
  });
  picker.querySelectorAll("[data-action='select-all-report-customers'], [data-action='clear-report-customers']")
    .forEach((button) => { button.disabled = useGroup || toggle.disabled; });
  updateCustomerMultiSelectSummary(details || picker);
}

async function renderDailyReportPage(workDate = null) {
  assertCanWriteOwnDailyReport();
  await loadCustomers();
  const selectedDate = workDate || dateValue(document, "daily-report-date") || bangkokDate();
  const { data: report, error } = await state.client
    .from("daily_reports")
    .select("*")
    .eq("user_id", state.profile.id)
    .eq("work_date", selectedDate)
    .maybeSingle();
  if (error) throw error;

  let items = [];
  let itemCustomers = [];
  let groupCustomerIds = [];
  if (report) {
    const itemsResult = await state.client
      .from("daily_report_items")
      .select("id,report_id,section,detail,sort_order,use_report_customer_group,created_at,updated_at")
      .eq("report_id", report.id)
      .order("section")
      .order("sort_order")
      .order("created_at");
    if (itemsResult.error) throw itemsResult.error;
    items = itemsResult.data || [];

    const groupResult = await state.client
      .from("daily_report_group_customers")
      .select("customer_id")
      .eq("report_id", report.id);
    if (groupResult.error) throw groupResult.error;
    groupCustomerIds = (groupResult.data || []).map((row) => row.customer_id);

    if (items.length) {
      const relationResult = await state.client
        .from("daily_report_item_customers")
        .select("item_id,customer_id")
        .in("item_id", items.map((item) => item.id));
      if (relationResult.error) throw relationResult.error;
      itemCustomers = relationResult.data || [];
    }
  }

  await loadReportCustomersByIds([
    ...groupCustomerIds,
    ...itemCustomers.map((row) => row.customer_id)
  ]);

  state.currentDailyReport = report;
  state.currentDailyItems = items;
  state.currentDailyItemCustomers = itemCustomers;
  state.currentDailyGroupCustomerIds = groupCustomerIds;
  const locked = report?.status === "acknowledged";
  const invalidCustomerIds = invalidCurrentReportCustomerIds();

  const pageActions = report
    ? `<button class="btn btn-secondary" data-action="print-own-report">พิมพ์ / บันทึกเป็นไฟล์</button>`
    : "";

  el.mainContent.innerHTML = `
    ${pageHeader(
      "รายงานประจำวัน",
      "สรุปสิ่งที่ทำวันนี้และวางแผนงานวันพรุ่งนี้",
      pageActions,
      [{ label: "รายงานประจำวัน" }]
    )}
    <section class="panel daily-report-panel">
      <div class="toolbar">
        <div class="toolbar-row">
          <div class="toolbar-field">
            ${dateControlHtml({
              id: "daily-report-date",
              name: "daily_report_date",
              label: "วันที่รายงาน",
              value: selectedDate,
              required: true
            })}
          </div>
          <div class="toolbar-field">
            <label>สถานะ</label>
            <div class="toolbar-value">
              ${report
                ? `<span class="status-badge" data-status="${h(report.status)}">${h(label("report_status", report.status))}</span>`
                : `<span class="muted">ยังไม่มีรายงาน</span>`}
            </div>
          </div>
          <div class="toolbar-field report-author-toolbar">
            <label>ผู้จัดทำ</label>
            ${profileIdentityMarkup(state.profile, {
              avatarClass: "profile-avatar-small",
              subtitle: state.profile?.position || "ไม่ระบุตำแหน่ง"
            })}
          </div>
          ${report ? `
            <div class="toolbar-summary toolbar-summary-end">
              <span>อัปเดตล่าสุด ${h(formatDateTime(report.updated_at))}</span>
            </div>` : ""}
        </div>
      </div>

      <div class="panel-body">
        ${report?.status === "revision_required" ? `
          <div class="alert alert-danger"><strong>เหตุผลที่ผู้จัดการส่งกลับ:</strong>&nbsp;${h(report.last_revision_reason || "-")}</div>
        ` : ""}
        ${report && invalidCustomerIds.length ? `
          <div class="alert alert-danger">
            <strong>พบลูกค้าที่ไม่พร้อมใช้งาน ${invalidCustomerIds.length.toLocaleString("th-TH")} ราย</strong>
            <span>กรุณานำออกจากกลุ่มหรือรายการก่อนส่งรายงานให้ผู้จัดการ</span>
          </div>` : ""}

        ${!report ? `
          <div class="empty-state">
            <strong>ยังไม่มีรายงานสำหรับวันที่ ${h(formatDate(selectedDate))}</strong>
            <span>สร้างรายงานแล้วเพิ่มรายการของวันนี้และวันพรุ่งนี้ได้หลายข้อ</span>
            <button class="btn btn-primary" data-action="create-daily-report" data-date="${h(selectedDate)}">${icon("plus")} สร้างรายงาน</button>
          </div>
        ` : `
          ${locked ? `<div class="alert alert-info">ผู้จัดการรับทราบแล้ว รายงานนี้ถูกล็อกและไม่สามารถแก้ไขได้</div>` : ""}
          <section class="report-customer-group panel-subsection">
            <div class="subsection-header">
              <div>
                <h2>กลุ่มลูกค้าของรายงาน</h2>
                <p class="muted">เลือกครั้งเดียวแล้วให้หลายรายการอ้างอิงกลุ่มนี้ได้</p>
              </div>
              <span id="report-group-customer-count" class="muted">${groupCustomerIds.length.toLocaleString("th-TH")} ราย</span>
            </div>
            ${reportCustomerMultiSelect("report_group_customer_id", groupCustomerIds, locked, `report-group-${report.id}`)}
            ${!locked ? `
              <div class="report-group-actions">
                <button type="button" class="btn btn-secondary btn-small"
                        data-action="save-report-customer-group" data-id="${h(report.id)}">
                  ${icon("save")} บันทึกกลุ่มลูกค้า
                </button>
              </div>` : ""}
          </section>

          ${renderDailySection("today", "วันนี้ — สิ่งที่ทำ", items, locked)}
          ${renderDailySection("tomorrow", "วันพรุ่งนี้ — แผนงาน", items, locked)}
          ${["draft", "revision_required"].includes(report.status) ? `
            <div class="page-actions report-submit-actions">
              <button class="btn btn-primary" data-action="submit-report" data-id="${h(report.id)}">ส่งรายงานให้ผู้จัดการ</button>
            </div>` : ""}
        `}
      </div>
    </section>`;

  document.querySelectorAll('[data-field="use_report_customer_group"], input[name="use_report_customer_group"]').forEach(syncReportCustomerPicker);
  updateReportGroupUsageLabels();
  refreshAllCustomerMultiSelectSummaries();
}

function renderDailySection(section, title, items, locked) {
  const sectionItems = items.filter((item) => item.section === section);
  const hasGroup = state.currentDailyGroupCustomerIds.length > 0;
  return `
    <section class="report-section">
      <h2>${h(title)}</h2>
      <div class="stack">
        ${sectionItems.map((item) => {
          const selectedIds = reportItemCustomerIds(item.id);
          const useGroup = Boolean(item.use_report_customer_group);
          return `
            <article class="report-item-editor" data-item-id="${h(item.id)}">
              <textarea data-field="detail" maxlength="5000" ${locked ? "disabled" : ""}>${h(item.detail)}</textarea>
              <label class="check-label report-use-group">
                <input type="checkbox" data-field="use_report_customer_group"
                       ${useGroup ? "checked" : ""} ${locked ? "disabled" : ""}>
                <span>ใช้กลุ่มลูกค้าของรายงาน</span>
              </label>
              <small class="field-help" data-report-group-summary></small>
              <div class="report-customer-picker ${useGroup ? "hidden" : ""}" data-explicit-customer-picker>
                ${reportCustomerMultiSelect("item_customer_id", selectedIds, locked || useGroup, `item-${item.id}`)}
              </div>
              ${!locked ? `
                <div class="report-item-actions">
                  <button class="btn btn-light btn-small" data-action="save-report-item" data-id="${h(item.id)}">บันทึก</button>
                  <button class="btn btn-danger btn-small" data-action="delete-report-item" data-id="${h(item.id)}">ลบ</button>
                </div>` : ""}
            </article>`;
        }).join("") || '<p class="muted">ยังไม่มีรายการ</p>'}
      </div>
      ${!locked ? `
        <form class="new-report-item-form" data-section="${h(section)}">
          <div class="report-item-editor">
            <textarea name="detail" maxlength="5000" placeholder="พิมพ์สิ่งที่ทำหรือแผนงาน..." required></textarea>
            <label class="check-label report-use-group">
              <input type="checkbox" name="use_report_customer_group" ${hasGroup ? "checked" : ""}>
              <span>ใช้กลุ่มลูกค้าของรายงาน</span>
            </label>
            <small class="field-help" data-report-group-summary></small>
            <div class="report-customer-picker ${hasGroup ? "hidden" : ""}" data-explicit-customer-picker>
              ${reportCustomerMultiSelect("item_customer_id", [], hasGroup, `new-${section}`)}
            </div>
            <div class="report-item-actions">
              <button class="btn btn-primary btn-small" type="submit">+ เพิ่มข้อ</button>
            </div>
          </div>
        </form>` : ""}
    </section>`;
}

async function saveDailyReportCustomerGroup(reportId, button) {
  assertCanWriteOwnDailyReport();
  const section = button.closest(".report-customer-group");
  const customerIds = checkedValues(section, "report_group_customer_id");
  if (!validateSelectedReportCustomers(customerIds)) return;
  setButtonBusy(button, true, "กำลังบันทึก...");
  try {
    const { error } = await state.client.rpc("save_daily_report_customer_group", {
      p_report_id: reportId,
      p_customer_ids: customerIds
    });
    if (error) throw error;
    state.currentDailyGroupCustomerIds = customerIds;
    updateReportGroupUsageLabels();
    showToast("บันทึกกลุ่มลูกค้าของรายงานแล้ว");
  } catch (error) {
    showError(error, "บันทึกกลุ่มลูกค้าไม่สำเร็จ");
  } finally {
    setButtonBusy(button, false);
  }
}
  async function createDailyReport(date) {
  assertCanWriteOwnDailyReport();
    setLoading(true, "กำลังสร้างรายงาน...");
    try {
      const { error } = await state.client.from("daily_reports").insert({
        user_id: state.profile.id,
        work_date: date
      });
      if (error) throw error;
      showToast("สร้างรายงานแล้ว");
      await renderDailyReportPage(date);
    } catch (error) {
      showError(error, "สร้างรายงานไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

async function addDailyReportItem(event) {
  assertCanWriteOwnDailyReport();
  event.preventDefault();
  const form = event.target;
  if (!form.reportValidity() || !state.currentDailyReport) return;
  const button = form.querySelector('button[type="submit"]');
  setButtonBusy(button, true, "กำลังเพิ่ม...");
  try {
    const data = new FormData(form);
    const section = form.dataset.section;
    const currentSection = state.currentDailyItems.filter((item) => item.section === section);
    const sortOrder = currentSection.reduce((max, item) => Math.max(max, Number(item.sort_order || 0)), -1) + 1;
    const useGroup = form.querySelector('input[name="use_report_customer_group"]')?.checked || false;
    const customerIds = useGroup ? [] : checkedValues(form, "item_customer_id");
    if (!useGroup && !validateSelectedReportCustomers(customerIds)) return;
    if (useGroup && !validateSelectedReportCustomers(state.currentDailyGroupCustomerIds)) return;
    const { error } = await state.client.rpc("save_daily_report_item_v3", {
      p_item_id: null,
      p_report_id: state.currentDailyReport.id,
      p_section: section,
      p_detail: String(data.get("detail") || "").trim(),
      p_sort_order: sortOrder,
      p_use_report_customer_group: useGroup,
      p_customer_ids: customerIds
    });
    if (error) throw error;
    showToast("เพิ่มรายการแล้ว");
    await renderDailyReportPage(state.currentDailyReport.work_date);
  } catch (error) {
    showError(error, "เพิ่มรายการไม่สำเร็จ");
  } finally {
    setButtonBusy(button, false);
  }
}

async function saveDailyReportItem(itemId, button) {
  assertCanWriteOwnDailyReport();
  const editor = button.closest(".report-item-editor");
  const detail = editor.querySelector('[data-field="detail"]').value.trim();
  const useGroup = editor.querySelector('[data-field="use_report_customer_group"]')?.checked || false;
  const customerIds = useGroup ? [] : checkedValues(editor, "item_customer_id");
  if (!useGroup && !validateSelectedReportCustomers(customerIds)) return;
  if (useGroup && !validateSelectedReportCustomers(state.currentDailyGroupCustomerIds)) return;
  if (!detail) {
    showToast("กรุณากรอกรายละเอียด", "error");
    return;
  }
  const item = state.currentDailyItems.find((row) => row.id === itemId);
  if (!item || !state.currentDailyReport) {
    showToast("ไม่พบรายการรายงาน", "error");
    return;
  }
  setButtonBusy(button, true);
  try {
    const { error } = await state.client.rpc("save_daily_report_item_v3", {
      p_item_id: itemId,
      p_report_id: state.currentDailyReport.id,
      p_section: item.section,
      p_detail: detail,
      p_sort_order: Number(item.sort_order || 0),
      p_use_report_customer_group: useGroup,
      p_customer_ids: customerIds
    });
    if (error) throw error;
    showToast("บันทึกรายการแล้ว");
    await renderDailyReportPage(state.currentDailyReport.work_date);
  } catch (error) {
    showError(error, "บันทึกรายการไม่สำเร็จ");
  } finally {
    setButtonBusy(button, false);
  }
}
async function submitDailyReport(reportId, button) {
  assertCanWriteOwnDailyReport();
  const invalidIds = invalidCurrentReportCustomerIds();
  if (invalidIds.length) {
    showToast(
      `ยังส่งรายงานไม่ได้ กรุณานำลูกค้าที่ไม่พร้อมใช้งานออก: ${invalidIds.map(customerDisplayName).join(", ")}`,
      "error"
    );
    return;
  }
  const ok = await confirmAction("ยืนยันการส่งรายงานให้ผู้จัดการหรือไม่?", "ส่งรายงาน", "ส่งรายงาน");
  if (!ok) return;
  setButtonBusy(button, true, "กำลังส่ง...");
  try {
    const { error } = await state.client.rpc("submit_daily_report", { p_report_id: reportId });
    if (error) throw error;
    showToast("ส่งรายงานแล้ว");
    await renderDailyReportPage(state.currentDailyReport.work_date);
  } catch (error) {
    showError(error, "ส่งรายงานไม่สำเร็จ");
  } finally {
    setButtonBusy(button, false);
  }
}

async function renderManagerReportsPage() {
  try { state.grids.managerReports?.destroy?.(); } catch (error) { console.warn(error); }
  state.grids.managerReports = null;
  await Promise.all([loadCommonData(), loadCustomers()]);
  const fromDate = bangkokDate(-60);
  const { data, error } = await state.client
    .from("daily_reports")
    .select("*")
    .gte("work_date", fromDate)
    .in("status", ["submitted", "acknowledged", "revision_required"])
    .order("work_date", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(1000);
  if (error) throw error;
  state.managerReports = data || [];

  if (!state.ui.managerFilters.date) state.ui.managerFilters.date = bangkokDate();
  if (state.ui.managerFilters.status === "draft") state.ui.managerFilters.status = "";
  const filters = state.ui.managerFilters;

  el.mainContent.innerHTML = `
    ${pageHeader(
      "รายงานของทีม",
      "ตรวจรายงาน รับทราบ หรือส่งกลับให้ผู้ใช้งานแก้ไข",
      "",
      [{ label: "รายงานของทีม" }]
    )}
    <section class="panel">
      <div class="toolbar manager-report-toolbar">
        <div class="manager-report-toolbar-row">
          <div class="toolbar-field">
            ${dateControlHtml({
              id: "manager-report-date",
              name: "manager_report_date",
              label: "วันที่",
              value: filters.date || bangkokDate(),
              required: true
            })}
          </div>
          <div class="toolbar-field">
            <label for="manager-report-user"><span class="field-label">ผู้ใช้งาน</span></label>
            <select id="manager-report-user">
              <option value="">ทั้งหมด</option>
              ${state.profiles.filter((profile) => profile.is_active).map((profile) => `
                <option value="${h(profile.id)}" ${filters.userId === profile.id ? "selected" : ""}>${h(profile.display_name)}</option>
              `).join("")}
            </select>
          </div>
          <div class="toolbar-field">
            <label for="manager-report-status"><span class="field-label">สถานะ</span></label>
            <select id="manager-report-status">
              <option value="">ทั้งหมด</option>
              <option value="submitted" ${filters.status === "submitted" ? "selected" : ""}>ส่งแล้ว</option>
              <option value="acknowledged" ${filters.status === "acknowledged" ? "selected" : ""}>รับทราบแล้ว</option>
              <option value="revision_required" ${filters.status === "revision_required" ? "selected" : ""}>ส่งกลับให้แก้ไข</option>
            </select>
          </div>
          <div class="toolbar-actions manager-report-toolbar-actions">
            <button class="btn btn-secondary" data-action="reset-manager-filters">${icon("refresh")} ล้างตัวกรอง</button>
            <button class="btn btn-secondary" data-action="export-manager-reports-excel">${icon("download")} Excel</button>
          </div>
        </div>
      </div>
      <div class="grid-status-row">
        <span id="manager-grid-count" class="muted">กำลังเตรียมข้อมูล...</span>
        <span class="muted">ไฟล์ Excel จะแสดงเฉพาะข้อมูลตามตัวกรองปัจจุบัน</span>
      </div>
      <div id="manager-report-grid" class="ag-grid-shell" aria-label="รายงานของทีม">
        <div class="chart-loading"><span class="spinner"></span><span>กำลังสร้างตาราง...</span></div>
      </div>
    </section>`;
  renderManagerReportTable();
}

function renderManagerReportTable() {
  const container = document.getElementById("manager-report-grid");
  if (!container) return;
  const filters = state.ui.managerFilters;
  filters.date = dateValue(document, "manager-report-date") || filters.date || bangkokDate();
  filters.userId = document.getElementById("manager-report-user")?.value ?? filters.userId ?? "";
  filters.status = document.getElementById("manager-report-status")?.value ?? filters.status ?? "";

  const rows = state.managerReports
    .filter((report) =>
      report.work_date === filters.date
      && (!filters.userId || report.user_id === filters.userId)
      && (!filters.status || report.status === filters.status)
    )
    .map((report) => ({
      ...report,
      user_name: profileName(report.user_id),
      user_profile: profileById(report.user_id),
      status_text: label("report_status", report.status)
    }));

  state.filteredManagerRows = rows;
  const countNode = document.getElementById("manager-grid-count");
  if (countNode) countNode.textContent = `${rows.length.toLocaleString("th-TH")} รายงาน`;

  if (state.grids.managerReports) {
    state.grids.managerReports.setGridOption("rowData", rows);
    return;
  }

  createCommunityGrid(container, {
    rowData: rows,
    getRowId: (params) => params.data.id,
    columnDefs: [
      {
        headerName: "วันที่",
        field: "work_date",
        minWidth: 130,
        sort: "desc",
        valueFormatter: (params) => formatDate(params.value),
        filter: "agTextColumnFilter"
      },
      {
        headerName: "ผู้ใช้งาน",
        field: "user_name",
        minWidth: 220,
        flex: 1,
        cellRenderer: (params) => profileIdentityNode(params.data.user_profile, {
          avatarClass: "profile-avatar-grid",
          subtitle: params.data.user_profile?.position || "ไม่ระบุตำแหน่ง"
        })
      },
      {
        headerName: "สถานะ",
        field: "status_text",
        minWidth: 165,
        cellRenderer: (params) => statusBadgeNode(params.value, params.data.status)
      },
      {
        headerName: "รุ่นเนื้อหา",
        field: "content_version",
        minWidth: 110,
        maxWidth: 130,
        type: "numericColumn",
        filter: "agNumberColumnFilter"
      },
      {
        headerName: "ส่งเมื่อ",
        field: "submitted_at",
        minWidth: 175,
        valueFormatter: (params) => formatDateTime(params.value)
      },
      {
        headerName: "อัปเดตล่าสุด",
        field: "updated_at",
        minWidth: 185,
        valueFormatter: (params) => formatDateTime(params.value)
      },
      {
        headerName: "",
        colId: "actions",
        pinned: "right",
        width: 58,
        minWidth: 58,
        maxWidth: 58,
        sortable: false,
        filter: false,
        resizable: false,
        suppressHeaderMenuButton: true,
        cellRenderer: (params) => {
          const wrapper = document.createElement("div");
          wrapper.className = "grid-actions grid-actions-compact";
          wrapper.append(iconActionButtonNode({
            label: "เปิดรายงาน",
            action: "open-manager-report",
            id: params.data.id,
            iconName: "eye"
          }));
          return wrapper;
        }
      }
    ]
  }, "managerReports");
}

async function openManagerReport(reportId) {
  const report = state.managerReports.find((item) => item.id === reportId)
    || (await state.client.from("daily_reports").select("*").eq("id", reportId).single()).data;
  if (!report) throw new Error("ไม่พบรายงาน");
  if (report.status === "draft") {
    throw new Error("รายงานฉบับร่างเห็นได้เฉพาะเจ้าของและยังไม่พร้อมตรวจ");
  }

  const [itemsResult, eventsResult, groupResult] = await Promise.all([
    state.client
      .from("daily_report_items")
      .select("id,report_id,section,detail,sort_order,use_report_customer_group,created_at,updated_at")
      .eq("report_id", reportId)
      .order("section")
      .order("sort_order"),
    state.client.from("daily_report_events").select("*").eq("report_id", reportId).order("created_at"),
    state.client.from("daily_report_group_customers").select("customer_id").eq("report_id", reportId)
  ]);
  if (itemsResult.error) throw itemsResult.error;
  if (eventsResult.error) throw eventsResult.error;
  if (groupResult.error) throw groupResult.error;

  const items = itemsResult.data || [];
  let itemCustomers = [];
  if (items.length) {
    const relationResult = await state.client
      .from("daily_report_item_customers")
      .select("item_id,customer_id")
      .in("item_id", items.map((item) => item.id));
    if (relationResult.error) throw relationResult.error;
    itemCustomers = relationResult.data || [];
  }

  const groupCustomerIds = (groupResult.data || []).map((row) => row.customer_id);
  await loadReportCustomersByIds([
    ...groupCustomerIds,
    ...itemCustomers.map((row) => row.customer_id)
  ]);

  state.reviewReport = {
    report,
    items,
    itemCustomers,
    groupCustomerIds,
    events: eventsResult.data || []
  };

  const today = state.reviewReport.items.filter((item) => item.section === "today");
  const tomorrow = state.reviewReport.items.filter((item) => item.section === "tomorrow");

  el.reportDialogContent.innerHTML = `
    <div class="report-review-dialog">
      <div class="dialog-header report-review-header">
        <div class="report-review-heading">
          <span class="eyebrow">รายงานประจำวัน</span>
          <div class="report-review-title-row">
            <h2>รายงาน ${h(formatDate(report.work_date))}</h2>
            <span class="status-badge" data-status="${h(report.status)}">${h(label("report_status", report.status))}</span>
          </div>
          <div class="report-author-line">
            ${profileIdentityMarkup(profileById(report.user_id), {
              avatarClass: "report-author-avatar",
              subtitle: `รุ่นเนื้อหา ${report.content_version}`
            })}
          </div>
        </div>
        <button type="button" class="icon-button" data-action="close-dialog" data-dialog="report-dialog" aria-label="ปิด">✕</button>
      </div>

      <div class="dialog-body report-review-body">
        ${report.status === "revision_required"
          ? `<div class="alert alert-danger report-review-alert"><strong>เหตุผลที่ส่งกลับ</strong><span>${h(report.last_revision_reason || "-")}</span></div>`
          : ""}
        ${state.reviewReport.groupCustomerIds.length ? `
          <section class="report-summary report-group-summary">
            <h3>กลุ่มลูกค้าของรายงาน</h3>
            <div class="tag-list">
              ${reportCustomerNames(state.reviewReport.groupCustomerIds).map((name) => `<span class="tag">${h(name)}</span>`).join("")}
            </div>
          </section>` : ""}
        <div class="report-review-sections">
          ${renderReportReadOnlySection(
            "วันนี้ — สิ่งที่ทำ",
            today,
            state.reviewReport.itemCustomers,
            state.reviewReport.groupCustomerIds
          )}
          ${renderReportReadOnlySection(
            "วันพรุ่งนี้ — แผนงาน",
            tomorrow,
            state.reviewReport.itemCustomers,
            state.reviewReport.groupCustomerIds
          )}
        </div>

        <section class="report-history">
          <div class="report-history-header">
            <h3>ประวัติรายงาน</h3>
            <span class="muted">${state.reviewReport.events.length.toLocaleString("th-TH")} รายการ</span>
          </div>
          <div class="report-history-list">
            ${state.reviewReport.events.map((event) => `
              <article class="event-item">
                <strong>${h(label("event_type", event.event_type))}</strong>
                ${event.reason ? `<div class="event-reason">${h(event.reason)}</div>` : ""}
                <small class="muted">${h(profileName(event.actor_id))} · ${h(formatDateTime(event.created_at))}</small>
              </article>`).join("") || '<p class="muted">ไม่มีประวัติ</p>'}
          </div>
        </section>
      </div>

      <div class="dialog-actions report-review-actions">
        <button class="btn btn-light" data-action="print-review-report">พิมพ์ / บันทึกเป็นไฟล์</button>
        <span class="report-review-action-spacer" aria-hidden="true"></span>
        ${report.status === "submitted" ? `
          <button class="btn btn-danger" data-action="open-revision" data-id="${h(report.id)}" data-version="${h(report.content_version)}">ส่งกลับ</button>
          <button class="btn btn-success" data-action="ack-report" data-id="${h(report.id)}" data-version="${h(report.content_version)}">รับทราบ</button>
        ` : report.status === "acknowledged" ? `
          <button class="btn btn-danger" data-action="open-revision" data-id="${h(report.id)}" data-version="${h(report.content_version)}">เปิดให้แก้ไข</button>
        ` : ""}
        <button class="btn btn-light" data-action="close-dialog" data-dialog="report-dialog">ปิด</button>
      </div>
    </div>`;
  openDialog(el.reportDialog);
}

function renderReportReadOnlySection(title, items, itemCustomers = [], groupCustomerIds = []) {
  return `
    <section class="report-summary">
      <h3>${h(title)}</h3>
      ${items.length ? `
        <ol>
          ${items.map((item) => {
            const customerIds = item.use_report_customer_group
              ? groupCustomerIds
              : reportItemCustomerIds(item.id, itemCustomers);
            const tags = reportCustomerNames(customerIds)
              .map((name) => `<span class="tag">${h(name)}</span>`)
              .join("");
            return `<li>
              <div>${h(item.detail).replaceAll("\n", "<br>")}</div>
              ${tags ? `<div class="tag-list report-item-customer-tags">${tags}</div>` : ""}
            </li>`;
          }).join("")}
        </ol>` : '<p class="muted">ไม่มีรายการ</p>'}
    </section>`;
}

  async function acknowledgeReport(reportId, version, button) {
    const ok = await confirmAction("เมื่อรับทราบแล้วผู้ใช้งานจะแก้ไขรายงานไม่ได้ ยืนยันหรือไม่?", "รับทราบรายงาน", "รับทราบ");
    if (!ok) return;
    setButtonBusy(button, true, "กำลังรับทราบ...");
    try {
      const { error } = await state.client.rpc("acknowledge_daily_report", {
        p_report_id: reportId,
        p_expected_content_version: Number(version)
      });
      if (error) throw error;
      closeDialog(el.reportDialog);
      showToast("รับทราบรายงานแล้ว");
      await renderManagerReportsPage();
    } catch (error) {
      showError(error, "รับทราบรายงานไม่สำเร็จ");
      await openManagerReport(reportId);
    } finally {
      setButtonBusy(button, false);
    }
  }

  function openRevisionDialog(reportId, version) {
    el.revisionForm.reset();
    el.revisionForm.elements.report_id.value = reportId;
    el.revisionForm.elements.content_version.value = version;
    openDialog(el.revisionDialog);
  }

  async function requestRevision(event) {
    event.preventDefault();
    if (!el.revisionForm.reportValidity()) return;
    const button = document.getElementById("revision-submit-button");
    setButtonBusy(button, true, "กำลังส่งกลับ...");
    try {
      const data = new FormData(el.revisionForm);
      const reportId = data.get("report_id");
      const { error } = await state.client.rpc("request_daily_report_revision", {
        p_report_id: reportId,
        p_reason: String(data.get("reason")).trim(),
        p_expected_content_version: Number(data.get("content_version"))
      });
      if (error) throw error;
      closeDialog(el.revisionDialog);
      closeDialog(el.reportDialog);
      showToast("ส่งกลับให้แก้ไขแล้ว");
      await renderManagerReportsPage();
    } catch (error) {
      showError(error, "ส่งกลับไม่สำเร็จ");
    } finally {
      setButtonBusy(button, false);
    }
  }

  function getProfileDraft(profile) {
    if (!state.ui.profileDrafts.has(profile.id)) {
      state.ui.profileDrafts.set(profile.id, {
        display_name: profile.display_name,
        position: profile.position || "",
        role: profile.role,
        is_active: Boolean(profile.is_active)
      });
    }
    return state.ui.profileDrafts.get(profile.id);
  }
  async function renderAdminUsersPage() {
    try { state.grids.users?.destroy?.(); } catch (error) { console.warn(error); }
    state.grids.users = null;
    await loadCommonData(true);
    state.ui.profileDrafts.clear();

    el.mainContent.innerHTML = `
      ${pageHeader(
        "จัดการผู้ใช้",
        "แก้ไขชื่อที่แสดง ตำแหน่ง สิทธิ์ และสถานะบัญชี",
        "",
        [{ label: "จัดการผู้ใช้" }]
      )}
      <section class="panel">
        <div class="toolbar">
          <div class="toolbar-row">
            <div class="toolbar-field toolbar-search">
              <label for="admin-user-search">ค้นหาผู้ใช้</label>
              <input id="admin-user-search" type="search"
                     placeholder="ชื่อ ตำแหน่ง อีเมล หรือสิทธิ์" autocomplete="off">
            </div>
            <div class="toolbar-summary toolbar-summary-end">
              <span>${state.profiles.length.toLocaleString("th-TH")} บัญชี · มีผู้จัดการที่เปิดใช้งานได้หนึ่งคน</span>
            </div>
          </div>
        </div>
        <div id="admin-user-grid" class="ag-grid-shell" aria-label="รายชื่อผู้ใช้งาน">
          <div class="chart-loading"><span class="spinner"></span><span>กำลังสร้างตาราง...</span></div>
        </div>
      </section>`;

    const container = document.getElementById("admin-user-grid");
    createCommunityGrid(container, {
      rowData: state.profiles.map((profile) => ({
        ...profile,
        role_text: label("role", profile.role),
        active_text: profile.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"
      })),
      getRowId: (params) => params.data.id,
      paginationPageSize: 20,
      columnDefs: [
        {
          headerName: "รูป",
          field: "avatar_path",
          width: 76,
          minWidth: 76,
          maxWidth: 76,
          sortable: false,
          filter: false,
          resizable: false,
          cellRenderer: (params) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "avatar-grid-button";
            button.dataset.action = "open-avatar-editor";
            button.dataset.id = params.data.id;
            button.title = `เปลี่ยนรูปของ ${params.data.display_name}`;
            button.setAttribute("aria-label", button.title);
            const url = avatarUrl(params.data);
            if (url) {
              const image = document.createElement("img");
              image.src = url;
              image.alt = "";
              button.append(image);
            } else {
              button.textContent = userInitials(params.data.display_name);
            }
            return button;
          }
        },
        {
          headerName: "ชื่อที่แสดง",
          field: "display_name",
          pinned: window.innerWidth >= 900 ? "left" : undefined,
          minWidth: 220,
          flex: 1,
          cellRenderer: (params) => {
            const wrapper = document.createElement("div");
            wrapper.className = "grid-edit-cell";
            const input = document.createElement("input");
            input.className = "grid-control";
            input.maxLength = 200;
            input.value = getProfileDraft(params.data).display_name;
            input.setAttribute("aria-label", `ชื่อที่แสดงของ ${params.data.display_name}`);
            input.addEventListener("input", () => {
              getProfileDraft(params.data).display_name = input.value;
            });
            wrapper.append(input);
            if (params.data.id === state.profile.id) {
              const tag = document.createElement("span");
              tag.className = "tag";
              tag.textContent = "บัญชีของคุณ";
              wrapper.append(tag);
            }
            return wrapper;
          }
        },
        {
          headerName: "ตำแหน่ง",
          field: "position",
          minWidth: 200,
          flex: 0.9,
          cellRenderer: (params) => {
            const input = document.createElement("input");
            input.className = "grid-control";
            input.maxLength = 200;
            input.placeholder = "ไม่ระบุ";
            input.value = getProfileDraft(params.data).position;
            input.setAttribute("aria-label", `ตำแหน่งของ ${params.data.display_name}`);
            input.addEventListener("input", () => {
              getProfileDraft(params.data).position = input.value;
            });
            return input;
          }
        },
        {
          headerName: "อีเมล",
          field: "email",
          minWidth: 240,
          flex: 1.1
        },
        {
          headerName: "สิทธิ์",
          field: "role_text",
          minWidth: 170,
          cellRenderer: (params) => {
            if (params.data.id === state.profile.id) {
              const node = document.createElement("span");
              node.className = "role-badge";
              node.textContent = params.value;
              return node;
            }
            const select = document.createElement("select");
            select.className = "grid-control";
            select.setAttribute("aria-label", `สิทธิ์ของ ${params.data.display_name}`);
            ["user", "manager", "admin"].forEach((role) => {
              const option = document.createElement("option");
              option.value = role;
              option.textContent = label("role", role);
              option.selected = getProfileDraft(params.data).role === role;
              select.append(option);
            });
            select.addEventListener("change", () => {
              getProfileDraft(params.data).role = select.value;
            });
            return select;
          }
        },
        {
          headerName: "สถานะ",
          field: "active_text",
          minWidth: 150,
          cellRenderer: (params) => {
            if (params.data.id === state.profile.id) {
              return statusBadgeNode(
                params.data.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน",
                params.data.is_active ? "active" : "inactive"
              );
            }
            const labelNode = document.createElement("label");
            labelNode.className = "grid-switch";
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = getProfileDraft(params.data).is_active;
            checkbox.setAttribute("aria-label", `สถานะของ ${params.data.display_name}`);
            const text = document.createElement("span");
            text.textContent = checkbox.checked ? "เปิดใช้งาน" : "ปิดใช้งาน";
            checkbox.addEventListener("change", () => {
              text.textContent = checkbox.checked ? "เปิดใช้งาน" : "ปิดใช้งาน";
              getProfileDraft(params.data).is_active = checkbox.checked;
            });
            labelNode.append(checkbox, text);
            return labelNode;
          }
        },
        {
          headerName: "",
          colId: "actions",
          pinned: "right",
          width: 58,
          minWidth: 58,
          maxWidth: 58,
          sortable: false,
          filter: false,
          resizable: false,
          suppressHeaderMenuButton: true,
          cellRenderer: (params) => {
            const wrapper = document.createElement("div");
            wrapper.className = "grid-actions grid-actions-compact";
            wrapper.append(iconActionButtonNode({
              label: "บันทึกการเปลี่ยนแปลงผู้ใช้",
              action: "save-profile",
              id: params.data.id,
              iconName: "save",
              variant: "primary"
            }));
            return wrapper;
          }
        }
      ]
    }, "users");
  }
  async function saveProfile(profileId, button) {
    const original = state.profiles.find((profile) => profile.id === profileId);
    if (!original) {
      showToast("ไม่พบข้อมูลผู้ใช้", "error");
      return;
    }
    const draft = getProfileDraft(original);
    const displayName = String(draft.display_name || "").trim();
    if (!displayName) {
      showToast("ชื่อที่แสดงห้ามว่าง", "error");
      return;
    }

    setButtonBusy(button, true, "กำลังบันทึก...");
    try {
      const { data, error } = await state.client.rpc("admin_update_profile_full", {
        p_profile_id: profileId,
        p_display_name: displayName,
        p_position: nullable(draft.position),
        p_role: draft.role,
        p_is_active: Boolean(draft.is_active)
      });
      if (error) throw error;

      const updated = Array.isArray(data) ? data[0] : data;
      if (updated?.id) {
        state.profiles = state.profiles.map((profile) =>
          profile.id === updated.id ? { ...profile, ...updated } : profile
        );
        if (updated.id === state.profile.id) {
          state.profile = { ...state.profile, ...updated };
          el.currentUserName.textContent = state.profile.display_name || "-";
          el.currentUserRole.textContent = state.profile.position || "ไม่ระบุตำแหน่ง";
        }
      }
      showToast("บันทึกผู้ใช้แล้ว");
      await renderAdminUsersPage();
    } catch (error) {
      showError(error, "บันทึกผู้ใช้ไม่สำเร็จ");
    } finally {
      setButtonBusy(button, false);
    }
  }

function buildPrintReport(report, items, itemCustomers = [], groupCustomerIds = []) {
  const owner = profileName(report.user_id);
  const today = items.filter((item) => item.section === "today");
  const tomorrow = items.filter((item) => item.section === "tomorrow");
  const renderItems = (rows) => rows.length
    ? `<ol>${rows.map((item) => {
        const customerIds = item.use_report_customer_group
          ? groupCustomerIds
          : reportItemCustomerIds(item.id, itemCustomers);
        const customerText = reportCustomerNames(customerIds).join(", ");
        return `<li>${h(item.detail).replaceAll("\n", "<br>")}${customerText ? ` — <strong>${h(customerText)}</strong>` : ""}</li>`;
      }).join("")}</ol>`
    : "<p>- ไม่มีรายการ -</p>";
  const groupText = reportCustomerNames(groupCustomerIds).join(", ");
  el.printRoot.innerHTML = `
    <h1>รายงานการทำงานประจำวัน</h1>
    <p><strong>ผู้จัดทำ:</strong> ${h(owner)}</p>
    <p><strong>วันที่:</strong> ${h(formatDate(report.work_date))}</p>
    <p><strong>สถานะ:</strong> ${h(label("report_status", report.status))}</p>
    ${groupText ? `<p><strong>กลุ่มลูกค้าของรายงาน:</strong> ${h(groupText)}</p>` : ""}
    <h2>วันนี้ — สิ่งที่ทำ</h2>
    ${renderItems(today)}
    <h2>วันพรุ่งนี้ — แผนงาน</h2>
    ${renderItems(tomorrow)}
    <p style="margin-top:32px;font-size:10pt">พิมพ์จากระบบติดตามลูกค้า FI · ${h(formatDateTime(new Date().toISOString()))}</p>`;
  window.print();
}

async function printOwnReport() {
  if (!state.currentDailyReport) return;
  buildPrintReport(
    state.currentDailyReport,
    state.currentDailyItems,
    state.currentDailyItemCustomers,
    state.currentDailyGroupCustomerIds
  );
}

function printReviewReport() {
  if (!state.reviewReport) return;
  buildPrintReport(
    state.reviewReport.report,
    state.reviewReport.items,
    state.reviewReport.itemCustomers,
    state.reviewReport.groupCustomerIds
  );
}

async function deleteContact(contactKey) {
  const draft = state.customerEditDraft;
  const contact = draft?.contacts.find((item) => item._key === contactKey);
  if (!draft || !contact) return;
  const ok = await confirmAction(`นำผู้ติดต่อ “${contact.contact_name}” ออกจากรายการหรือไม่?`, "นำผู้ติดต่อออก", "นำออก");
  if (!ok) return;

  draft.contacts = draft.contacts.filter((item) => item._key !== contactKey);
  if (!contact._isNew && contact.id) draft.deletedContactIds.add(contact.id);
  draft.dirty = true;
  renderCustomerDraftContacts();
  scheduleCustomerDraftSave();
  showToast("นำผู้ติดต่อออกจากแบบร่างแล้ว กรุณากดบันทึก");
}
  async function deleteCustomer(customerId) {
    const customer = state.customers.find((item) => item.id === customerId) || state.currentCustomer;
    const ok = await confirmAction(
      `ลบ “${customer?.legal_name || "ลูกค้ารายนี้"}” ออกจากระบบหรือไม่?`,
      "ลบข้อมูลลูกค้า",
      "ลบ"
    );
    if (!ok) return;

    await withGlobalLoading("กำลังลบข้อมูลลูกค้า...", async () => {
      const { error } = await state.client.rpc("archive_customer", { p_customer_id: customerId });
      if (error) throw error;

      state.customers = state.customers.filter((item) => item.id !== customerId);
      state.customerOwners = state.customerOwners.filter((item) => item.customer_id !== customerId);
      state.customerModules = state.customerModules.filter((item) => item.customer_id !== customerId);
      state.customerFeatures = state.customerFeatures.filter((item) => item.customer_id !== customerId);
      state.customerAccounts = state.customerAccounts.filter((item) => item.customer_id !== customerId);
      state.customerNotes = state.customerNotes.filter((item) => item.customer_id !== customerId);
      state.filteredCustomerRows = state.filteredCustomerRows.filter((item) => item.id !== customerId);
      state.currentCustomer = null;
      state.currentCustomerData = null;
      clearCustomerDraftStorage(customerId);
      state.customerEditDraft = null;

      if (parseRoute().name === "customers") {
        state.grids.customers?.applyTransaction?.({ remove: [{ id: customerId }] });
        renderCustomerTable();
      } else {
        location.hash = "#/customers";
      }

      showToast("ลบข้อมูลลูกค้าแล้ว");
    });
  }

  async function deleteDailyItem(itemId) {
    assertCanWriteOwnDailyReport();
    const ok = await confirmAction("ลบรายการนี้หรือไม่?", "ลบรายการรายงาน", "ลบ");
    if (!ok) return;
    await withGlobalLoading("กำลังลบรายการ...", async () => {
      const { error } = await state.client.from("daily_report_items").delete().eq("id", itemId);
      if (error) throw error;
      showToast("ลบรายการแล้ว");
      await renderDailyReportPage(state.currentDailyReport.work_date);
    });
  }

  function bindGlobalEvents() {
    el.loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!el.loginForm.reportValidity() || !state.client) return;
      setButtonBusy(el.loginButton, true, "กำลังเข้าสู่ระบบ...");
      try {
        const data = new FormData(el.loginForm);
        const { error } = await state.client.auth.signInWithPassword({
          email: String(data.get("email")).trim(),
          password: String(data.get("password"))
        });
        if (error) throw error;
      } catch (error) {
        showError(error, "เข้าสู่ระบบไม่สำเร็จ");
      } finally {
        setButtonBusy(el.loginButton, false);
      }
    });

    el.contactForm.addEventListener("submit", saveContact);
    el.customerUserForm?.addEventListener("submit", saveCustomerUserDraft);
    el.customerNoteForm?.addEventListener("submit", saveCustomerNoteDraft);
    el.revisionForm.addEventListener("submit", requestRevision);
    el.avatarForm.addEventListener("submit", saveAvatar);
    el.dateRangeForm?.addEventListener("submit", saveDateRange);
    el.customerExcelImportFile?.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (file) await handleCustomerExcelImportFile(file);
    });

    window.addEventListener("hashchange", renderRoute);
    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) {
        el.sidebar.classList.remove("open");
        document.querySelector(".sidebar-backdrop")?.classList.add("hidden");
      }
    });

    window.addEventListener("beforeunload", (event) => {
      if (!state.ui.themePreviewDirty && !state.customerEditDraft?.dirty) return;
      event.preventDefault();
      event.returnValue = "";
    });

    document.addEventListener("visibilitychange", async () => {
      if (document.visibilityState !== "visible" || !state.client) return;
      const { data, error } = await state.client.auth.getSession();
      if (error) {
        showError(error, "ตรวจสอบ Session ไม่สำเร็จ");
        return;
      }
      if (!data.session) {
        await handleSession(null);
      } else if (state.session?.user?.id !== data.session.user.id) {
        await handleSession(data.session);
      }
    });

    document.addEventListener("submit", async (event) => {
      const target = event.target;
      const targetId = target.getAttribute("id") || "";
      const handled = [
        "customer-core-form",
        "customer-edit-form",
        "profile-details-form",
        "profile-theme-form",
        "master-option-form"
      ].includes(targetId) || target.classList.contains("new-report-item-form");
      if (!handled) return;

      event.preventDefault();
      try {
        if (targetId === "customer-core-form") await saveCustomer(event);
        else if (targetId === "customer-edit-form") await saveCustomerEdit(event);
        else if (targetId === "profile-details-form") await saveMyProfileDetails(event);
        else if (targetId === "profile-theme-form") await saveMyProfilePreferences(event);
        else if (targetId === "master-option-form") await saveMasterOption(event);
        else if (target.classList.contains("new-report-item-form")) await addDailyReportItem(event);
      } catch (error) {
        showError(error);
      }
    });

    document.addEventListener("input", (event) => {
      const target = event.target;

      if (target.matches("[data-date-display]")) {
        syncDateControlFromDisplay(target, false);
        if (target.closest("#customer-edit-form, #customer-core-form")) {
          markCustomerEditDirty();
          scheduleCustomerDraftSave();
        }
        return;
      }

      if (target.matches("[data-multiselect-search]")) {
        filterCustomerMultiSelect(target);
        return;
      }

      if (target.id === "customer-search") {
        state.ui.customerFilters.search = target.value;
        renderCustomerTable();
        return;
      }

      if (["customer-fleet-min", "customer-fleet-max"].includes(target.id)) {
        renderCustomerTable();
        return;
      }

      if (target.closest("#customer-edit-form, #customer-core-form")) {
        markCustomerEditDirty();
        scheduleCustomerDraftSave();
      }

      if (target.id === "admin-user-search") {
        state.grids.users?.setGridOption?.("quickFilterText", target.value);
        return;
      }

      if (target.id === "theme-accent-picker") {
        const hex = document.getElementById("theme-accent-hex");
        if (hex) hex.value = target.value.toLowerCase();
        previewThemeFromProfileForm();
        return;
      }

      if (target.id === "theme-accent-hex") {
        target.value = target.value.trim();
        if (/^#[0-9a-f]{6}$/i.test(target.value)) {
          const picker = document.getElementById("theme-accent-picker");
          if (picker) picker.value = target.value.toLowerCase();
          previewThemeFromProfileForm();
        }
      }
    });

    document.addEventListener("blur", (event) => {
      if (event.target.matches("[data-date-display]")) {
        syncDateControlFromDisplay(event.target, true);
      }
    }, true);

    document.addEventListener("datevaluechange", async (event) => {
      const target = event.target;
      try {
        if (target.id === "daily-report-date" && target.value) {
          await withGlobalLoading("กำลังโหลดรายงาน...", () => renderDailyReportPage(target.value));
        } else if (target.id === "manager-report-date" && target.value) {
          state.ui.managerFilters.date = target.value;
          renderManagerReportTable();
        }
      } catch (error) {
        showError(error, "เปลี่ยนวันที่ไม่สำเร็จ");
      }
    });

    document.addEventListener("change", async (event) => {
      const target = event.target;
      try {
        if (target.matches("[data-customer-list-column-toggle]")) {
          setCustomerListColumnEnabled(target.dataset.customerListColumnToggle, target.checked);
        } else if (["customer-list-sort-column", "customer-list-sort-direction"].includes(target.id)) {
          syncCustomerListSettingsDraftFromControls();
        } else if (target.matches("input[data-customer-multiselect-option]")) {
          updateCustomerMultiSelectSummary(target);
        } else if (target.matches("[data-date-native]")) {
          syncDateControlFromNative(target, true);
          if (target.closest("#customer-edit-form, #customer-core-form")) {
            markCustomerEditDirty();
            scheduleCustomerDraftSave();
          }
        } else if ([
          "customer-owner-filter",
          "customer-onboarding-filter",
          "customer-import-filter",
          "customer-engagement-filter",
          "customer-contract-filter",
          "customer-sales-filter",
          "customer-module-filter",
          "customer-feature-filter"
        ].includes(target.id)) {
          renderCustomerTable();
        } else if (["manager-report-user", "manager-report-status"].includes(target.id)) {
          state.ui.managerFilters.userId = document.getElementById("manager-report-user")?.value || "";
          state.ui.managerFilters.status = document.getElementById("manager-report-status")?.value || "";
          renderManagerReportTable();
        } else if (target.matches('input[name="theme_mode"]')) {
          previewThemeFromProfileForm();
        } else if (target.id === "master-group-select") {
          location.hash = `#/master-data/${encodeURIComponent(target.value)}`;
        } else if (target.id === "avatar-file" && target.files?.[0]) {
          await validateImageFile(target.files[0], {
            maxBytes: 3 * 1024 * 1024,
            allowedTypes: ["image/png", "image/jpeg", "image/webp"],
            requireSquare: false
          });
          const objectUrl = URL.createObjectURL(target.files[0]);
          el.avatarPreview.classList.add("has-image");
          el.avatarPreview.innerHTML = `<img src="${h(objectUrl)}" alt="ตัวอย่างรูปโปรไฟล์">`;
        } else if (["login-image-file", "favicon-image-file"].includes(target.id) && target.files?.[0]) {
          const isLogin = target.id === "login-image-file";
          await validateImageFile(target.files[0], {
            maxBytes: isLogin ? 5 * 1024 * 1024 : 1024 * 1024,
            allowedTypes: isLogin
              ? ["image/png", "image/jpeg", "image/webp"]
              : ["image/png", "image/webp", "image/x-icon", "image/vnd.microsoft.icon"],
            requireSquare: !isLogin
          });
          const preview = document.getElementById(isLogin ? "login-image-preview" : "favicon-image-preview");
          const objectUrl = URL.createObjectURL(target.files[0]);
          if (preview) preview.innerHTML = `<img src="${h(objectUrl)}" alt="ตัวอย่างรูปภาพ">`;
        } else if (
          target.matches('[data-field="use_report_customer_group"]')
          || target.matches('input[name="use_report_customer_group"]')
        ) {
          syncReportCustomerPicker(target);
        } else if (target.closest("#customer-edit-form, #customer-core-form")) {
          markCustomerEditDirty();
          scheduleCustomerDraftSave();
        }
      } catch (error) {
        showError(error);
      }
    });

    document.addEventListener("toggle", (event) => {
      if (event.target.id === "customer-advanced-filters") {
        state.ui.customerFilters.advancedOpen = event.target.open;
      }
    }, true);

    document.addEventListener("click", async (event) => {
      const clickedPicker = event.target.closest("[data-customer-multiselect]");
      document.querySelectorAll("details[data-customer-multiselect][open]").forEach((picker) => {
        if (picker !== clickedPicker) picker.open = false;
      });

      if (event.target.closest("details[data-customer-multiselect][data-disabled='true'] > summary")) {
        event.preventDefault();
        return;
      }

      const target = event.target.closest("[data-action]");
      if (!target) return;
      const action = target.dataset.action;

      try {
        switch (action) {
          case "toggle-sidebar": {
            if (window.innerWidth <= 820) {
              const open = !el.sidebar.classList.contains("open");
              el.sidebar.classList.toggle("open", open);
              document.querySelector(".sidebar-backdrop")?.classList.toggle("hidden", !open);
            } else {
              const collapsed = !el.appView.classList.contains("sidebar-collapsed");
              el.appView.classList.toggle("sidebar-collapsed", collapsed);
              window.localStorage.setItem("fi-sidebar-collapsed", String(collapsed));
            }
            break;
          }
          case "close-sidebar":
            el.sidebar.classList.remove("open");
            target.classList.add("hidden");
            break;
          case "logout":
            clearAllCustomerDraftStorage();
            await withGlobalLoading("กำลังออกจากระบบ...", () => state.client.auth.signOut());
            break;
          case "close-dialog":
            closeDialog(document.getElementById(target.dataset.dialog));
            break;
          case "refresh-route":
            await renderRoute();
            break;
          case "open-date-picker": {
            const native = target.closest("[data-date-control]")?.querySelector("[data-date-native]");
            if (!native) break;
            try {
              native.showPicker?.();
            } catch (_error) {
              native.focus();
              native.click();
            }
            break;
          }
          case "open-date-range-filter":
            openDateRangeDialog(target.dataset.kind);
            break;
          case "select-date-range-preset":
            selectDateRangePreset(target.dataset.preset);
            break;
          case "clear-date-range":
            clearDateRangeDraft();
            break;
          case "set-customer-account-tab": {
            const accountTab = target.dataset.customerAccountTab === "inactive" ? "inactive" : "active";
            state.ui.customerFilters.accountTab = accountTab;
            renderCustomerTable();
            break;
          }
          case "reset-customer-filters": {
            state.ui.customerFilters = {
              search: "", accountTab: "active", owner: "", onboarding: "", importStatus: "",
              engagement: "", contractType: "", salesCode: "", moduleId: "", featureId: "", fleetMin: "", fleetMax: "",
              startFrom: "", startTo: "", billingFrom: "", billingTo: "", advancedOpen: false
            };
            await withGlobalLoading("กำลังล้างตัวกรอง...", () => renderCustomersPage());
            break;
          }
          case "export-customers-excel":
            await runExcelExport(target, exportCustomersExcel);
            break;
          case "download-customer-update-template":
            await runExcelExport(target, exportCustomerUpdateTemplate);
            break;
          case "open-customer-list-settings":
            openCustomerListSettings();
            break;
          case "move-customer-list-column":
            moveCustomerListColumn(target.dataset.columnKey, target.dataset.direction);
            break;
          case "reset-customer-list-settings":
            resetCustomerListSettingsDraft();
            break;
          case "save-customer-list-settings":
            await saveCustomerListSettings(target);
            break;
          case "import-customers-excel":
            await openCustomerExcelImport();
            break;
          case "close-excel-import":
            closeCustomerExcelImport();
            break;
          case "confirm-customer-excel-import":
            await confirmCustomerExcelImport(target);
            break;
          case "reset-manager-filters": {
            state.ui.managerFilters = { date: bangkokDate(), userId: "", status: "" };
            const native = document.getElementById("manager-report-date");
            if (native) {
              native.value = bangkokDate();
              syncDateControlFromNative(native, false);
            }
            const user = document.getElementById("manager-report-user");
            const status = document.getElementById("manager-report-status");
            if (user) user.value = "";
            if (status) status.value = "";
            renderManagerReportTable();
            break;
          }
          case "export-manager-reports-excel":
            await runExcelExport(target, exportManagerReportsExcel);
            break;
          case "open-customer-create":
            location.hash = "#/customers/new";
            break;
          case "edit-customer":
            location.hash = `#/customer/${target.dataset.id}/edit`;
            break;
          case "delete-customer":
            await deleteCustomer(target.dataset.id);
            break;
          case "open-contact-create":
            openContactForm(null, target.dataset.customerId);
            break;
          case "edit-contact": {
            const contact = state.customerEditDraft?.contacts.find((item) => item._key === target.dataset.id);
            if (!contact) throw new Error("ไม่พบผู้ติดต่อ");
            openContactForm(contact);
            break;
          }
          case "delete-contact":
            await deleteContact(target.dataset.id);
            break;
          case "open-customer-user-create":
            openCustomerUserForm(null, target.dataset.customerId);
            break;
          case "edit-customer-user": {
            const account = state.customerEditDraft?.accounts.find((item) => item._key === target.dataset.id);
            if (!account) throw new Error("ไม่พบผู้ใช้งานลูกค้า");
            openCustomerUserForm(account);
            break;
          }
          case "delete-customer-user":
            await deleteCustomerUserDraft(target.dataset.id);
            break;
          case "open-customer-note-create":
            openCustomerNoteForm(null, target.dataset.customerId);
            break;
          case "edit-customer-note": {
            const note = state.customerEditDraft?.notes.find((item) => item._key === target.dataset.id);
            if (!note) throw new Error("ไม่พบโน้ตลูกค้า");
            openCustomerNoteForm(note, target.dataset.customerId);
            break;
          }
          case "delete-customer-note":
            await deleteCustomerNoteDraft(target.dataset.id);
            break;
          case "cancel-customer-edit":
            event.preventDefault();
            clearCustomerDraftStorage(state.customerEditDraft?.customerId || "new");
            state.customerEditDraft = null;
            location.hash = target.dataset.target || "#/customers";
            break;
          case "create-daily-report":
            await createDailyReport(target.dataset.date);
            break;
          case "select-all-report-customers":
            setVisibleCustomerMultiSelectOptions(target, true);
            break;
          case "clear-report-customers":
            setVisibleCustomerMultiSelectOptions(target, false);
            break;
          case "save-report-customer-group":
            await saveDailyReportCustomerGroup(target.dataset.id, target);
            break;
          case "save-report-item":
            await saveDailyReportItem(target.dataset.id, target);
            break;
          case "delete-report-item":
            await deleteDailyItem(target.dataset.id);
            break;
          case "submit-report":
            await submitDailyReport(target.dataset.id, target);
            break;
          case "open-manager-report":
            await withGlobalLoading("กำลังเปิดรายงาน...", () => openManagerReport(target.dataset.id));
            break;
          case "ack-report":
            await acknowledgeReport(target.dataset.id, target.dataset.version, target);
            break;
          case "open-revision":
            openRevisionDialog(target.dataset.id, target.dataset.version);
            break;
          case "save-profile":
            await saveProfile(target.dataset.id, target);
            break;
          case "print-own-report":
            await printOwnReport();
            break;
          case "print-review-report":
            printReviewReport();
            break;
          case "select-theme-color": {
            const color = normalizeHex(target.dataset.color);
            const picker = document.getElementById("theme-accent-picker");
            const hex = document.getElementById("theme-accent-hex");
            if (picker) picker.value = color;
            if (hex) hex.value = color;
            previewThemeFromProfileForm();
            break;
          }
          case "reset-theme-preview":
            resetThemePreview();
            await renderProfilePage();
            break;
          case "open-avatar-editor":
            openAvatarEditor(target.dataset.id || state.profile?.id);
            break;
          case "remove-avatar":
            await removeAvatar();
            break;
          case "save-branding-image":
            await saveBrandingImage(target.dataset.kind, target);
            break;
          case "remove-branding-image":
            await removeBrandingImage(target.dataset.kind, target);
            break;
          case "reset-master-option-form":
            resetMasterOptionForm();
            break;
          case "edit-master-option":
            editMasterOption(target.dataset.id, target.dataset.group);
            break;
          case "delete-master-option":
            await deleteMasterOption(target.dataset.id, target.dataset.group, target);
            break;
          default:
            break;
        }
      } catch (error) {
        showError(error);
      }
    });
  }


  init().catch((error) => {
    showError(error, "เริ่มระบบไม่สำเร็จ");
    setLoading(false);
  });
})();
