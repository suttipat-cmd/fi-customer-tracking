(() => {
  "use strict";

  const APP_VERSION = "0.7.0-system-settings";
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
    activity_type: { label: "ประเภทกิจกรรม", source: "master_options" },
    driver_payment_method: { label: "วิธีจ่ายพนักงานขับรถ", source: "master_options" },
    trip_expense_management: { label: "รูปแบบจัดการค่าใช้จ่ายเที่ยว", source: "master_options" }
  };

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
    report_status: {
      draft: "ฉบับร่าง",
      submitted: "ส่งแล้ว",
      acknowledged: "รับทราบแล้ว",
      revision_required: "ส่งกลับให้แก้ไข"
    },
    activity_type: {
      note: "หมายเหตุ",
      call: "โทรศัพท์",
      meeting: "ประชุม",
      follow_up: "ติดตาม",
      system: "ระบบ"
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
    modules: [],
    features: [],
    masterOptions: [],
    externalLinks: [],
    systemSettings: {
      id: 1,
      login_image_path: null,
      favicon_path: null,
      updated_at: null
    },
    currentCustomer: null,
    currentCustomerData: null,
    currentDailyReport: null,
    currentDailyItems: [],
    managerReports: [],
    reviewReport: null,
    customerEditDraft: null,
    filteredCustomerRows: [],
    filteredManagerRows: [],
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
        status: "",
        owner: "",
        onboarding: "",
        importStatus: "",
        engagement: "",
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
      profileDrafts: new Map()
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
    loadingOverlay: document.getElementById("loading-overlay"),
    loadingText: document.getElementById("loading-text"),
    contactDialog: document.getElementById("contact-dialog"),
    contactForm: document.getElementById("contact-form"),
    reportDialog: document.getElementById("report-dialog"),
    reportDialogContent: document.getElementById("report-dialog-content"),
    revisionDialog: document.getElementById("revision-dialog"),
    revisionForm: document.getElementById("revision-form"),
    confirmDialog: document.getElementById("confirm-dialog"),
    confirmTitle: document.getElementById("confirm-title"),
    confirmMessage: document.getElementById("confirm-message"),
    confirmOkButton: document.getElementById("confirm-ok-button"),
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

  function label(group, value) {
    if (value === null || value === undefined || value === "") return "-";
    const masterGroup = ["onboarding_stage", "import_status", "engagement_level", "activity_type", "driver_payment_method", "trip_expense_management"].includes(group)
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
      ["Invalid login credentials", "อีเมลหรือรหัสผ่านไม่ถูกต้อง"],
      ["Email not confirmed", "บัญชียังไม่ได้ยืนยันอีเมล"],
      ["duplicate key value", "ข้อมูลซ้ำกับรายการที่มีอยู่แล้ว"],
      ["customers_tax_id", "เลขประจำตัวผู้เสียภาษีนี้มีอยู่แล้ว"],
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

    root.dataset.theme = resolved;
    document.body.dataset.agThemeMode = resolved;
    root.style.setProperty("--primary", accent);
    root.style.setProperty("--primary-hover", mixHex(accent, resolved === "dark" ? "#ffffff" : "#000000", 0.16));
    root.style.setProperty("--primary-soft", mixHex(accent, surface, resolved === "dark" ? 0.82 : 0.91));
    root.style.setProperty("--focus", rgbaFromHex(accent, resolved === "dark" ? 0.34 : 0.22));
    root.style.setProperty("--brand-blue", accent);
    root.style.setProperty("--brand-blue-strong", mixHex(accent, resolved === "dark" ? "#ffffff" : "#000000", 0.18));
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


function exportRowsToExcel(rows, columns, fileName, sheetName) {
  if (!rows.length) {
    showToast("ไม่มีข้อมูลสำหรับส่งออก", "warning");
    return;
  }
  if (!window.XLSX?.utils) {
    showToast("โหลดเครื่องมือสร้างไฟล์ Excel ไม่สำเร็จ", "error");
    return;
  }
  const output = rows.map((row) => Object.fromEntries(
    columns.map((column) => [column.header, column.value(row)])
  ));
  const worksheet = window.XLSX.utils.json_to_sheet(output);
  worksheet["!cols"] = columns.map((column) => ({ wch: column.width || 18 }));
  const workbook = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  window.XLSX.writeFile(workbook, fileName, { compression: true });
}

function exportCustomersExcel() {
  const rows = [];
  state.grids.customers?.forEachNodeAfterFilterAndSort?.((node) => {
    if (node.data) rows.push(node.data);
  });
  if (!state.grids.customers && state.filteredCustomerRows?.length) {
    rows.push(...state.filteredCustomerRows);
  }
  exportRowsToExcel(rows, [
    { header: "ชื่อนิติบุคคล", value: (row) => row.legal_name || "-", width: 36 },
    { header: "ชื่อย่อ", value: (row) => row.short_name || "-", width: 24 },
    { header: "เลขประจำตัวผู้เสียภาษี", value: (row) => row.tax_id || "-", width: 20 },
    { header: "จำนวนรถ", value: (row) => Number(row.fleet_size || 0), width: 12 },
    { header: "ผู้รับผิดชอบ", value: (row) => row.owner_text || "-", width: 28 },
    { header: "ขั้นตอนเริ่มใช้งาน", value: (row) => row.onboarding_text || "-", width: 22 },
    { header: "สถานะการนำเข้าข้อมูล", value: (row) => row.import_text || "-", width: 24 },
    { header: "ระดับความสนใจ", value: (row) => row.engagement_text || "-", width: 18 },
    { header: "โมดูล", value: (row) => row.module_text || "-", width: 26 },
    { header: "ฟังก์ชัน", value: (row) => row.feature_text || "-", width: 26 },
    { header: "วันที่เริ่ม", value: (row) => formatDate(row.start_date), width: 14 },
    { header: "วันที่เริ่มวางบิล", value: (row) => formatDate(row.billing_date), width: 18 },
    { header: "อัปเดตล่าสุด", value: (row) => formatDateTime(row.updated_at), width: 20 },
    { header: "แก้ไขล่าสุดโดย", value: (row) => row.updated_by_name || "-", width: 22 }
  ], `ข้อมูลลูกค้า-${bangkokDate()}.xlsx`, "ข้อมูลลูกค้า");
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
    exporter();
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
        ? (settings.favicon_path.endsWith(".ico") ? "image/x-icon" : "image/png")
        : "image/svg+xml";
    }
  }

  async function loadPublicSettings(force = false) {
    if (!state.client || (state.publicSettingsLoaded && !force)) return;
    const result = await state.client
      .from("app_settings")
      .select("id,login_image_path,favicon_path,updated_at")
      .eq("id", 1)
      .maybeSingle();
    if (result.error) {
      if (/relation .*app_settings.*does not exist|Could not find the table/i.test(result.error.message || "")) {
        state.publicSettingsLoaded = true;
        applySystemBranding();
        return;
      }
      throw result.error;
    }
    state.systemSettings = result.data || {
      id: 1,
      login_image_path: null,
      favicon_path: null,
      updated_at: null
    };
    state.publicSettingsLoaded = true;
    applySystemBranding();
  }

  function externalUrl(value) {
    try {
      const url = new URL(String(value || "").trim());
      if (!["https:", "http:"].includes(url.protocol)) return null;
      return url.toString();
    } catch (_error) {
      return null;
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
        requireSquare: true
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
            <small class="field-help">รองรับ PNG, JPEG หรือ WebP ขนาดไม่เกิน 5 MB และต้องมีอัตราส่วน 1:1</small>
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
        requireSquare: true
      });
      const nextPath = await uploadMedia(file, isLogin ? "branding/login" : "branding/favicon", PUBLIC_MEDIA_BUCKET);
      const column = isLogin ? "login_image_path" : "favicon_path";
      const previousPath = state.systemSettings?.[column] || null;
      const { data, error } = await state.client
        .from("app_settings")
        .update({ [column]: nextPath })
        .eq("id", 1)
        .select("id,login_image_path,favicon_path,updated_at")
        .single();
      if (error) {
        await removeMedia(nextPath);
        throw error;
      }
      state.systemSettings = data;
      state.publicSettingsLoaded = true;
      applySystemBranding();
      await removeMedia(previousPath);
      showToast("บันทึกรูปภาพแล้ว");
      await renderSystemSettingsPage();
    } catch (error) {
      showError(error, "บันทึกรูปภาพไม่สำเร็จ");
    } finally {
      setButtonBusy(button, false);
    }
  }

  async function removeBrandingImage(kind) {
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
    const { data, error } = await state.client
      .from("app_settings")
      .update({ [column]: null })
      .eq("id", 1)
      .select("id,login_image_path,favicon_path,updated_at")
      .single();
    if (error) throw error;
    state.systemSettings = data;
    applySystemBranding();
    await removeMedia(previousPath);
    showToast("ลบรูปภาพแล้ว");
    await renderSystemSettingsPage();
  }

  function externalLinkCards() {
    const rows = [...state.externalLinks].sort((a, b) =>
      Number(a.sort_order || 0) - Number(b.sort_order || 0)
      || String(a.display_name).localeCompare(String(b.display_name), "th")
    );
    if (!rows.length) {
      return '<div class="empty-state compact"><strong>ยังไม่มีลิงก์เว็บไซต์</strong></div>';
    }
    return rows.map((item) => `
      <article class="list-card external-link-admin-card">
        <div class="list-card-header">
          <div>
            <strong>${h(item.display_name)}</strong>
            <div class="muted external-link-url">${h(item.url)}</div>
            <div class="tag-list">
              <span class="status-badge" data-status="${item.is_active ? "active" : "inactive"}">${item.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span>
              <span class="tag">ลำดับ ${Number(item.sort_order || 0)}</span>
            </div>
          </div>
          <div class="list-card-actions">
            <button class="btn btn-secondary btn-small" type="button" data-action="edit-external-link" data-id="${h(item.id)}">แก้ไข</button>
            <button class="btn btn-danger btn-small" type="button" data-action="delete-external-link" data-id="${h(item.id)}">ลบ</button>
          </div>
        </div>
      </article>
    `).join("");
  }

  async function renderExternalLinksPage() {
    await loadCommonData(true);
    el.mainContent.innerHTML = `
      ${pageHeader(
        "ลิงก์เว็บไซต์ภายนอก",
        "เพิ่มลิงก์ที่จะแสดงในเมนูของผู้ใช้งานทุกคน",
        "",
        [{ label: "ลิงก์เว็บไซต์ภายนอก" }]
      )}
      <div class="settings-two-column">
        <form id="external-link-form" class="panel" novalidate>
          <div class="panel-header"><h2>ข้อมูลลิงก์</h2></div>
          <div class="panel-body">
            <input name="id" type="hidden">
            <label>
              <span class="field-label">ชื่อที่แสดง <span class="required">*</span></span>
              <input name="display_name" maxlength="120" required>
            </label>
            <label>
              <span class="field-label">URL <span class="required">*</span></span>
              <input name="url" type="url" maxlength="2048" placeholder="https://example.com" required>
            </label>
            <label>
              <span class="field-label">ลำดับการแสดง</span>
              <input name="sort_order" type="number" min="0" max="9999" step="1" value="0">
            </label>
            <label class="check-label">
              <input name="is_active" type="checkbox" checked>
              <span>เปิดใช้งาน</span>
            </label>
          </div>
          <div class="panel-footer-actions">
            <button type="button" class="btn btn-secondary" data-action="reset-external-link-form">ล้างฟอร์ม</button>
            <button id="external-link-save-button" type="submit" class="btn btn-primary">${icon("save")} บันทึก</button>
          </div>
        </form>
        <section class="panel">
          <div class="panel-header">
            <h2>รายการลิงก์</h2>
            <span class="muted">${state.externalLinks.length.toLocaleString("th-TH")} รายการ</span>
          </div>
          <div class="panel-body stack">${externalLinkCards()}</div>
        </section>
      </div>`;
  }

  function resetExternalLinkForm() {
    const form = document.getElementById("external-link-form");
    if (!form) return;
    form.reset();
    form.elements.id.value = "";
    form.elements.sort_order.value = "0";
    form.elements.is_active.checked = true;
  }

  function editExternalLink(id) {
    const item = state.externalLinks.find((row) => row.id === id);
    const form = document.getElementById("external-link-form");
    if (!item || !form) return;
    form.elements.id.value = item.id;
    form.elements.display_name.value = item.display_name;
    form.elements.url.value = item.url;
    form.elements.sort_order.value = item.sort_order || 0;
    form.elements.is_active.checked = Boolean(item.is_active);
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    form.elements.display_name.focus();
  }

  async function saveExternalLink(event) {
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;
    const button = document.getElementById("external-link-save-button");
    const data = new FormData(form);
    const url = externalUrl(data.get("url"));
    if (!url) {
      showToast("URL ต้องขึ้นต้นด้วย http:// หรือ https://", "error");
      return;
    }
    const payload = {
      display_name: String(data.get("display_name") || "").trim(),
      url,
      sort_order: Number(data.get("sort_order") || 0),
      is_active: data.get("is_active") === "on"
    };
    setButtonBusy(button, true, "กำลังบันทึก...");
    try {
      const id = String(data.get("id") || "");
      const query = id
        ? state.client.from("external_links").update(payload).eq("id", id)
        : state.client.from("external_links").insert(payload);
      const { error } = await query;
      if (error) throw error;
      showToast(id ? "แก้ไขลิงก์แล้ว" : "เพิ่มลิงก์แล้ว");
      state.configurationLoaded = false;
      await renderExternalLinksPage();
    } catch (error) {
      showError(error, "บันทึกลิงก์ไม่สำเร็จ");
    } finally {
      setButtonBusy(button, false);
    }
  }

  async function deleteExternalLink(id) {
    const item = state.externalLinks.find((row) => row.id === id);
    if (!item) return;
    const confirmed = await confirmAction(
      `ต้องการลบลิงก์ “${item.display_name}” หรือไม่`,
      "ลบลิงก์เว็บไซต์",
      "ลบ"
    );
    if (!confirmed) return;
    const { error } = await state.client.from("external_links").delete().eq("id", id);
    if (error) throw error;
    showToast("ลบลิงก์แล้ว");
    state.configurationLoaded = false;
    await renderExternalLinksPage();
  }

  function masterRows(groupKey) {
    const config = MASTER_GROUPS[groupKey];
    if (!config) return [];
    if (config.source === "modules") {
      return state.modules.map((item) => ({
        id: item.id,
        option_value: item.code,
        display_name: item.name,
        sort_order: item.sort_order || 0,
        is_active: item.is_active,
        source: "modules"
      }));
    }
    if (config.source === "features") {
      return state.features.map((item) => ({
        id: item.id,
        option_value: item.code,
        display_name: item.name,
        sort_order: item.sort_order || 0,
        is_active: item.is_active,
        source: "features"
      }));
    }
    return state.masterOptions
      .filter((item) => item.group_key === groupKey)
      .map((item) => ({ ...item, source: "master_options" }));
  }

  function masterListHtml(groupKey) {
    const rows = masterRows(groupKey).sort((a, b) =>
      Number(a.sort_order || 0) - Number(b.sort_order || 0)
      || String(a.display_name).localeCompare(String(b.display_name), "th")
    );
    if (!rows.length) return '<div class="empty-state compact"><strong>ยังไม่มีรายการ</strong></div>';
    return rows.map((item) => `
      <article class="list-card master-option-card">
        <div class="list-card-header">
          <div>
            <strong>${h(item.display_name)}</strong>
            <div class="muted"><code>${h(item.option_value)}</code></div>
            <div class="tag-list">
              <span class="status-badge" data-status="${item.is_active ? "active" : "inactive"}">${item.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span>
              <span class="tag">ลำดับ ${Number(item.sort_order || 0)}</span>
            </div>
          </div>
          <button type="button" class="btn btn-secondary btn-small"
                  data-action="edit-master-option" data-id="${h(item.id)}" data-group="${h(groupKey)}">แก้ไข</button>
        </div>
      </article>
    `).join("");
  }

  async function renderMasterDataPage(groupKey = null) {
    await loadCommonData(true);
    const selectedGroup = MASTER_GROUPS[groupKey] ? groupKey : Object.keys(MASTER_GROUPS)[0];
    const config = MASTER_GROUPS[selectedGroup];
    const rows = masterRows(selectedGroup);
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
            <input name="id" type="hidden">
            <label>
              <span class="field-label">รหัสค่า <span class="required">*</span></span>
              <input name="option_value" maxlength="100" pattern="[A-Za-z0-9_\\-ก-๙ .()/]+" required>
            </label>
            <label>
              <span class="field-label">ชื่อที่แสดง <span class="required">*</span></span>
              <input name="display_name" maxlength="200" required>
            </label>
            <label>
              <span class="field-label">ลำดับการแสดง</span>
              <input name="sort_order" type="number" min="0" max="9999" step="1" value="0">
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
            <span class="muted">${rows.length.toLocaleString("th-TH")} รายการ</span>
          </div>
          <div class="panel-body stack">${masterListHtml(selectedGroup)}</div>
        </section>
      </div>`;
  }

  function resetMasterOptionForm() {
    const form = document.getElementById("master-option-form");
    if (!form) return;
    form.reset();
    form.elements.id.value = "";
    form.elements.sort_order.value = "0";
    form.elements.is_active.checked = true;
    form.elements.option_value.disabled = false;
  }

  function editMasterOption(id, groupKey) {
    const item = masterRows(groupKey).find((row) => row.id === id);
    const form = document.getElementById("master-option-form");
    if (!item || !form) return;
    form.elements.id.value = item.id;
    form.elements.option_value.value = item.option_value;
    form.elements.option_value.disabled = true;
    form.elements.display_name.value = item.display_name;
    form.elements.sort_order.value = item.sort_order || 0;
    form.elements.is_active.checked = Boolean(item.is_active);
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    form.elements.display_name.focus();
  }

  async function saveMasterOption(event) {
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;
    const groupKey = form.dataset.group;
    const config = MASTER_GROUPS[groupKey];
    if (!config) return;
    const button = document.getElementById("master-option-save-button");
    const data = new FormData(form);
    const id = String(data.get("id") || "");
    const payload = {
      display_name: String(data.get("display_name") || "").trim(),
      sort_order: Number(data.get("sort_order") || 0),
      is_active: data.get("is_active") === "on"
    };
    if (!id) payload.option_value = String(data.get("option_value") || "").trim();
    setButtonBusy(button, true, "กำลังบันทึก...");
    try {
      let query;
      if (config.source === "modules" || config.source === "features") {
        const table = config.source;
        const tablePayload = {
          name: payload.display_name,
          sort_order: payload.sort_order,
          is_active: payload.is_active
        };
        if (!id) tablePayload.code = payload.option_value.toLowerCase().replace(/\s+/g, "_");
        query = id
          ? state.client.from(table).update(tablePayload).eq("id", id)
          : state.client.from(table).insert(tablePayload);
      } else {
        const tablePayload = {
          group_key: groupKey,
          display_name: payload.display_name,
          sort_order: payload.sort_order,
          is_active: payload.is_active
        };
        if (!id) tablePayload.option_value = payload.option_value;
        query = id
          ? state.client.from("master_options").update(tablePayload).eq("id", id)
          : state.client.from("master_options").insert(tablePayload);
      }
      const { error } = await query;
      if (error) throw error;
      showToast(id ? "แก้ไขรายการแล้ว" : "เพิ่มรายการแล้ว");
      state.configurationLoaded = false;
      await renderMasterDataPage(groupKey);
    } catch (error) {
      showError(error, "บันทึกข้อมูลตัวเลือกไม่สำเร็จ");
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

    state.client.auth.onAuthStateChange((_event, session) => {
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
        state.session = null;
        state.profile = null;
        destroyDynamicComponents();
        applyThemePreferences({ theme_mode: "light", theme_accent: "#2f68e6" });
        showLogin();
        return;
      }

      const sameUser = state.session?.user?.id === session.user.id && state.profile;
      state.session = session;

      if (!sameUser) {
        let profileResult = await state.client
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
            .select("id,display_name,email,role,is_active,theme_mode,theme_accent,created_at,updated_at")
            .eq("id", session.user.id)
            .single();

          if (
            profileResult.error &&
            /theme_mode|theme_accent|column .* does not exist/i.test(profileResult.error.message || "")
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
      }

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
    el.currentUserRole.textContent = label("role", state.profile?.role);
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
          { route: "daily-report", icon: "report", label: "รายงานประจำวัน", roles: ["user"] },
          { route: "manager-reports", icon: "team", label: "รายงานของทีม", roles: ["admin", "manager"] }
        ]
      },
      {
        label: "การดูแลระบบ",
        items: [
          { route: "admin-users", icon: "users", label: "จัดการผู้ใช้", roles: ["admin"] },
          { route: "system-settings", icon: "image", label: "ตั้งค่าภาพระบบ", roles: ["admin"] },
          { route: "external-links", icon: "link", label: "ลิงก์เว็บไซต์ภายนอก", roles: ["admin"] },
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
    const internalHtml = groups.map((group) => {
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

    const linkRows = state.externalLinks
      .filter((item) => item.is_active && externalUrl(item.url))
      .sort((a, b) =>
        Number(a.sort_order || 0) - Number(b.sort_order || 0)
        || String(a.display_name).localeCompare(String(b.display_name), "th")
      );
    const externalHtml = linkRows.length ? `
      <div class="nav-group external-nav-group">
        <span class="nav-group-label">เว็บไซต์อื่น</span>
        ${linkRows.map((item) => `
          <a class="nav-link" href="${h(item.url)}" target="_blank" rel="noopener noreferrer"
             title="${h(item.display_name)}">
            <span class="nav-icon">${icon("external")}</span>
            <span>${h(item.display_name)}</span>
          </a>
        `).join("")}
      </div>
    ` : "";

    el.mainNav.innerHTML = internalHtml + externalHtml;
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
      "daily-report": ["user"],
      "manager-reports": ["admin", "manager"],
      "admin-users": ["admin"],
      "system-settings": ["admin"],
      "external-links": ["admin"],
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
      "external-links": "ลิงก์เว็บไซต์ภายนอก",
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
        case "external-links":
          await renderExternalLinksPage();
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
      .select("id,display_name,email,role,is_active,theme_mode,theme_accent,avatar_path,created_at,updated_at")
      .order("display_name");

    if (
      profilesResult.error &&
      /theme_mode|theme_accent|avatar_path|column .* does not exist/i.test(profilesResult.error.message || "")
    ) {
      profilesResult = await state.client
        .from("profiles")
        .select("id,display_name,email,role,is_active,theme_mode,theme_accent,created_at,updated_at")
        .order("display_name");
      if (
        profilesResult.error &&
        /theme_mode|theme_accent|column .* does not exist/i.test(profilesResult.error.message || "")
      ) {
        profilesResult = await state.client
          .from("profiles")
          .select("id,display_name,email,role,is_active,created_at,updated_at")
          .order("display_name");
      }
      if (!profilesResult.error) {
        profilesResult.data = (profilesResult.data || []).map((profile) => ({
          ...profile,
          theme_mode: profile.theme_mode || "light",
          theme_accent: profile.theme_accent || "#2f68e6",
          avatar_path: null
        }));
      }
    }

    let modulesResult = await state.client
      .from("modules")
      .select("id,code,name,is_active,sort_order")
      .order("sort_order")
      .order("name");
    if (modulesResult.error && /sort_order|column .* does not exist/i.test(modulesResult.error.message || "")) {
      modulesResult = await state.client.from("modules").select("id,code,name,is_active").order("name");
    }

    let featuresResult = await state.client
      .from("features")
      .select("id,code,name,is_active,sort_order")
      .order("sort_order")
      .order("name");
    if (featuresResult.error && /sort_order|column .* does not exist/i.test(featuresResult.error.message || "")) {
      featuresResult = await state.client.from("features").select("id,code,name,is_active").order("name");
    }

    const [masterResult, linkResult] = await Promise.all([
      state.client
        .from("master_options")
        .select("id,group_key,option_value,display_name,sort_order,is_active,created_at,updated_at")
        .order("group_key")
        .order("sort_order")
        .order("display_name"),
      state.client
        .from("external_links")
        .select("id,display_name,url,sort_order,is_active,created_at,updated_at")
        .order("sort_order")
        .order("display_name")
    ]);

    if (profilesResult.error) throw profilesResult.error;
    if (modulesResult.error) throw modulesResult.error;
    if (featuresResult.error) throw featuresResult.error;

    const fallbackRows = [
      ...Object.entries(LABELS.onboarding_stage).map(([option_value, display_name], sort_order) => ({
        id: `fallback-onboarding-${option_value}`,
        group_key: "onboarding_stage",
        option_value,
        display_name,
        sort_order,
        is_active: true
      })),
      ...Object.entries(LABELS.import_status).map(([option_value, display_name], sort_order) => ({
        id: `fallback-import-${option_value}`,
        group_key: "import_status",
        option_value,
        display_name,
        sort_order,
        is_active: true
      })),
      ...Object.entries(LABELS.engagement_level).map(([option_value, display_name], sort_order) => ({
        id: `fallback-engagement-${option_value}`,
        group_key: "engagement_level",
        option_value,
        display_name,
        sort_order,
        is_active: true
      })),
      ...Object.entries(LABELS.activity_type).map(([option_value, display_name], sort_order) => ({
        id: `fallback-activity-${option_value}`,
        group_key: "activity_type",
        option_value,
        display_name,
        sort_order,
        is_active: option_value !== "system"
      }))
    ];

    const preparedProfiles = (profilesResult.data || []).map((profile) => ({
      ...profile,
      theme_mode: profile.theme_mode || "light",
      theme_accent: normalizeHex(profile.theme_accent || "#2f68e6"),
      avatar_path: profile.avatar_path || null
    }));
    state.profiles = await hydrateProfileAvatarUrls(preparedProfiles);
    if (state.profile?.id) {
      const currentProfile = state.profiles.find((profile) => profile.id === state.profile.id);
      if (currentProfile) state.profile = { ...state.profile, ...currentProfile };
    }
    state.modules = (modulesResult.data || []).map((item) => ({ ...item, sort_order: item.sort_order || 0 }));
    state.features = (featuresResult.data || []).map((item) => ({ ...item, sort_order: item.sort_order || 0 }));
    state.masterOptions = masterResult.error
      ? fallbackRows
      : (masterResult.data || []);
    state.externalLinks = linkResult.error
      ? []
      : (linkResult.data || []);
    state.configurationLoaded = true;
  }

async function loadCustomers(force = false) {
  if (!force && state.customers.length) return;
  const [customersResult, ownersResult, modulesResult, featuresResult] = await Promise.all([
    state.client
      .from("customers")
      .select("id,legacy_customer_id,legal_name,short_name,tax_id,fleet_size,account_status,onboarding_stage,import_status,engagement_level,start_date,billing_date,is_archived,archived_at,archived_by,created_at,created_by,updated_at,updated_by")
      .eq("is_archived", false)
      .order("updated_at", { ascending: false })
      .limit(1000),
    state.client
      .from("customer_owners")
      .select("customer_id,profile_id,is_primary")
      .limit(5000),
    state.client
      .from("customer_modules")
      .select("customer_id,module_id")
      .limit(5000),
    state.client
      .from("customer_features")
      .select("customer_id,feature_id")
      .limit(5000)
  ]);
  [customersResult, ownersResult, modulesResult, featuresResult].forEach((result) => {
    if (result.error) throw result.error;
  });
  state.customers = customersResult.data || [];
  const activeIds = new Set(state.customers.map((customer) => customer.id));
  state.customerOwners = (ownersResult.data || []).filter((row) => activeIds.has(row.customer_id));
  state.customerModules = (modulesResult.data || []).filter((row) => activeIds.has(row.customer_id));
  state.customerFeatures = (featuresResult.data || []).filter((row) => activeIds.has(row.customer_id));
}

  function profileName(id) {
    return state.profiles.find((profile) => profile.id === id)?.display_name || "-";
  }

  function ownerNames(customerId) {
    return state.customerOwners
      .filter((owner) => owner.customer_id === customerId)
      .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
      .map((owner) => `${profileName(owner.profile_id)}${owner.is_primary ? " ★" : ""}`);
  }

async function renderDashboard() {
  await Promise.all([loadCommonData(), loadCustomers(true)]);
  const customers = state.customers;
  const goLive = customers.filter((customer) => customer.onboarding_stage === "go_live").length;
  const importPending = customers.filter((customer) => customer.import_status !== "done").length;
  const updatedAt = formatDateTime(new Date().toISOString());

  let reportQuery = state.client.from("daily_reports").select("id,status,work_date,user_id,updated_at,last_revision_reason");
  if (state.profile.role === "user") {
    reportQuery = reportQuery
      .eq("user_id", state.profile.id)
      .eq("work_date", bangkokDate())
      .order("updated_at", { ascending: false });
  } else {
    reportQuery = reportQuery
      .eq("work_date", bangkokDate())
      .order("updated_at", { ascending: false });
  }
  const { data: reports, error: reportsError } = await reportQuery;
  if (reportsError) throw reportsError;
  const reportRows = reports || [];

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

  let rolePanel = "";
  if (state.profile.role === "user") {
    const todayReport = reportRows[0] || null;
    rolePanel = `
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>รายงานประจำวันนี้</h2>
            <p class="muted">บันทึกงานวันนี้และแผนงานวันพรุ่งนี้</p>
          </div>
          ${todayReport ? `<span class="status-badge" data-status="${h(todayReport.status)}">${h(label("report_status", todayReport.status))}</span>` : ""}
        </div>
        <div class="panel-body">
          ${todayReport ? `
            ${todayReport.last_revision_reason && todayReport.status === "revision_required"
              ? `<div class="alert alert-danger"><strong>ผู้จัดการส่งกลับ:</strong>&nbsp;${h(todayReport.last_revision_reason)}</div>`
              : ""}
            <div class="toolbar-summary">
              <span>อัปเดตล่าสุด ${h(formatDateTime(todayReport.updated_at))}</span>
              <a class="btn btn-primary" href="#/daily-report">เปิดรายงาน</a>
            </div>
          ` : `
            <div class="empty-state">
              <strong>ยังไม่มีรายงานสำหรับวันนี้</strong>
              <span>เริ่มบันทึกงานและแก้ไขได้ก่อนผู้จัดการรับทราบ</span>
              <a class="btn btn-primary" href="#/daily-report">${icon("plus")} เริ่มเขียนรายงาน</a>
            </div>
          `}
        </div>
      </section>`;
  } else {
    const pending = reportRows.filter((report) => report.status === "submitted").length;
    const acknowledged = reportRows.filter((report) => report.status === "acknowledged").length;
    const revision = reportRows.filter((report) => report.status === "revision_required").length;
    rolePanel = `
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>รายงานของทีมวันนี้</h2>
            <p class="muted">ติดตามรายงานที่รอรับทราบและรายการที่ส่งกลับ</p>
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
              <span class="stat-meta">รายงานที่ผู้ใช้งานส่งแล้ว</span>
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
              <span class="stat-meta">รายงานที่รอแก้ไข</span>
            </div>
          </div>
        </div>
      </section>`;
  }

  el.mainContent.innerHTML = `
    ${pageHeader("ภาพรวม", `ข้อมูลล่าสุด ณ ${updatedAt}`)}
    <section class="cards-grid cards-grid-3" style="margin-bottom:20px">
      <div class="card stat-card">
        <div class="stat-card-header">
          <span class="stat-label">ลูกค้าทั้งหมด</span>
          <span class="stat-icon">${icon("building")}</span>
        </div>
        <span class="stat-value">${customers.length}</span>
        <span class="stat-meta">เฉพาะรายการที่ใช้งานอยู่</span>
      </div>
      <div class="card stat-card">
        <div class="stat-card-header">
          <span class="stat-label">เริ่มใช้งานจริง</span>
          <span class="stat-icon">${icon("rocket")}</span>
        </div>
        <span class="stat-value">${goLive}</span>
        <span class="stat-meta">ผ่านขั้นตอนเริ่มใช้งาน</span>
      </div>
      <div class="card stat-card">
        <div class="stat-card-header">
          <span class="stat-label">นำเข้าข้อมูลยังไม่เสร็จ</span>
          <span class="stat-icon">${icon("import")}</span>
        </div>
        <span class="stat-value">${importPending}</span>
        <span class="stat-meta">รอดำเนินการหรือกำลังดำเนินการ</span>
      </div>
    </section>

    <section class="chart-grid chart-grid-2" aria-label="กราฟสรุป">
      <article class="panel chart-panel">
        <div class="panel-header">
          <div><h2>สถานะการเริ่มใช้งาน</h2><p class="muted">จำนวนลูกค้าตามขั้นตอน</p></div>
        </div>
        <div id="onboarding-chart" class="chart-container">
          <div class="chart-loading"><span class="spinner"></span><span>กำลังสร้างกราฟ...</span></div>
        </div>
      </article>
      <article class="panel chart-panel">
        <div class="panel-header">
          <div><h2>สถานะการนำเข้าข้อมูล</h2><p class="muted">สัดส่วนความคืบหน้าการนำเข้าข้อมูล</p></div>
        </div>
        <div id="import-chart" class="chart-container">
          <div class="chart-loading"><span class="spinner"></span><span>กำลังสร้างกราฟ...</span></div>
        </div>
      </article>
    </section>

    ${rolePanel}`;

  window.requestAnimationFrame(() => renderDashboardCharts(state.dashboardChartData));
}

async function renderCustomersPage() {
  try { state.grids.customers?.destroy?.(); } catch (error) { console.warn(error); }
  state.grids.customers = null;
  await Promise.all([loadCommonData(), loadCustomers(true)]);
  const filters = state.ui.customerFilters;
  el.mainContent.innerHTML = `
    ${pageHeader(
      "ข้อมูลลูกค้า",
      "ค้นหา กรอง และจัดการข้อมูลลูกค้า",
      `<a class="btn btn-primary" href="#/customers/new">${icon("plus")} เพิ่มลูกค้า</a>`,
      [{ label: "ข้อมูลลูกค้า" }]
    )}
    <section class="panel">
      <div class="toolbar">
        <div class="toolbar-row">
          <div class="toolbar-field toolbar-search">
            <label for="customer-search">ค้นหา</label>
            <input id="customer-search" type="search" placeholder="ชื่อบริษัท ชื่อย่อ เลขประจำตัวผู้เสียภาษี หรือผู้รับผิดชอบ"
                   autocomplete="off" value="${h(filters.search)}">
          </div>
          <div class="toolbar-field">
            <label for="customer-status-filter">สถานะบัญชี</label>
            <select id="customer-status-filter">
              <option value="">ทั้งหมด</option>
              <option value="active" ${filters.status === "active" ? "selected" : ""}>ใช้งาน</option>
              <option value="inactive" ${filters.status === "inactive" ? "selected" : ""}>ไม่ใช้งาน</option>
            </select>
          </div>
          <div class="toolbar-field">
            <label for="customer-owner-filter">ผู้รับผิดชอบ</label>
            <select id="customer-owner-filter">
              <option value="">ทั้งหมด</option>
              <option value="unassigned" ${filters.owner === "unassigned" ? "selected" : ""}>ยังไม่มีผู้รับผิดชอบ</option>
              ${state.profiles.filter((profile) => profile.is_active).map((profile) => `
                <option value="${h(profile.id)}" ${filters.owner === profile.id ? "selected" : ""}>${h(profile.display_name)}</option>
              `).join("")}
            </select>
          </div>
          <div class="toolbar-actions">
            <button class="btn btn-secondary" data-action="reset-customer-filters">${icon("refresh")} ล้างตัวกรอง</button>
            <button class="btn btn-secondary" data-action="export-customers-excel">${icon("download")} Excel</button>
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
                  <option value="${h(item.option_value)}" ${filters.onboarding === item.option_value ? "selected" : ""}>${h(item.display_name)}</option>
                `).join("")}
              </select>
            </label>
            <label>
              สถานะการนำเข้าข้อมูล
              <select id="customer-import-filter">
                <option value="">ทั้งหมด</option>
                ${masterOptions("import_status").map((item) => `
                  <option value="${h(item.option_value)}" ${filters.importStatus === item.option_value ? "selected" : ""}>${h(item.display_name)}</option>
                `).join("")}
              </select>
            </label>
            <label>
              ระดับความสนใจ
              <select id="customer-engagement-filter">
                <option value="">ทั้งหมด</option>
                <option value="none" ${filters.engagement === "none" ? "selected" : ""}>ไม่ระบุ</option>
                ${masterOptions("engagement_level").map((item) => `
                  <option value="${h(item.option_value)}" ${filters.engagement === item.option_value ? "selected" : ""}>${h(item.display_name)}</option>
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
            ${dateControlHtml({
              id: "customer-start-from",
              name: "customer_start_from",
              label: "วันที่เริ่ม ตั้งแต่",
              value: filters.startFrom || ""
            })}
            ${dateControlHtml({
              id: "customer-start-to",
              name: "customer_start_to",
              label: "วันที่เริ่ม ถึง",
              value: filters.startTo || ""
            })}
            ${dateControlHtml({
              id: "customer-billing-from",
              name: "customer_billing_from",
              label: "วันที่เริ่มวางบิล ตั้งแต่",
              value: filters.billingFrom || ""
            })}
            ${dateControlHtml({
              id: "customer-billing-to",
              name: "customer_billing_to",
              label: "วันที่เริ่มวางบิล ถึง",
              value: filters.billingTo || ""
            })}
          </div>
        </details>
      </div>
      <div class="grid-status-row">
        <span id="customer-grid-count" class="muted">กำลังเตรียมข้อมูล...</span>
        <span class="muted">ปรับลำดับ ความกว้าง และตัวกรองในหัวตารางได้</span>
      </div>
      <div id="customer-grid" class="ag-grid-shell" aria-label="รายชื่อลูกค้า">
        <div class="chart-loading"><span class="spinner"></span><span>กำลังสร้างตาราง...</span></div>
      </div>
    </section>`;
  renderCustomerTable();
}

function renderCustomerTable() {
  const container = document.getElementById("customer-grid");
  if (!container) return;

  const filters = state.ui.customerFilters;
  filters.search = document.getElementById("customer-search")?.value.trim() || "";
  filters.status = document.getElementById("customer-status-filter")?.value || "";
  filters.owner = document.getElementById("customer-owner-filter")?.value || "";
  filters.onboarding = document.getElementById("customer-onboarding-filter")?.value || "";
  filters.importStatus = document.getElementById("customer-import-filter")?.value || "";
  filters.engagement = document.getElementById("customer-engagement-filter")?.value || "";
  filters.moduleId = document.getElementById("customer-module-filter")?.value || "";
  filters.featureId = document.getElementById("customer-feature-filter")?.value || "";
  filters.fleetMin = document.getElementById("customer-fleet-min")?.value || "";
  filters.fleetMax = document.getElementById("customer-fleet-max")?.value || "";
  filters.startFrom = dateValue(document, "customer_start_from") || "";
  filters.startTo = dateValue(document, "customer_start_to") || "";
  filters.billingFrom = dateValue(document, "customer_billing_from") || "";
  filters.billingTo = dateValue(document, "customer_billing_to") || "";
  filters.advancedOpen = Boolean(document.getElementById("customer-advanced-filters")?.open);

  const query = filters.search.toLowerCase();
  const minimumFleet = filters.fleetMin === "" ? null : Number(filters.fleetMin);
  const maximumFleet = filters.fleetMax === "" ? null : Number(filters.fleetMax);

  const rows = state.customers
    .filter((customer) => {
      const owners = state.customerOwners.filter((item) => item.customer_id === customer.id);
      const moduleIds = state.customerModules.filter((item) => item.customer_id === customer.id).map((item) => item.module_id);
      const featureIds = state.customerFeatures.filter((item) => item.customer_id === customer.id).map((item) => item.feature_id);
      const ownerText = owners.map((item) => profileName(item.profile_id)).join(" ");
      const haystack = `${customer.legal_name} ${customer.short_name || ""} ${customer.tax_id} ${ownerText}`.toLowerCase();
      const ownerMatch = !filters.owner
        || (filters.owner === "unassigned" && owners.length === 0)
        || owners.some((item) => item.profile_id === filters.owner);
      const onboardingMatch = !filters.onboarding
        || (filters.onboarding === "none" ? !customer.onboarding_stage : customer.onboarding_stage === filters.onboarding);
      const engagementMatch = !filters.engagement
        || (filters.engagement === "none" ? !customer.engagement_level : customer.engagement_level === filters.engagement);
      const fleet = Number(customer.fleet_size || 0);
      return (
        (!query || haystack.includes(query))
        && (!filters.status || customer.account_status === filters.status)
        && ownerMatch
        && onboardingMatch
        && (!filters.importStatus || customer.import_status === filters.importStatus)
        && engagementMatch
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
        module_text: moduleNames.join(", ") || "-",
        feature_text: featureNames.join(", ") || "-",
        onboarding_text: label("onboarding_stage", customer.onboarding_stage),
        import_text: label("import_status", customer.import_status),
        engagement_text: label("engagement_level", customer.engagement_level),
        updated_by_name: profileName(customer.updated_by)
      };
    });

  state.filteredCustomerRows = rows;
  const countNode = document.getElementById("customer-grid-count");
  if (countNode) countNode.textContent = `${rows.length.toLocaleString("th-TH")} รายการ`;

  if (state.grids.customers) {
    state.grids.customers.setGridOption("rowData", rows);
    return;
  }

  const mobile = window.innerWidth < 760;
  createCommunityGrid(container, {
    rowData: rows,
    getRowId: (params) => params.data.id,
    columnDefs: [
      {
        headerName: "ลูกค้า",
        field: "legal_name",
        pinned: mobile ? undefined : "left",
        minWidth: 250,
        flex: 1.5,
        cellRenderer: (params) => {
          const wrapper = document.createElement("div");
          wrapper.className = "grid-primary-cell";
          const title = document.createElement("strong");
          title.textContent = params.data.legal_name || "-";
          const secondary = document.createElement("span");
          secondary.className = "grid-secondary";
          secondary.textContent = params.data.short_name || "ไม่มีชื่อย่อ";
          wrapper.append(title, secondary);
          return wrapper;
        }
      },
      {
        headerName: "เลขประจำตัวผู้เสียภาษี",
        field: "tax_id",
        minWidth: 190,
        filter: "agTextColumnFilter"
      },
      {
        headerName: "จำนวนรถ",
        field: "fleet_size",
        minWidth: 115,
        maxWidth: 130,
        type: "numericColumn",
        filter: "agNumberColumnFilter",
        valueFormatter: (params) => Number(params.value || 0).toLocaleString("th-TH")
      },
      {
        headerName: "ผู้รับผิดชอบ",
        field: "owner_text",
        minWidth: 190,
        flex: 1
      },
      {
        headerName: "ขั้นตอนเริ่มใช้งาน",
        field: "onboarding_text",
        minWidth: 170
      },
      {
        headerName: "การนำเข้าข้อมูล",
        field: "import_text",
        minWidth: 155,
        cellRenderer: (params) => statusBadgeNode(params.value, params.data.import_status)
      },
      {
        headerName: "อัปเดตล่าสุด",
        field: "updated_at",
        minWidth: 185,
        sort: "desc",
        cellRenderer: (params) => {
          const wrapper = document.createElement("div");
          wrapper.className = "grid-primary-cell";
          const date = document.createElement("span");
          date.textContent = formatDateTime(params.value);
          const by = document.createElement("span");
          by.className = "grid-secondary";
          by.textContent = params.data.updated_by_name;
          wrapper.append(date, by);
          return wrapper;
        }
      },
      {
        headerName: "",
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
      }
    ]
  }, "customers");
}

function customerCoreFields(customer = null) {
  const c = customer || {};
  const defaultImportStatus = c.import_status
    || masterOptions("import_status")[0]?.option_value
    || "waiting";
  return `
    <section class="form-section">
      <div class="form-section-heading">
        <h2>ข้อมูลบริษัท</h2>
      </div>
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
          <span class="field-label">สถานะบัญชี <span class="required">*</span></span>
          <select name="account_status" required>
            <option value="active" ${(c.account_status || "active") === "active" ? "selected" : ""}>ใช้งาน</option>
            <option value="inactive" ${c.account_status === "inactive" ? "selected" : ""}>ไม่ใช้งาน</option>
          </select>
        </label>
      </div>
    </section>

    <section class="form-section">
      <div class="form-section-heading">
        <h2>ความคืบหน้าและวันที่</h2>
      </div>
      <div class="form-grid">
        <label>
          <span class="field-label">ขั้นตอนเริ่มใช้งาน</span>
          <select name="onboarding_stage">
            ${masterOptionHtml("onboarding_stage", c.onboarding_stage || "")}
          </select>
        </label>
        <label>
          <span class="field-label">สถานะการนำเข้าข้อมูล <span class="required">*</span></span>
          <select name="import_status" required>
            ${masterOptionHtml("import_status", defaultImportStatus, { allowBlank: false })}
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
          label: "วันที่เริ่ม",
          value: c.start_date || ""
        })}
        ${dateControlHtml({
          id: "customer-billing-date",
          name: "billing_date",
          label: "วันที่เริ่มวางบิล",
          value: c.billing_date || ""
        })}
      </div>
    </section>`;
}

  async function renderCustomerCreatePage() {
    el.mainContent.innerHTML = `
      ${pageHeader(
        "เพิ่มลูกค้า",
        "สร้างข้อมูลหลักก่อน แล้วระบบจะพาไปหน้าจัดการข้อมูลทั้งหมด",
        "",
        [{ label: "ข้อมูลลูกค้า", href: "#/customers" }, { label: "เพิ่มลูกค้า" }]
      )}
      <form id="customer-core-form" data-mode="create" class="customer-form-page" novalidate>
        <section class="panel form-page-panel">
          <div class="panel-body">
            ${customerCoreFields()}
          </div>
        </section>
        <div class="sticky-form-actions">
          <a class="btn btn-secondary" href="#/customers">ยกเลิก</a>
          <button id="customer-save-button" class="btn btn-primary" type="submit">${icon("save")} บันทึกและกรอกข้อมูลต่อ</button>
        </div>
      </form>`;
  }


function createCustomerEditDraft(data) {
  return {
    customerId: data.customer.id,
    original: data,
    contacts: data.contacts.map((contact) => ({
      ...contact,
      _key: contact.id,
      _isNew: false
    })),
    deletedContactIds: new Set(),
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

async function renderCustomerEditPage(customerId) {
  const data = await loadCustomerDetail(customerId);
  state.currentCustomer = data.customer;
  state.currentCustomerData = data;
  state.customerEditDraft = createCustomerEditDraft(data);
  const c = data.customer;

  const allProfiles = state.profiles.filter((profile) => profile.is_active);
  const selectedOwnerIds = new Set(data.owners.map((row) => row.profile_id));
  const primaryOwner = data.owners.find((row) => row.is_primary)?.profile_id || "";

  el.mainContent.innerHTML = `
    ${pageHeader(
      `แก้ไข: ${c.legal_name}`,
      "",
      "",
      [{ label: "ข้อมูลลูกค้า", href: "#/customers" }, { label: c.short_name || c.legal_name, href: `#/customer/${h(c.id)}` }, { label: "แก้ไข" }]
    )}

    <form id="customer-edit-form" data-customer-id="${h(c.id)}" class="customer-form-page" novalidate>
      <div class="edit-sections">
        <section id="customer-core-section" class="panel edit-section">
          <div class="panel-header"><h2>ข้อมูลหลัก</h2></div>
          <div class="panel-body">${customerCoreFields(c)}</div>
        </section>

        <section id="customer-owner-section" class="panel edit-section">
          <div class="panel-header"><h2>ผู้รับผิดชอบ</h2></div>
          <div class="panel-body">
            <div class="owner-grid">
              ${allProfiles.map((profile) => `
                <label class="choice-card">
                  <input type="checkbox" name="owner_id" value="${h(profile.id)}" ${selectedOwnerIds.has(profile.id) ? "checked" : ""}>
                  <span>${h(profile.display_name)}<small>${h(label("role", profile.role))}</small></span>
                </label>
              `).join("") || '<p class="muted">ยังไม่มีผู้ใช้งานที่เปิดใช้งาน</p>'}
            </div>
            <label class="field-block">
              <span class="field-label">ผู้รับผิดชอบหลัก</span>
              <select name="primary_owner">
                <option value="">ไม่ระบุ</option>
                ${allProfiles.map((profile) => `<option value="${h(profile.id)}" ${profile.id === primaryOwner ? "selected" : ""}>${h(profile.display_name)}</option>`).join("")}
              </select>
            </label>
          </div>
        </section>

        <section id="customer-contact-section" class="panel edit-section">
          <div class="panel-header">
            <h2>ผู้ติดต่อ</h2>
            <button type="button" class="btn btn-secondary btn-small" data-action="open-contact-create" data-customer-id="${h(c.id)}">${icon("plus")} เพิ่มผู้ติดต่อ</button>
          </div>
          <div class="panel-body">
            <div id="customer-contact-list" class="stack"></div>
          </div>
        </section>

        <section id="customer-module-section" class="panel edit-section">
          <div class="panel-header"><h2>โมดูลและฟังก์ชัน</h2></div>
          <div class="panel-body">
            <h3>โมดูล</h3>
            <div class="choice-grid">
              ${state.modules.filter((item) => item.is_active).map((item) => `
                <label class="choice-card">
                  <input type="checkbox" name="module_id" value="${h(item.id)}" ${data.moduleIds.includes(item.id) ? "checked" : ""}>
                  <span>${h(item.name)}</span>
                </label>`).join("")}
            </div>
            <h3 class="section-subtitle">ฟังก์ชัน</h3>
            <div class="choice-grid">
              ${state.features.filter((item) => item.is_active).map((item) => `
                <label class="choice-card">
                  <input type="checkbox" name="feature_id" value="${h(item.id)}" ${data.featureIds.includes(item.id) ? "checked" : ""}>
                  <span>${h(item.name)}</span>
                </label>`).join("")}
            </div>
          </div>
        </section>

        <section id="customer-operation-section" class="panel edit-section">
          <div class="panel-header"><h2>รูปแบบการดำเนินงาน</h2></div>
          <div class="panel-body">
            <label>
              <span class="field-label">วิธีจ่ายพนักงานขับรถ</span>
              <select name="driver_payment_method">
                ${masterOptionHtml("driver_payment_method", data.operations?.driver_payment_method || "")}
              </select>
            </label>
            <label>
              <span class="field-label">การจัดการค่าใช้จ่ายเที่ยว</span>
              <select name="trip_expense_management">
                ${masterOptionHtml("trip_expense_management", data.operations?.trip_expense_management || "")}
              </select>
            </label>
          </div>
        </section>

        <section id="customer-timeline-section" class="panel edit-section">
          <div class="panel-header"><h2>ประวัติการติดตาม</h2></div>
          <div class="panel-body">
            <div class="form-grid">
              <label>
                <span class="field-label">ประเภท</span>
                <select name="activity_type">
                  ${masterOptionHtml("activity_type", masterOptions("activity_type")[0]?.option_value || "note", { allowBlank: false })}
                </select>
              </label>
              ${dateControlHtml({
                id: "activity-date",
                name: "activity_date",
                label: "วันที่",
                value: bangkokDate()
              })}
              <label class="span-2">
                <span class="field-label">รายละเอียดใหม่</span>
                <textarea name="activity_detail" maxlength="10000" placeholder="เว้นว่างได้ หากไม่ต้องการเพิ่มรายการใหม่"></textarea>
              </label>
            </div>
            <div class="section-divider"></div>
            <div class="timeline-list">
              ${data.activities.map((activity) => `
                <article class="activity-item">
                  <strong>${h(label("activity_type", activity.activity_type))} · ${h(formatDate(activity.activity_date))}</strong>
                  <p>${h(activity.detail).replaceAll("\n", "<br>")}</p>
                  <small class="muted">${h(profileName(activity.created_by))} · ${h(formatDateTime(activity.created_at))}</small>
                </article>`).join("") || '<div class="empty-state compact"><strong>ยังไม่มีประวัติการติดตาม</strong></div>'}
            </div>
          </div>
        </section>
      </div>

      <div class="sticky-form-actions">
        <a class="btn btn-secondary" href="#/customer/${h(c.id)}">ยกเลิก</a>
        <button id="customer-save-button" class="btn btn-primary" type="submit">${icon("save")} บันทึก</button>
      </div>
    </form>`;

  renderCustomerDraftContacts();
}

  function openCustomerForm(customer = null) {
    location.hash = customer?.id ? `#/customer/${customer.id}/edit` : "#/customers/new";
  }

async function saveCustomer(event) {
  event.preventDefault();
  const formElement = event.target;
  if (!validateDateControls(formElement) || !formElement.reportValidity()) return;

  const button = formElement.querySelector('button[type="submit"]');
  setButtonBusy(button, true, "กำลังบันทึก...");
  setLoading(true, "กำลังสร้างข้อมูลลูกค้า...");

  try {
    const form = new FormData(formElement);
    const payload = {
      legal_name: String(form.get("legal_name") || "").trim(),
      short_name: nullable(form.get("short_name")),
      tax_id: String(form.get("tax_id") || "").trim(),
      fleet_size: Number(form.get("fleet_size") || 0),
      account_status: form.get("account_status"),
      onboarding_stage: nullable(form.get("onboarding_stage")),
      import_status: form.get("import_status"),
      engagement_level: nullable(form.get("engagement_level")),
      start_date: dateValue(formElement, "start_date"),
      billing_date: dateValue(formElement, "billing_date")
    };

    const result = await state.client.from("customers").insert(payload).select().single();
    if (result.error) throw result.error;

    state.customers = [];
    state.customerOwners = [];
    state.customerModules = [];
    state.customerFeatures = [];
    showToast("สร้างข้อมูลลูกค้าแล้ว");
    location.hash = `#/customer/${result.data.id}/edit`;
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

  const customerId = formElement.dataset.customerId;
  const button = formElement.querySelector('button[type="submit"]');
  const form = new FormData(formElement);
  const selectedOwnerIds = form.getAll("owner_id").map(String);
  const primaryOwnerId = nullable(form.get("primary_owner"));
  if (primaryOwnerId && !selectedOwnerIds.includes(primaryOwnerId)) {
    showToast("ผู้รับผิดชอบหลักต้องอยู่ในรายชื่อผู้รับผิดชอบที่เลือก", "error");
    return;
  }

  const primaryContacts = draft.contacts.filter((contact) => contact.is_primary && contact.is_active);
  if (primaryContacts.length > 1) {
    showToast("กำหนดผู้ติดต่อหลักที่เปิดใช้งานได้เพียงหนึ่งคน", "error");
    return;
  }

  setButtonBusy(button, true, "กำลังบันทึก...");
  setLoading(true, "กำลังบันทึกข้อมูลลูกค้า...");
  let currentStep = "ข้อมูลหลัก";
  let completedSteps = 0;

  try {
    const payload = {
      legal_name: String(form.get("legal_name") || "").trim(),
      short_name: nullable(form.get("short_name")),
      tax_id: String(form.get("tax_id") || "").trim(),
      fleet_size: Number(form.get("fleet_size") || 0),
      account_status: form.get("account_status"),
      onboarding_stage: nullable(form.get("onboarding_stage")),
      import_status: form.get("import_status"),
      engagement_level: nullable(form.get("engagement_level")),
      start_date: dateValue(formElement, "start_date"),
      billing_date: dateValue(formElement, "billing_date")
    };
    let result = await state.client.from("customers").update(payload).eq("id", customerId).select().single();
    if (result.error) throw result.error;
    completedSteps += 1;

    currentStep = "ผู้รับผิดชอบ";
    result = await state.client.rpc("save_customer_owners", {
      p_customer_id: customerId,
      p_owner_ids: selectedOwnerIds,
      p_primary_owner_id: primaryOwnerId
    });
    if (result.error) throw result.error;
    completedSteps += 1;

    currentStep = "โมดูลและฟังก์ชัน";
    const nextModuleIds = form.getAll("module_id").map(String);
    const nextFeatureIds = form.getAll("feature_id").map(String);
    await saveCustomerRelations(
      "customer_modules",
      "module_id",
      customerId,
      draft.original.moduleIds,
      nextModuleIds
    );
    await saveCustomerRelations(
      "customer_features",
      "feature_id",
      customerId,
      draft.original.featureIds,
      nextFeatureIds
    );
    draft.original.moduleIds = [...nextModuleIds];
    draft.original.featureIds = [...nextFeatureIds];
    completedSteps += 1;

    currentStep = "รูปแบบการดำเนินงาน";
    result = await state.client.from("customer_operations").upsert({
      customer_id: customerId,
      driver_payment_method: nullable(form.get("driver_payment_method")),
      trip_expense_management: nullable(form.get("trip_expense_management"))
    }, { onConflict: "customer_id" });
    if (result.error) throw result.error;
    completedSteps += 1;

    currentStep = "ผู้ติดต่อ";
    for (const contactId of [...draft.deletedContactIds]) {
      result = await state.client.from("customer_contacts").delete().eq("id", contactId).eq("customer_id", customerId);
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

    const activityDetail = String(form.get("activity_detail") || "").trim();
    if (activityDetail) {
      currentStep = "ประวัติการติดตาม";
      result = await state.client.from("customer_activities").insert({
        customer_id: customerId,
        activity_type: form.get("activity_type"),
        activity_date: dateValue(formElement, "activity_date") || bangkokDate(),
        detail: activityDetail
      });
      if (result.error) throw result.error;
      completedSteps += 1;
    }

    state.customers = [];
    state.customerOwners = [];
    state.customerModules = [];
    state.customerFeatures = [];
    state.customerEditDraft = null;
    showToast("บันทึกข้อมูลลูกค้าครบแล้ว");
    location.hash = `#/customer/${customerId}`;
  } catch (error) {
    console.error(error);
    renderCustomerDraftContacts();
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
      const customerResult = await state.client.from("customers").select("*").eq("id", customerId).eq("is_archived", false).single();
      if (customerResult.error) throw customerResult.error;
      customer = customerResult.data;
    }
    if (!customer) throw new Error("ไม่พบข้อมูลลูกค้า");

    const [
      ownersResult,
      contactsResult,
      modulesResult,
      featuresResult,
      operationsResult,
      activitiesResult
    ] = await Promise.all([
      state.client.from("customer_owners").select("*").eq("customer_id", customerId),
      state.client.from("customer_contacts").select("*").eq("customer_id", customerId).order("is_primary", { ascending: false }).order("contact_name"),
      state.client.from("customer_modules").select("customer_id,module_id").eq("customer_id", customerId),
      state.client.from("customer_features").select("customer_id,feature_id").eq("customer_id", customerId),
      state.client.from("customer_operations").select("*").eq("customer_id", customerId).maybeSingle(),
      state.client.from("customer_activities").select("*").eq("customer_id", customerId)
        .order("activity_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(100)
    ]);

    [ownersResult, contactsResult, modulesResult, featuresResult, operationsResult, activitiesResult]
      .forEach((result) => {
        if (result.error) throw result.error;
      });

    return {
      customer,
      owners: ownersResult.data || [],
      contacts: contactsResult.data || [],
      moduleIds: (modulesResult.data || []).map((row) => row.module_id),
      featureIds: (featuresResult.data || []).map((row) => row.feature_id),
      operations: operationsResult.data || null,
      activities: activitiesResult.data || []
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
    .map((owner) => `${profileName(owner.profile_id)}${owner.is_primary ? " (ผู้รับผิดชอบหลัก)" : ""}`);
  const moduleNames = state.modules.filter((item) => data.moduleIds.includes(item.id)).map((item) => item.name);
  const featureNames = state.features.filter((item) => data.featureIds.includes(item.id)).map((item) => item.name);

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
        <div class="panel-header"><h2>ข้อมูลหลัก</h2></div>
        <div class="panel-body">
          <dl class="meta-list meta-list-2">
            <dt>เลขประจำตัวผู้เสียภาษี</dt><dd>${h(c.tax_id)}</dd>
            <dt>จำนวนรถ</dt><dd>${Number(c.fleet_size || 0).toLocaleString("th-TH")}</dd>
            <dt>สถานะบัญชี</dt><dd><span class="status-badge" data-status="${h(c.account_status)}">${h(label("account_status", c.account_status))}</span></dd>
            <dt>ขั้นตอนเริ่มใช้งาน</dt><dd>${h(label("onboarding_stage", c.onboarding_stage))}</dd>
            <dt>สถานะการนำเข้าข้อมูล</dt><dd><span class="status-badge" data-status="${h(c.import_status)}">${h(label("import_status", c.import_status))}</span></dd>
            <dt>ระดับความสนใจ</dt><dd>${h(label("engagement_level", c.engagement_level))}</dd>
            <dt>วันที่เริ่ม</dt><dd>${h(formatDate(c.start_date))}</dd>
            <dt>วันที่เริ่มวางบิล</dt><dd>${h(formatDate(c.billing_date))}</dd>
            <dt>สร้างโดย</dt><dd>${h(profileName(c.created_by))} · ${h(formatDateTime(c.created_at))}</dd>
            <dt>แก้ไขล่าสุดโดย</dt><dd>${h(profileName(c.updated_by))} · ${h(formatDateTime(c.updated_at))}</dd>
          </dl>
        </div>
      </section>

      <section class="panel edit-section">
        <div class="panel-header"><h2>ผู้รับผิดชอบ</h2></div>
        <div class="panel-body">
          ${ownerList.length
            ? `<ul class="plain-list">${ownerList.map((name) => `<li>${h(name)}</li>`).join("")}</ul>`
            : '<p class="muted">ยังไม่มีผู้รับผิดชอบ</p>'}
        </div>
      </section>

      <section class="panel edit-section">
        <div class="panel-header"><h2>ผู้ติดต่อ</h2></div>
        <div class="panel-body">
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
      </section>

      <section class="panel edit-section">
        <div class="panel-header"><h2>โมดูลและฟังก์ชัน</h2></div>
        <div class="panel-body">
          <h3>โมดูล</h3>
          <div class="tag-list">${moduleNames.length ? moduleNames.map((name) => `<span class="tag">${h(name)}</span>`).join("") : '<span class="muted">-</span>'}</div>
          <h3 class="section-subtitle">ฟังก์ชัน</h3>
          <div class="tag-list">${featureNames.length ? featureNames.map((name) => `<span class="tag">${h(name)}</span>`).join("") : '<span class="muted">-</span>'}</div>
        </div>
      </section>

      <section class="panel edit-section">
        <div class="panel-header"><h2>รูปแบบการดำเนินงาน</h2></div>
        <div class="panel-body">
          <dl class="meta-list">
            <dt>วิธีจ่ายพนักงานขับรถ</dt><dd>${h(label("driver_payment_method", data.operations?.driver_payment_method))}</dd>
            <dt>การจัดการค่าใช้จ่ายเที่ยว</dt><dd>${h(label("trip_expense_management", data.operations?.trip_expense_management))}</dd>
          </dl>
        </div>
      </section>

      <section class="panel edit-section">
        <div class="panel-header"><h2>ประวัติการติดตาม</h2></div>
        <div class="panel-body">
          <div class="timeline-list">
            ${data.activities.map((activity) => `
              <article class="activity-item">
                <strong>${h(label("activity_type", activity.activity_type))} · ${h(formatDate(activity.activity_date))}</strong>
                <p>${h(activity.detail).replaceAll("\n", "<br>")}</p>
                <small class="muted">${h(profileName(activity.created_by))} · ${h(formatDateTime(activity.created_at))}</small>
              </article>
            `).join("") || '<div class="empty-state compact"><strong>ยังไม่มีประวัติการติดตาม</strong></div>'}
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
  const key = nullable(form.get("id")) || `new-${crypto.randomUUID()}`;
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
            <span class="role-badge">${h(label("role", profile.role))}</span>
            <button type="button" class="btn btn-secondary btn-small" data-action="open-avatar-editor" data-id="${h(profile.id)}">${icon("camera")} เปลี่ยนรูปโปรไฟล์</button>
          </div>
        </div>
        <div class="panel-body">
          <dl class="meta-list">
            <dt>ชื่อที่แสดง</dt><dd>${h(profile.display_name)}</dd>
            <dt>อีเมล</dt><dd>${h(profile.email)}</dd>
            <dt>สิทธิ์การใช้งาน</dt><dd>${h(label("role", profile.role))}</dd>
            <dt>สถานะ</dt><dd><span class="status-badge" data-status="${profile.is_active ? "active" : "inactive"}">${profile.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span></dd>
            <dt>สร้างบัญชี</dt><dd>${h(formatDateTime(profile.created_at))}</dd>
            <dt>อัปเดตล่าสุด</dt><dd>${h(formatDateTime(profile.updated_at))}</dd>
          </dl>
        </div>
      </section>

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
                <input type="radio" name="theme_mode" value="${value}" ${(profile.theme_mode || "light") === value ? "checked" : ""}>
                <span><strong>${title}</strong><small>${desc}</small></span>
              </label>
            `).join("")}
          </fieldset>

          <div class="form-section">
            <div class="form-section-heading">
              <h3>สีหลัก</h3>
            </div>

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
          <button type="button" class="btn btn-secondary" data-action="reset-theme-preview">${icon("refresh")} คืนค่าที่บันทึกไว้</button>
          <button id="profile-theme-save" type="submit" class="btn btn-primary">${icon("save")} บันทึกรูปแบบสี</button>
        </div>
      </form>
    </div>`;
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

  async function renderDailyReportPage(workDate = null) {
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
    if (report) {
      const result = await state.client
        .from("daily_report_items")
        .select("*")
        .eq("report_id", report.id)
        .order("section")
        .order("sort_order")
        .order("created_at");
      if (result.error) throw result.error;
      items = result.data || [];
    }

    state.currentDailyReport = report;
    state.currentDailyItems = items;
    const locked = report?.status === "acknowledged";
    const customerOptions = state.customers
      .filter((customer) => !customer.is_archived)
      .sort((a, b) => a.legal_name.localeCompare(b.legal_name, "th"))
      .map((customer) => `<option value="${h(customer.id)}">${h(customer.short_name || customer.legal_name)}</option>`)
      .join("");

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
      <section class="panel">
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

          ${!report ? `
            <div class="empty-state">
              <strong>ยังไม่มีรายงานสำหรับวันที่ ${h(formatDate(selectedDate))}</strong>
              <span>สร้างรายงานแล้วเพิ่มรายการของวันนี้และวันพรุ่งนี้ได้หลายข้อ</span>
              <button class="btn btn-primary" data-action="create-daily-report" data-date="${h(selectedDate)}">${icon("plus")} สร้างรายงาน</button>
            </div>
          ` : `
            ${locked ? `<div class="alert alert-info">ผู้จัดการรับทราบแล้ว รายงานนี้ถูกล็อกและไม่สามารถแก้ไขได้</div>` : ""}
            ${renderDailySection("today", "วันนี้ — สิ่งที่ทำ", items, customerOptions, locked)}
            ${renderDailySection("tomorrow", "วันพรุ่งนี้ — แผนงาน", items, customerOptions, locked)}
            ${["draft", "revision_required"].includes(report.status) ? `
              <div class="page-actions report-submit-actions">
                <button class="btn btn-primary" data-action="submit-report" data-id="${h(report.id)}">ส่งรายงานให้ผู้จัดการ</button>
              </div>` : ""}
          `}
        </div>
      </section>`;
  }


  function renderDailySection(section, title, items, customerOptions, locked) {
    const sectionItems = items.filter((item) => item.section === section);
    return `
      <section class="report-section">
        <h2>${h(title)}</h2>
        <div class="stack">
          ${sectionItems.map((item) => `
            <article class="report-item-editor" data-item-id="${h(item.id)}">
              <textarea data-field="detail" maxlength="5000" ${locked ? "disabled" : ""}>${h(item.detail)}</textarea>
              <select data-field="customer_id" ${locked ? "disabled" : ""}>
                <option value="">งานทั่วไป / ไม่ระบุลูกค้า</option>
                ${state.customers.filter((customer) => !customer.is_archived || customer.id === item.customer_id)
                  .sort((a, b) => a.legal_name.localeCompare(b.legal_name, "th"))
                  .map((customer) => `<option value="${h(customer.id)}" ${customer.id === item.customer_id ? "selected" : ""}>${h(customer.short_name || customer.legal_name)}</option>`)
                  .join("")}
              </select>
              ${!locked ? `
                <div class="report-item-actions">
                  <button class="btn btn-light btn-small" data-action="save-report-item" data-id="${h(item.id)}">บันทึก</button>
                  <button class="btn btn-danger btn-small" data-action="delete-report-item" data-id="${h(item.id)}">ลบ</button>
                </div>` : ""}
            </article>`).join("") || '<p class="muted">ยังไม่มีรายการ</p>'}
        </div>
        ${!locked ? `
          <form class="new-report-item-form" data-section="${h(section)}">
            <div class="report-item-editor">
              <textarea name="detail" maxlength="5000" placeholder="พิมพ์สิ่งที่ทำหรือแผนงาน..." required></textarea>
              <select name="customer_id">
                <option value="">งานทั่วไป / ไม่ระบุลูกค้า</option>
                ${customerOptions}
              </select>
              <div class="report-item-actions">
                <button class="btn btn-primary btn-small" type="submit">+ เพิ่มข้อ</button>
              </div>
            </div>
          </form>` : ""}
      </section>`;
  }

  async function createDailyReport(date) {
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
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity() || !state.currentDailyReport) return;
    const button = form.querySelector('button[type="submit"]');
    setButtonBusy(button, true, "กำลังเพิ่ม...");
    try {
      const data = new FormData(form);
      const section = form.dataset.section;
      const currentSection = state.currentDailyItems.filter((item) => item.section === section);
      const sortOrder = currentSection.reduce((max, item) => Math.max(max, item.sort_order), -1) + 1;
      const { error } = await state.client.from("daily_report_items").insert({
        report_id: state.currentDailyReport.id,
        section,
        customer_id: nullable(data.get("customer_id")),
        detail: String(data.get("detail")).trim(),
        sort_order: sortOrder
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
    const editor = button.closest(".report-item-editor");
    const detail = editor.querySelector('[data-field="detail"]').value.trim();
    const customerId = editor.querySelector('[data-field="customer_id"]').value || null;
    if (!detail) {
      showToast("กรุณากรอกรายละเอียด", "error");
      return;
    }
    setButtonBusy(button, true);
    try {
      const { error } = await state.client
        .from("daily_report_items")
        .update({ detail, customer_id: customerId })
        .eq("id", itemId);
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
    .order("work_date", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(1000);
  if (error) throw error;
  state.managerReports = data || [];

  if (!state.ui.managerFilters.date) state.ui.managerFilters.date = bangkokDate();
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
              ${state.profiles.filter((profile) => profile.role === "user").map((profile) => `
                <option value="${h(profile.id)}" ${filters.userId === profile.id ? "selected" : ""}>${h(profile.display_name)}</option>
              `).join("")}
            </select>
          </div>
          <div class="toolbar-field">
            <label for="manager-report-status"><span class="field-label">สถานะ</span></label>
            <select id="manager-report-status">
              <option value="">ทั้งหมด</option>
              <option value="draft" ${filters.status === "draft" ? "selected" : ""}>ฉบับร่าง</option>
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
        minWidth: 180,
        flex: 1
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

    const [itemsResult, eventsResult] = await Promise.all([
      state.client.from("daily_report_items").select("*").eq("report_id", reportId).order("section").order("sort_order"),
      state.client.from("daily_report_events").select("*").eq("report_id", reportId).order("created_at")
    ]);
    if (itemsResult.error) throw itemsResult.error;
    if (eventsResult.error) throw eventsResult.error;

    state.reviewReport = {
      report,
      items: itemsResult.data || [],
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
            <p class="muted">
              ผู้จัดทำ ${h(profileName(report.user_id))}
              <span aria-hidden="true">·</span>
              รุ่นเนื้อหา ${h(report.content_version)}
            </p>
          </div>
          <button type="button" class="icon-button" data-action="close-dialog" data-dialog="report-dialog" aria-label="ปิด">✕</button>
        </div>

        <div class="dialog-body report-review-body">
          ${report.status === "revision_required"
            ? `<div class="alert alert-danger report-review-alert"><strong>เหตุผลที่ส่งกลับ</strong><span>${h(report.last_revision_reason || "-")}</span></div>`
            : ""}
          <div class="report-review-sections">
            ${renderReportReadOnlySection("วันนี้ — สิ่งที่ทำ", today)}
            ${renderReportReadOnlySection("วันพรุ่งนี้ — แผนงาน", tomorrow)}
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

  function renderReportReadOnlySection(title, items) {
    return `
      <section class="report-summary">
        <h3>${h(title)}</h3>
        ${items.length ? `
          <ol>
            ${items.map((item) => {
              const customer = state.customers.find((row) => row.id === item.customer_id);
              return `<li>${h(item.detail).replaceAll("\n", "<br>")}${customer ? ` <span class="tag">${h(customer.short_name || customer.legal_name)}</span>` : ""}</li>`;
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

  async function renderAdminUsersPage() {
    try { state.grids.users?.destroy?.(); } catch (error) { console.warn(error); }
    state.grids.users = null;
    await loadCommonData(true);
    state.ui.profileDrafts.clear();

    el.mainContent.innerHTML = `
      ${pageHeader(
        "จัดการผู้ใช้",
        "กำหนดสิทธิ์และสถานะบัญชีผู้ใช้งาน",
        "",
        [{ label: "จัดการผู้ใช้" }]
      )}
      <section class="panel">
        <div class="toolbar">
          <div class="toolbar-row">
            <div class="toolbar-field toolbar-search">
              <label for="admin-user-search">ค้นหาผู้ใช้</label>
              <input id="admin-user-search" type="search" placeholder="ชื่อ อีเมล หรือสิทธิ์" autocomplete="off">
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
          headerName: "ชื่อ",
          field: "display_name",
          pinned: window.innerWidth >= 760 ? "left" : undefined,
          minWidth: 210,
          flex: 1,
          cellRenderer: (params) => {
            const wrapper = document.createElement("div");
            wrapper.className = "grid-primary-cell";
            const title = document.createElement("strong");
            title.textContent = params.value || "-";
            wrapper.append(title);
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
          headerName: "อีเมล",
          field: "email",
          minWidth: 240,
          flex: 1.2
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
              option.selected = params.data.role === role;
              select.append(option);
            });
            select.addEventListener("change", () => {
              const draft = state.ui.profileDrafts.get(params.data.id) || {
                role: params.data.role,
                is_active: params.data.is_active
              };
              draft.role = select.value;
              state.ui.profileDrafts.set(params.data.id, draft);
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
              return statusBadgeNode(params.data.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน", params.data.is_active ? "active" : "inactive");
            }
            const labelNode = document.createElement("label");
            labelNode.className = "grid-switch";
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = Boolean(params.data.is_active);
            checkbox.setAttribute("aria-label", `สถานะของ ${params.data.display_name}`);
            const text = document.createElement("span");
            text.textContent = checkbox.checked ? "เปิดใช้งาน" : "ปิดใช้งาน";
            checkbox.addEventListener("change", () => {
              text.textContent = checkbox.checked ? "เปิดใช้งาน" : "ปิดใช้งาน";
              const draft = state.ui.profileDrafts.get(params.data.id) || {
                role: params.data.role,
                is_active: params.data.is_active
              };
              draft.is_active = checkbox.checked;
              state.ui.profileDrafts.set(params.data.id, draft);
            });
            labelNode.append(checkbox, text);
            return labelNode;
          }
        },
        {
          headerName: "รูปแบบสี",
          field: "theme_accent",
          minWidth: 120,
          cellRenderer: (params) => {
            const wrapper = document.createElement("div");
            wrapper.className = "grid-theme-chip";
            const dot = document.createElement("span");
            dot.style.background = normalizeHex(params.value || "#2f68e6");
            const text = document.createElement("span");
            text.textContent = ({ light: "สว่าง", dark: "มืด", system: "ตามอุปกรณ์" })[params.data.theme_mode] || "สว่าง";
            wrapper.append(dot, text);
            return wrapper;
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
            if (params.data.id === state.profile.id) {
              const placeholder = document.createElement("span");
              placeholder.className = "grid-action-placeholder";
              placeholder.textContent = "—";
              placeholder.title = "บัญชีของคุณ";
              wrapper.append(placeholder);
            } else {
              wrapper.append(iconActionButtonNode({
                label: "บันทึกการเปลี่ยนแปลงผู้ใช้",
                action: "save-profile",
                id: params.data.id,
                iconName: "save",
                variant: "primary"
              }));
            }
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
    const draft = state.ui.profileDrafts.get(profileId) || {
      role: original.role,
      is_active: original.is_active
    };

    setButtonBusy(button, true, "กำลังบันทึก...");
    try {
      const { error } = await state.client.rpc("admin_update_profile", {
        p_profile_id: profileId,
        p_role: draft.role,
        p_is_active: Boolean(draft.is_active)
      });
      if (error) throw error;
      showToast("บันทึกผู้ใช้แล้ว");
      await renderAdminUsersPage();
    } catch (error) {
      showError(error, "บันทึกผู้ใช้ไม่สำเร็จ");
    } finally {
      setButtonBusy(button, false);
    }
  }


  function buildPrintReport(report, items) {
    const owner = profileName(report.user_id);
    const today = items.filter((item) => item.section === "today");
    const tomorrow = items.filter((item) => item.section === "tomorrow");
    const renderItems = (rows) => rows.length
      ? `<ol>${rows.map((item) => {
          const customer = state.customers.find((row) => row.id === item.customer_id);
          return `<li>${h(item.detail).replaceAll("\n", "<br>")}${customer ? ` — <strong>${h(customer.short_name || customer.legal_name)}</strong>` : ""}</li>`;
        }).join("")}</ol>`
      : "<p>- ไม่มีรายการ -</p>";
    el.printRoot.innerHTML = `
      <h1>รายงานการทำงานประจำวัน</h1>
      <p><strong>ผู้จัดทำ:</strong> ${h(owner)}</p>
      <p><strong>วันที่:</strong> ${h(formatDate(report.work_date))}</p>
      <p><strong>สถานะ:</strong> ${h(label("report_status", report.status))}</p>
      <h2>วันนี้ — สิ่งที่ทำ</h2>
      ${renderItems(today)}
      <h2>วันพรุ่งนี้ — แผนงาน</h2>
      ${renderItems(tomorrow)}
      <p style="margin-top:32px;font-size:10pt">พิมพ์จากระบบติดตามลูกค้า FI · ${h(formatDateTime(new Date().toISOString()))}</p>`;
    window.print();
  }

  async function printOwnReport() {
    if (!state.currentDailyReport) return;
    buildPrintReport(state.currentDailyReport, state.currentDailyItems);
  }

  function printReviewReport() {
    if (!state.reviewReport) return;
    buildPrintReport(state.reviewReport.report, state.reviewReport.items);
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
    state.customers = [];
    state.customerOwners = [];
    state.customerModules = [];
    state.customerFeatures = [];
    state.currentCustomer = null;
    state.currentCustomerData = null;
    state.customerEditDraft = null;
    showToast("ลบข้อมูลลูกค้าแล้ว");
    location.hash = "#/customers";
  });
}



  async function deleteDailyItem(itemId) {
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
    el.revisionForm.addEventListener("submit", requestRevision);
    el.avatarForm.addEventListener("submit", saveAvatar);

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
        showLogin();
      } else if (state.session?.user?.id !== data.session.user.id) {
        await handleSession(data.session);
      }
    });

    document.addEventListener("submit", async (event) => {
      try {
        if (event.target.id === "customer-core-form") await saveCustomer(event);
        else if (event.target.id === "customer-edit-form") await saveCustomerEdit(event);
        else if (event.target.id === "profile-theme-form") await saveMyProfilePreferences(event);
        else if (event.target.id === "external-link-form") await saveExternalLink(event);
        else if (event.target.id === "master-option-form") await saveMasterOption(event);
        else if (event.target.classList.contains("new-report-item-form")) await addDailyReportItem(event);
      } catch (error) {
        showError(error);
      }
    });

    document.addEventListener("input", (event) => {
      const target = event.target;

      if (target.matches("[data-date-display]")) {
        syncDateControlFromDisplay(target, false);
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

      if (target.closest("#customer-edit-form")) {
        markCustomerEditDirty();
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
        } else if (["customer-start-from", "customer-start-to", "customer-billing-from", "customer-billing-to"].includes(target.id)) {
          renderCustomerTable();
        }
      } catch (error) {
        showError(error, "เปลี่ยนวันที่ไม่สำเร็จ");
      }
    });

    document.addEventListener("change", async (event) => {
      const target = event.target;
      try {
        if (target.matches("[data-date-native]")) {
          syncDateControlFromNative(target, true);
        } else if ([
          "customer-status-filter",
          "customer-owner-filter",
          "customer-onboarding-filter",
          "customer-import-filter",
          "customer-engagement-filter",
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
            requireSquare: true
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
            requireSquare: true
          });
          const preview = document.getElementById(isLogin ? "login-image-preview" : "favicon-image-preview");
          const objectUrl = URL.createObjectURL(target.files[0]);
          if (preview) preview.innerHTML = `<img src="${h(objectUrl)}" alt="ตัวอย่างรูปภาพ">`;
        } else if (target.closest("#customer-edit-form")) {
          markCustomerEditDirty();
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
          case "reset-customer-filters": {
            state.ui.customerFilters = {
              search: "", status: "", owner: "", onboarding: "", importStatus: "",
              engagement: "", moduleId: "", featureId: "", fleetMin: "", fleetMax: "",
              startFrom: "", startTo: "", billingFrom: "", billingTo: "", advancedOpen: false
            };
            await withGlobalLoading("กำลังล้างตัวกรอง...", () => renderCustomersPage());
            break;
          }
          case "export-customers-excel":
            await runExcelExport(target, exportCustomersExcel);
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
          case "create-daily-report":
            await createDailyReport(target.dataset.date);
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
            await removeBrandingImage(target.dataset.kind);
            break;
          case "reset-external-link-form":
            resetExternalLinkForm();
            break;
          case "edit-external-link":
            editExternalLink(target.dataset.id);
            break;
          case "delete-external-link":
            await deleteExternalLink(target.dataset.id);
            break;
          case "reset-master-option-form":
            resetMasterOptionForm();
            break;
          case "edit-master-option":
            editMasterOption(target.dataset.id, target.dataset.group);
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
