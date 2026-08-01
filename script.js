(() => {
  "use strict";

  const APP_VERSION = "0.5.0-ag-experience";

  // Public browser configuration only. Never place a database password,
  // secret key, or service_role key in this file.
  const SUPABASE_URL = "https://edewezrgycqvhdtlprsw.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkZXdlenJneWNxdmhkdGxwcnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1Njc5NTIsImV4cCI6MjEwMTE0Mzk1Mn0.QPEkfCaRMOn77d_q5612MA1n-5EpJ7myiUdBpCFqQX8";

  const LABELS = {
    role: { admin: "Admin", manager: "Manager", user: "User" },
    account_status: { active: "ใช้งาน", inactive: "ไม่ใช้งาน" },
    onboarding_stage: {
      to_do: "To do",
      pending_data: "รอข้อมูล",
      onboarding: "Onboarding",
      training_completed: "อบรมแล้ว",
      go_live: "Go Live"
    },
    import_status: { waiting: "รอ", in_process: "กำลังดำเนินการ", done: "เสร็จแล้ว" },
    engagement_level: { interest: "สนใจ", neutral: "เฉย ๆ" },
    report_status: {
      draft: "ฉบับร่าง",
      submitted: "ส่งแล้ว",
      acknowledged: "รับทราบแล้ว",
      revision_required: "ส่งกลับให้แก้ไข"
    },
    activity_type: {
      note: "หมายเหตุ",
      call: "โทร",
      meeting: "ประชุม",
      follow_up: "ติดตาม",
      system: "ระบบ"
    },
    event_type: {
      created: "สร้างรายงาน",
      submitted: "ส่งรายงาน",
      resubmitted: "ส่งรายงานอีกครั้ง",
      acknowledged: "Manager รับทราบ",
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
    modules: [],
    features: [],
    currentCustomer: null,
    currentCustomerData: null,
    currentDailyReport: null,
    currentDailyItems: [],
    managerReports: [],
    reviewReport: null,
    routeRenderToken: 0,
    authHandling: false,
    loadingCount: 0,
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
        archivedOnly: false
      },
      managerFilters: {
        date: "",
        userId: "",
        status: "",
        allDates: false
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
    return LABELS[group]?.[value] ?? String(value);
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
      save: '<path d="M5 3h12l2 2v16H5z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>'
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
          <nav class="breadcrumb" aria-label="Breadcrumb">
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
      ["customers_tax_id", "Tax ID นี้มีอยู่แล้ว"],
      ["Only one active manager is allowed", "ระบบอนุญาต Active Manager ได้เพียง 1 คน"],
      ["Daily report is locked", "รายงานนี้ถูกล็อกแล้ว"],
      ["Report content changed", "เนื้อหารายงานมีการเปลี่ยนแปลง กรุณาโหลดใหม่"],
      ["Add at least one report item", "กรุณาเพิ่มรายการอย่างน้อย 1 ข้อก่อนส่ง"],
      ["A revision reason is required", "กรุณาระบุเหตุผลที่ส่งกลับ"],
      ["permission denied", "คุณไม่มีสิทธิ์ทำรายการนี้"],
      ["row-level security", "คุณไม่มีสิทธิ์เข้าถึงหรือแก้ไขข้อมูลนี้"]
    ];
    const match = known.find(([needle]) => message.includes(needle));
    return match ? match[1] : message;
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
    help = "รูปแบบ DD/MM/YYYY"
  }) {
    const displayId = `${id}-display`;
    const helpId = `${id}-help`;
    return `
      <div class="form-field date-field">
        <label for="${h(displayId)}">${h(fieldLabel)}${required ? ' <span class="required">*</span>' : ""}</label>
        <div class="date-control" data-date-control>
          <input id="${h(displayId)}" data-date-display type="text" inputmode="numeric"
                 autocomplete="off" placeholder="DD/MM/YYYY" maxlength="10"
                 value="${value ? h(formatDate(value)) : ""}" aria-describedby="${h(helpId)}"
                 ${required ? "required" : ""}>
          <button type="button" class="date-picker-button" data-action="open-date-picker"
                  aria-label="เปิดปฏิทินสำหรับ ${h(fieldLabel)}">${icon("calendar")}</button>
          <input id="${h(id)}" name="${h(name)}" data-date-native class="native-date-picker"
                 type="date" value="${h(value || "")}" tabindex="-1" aria-hidden="true">
        </div>
        <small id="${h(helpId)}" class="field-help">${h(help)}</small>
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

  function createCommunityGrid(container, gridOptions, key) {
    if (!container) return null;
    if (!window.agGrid?.createGrid) {
      container.innerHTML = `
        <div class="dependency-error" role="alert">
          <strong>โหลด AG Grid Community ไม่สำเร็จ</strong>
          <span>กรุณาตรวจสอบอินเทอร์เน็ตหรือ Content Security Policy แล้วลองใหม่</span>
          <button class="btn btn-secondary btn-small" data-action="refresh-route">ลองใหม่</button>
        </div>`;
      return null;
    }

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
      ensureDomOrder: true,
      overlayLoadingTemplate: '<div class="ag-overlay-message"><span class="spinner spinner-small"></span><span>กำลังโหลดข้อมูล...</span></div>',
      overlayNoRowsTemplate: '<div class="ag-overlay-message">ไม่พบข้อมูลที่ตรงกับเงื่อนไข</div>',
      localeText: {
        page: "หน้า",
        more: "เพิ่มเติม",
        to: "ถึง",
        of: "จาก",
        next: "ถัดไป",
        last: "สุดท้าย",
        first: "แรก",
        previous: "ก่อนหน้า",
        loadingOoo: "กำลังโหลด...",
        noRowsToShow: "ไม่พบข้อมูล",
        searchOoo: "ค้นหา...",
        filterOoo: "กรอง...",
        equals: "เท่ากับ",
        notEqual: "ไม่เท่ากับ",
        contains: "มีคำว่า",
        notContains: "ไม่มีคำว่า",
        startsWith: "ขึ้นต้นด้วย",
        endsWith: "ลงท้ายด้วย",
        blank: "ว่าง",
        notBlank: "ไม่ว่าง"
      },
      ...gridOptions
    };

    const api = window.agGrid.createGrid(container, options);
    state.grids[key] = api;
    return api;
  }

  function createCommunityChart(container, options) {
    if (!container) return null;
    if (!window.agCharts?.AgCharts?.create) {
      container.innerHTML = `
        <div class="dependency-error" role="alert">
          <strong>โหลด AG Charts Community ไม่สำเร็จ</strong>
          <span>กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่</span>
        </div>`;
      return null;
    }
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
    return chart;
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

    createCommunityChart(document.getElementById("report-chart"), {
      data: data.reportStatus,
      series: [{
        type: "bar",
        xKey: "label",
        yKey: "count",
        yName: "รายงาน",
        fill: palette[0],
        stroke: palette[0],
        label: { enabled: true }
      }],
      legend: { enabled: false },
      axes: [
        { type: "category", position: "bottom" },
        { type: "number", position: "left", min: 0, nice: true }
      ]
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

  function actionButtonNode({ label: buttonLabel, action, id, className = "btn btn-secondary btn-small" }) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.dataset.action = action;
    if (id) button.dataset.id = id;
    button.textContent = buttonLabel;
    return button;
  }

  async function init() {
    document.querySelectorAll("[data-app-version]").forEach((node) => {
      node.textContent = APP_VERSION;
    });

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
          if (!profileResult.error) {
            profileResult.data.theme_mode = "light";
            profileResult.data.theme_accent = "#2f68e6";
            showToast("ยังไม่ได้รัน Migration 004 จึงใช้ Theme เริ่มต้นชั่วคราว", "warning");
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
  }

  function showApp() {
    el.loginView.classList.add("hidden");
    el.appView.classList.remove("hidden");
    el.currentUserName.textContent = state.profile?.display_name || "-";
    el.currentUserRole.textContent = label("role", state.profile?.role);
    if (el.currentUserAvatar) {
      el.currentUserAvatar.textContent = userInitials(state.profile?.display_name);
    }
    applyThemePreferences(state.profile || {});
    const collapsed = window.localStorage.getItem("fi-sidebar-collapsed") === "true";
    el.appView.classList.toggle("sidebar-collapsed", collapsed && window.innerWidth > 820);
    renderNavigation();
  }

  function renderNavigation() {
    const role = state.profile?.role;
    const groups = [
      {
        label: "Workspace",
        items: [
          { route: "dashboard", icon: "dashboard", label: "ภาพรวม", roles: ["admin", "manager", "user"] },
          { route: "customers", icon: "customers", label: "ข้อมูลลูกค้า", roles: ["admin", "manager", "user"] }
        ]
      },
      {
        label: "Reports & Admin",
        items: [
          { route: "daily-report", icon: "report", label: "รายงานประจำวัน", roles: ["user"] },
          { route: "manager-reports", icon: "team", label: "รายงานของทีม", roles: ["admin", "manager"] },
          { route: "admin-users", icon: "users", label: "จัดการผู้ใช้", roles: ["admin"] }
        ]
      },
      {
        label: "Account",
        items: [
          { route: "profile", icon: "profile", label: "โปรไฟล์และธีม", roles: ["admin", "manager", "user"] }
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
      "daily-report": ["user"],
      "manager-reports": ["admin", "manager"],
      "admin-users": ["admin"]
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
      profile: "โปรไฟล์และธีม",
      "daily-report": "รายงานประจำวัน",
      "manager-reports": "รายงานของทีม",
      "admin-users": "จัดการผู้ใช้"
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
      el.topbarPageLabel.textContent = pageLabels[route.name] || "FI Workspace";
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
        default:
          location.hash = "#/dashboard";
          return;
      }

      if (token === state.routeRenderToken) {
        document.title = `${pageLabels[route.name] || "FI Workspace"} · FI Customer Tracking`;
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
    if (!force && state.profiles.length && state.modules.length && state.features.length) return;

    let profilesResult = await state.client
      .from("profiles")
      .select("id,display_name,email,role,is_active,theme_mode,theme_accent")
      .order("display_name");

    if (
      profilesResult.error &&
      /theme_mode|theme_accent|column .* does not exist/i.test(profilesResult.error.message || "")
    ) {
      profilesResult = await state.client
        .from("profiles")
        .select("id,display_name,email,role,is_active")
        .order("display_name");
      if (!profilesResult.error) {
        profilesResult.data = (profilesResult.data || []).map((profile) => ({
          ...profile,
          theme_mode: "light",
          theme_accent: "#2f68e6"
        }));
      }
    }

    const [modulesResult, featuresResult] = await Promise.all([
      state.client.from("modules").select("id,code,name,is_active").order("name"),
      state.client.from("features").select("id,code,name,is_active").order("name")
    ]);

    if (profilesResult.error) throw profilesResult.error;
    if (modulesResult.error) throw modulesResult.error;
    if (featuresResult.error) throw featuresResult.error;

    state.profiles = profilesResult.data || [];
    state.modules = modulesResult.data || [];
    state.features = featuresResult.data || [];
  }


  async function loadCustomers(force = false) {
    if (!force && state.customers.length) return;
    const [customersResult, ownersResult] = await Promise.all([
      state.client
        .from("customers")
        .select("id,legacy_customer_id,legal_name,short_name,tax_id,fleet_size,account_status,onboarding_stage,import_status,engagement_level,start_date,billing_date,is_archived,archived_at,archived_by,created_at,created_by,updated_at,updated_by")
        .order("updated_at", { ascending: false })
        .limit(1000),
      state.client
        .from("customer_owners")
        .select("customer_id,profile_id,is_primary")
        .limit(5000)
    ]);
    if (customersResult.error) throw customersResult.error;
    if (ownersResult.error) throw ownersResult.error;
    state.customers = customersResult.data || [];
    state.customerOwners = ownersResult.data || [];
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
    const activeCustomers = state.customers.filter((customer) => !customer.is_archived);
    const archived = state.customers.length - activeCustomers.length;
    const goLive = activeCustomers.filter((customer) => customer.onboarding_stage === "go_live").length;
    const importPending = activeCustomers.filter((customer) => customer.import_status !== "done").length;
    const updatedAt = formatDateTime(new Date().toISOString());

    let reportQuery = state.client.from("daily_reports").select("id,status,work_date,user_id,updated_at,last_revision_reason");
    if (state.profile.role === "user") {
      reportQuery = reportQuery
        .eq("user_id", state.profile.id)
        .gte("work_date", bangkokDate(-29))
        .order("work_date", { ascending: false });
    } else {
      reportQuery = reportQuery
        .eq("work_date", bangkokDate())
        .order("updated_at", { ascending: false });
    }
    const { data: reports, error: reportsError } = await reportQuery;
    if (reportsError) throw reportsError;
    const reportRows = reports || [];

    const onboardingOrder = ["to_do", "pending_data", "onboarding", "training_completed", "go_live"];
    const onboarding = onboardingOrder.map((key) => ({
      key,
      label: label("onboarding_stage", key),
      count: activeCustomers.filter((customer) => customer.onboarding_stage === key).length
    }));
    const noStage = activeCustomers.filter((customer) => !customer.onboarding_stage).length;
    if (noStage) onboarding.unshift({ key: "unknown", label: "ไม่ระบุ", count: noStage });

    const importStatus = ["waiting", "in_process", "done"].map((key) => ({
      key,
      label: label("import_status", key),
      count: activeCustomers.filter((customer) => customer.import_status === key).length
    }));

    const reportStatus = ["draft", "submitted", "acknowledged", "revision_required"].map((key) => ({
      key,
      label: label("report_status", key),
      count: reportRows.filter((report) => report.status === key).length
    }));

    state.dashboardChartData = { onboarding, importStatus, reportStatus };

    let rolePanel = "";
    if (state.profile.role === "user") {
      const todayReport = reportRows.find((report) => report.work_date === bangkokDate()) || null;
      rolePanel = `
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2>รายงานประจำวันนี้</h2>
              <p class="muted">บันทึกสิ่งที่ทำวันนี้และแผนงานวันพรุ่งนี้</p>
            </div>
            ${todayReport ? `<span class="status-badge" data-status="${h(todayReport.status)}">${h(label("report_status", todayReport.status))}</span>` : ""}
          </div>
          <div class="panel-body">
            ${todayReport ? `
              ${todayReport.last_revision_reason && todayReport.status === "revision_required"
                ? `<div class="alert alert-danger"><strong>Manager ส่งกลับ:</strong>&nbsp;${h(todayReport.last_revision_reason)}</div>`
                : ""}
              <div class="toolbar-summary">
                <span>อัปเดตล่าสุด ${h(formatDateTime(todayReport.updated_at))}</span>
                <a class="btn btn-primary" href="#/daily-report">เปิดรายงาน</a>
              </div>
            ` : `
              <div class="empty-state">
                <strong>ยังไม่มีรายงานสำหรับวันนี้</strong>
                <span>เริ่มบันทึกงานได้ทันทีและกลับมาแก้ไขก่อน Manager รับทราบ</span>
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
                <span class="stat-meta">ฉบับที่ User ส่งแล้ว</span>
              </div>
              <div class="card stat-card">
                <div class="stat-card-header">
                  <span class="stat-label">รับทราบแล้ว</span>
                  <span class="stat-icon">${icon("check")}</span>
                </div>
                <span class="stat-value">${acknowledged}</span>
                <span class="stat-meta">ฉบับที่ล็อกเรียบร้อย</span>
              </div>
              <div class="card stat-card">
                <div class="stat-card-header">
                  <span class="stat-label">ส่งกลับแก้ไข</span>
                  <span class="stat-icon">${icon("refresh")}</span>
                </div>
                <span class="stat-value">${revision}</span>
                <span class="stat-meta">ฉบับที่รอ User แก้ไข</span>
              </div>
            </div>
          </div>
        </section>`;
    }

    el.mainContent.innerHTML = `
      ${pageHeader("ภาพรวม", `ข้อมูลล่าสุด ณ ${updatedAt}`)}
      <section class="cards-grid" style="margin-bottom:20px">
        <div class="card stat-card">
          <div class="stat-card-header">
            <span class="stat-label">ลูกค้าที่ใช้งาน</span>
            <span class="stat-icon">${icon("building")}</span>
          </div>
          <span class="stat-value">${activeCustomers.length}</span>
          <span class="stat-meta">ไม่รวมรายการ Archive</span>
        </div>
        <div class="card stat-card">
          <div class="stat-card-header">
            <span class="stat-label">Go Live</span>
            <span class="stat-icon">${icon("rocket")}</span>
          </div>
          <span class="stat-value">${goLive}</span>
          <span class="stat-meta">ผ่านขั้นตอน Onboarding</span>
        </div>
        <div class="card stat-card">
          <div class="stat-card-header">
            <span class="stat-label">Import ยังไม่เสร็จ</span>
            <span class="stat-icon">${icon("import")}</span>
          </div>
          <span class="stat-value">${importPending}</span>
          <span class="stat-meta">รอหรือกำลังดำเนินการ</span>
        </div>
        <div class="card stat-card">
          <div class="stat-card-header">
            <span class="stat-label">Archive</span>
            <span class="stat-icon">${icon("archive")}</span>
          </div>
          <span class="stat-value">${archived}</span>
          <span class="stat-meta">เก็บประวัติและกู้คืนได้</span>
        </div>
      </section>

      <section class="chart-grid" aria-label="กราฟสรุป">
        <article class="panel chart-panel">
          <div class="panel-header">
            <div><h2>สถานะ Onboarding</h2><p class="muted">จำนวนลูกค้าตามขั้นตอน</p></div>
          </div>
          <div id="onboarding-chart" class="chart-container">
            <div class="chart-loading"><span class="spinner"></span><span>กำลังสร้างกราฟ...</span></div>
          </div>
        </article>
        <article class="panel chart-panel">
          <div class="panel-header">
            <div><h2>สถานะ Import</h2><p class="muted">สัดส่วนความคืบหน้าการนำเข้าข้อมูล</p></div>
          </div>
          <div id="import-chart" class="chart-container">
            <div class="chart-loading"><span class="spinner"></span><span>กำลังสร้างกราฟ...</span></div>
          </div>
        </article>
        <article class="panel chart-panel chart-panel-wide">
          <div class="panel-header">
            <div>
              <h2>สถานะ Daily Report</h2>
              <p class="muted">${state.profile.role === "user" ? "รายงานของคุณย้อนหลัง 30 วัน" : "รายงานของทีมวันนี้"}</p>
            </div>
          </div>
          <div id="report-chart" class="chart-container">
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
        "ค้นหา กรอง และเปิดรายละเอียดลูกค้าทั้งหมด",
        `<a class="btn btn-primary" href="#/customers/new">${icon("plus")} เพิ่มลูกค้า</a>`,
        [{ label: "ข้อมูลลูกค้า" }]
      )}
      <section class="panel">
        <div class="toolbar">
          <div class="toolbar-row">
            <div class="toolbar-field toolbar-search">
              <label for="customer-search">ค้นหา</label>
              <input id="customer-search" type="search" placeholder="ชื่อบริษัท ชื่อย่อ Tax ID หรือ Owner"
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
              <label for="customer-owner-filter">Owner</label>
              <select id="customer-owner-filter">
                <option value="">ทั้งหมด</option>
                <option value="unassigned" ${filters.owner === "unassigned" ? "selected" : ""}>ยังไม่มี Owner</option>
                ${state.profiles.filter((p) => p.is_active).map((p) => `
                  <option value="${h(p.id)}" ${filters.owner === p.id ? "selected" : ""}>${h(p.display_name)}</option>
                `).join("")}
              </select>
            </div>
            <div class="toolbar-actions">
              <label class="check-label">
                <input id="customer-archive-filter" type="checkbox" ${filters.archivedOnly ? "checked" : ""}>
                <span>เฉพาะ Archive</span>
              </label>
              <button class="btn btn-secondary" data-action="reset-customer-filters">${icon("refresh")} รีเซ็ต</button>
              <button class="btn btn-secondary" data-action="export-customers-csv">${icon("download")} CSV</button>
            </div>
          </div>
        </div>
        <div class="grid-status-row">
          <span id="customer-grid-count" class="muted">กำลังเตรียมข้อมูล...</span>
          <span class="muted">ลากหัวคอลัมน์เพื่อจัดลำดับ · ปรับความกว้างและกรองได้</span>
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
    filters.search = document.getElementById("customer-search")?.value.trim() || filters.search || "";
    filters.status = document.getElementById("customer-status-filter")?.value ?? filters.status ?? "";
    filters.owner = document.getElementById("customer-owner-filter")?.value ?? filters.owner ?? "";
    filters.archivedOnly = document.getElementById("customer-archive-filter")?.checked ?? filters.archivedOnly ?? false;

    const query = filters.search.toLowerCase();
    const rows = state.customers
      .filter((customer) => {
        const owners = state.customerOwners.filter((item) => item.customer_id === customer.id);
        const ownerText = owners.map((item) => profileName(item.profile_id)).join(" ");
        const haystack = `${customer.legal_name} ${customer.short_name || ""} ${customer.tax_id} ${ownerText}`.toLowerCase();
        const ownerMatch = !filters.owner
          || (filters.owner === "unassigned" && owners.length === 0)
          || owners.some((item) => item.profile_id === filters.owner);
        return (
          (!query || haystack.includes(query))
          && (!filters.status || customer.account_status === filters.status)
          && ownerMatch
          && (filters.archivedOnly ? customer.is_archived : !customer.is_archived)
        );
      })
      .map((customer) => ({
        ...customer,
        owner_text: ownerNames(customer.id).join(", ") || "-",
        onboarding_text: label("onboarding_stage", customer.onboarding_stage),
        import_text: label("import_status", customer.import_status),
        updated_text: formatDateTime(customer.updated_at),
        updated_by_name: profileName(customer.updated_by)
      }));

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
            if (params.data.is_archived) wrapper.append(statusBadgeNode("Archive", "inactive"));
            return wrapper;
          }
        },
        {
          headerName: "Tax ID",
          field: "tax_id",
          minWidth: 145,
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
          headerName: "Owner",
          field: "owner_text",
          minWidth: 180,
          flex: 1
        },
        {
          headerName: "Onboarding",
          field: "onboarding_text",
          minWidth: 150
        },
        {
          headerName: "Import",
          field: "import_text",
          minWidth: 135,
          cellRenderer: (params) => statusBadgeNode(params.value, params.data.import_status)
        },
        {
          headerName: "อัปเดตล่าสุด",
          field: "updated_at",
          minWidth: 185,
          sort: "desc",
          valueFormatter: (params) => formatDateTime(params.value),
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
          width: 176,
          minWidth: 176,
          maxWidth: 176,
          sortable: false,
          filter: false,
          resizable: false,
          suppressHeaderMenuButton: true,
          cellRenderer: (params) => {
            const wrapper = document.createElement("div");
            wrapper.className = "grid-actions";
            const view = document.createElement("a");
            view.className = "btn btn-secondary btn-small";
            view.href = `#/customer/${params.data.id}`;
            view.innerHTML = `${icon("eye")}<span>ดู</span>`;
            wrapper.append(view);
            if (!params.data.is_archived) {
              const edit = document.createElement("a");
              edit.className = "btn btn-tertiary btn-small";
              edit.href = `#/customer/${params.data.id}/edit`;
              edit.innerHTML = `${icon("edit")}<span>แก้ไข</span>`;
              wrapper.append(edit);
            }
            return wrapper;
          }
        }
      ]
    }, "customers");
  }

  function customerCoreFields(customer = null) {
    const c = customer || {};
    return `
      <section class="form-section">
        <div class="form-section-heading">
          <h2>ข้อมูลบริษัท</h2>
          <p>ข้อมูลอ้างอิงหลักของลูกค้า</p>
        </div>
        <div class="form-grid">
          <label class="span-2">
            ชื่อนิติบุคคล <span class="required">*</span>
            <input name="legal_name" maxlength="500" value="${h(c.legal_name || "")}" required>
          </label>
          <label>
            ชื่อย่อ
            <input name="short_name" maxlength="300" value="${h(c.short_name || "")}">
          </label>
          <label>
            Tax ID <span class="required">*</span>
            <input name="tax_id" inputmode="numeric" pattern="[0-9]{13}" minlength="13" maxlength="13"
                   value="${h(c.tax_id || "")}" placeholder="เลข 13 หลัก" required>
            <small class="field-help">กรอกตัวเลข 13 หลักโดยไม่เว้นวรรค</small>
          </label>
          <label>
            จำนวนรถ
            <input name="fleet_size" type="number" min="0" step="1" value="${h(c.fleet_size ?? 0)}" required>
          </label>
          <label>
            สถานะบัญชี
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
          <p>ข้อมูลสำหรับ Dashboard และการติดตามสถานะ</p>
        </div>
        <div class="form-grid">
          <label>
            ขั้นตอน Onboarding
            <select name="onboarding_stage">
              <option value="">ไม่ระบุ</option>
              <option value="to_do" ${c.onboarding_stage === "to_do" ? "selected" : ""}>To do</option>
              <option value="pending_data" ${c.onboarding_stage === "pending_data" ? "selected" : ""}>รอข้อมูล</option>
              <option value="onboarding" ${c.onboarding_stage === "onboarding" ? "selected" : ""}>Onboarding</option>
              <option value="training_completed" ${c.onboarding_stage === "training_completed" ? "selected" : ""}>อบรมแล้ว</option>
              <option value="go_live" ${c.onboarding_stage === "go_live" ? "selected" : ""}>Go Live</option>
            </select>
          </label>
          <label>
            สถานะ Import
            <select name="import_status" required>
              <option value="waiting" ${(c.import_status || "waiting") === "waiting" ? "selected" : ""}>รอ</option>
              <option value="in_process" ${c.import_status === "in_process" ? "selected" : ""}>กำลังดำเนินการ</option>
              <option value="done" ${c.import_status === "done" ? "selected" : ""}>เสร็จแล้ว</option>
            </select>
          </label>
          <label>
            Engagement
            <select name="engagement_level">
              <option value="">ไม่ระบุ</option>
              <option value="interest" ${c.engagement_level === "interest" ? "selected" : ""}>สนใจ</option>
              <option value="neutral" ${c.engagement_level === "neutral" ? "selected" : ""}>เฉย ๆ</option>
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
            label: "วันที่เริ่ม Billing",
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

  async function renderCustomerEditPage(customerId) {
    const data = await loadCustomerDetail(customerId);
    state.currentCustomer = data.customer;
    state.currentCustomerData = data;
    const c = data.customer;
    const locked = c.is_archived && state.profile.role !== "admin";

    if (locked) {
      showToast("ลูกค้าที่ Archive เป็นแบบอ่านอย่างเดียวสำหรับบัญชีนี้", "warning");
      location.hash = `#/customer/${customerId}`;
      return;
    }

    const allProfiles = state.profiles.filter((profile) => profile.is_active);
    const selectedOwnerIds = new Set(data.owners.map((row) => row.profile_id));
    const primaryOwner = data.owners.find((row) => row.is_primary)?.profile_id || "";

    el.mainContent.innerHTML = `
      ${pageHeader(
        `แก้ไข: ${c.legal_name}`,
        "แก้ไขข้อมูลลูกค้าทุกส่วนได้จากหน้าเดียว",
        `<a class="btn btn-secondary" href="#/customer/${h(c.id)}">${icon("eye")} ดูรายละเอียด</a>`,
        [{ label: "ข้อมูลลูกค้า", href: "#/customers" }, { label: c.short_name || c.legal_name, href: `#/customer/${h(c.id)}` }, { label: "แก้ไข" }]
      )}

      ${c.is_archived ? `<div class="alert alert-warning">ลูกค้ารายนี้ถูก Archive — Admin ยังแก้ไขได้ แต่ควร Restore ก่อนนำกลับมาใช้งาน</div>` : ""}

      <div class="edit-page-layout">
        <nav class="edit-section-nav" aria-label="หัวข้อการแก้ไข">
          <a href="#customer-core-section">ข้อมูลหลัก</a>
          <a href="#customer-owner-section">Owner</a>
          <a href="#customer-contact-section">ผู้ติดต่อ</a>
          <a href="#customer-module-section">Modules / Functions</a>
          <a href="#customer-operation-section">การดำเนินงาน</a>
          <a href="#customer-timeline-section">Timeline</a>
        </nav>

        <div class="edit-sections">
          <form id="customer-core-form" data-mode="edit" data-customer-id="${h(c.id)}" novalidate>
            <section id="customer-core-section" class="panel edit-section">
              <div class="panel-header">
                <div><h2>ข้อมูลหลัก</h2><p class="muted">ข้อมูลบริษัท สถานะ และวันที่</p></div>
              </div>
              <div class="panel-body">
                ${customerCoreFields(c)}
              </div>
              <div class="panel-footer-actions">
                <button id="customer-save-button" class="btn btn-primary" type="submit">${icon("save")} บันทึกข้อมูลหลัก</button>
              </div>
            </section>
          </form>

          <section id="customer-owner-section" class="panel edit-section">
            <div class="panel-header">
              <div><h2>Owner</h2><p class="muted">กำหนดผู้รับผิดชอบได้หลายคน และ Primary Owner ได้หนึ่งคน</p></div>
            </div>
            <div class="panel-body">
              <form id="owners-form" data-customer-id="${h(c.id)}">
                <div class="owner-grid">
                  ${allProfiles.map((profile) => `
                    <label class="choice-card">
                      <input type="checkbox" name="owner_id" value="${h(profile.id)}" ${selectedOwnerIds.has(profile.id) ? "checked" : ""}>
                      <span>${h(profile.display_name)}<small>${h(label("role", profile.role))}</small></span>
                    </label>
                  `).join("") || '<p class="muted">ยังไม่มีผู้ใช้งาน Active</p>'}
                </div>
                <label class="field-block">Primary Owner
                  <select name="primary_owner">
                    <option value="">ไม่ระบุ</option>
                    ${allProfiles.map((profile) => `<option value="${h(profile.id)}" ${profile.id === primaryOwner ? "selected" : ""}>${h(profile.display_name)}</option>`).join("")}
                  </select>
                </label>
                <div class="panel-inline-actions">
                  <button class="btn btn-primary" type="submit">${icon("save")} บันทึก Owner</button>
                </div>
              </form>
            </div>
          </section>

          <section id="customer-contact-section" class="panel edit-section">
            <div class="panel-header">
              <div><h2>ผู้ติดต่อ</h2><p class="muted">จัดการผู้ประสานงานและผู้ติดต่อหลัก</p></div>
              <button class="btn btn-secondary btn-small" data-action="open-contact-create" data-customer-id="${h(c.id)}">${icon("plus")} เพิ่มผู้ติดต่อ</button>
            </div>
            <div class="panel-body">
              <div class="stack">
                ${data.contacts.map((contact) => `
                  <article class="list-card">
                    <div class="list-card-header">
                      <div>
                        <strong>${h(contact.contact_name)}</strong>
                        ${contact.is_primary ? '<span class="tag">ผู้ติดต่อหลัก</span>' : ""}
                        ${!contact.is_active ? '<span class="status-badge" data-status="inactive">ปิดใช้งาน</span>' : ""}
                        <div class="muted">${h(contact.position || "-")}</div>
                        <div>${h(contact.phone || "-")} · ${h(contact.email || "-")} · LINE: ${h(contact.line_id || "-")}</div>
                      </div>
                      <div class="list-card-actions">
                        <button class="btn btn-secondary btn-small" data-action="edit-contact" data-id="${h(contact.id)}">แก้ไข</button>
                        <button class="btn btn-danger btn-small" data-action="delete-contact" data-id="${h(contact.id)}">ลบ</button>
                      </div>
                    </div>
                  </article>
                `).join("") || '<div class="empty-state compact"><strong>ยังไม่มีผู้ติดต่อ</strong><span>เพิ่มผู้ติดต่อเพื่อให้ทีมประสานงานได้สะดวกขึ้น</span></div>'}
              </div>
            </div>
          </section>

          <section id="customer-module-section" class="panel edit-section">
            <div class="panel-header">
              <div><h2>Modules และ Functions</h2><p class="muted">ระบบจะบันทึกทันทีเมื่อเปิดหรือปิดรายการ</p></div>
            </div>
            <div class="panel-body">
              <h3>Modules</h3>
              <div class="choice-grid">
                ${state.modules.filter((item) => item.is_active).map((item) => `
                  <label class="choice-card">
                    <input type="checkbox" data-action="toggle-module" data-customer-id="${h(c.id)}" data-master-id="${h(item.id)}" ${data.moduleIds.includes(item.id) ? "checked" : ""}>
                    <span>${h(item.name)}</span>
                  </label>`).join("")}
              </div>
              <h3 class="section-subtitle">Functions</h3>
              <div class="choice-grid">
                ${state.features.filter((item) => item.is_active).map((item) => `
                  <label class="choice-card">
                    <input type="checkbox" data-action="toggle-feature" data-customer-id="${h(c.id)}" data-master-id="${h(item.id)}" ${data.featureIds.includes(item.id) ? "checked" : ""}>
                    <span>${h(item.name)}</span>
                  </label>`).join("")}
              </div>
            </div>
          </section>

          <section id="customer-operation-section" class="panel edit-section">
            <div class="panel-header">
              <div><h2>รูปแบบการดำเนินงาน</h2><p class="muted">รายละเอียดวิธีจ่ายคนขับและการจัดการค่าใช้จ่ายเที่ยว</p></div>
            </div>
            <div class="panel-body">
              <form id="operations-form" data-customer-id="${h(c.id)}">
                <label>วิธีจ่ายพนักงานขับรถ
                  <textarea name="driver_payment_method" maxlength="5000">${h(data.operations?.driver_payment_method || "")}</textarea>
                </label>
                <label>การจัดการค่าใช้จ่ายเที่ยว
                  <textarea name="trip_expense_management" maxlength="5000">${h(data.operations?.trip_expense_management || "")}</textarea>
                </label>
                <div class="panel-inline-actions">
                  <button class="btn btn-primary" type="submit">${icon("save")} บันทึกการดำเนินงาน</button>
                </div>
              </form>
            </div>
          </section>

          <section id="customer-timeline-section" class="panel edit-section">
            <div class="panel-header">
              <div><h2>Timeline / หมายเหตุ</h2><p class="muted">บันทึกการโทร ประชุม ติดตาม และหมายเหตุ</p></div>
            </div>
            <div class="panel-body">
              <form id="activity-form" data-customer-id="${h(c.id)}" novalidate>
                <div class="form-grid">
                  <label>ประเภท
                    <select name="activity_type">
                      <option value="note">หมายเหตุ</option>
                      <option value="call">โทร</option>
                      <option value="meeting">ประชุม</option>
                      <option value="follow_up">ติดตาม</option>
                    </select>
                  </label>
                  ${dateControlHtml({
                    id: "activity-date",
                    name: "activity_date",
                    label: "วันที่",
                    value: bangkokDate(),
                    required: true
                  })}
                  <label class="span-2">รายละเอียด
                    <textarea name="detail" maxlength="10000" required></textarea>
                  </label>
                </div>
                <div class="panel-inline-actions">
                  <button class="btn btn-primary" type="submit">${icon("plus")} เพิ่ม Timeline</button>
                </div>
              </form>
              <div class="section-divider"></div>
              <div class="timeline-list">
                ${data.activities.map((activity) => `
                  <article class="activity-item">
                    <strong>${h(label("activity_type", activity.activity_type))} · ${h(formatDate(activity.activity_date))}</strong>
                    <p>${h(activity.detail).replaceAll("\n", "<br>")}</p>
                    <small class="muted">${h(profileName(activity.created_by))} · ${h(formatDateTime(activity.created_at))}</small>
                  </article>`).join("") || '<div class="empty-state compact"><strong>ยังไม่มี Timeline</strong><span>เพิ่มรายการแรกจากแบบฟอร์มด้านบน</span></div>'}
              </div>
            </div>
          </section>
        </div>
      </div>`;
  }

  function openCustomerForm(customer = null) {
    location.hash = customer?.id ? `#/customer/${customer.id}/edit` : "#/customers/new";
  }

  async function saveCustomer(event) {
    event.preventDefault();
    const formElement = event.target;
    if (!validateDateControls(formElement) || !formElement.reportValidity()) return;

    const button = formElement.querySelector('button[type="submit"]');
    const panel = formElement.querySelector(".panel") || formElement;
    setButtonBusy(button, true, "กำลังบันทึก...");
    setElementBusy(panel, true, "กำลังบันทึกข้อมูลลูกค้า...");

    try {
      const form = new FormData(formElement);
      const customerId = formElement.dataset.customerId || null;
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

      let result;
      if (formElement.dataset.mode === "edit" && customerId) {
        result = await state.client.from("customers").update(payload).eq("id", customerId).select().single();
      } else {
        result = await state.client.from("customers").insert(payload).select().single();
      }
      if (result.error) throw result.error;

      state.customers = [];
      state.customerOwners = [];
      if (customerId) {
        showToast("บันทึกข้อมูลหลักแล้ว");
        await renderCustomerEditPage(customerId);
      } else {
        showToast("สร้างลูกค้าแล้ว กรุณากรอกข้อมูลส่วนอื่นต่อ");
        location.hash = `#/customer/${result.data.id}/edit`;
      }
    } catch (error) {
      showError(error, "บันทึกลูกค้าไม่สำเร็จ");
    } finally {
      setElementBusy(panel, false);
      setButtonBusy(button, false);
    }
  }

  async function loadCustomerDetail(customerId) {
    await Promise.all([loadCommonData(), loadCustomers()]);
    let customer = state.customers.find((item) => item.id === customerId) || null;
    if (!customer) {
      const customerResult = await state.client.from("customers").select("*").eq("id", customerId).single();
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
    const c = data.customer;
    const ownerList = data.owners
      .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
      .map((owner) => `${profileName(owner.profile_id)}${owner.is_primary ? " (Primary)" : ""}`);
    const moduleNames = state.modules.filter((item) => data.moduleIds.includes(item.id)).map((item) => item.name);
    const featureNames = state.features.filter((item) => data.featureIds.includes(item.id)).map((item) => item.name);

    const customerActions = !c.is_archived
      ? `<a class="btn btn-primary" href="#/customer/${h(c.id)}/edit">${icon("edit")} แก้ไขข้อมูล</a>
         <button class="btn btn-danger" data-action="archive-customer" data-id="${h(c.id)}">Archive</button>`
      : state.profile.role === "admin"
        ? `<button class="btn btn-success" data-action="restore-customer" data-id="${h(c.id)}">Restore</button>
           <a class="btn btn-secondary" href="#/customer/${h(c.id)}/edit">${icon("edit")} แก้ไข</a>`
        : "";

    el.mainContent.innerHTML = `
      ${pageHeader(
        c.legal_name,
        c.short_name || c.tax_id,
        customerActions,
        [{ label: "ข้อมูลลูกค้า", href: "#/customers" }, { label: c.short_name || c.legal_name }]
      )}

      ${c.is_archived ? `<div class="alert alert-warning">ลูกค้ารายนี้ถูก Archive และจะไม่แสดงในรายการใช้งานปกติ</div>` : ""}

      <div class="detail-page-layout">
        <section class="panel detail-main-panel">
          <div class="panel-header"><div><h2>ข้อมูลหลัก</h2><p class="muted">ข้อมูลบริษัทและสถานะล่าสุด</p></div></div>
          <div class="panel-body">
            <dl class="meta-list meta-list-2">
              <dt>Tax ID</dt><dd>${h(c.tax_id)}</dd>
              <dt>จำนวนรถ</dt><dd>${Number(c.fleet_size || 0).toLocaleString("th-TH")}</dd>
              <dt>สถานะบัญชี</dt><dd><span class="status-badge" data-status="${h(c.account_status)}">${h(label("account_status", c.account_status))}</span></dd>
              <dt>Onboarding</dt><dd>${h(label("onboarding_stage", c.onboarding_stage))}</dd>
              <dt>Import</dt><dd><span class="status-badge" data-status="${h(c.import_status)}">${h(label("import_status", c.import_status))}</span></dd>
              <dt>Engagement</dt><dd>${h(label("engagement_level", c.engagement_level))}</dd>
              <dt>วันที่เริ่ม</dt><dd>${h(formatDate(c.start_date))}</dd>
              <dt>วันที่ Billing</dt><dd>${h(formatDate(c.billing_date))}</dd>
              <dt>สร้างโดย</dt><dd>${h(profileName(c.created_by))} · ${h(formatDateTime(c.created_at))}</dd>
              <dt>แก้ล่าสุดโดย</dt><dd>${h(profileName(c.updated_by))} · ${h(formatDateTime(c.updated_at))}</dd>
            </dl>
          </div>
        </section>

        <aside class="detail-side-stack">
          <section class="panel">
            <div class="panel-header"><h2>Owner</h2></div>
            <div class="panel-body">
              ${ownerList.length
                ? `<ul class="plain-list">${ownerList.map((name) => `<li>${h(name)}</li>`).join("")}</ul>`
                : '<p class="muted">ยังไม่มี Owner</p>'}
            </div>
          </section>

          <section class="panel">
            <div class="panel-header"><h2>Modules / Functions</h2></div>
            <div class="panel-body">
              <h3>Modules</h3>
              <div class="tag-list">${moduleNames.length ? moduleNames.map((name) => `<span class="tag">${h(name)}</span>`).join("") : '<span class="muted">-</span>'}</div>
              <h3 class="section-subtitle">Functions</h3>
              <div class="tag-list">${featureNames.length ? featureNames.map((name) => `<span class="tag">${h(name)}</span>`).join("") : '<span class="muted">-</span>'}</div>
            </div>
          </section>
        </aside>

        <section class="panel detail-wide-panel">
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
                  <div>LINE: ${h(contact.line_id || "-")}</div>
                </article>
              `).join("") || '<div class="empty-state compact"><strong>ยังไม่มีผู้ติดต่อ</strong></div>'}
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-header"><h2>รูปแบบการดำเนินงาน</h2></div>
          <div class="panel-body">
            <dl class="meta-list">
              <dt>วิธีจ่ายคนขับ</dt><dd>${h(data.operations?.driver_payment_method || "-").replaceAll("\n", "<br>")}</dd>
              <dt>ค่าใช้จ่ายเที่ยว</dt><dd>${h(data.operations?.trip_expense_management || "-").replaceAll("\n", "<br>")}</dd>
            </dl>
          </div>
        </section>

        <section class="panel">
          <div class="panel-header"><h2>Timeline ล่าสุด</h2></div>
          <div class="panel-body">
            <div class="timeline-list">
              ${data.activities.slice(0, 10).map((activity) => `
                <article class="activity-item">
                  <strong>${h(label("activity_type", activity.activity_type))} · ${h(formatDate(activity.activity_date))}</strong>
                  <p>${h(activity.detail).replaceAll("\n", "<br>")}</p>
                  <small class="muted">${h(profileName(activity.created_by))} · ${h(formatDateTime(activity.created_at))}</small>
                </article>
              `).join("") || '<div class="empty-state compact"><strong>ยังไม่มี Timeline</strong></div>'}
            </div>
          </div>
        </section>
      </div>`;
  }

  async function saveOwners(event) {
    event.preventDefault();
    const form = event.target;
    const customerId = form.dataset.customerId;
    const button = form.querySelector('button[type="submit"]');
    const panel = form.closest(".panel");
    setButtonBusy(button, true, "กำลังบันทึก...");
    setElementBusy(panel, true, "กำลังบันทึก Owner...");
    try {
      const selected = [...form.querySelectorAll('input[name="owner_id"]:checked')].map((input) => input.value);
      let primary = form.elements.primary_owner.value || null;
      if (primary && !selected.includes(primary)) {
        showToast("Primary Owner ต้องอยู่ในรายชื่อ Owner ที่เลือก", "error");
        return;
      }

      const { error } = await state.client.rpc("save_customer_owners", {
        p_customer_id: customerId,
        p_owner_ids: selected,
        p_primary_owner_id: primary
      });
      if (error) throw error;

      state.customers = [];
      state.customerOwners = [];
      showToast("บันทึก Owner แล้ว");
      await renderCustomerEditPage(customerId);
      document.getElementById("customer-owner-section")?.scrollIntoView({ block: "start" });
    } catch (error) {
      showError(error, "บันทึก Owner ไม่สำเร็จ");
    } finally {
      setElementBusy(panel, false);
      setButtonBusy(button, false);
    }
  }


  function openContactForm(contact = null, customerId = null) {
    el.contactForm.reset();
    const form = el.contactForm.elements;
    document.getElementById("contact-dialog-title").textContent = contact ? "แก้ไขผู้ติดต่อ" : "เพิ่มผู้ติดต่อ";
    form.id.value = contact?.id || "";
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
    const button = document.getElementById("contact-save-button");
    setButtonBusy(button, true, "กำลังบันทึก...");
    setElementBusy(el.contactForm, true, "กำลังบันทึกผู้ติดต่อ...");
    try {
      const form = new FormData(el.contactForm);
      const contactId = nullable(form.get("id"));
      const customerId = form.get("customer_id");
      const { error } = await state.client.rpc("save_customer_contact", {
        p_customer_id: customerId,
        p_contact_id: contactId,
        p_contact_name: String(form.get("contact_name")).trim(),
        p_position: nullable(form.get("position")),
        p_phone: nullable(form.get("phone")),
        p_email: nullable(form.get("email")),
        p_line_id: nullable(form.get("line_id")),
        p_is_primary: form.get("is_primary") === "on",
        p_is_active: form.get("is_active") === "on"
      });
      if (error) throw error;
      closeDialog(el.contactDialog);
      showToast("บันทึกผู้ติดต่อแล้ว");
      await renderCustomerEditPage(customerId);
      document.getElementById("customer-contact-section")?.scrollIntoView({ block: "start" });
    } catch (error) {
      showError(error, "บันทึกผู้ติดต่อไม่สำเร็จ");
    } finally {
      setElementBusy(el.contactForm, false);
      setButtonBusy(button, false);
    }
  }

  async function toggleCustomerRelation(kind, customerId, masterId, checked, input) {
    const card = input.closest(".choice-card");
    input.disabled = true;
    card?.classList.add("is-saving");
    const table = kind === "module" ? "customer_modules" : "customer_features";
    const key = kind === "module" ? "module_id" : "feature_id";
    try {
      let result;
      if (checked) {
        result = await state.client.from(table).insert({ customer_id: customerId, [key]: masterId });
      } else {
        result = await state.client.from(table).delete().eq("customer_id", customerId).eq(key, masterId);
      }
      if (result.error) throw result.error;
      showToast("บันทึกแล้ว");
    } catch (error) {
      input.checked = !checked;
      showError(error, "บันทึกไม่สำเร็จ");
    } finally {
      input.disabled = false;
      card?.classList.remove("is-saving");
    }
  }

  async function saveOperations(event) {
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('button[type="submit"]');
    const panel = form.closest(".panel");
    setButtonBusy(button, true, "กำลังบันทึก...");
    setElementBusy(panel, true, "กำลังบันทึกการดำเนินงาน...");
    try {
      const data = new FormData(form);
      const payload = {
        customer_id: form.dataset.customerId,
        driver_payment_method: nullable(data.get("driver_payment_method")),
        trip_expense_management: nullable(data.get("trip_expense_management"))
      };
      const { error } = await state.client
        .from("customer_operations")
        .upsert(payload, { onConflict: "customer_id" });
      if (error) throw error;
      showToast("บันทึกรูปแบบการดำเนินงานแล้ว");
    } catch (error) {
      showError(error, "บันทึกไม่สำเร็จ");
    } finally {
      setElementBusy(panel, false);
      setButtonBusy(button, false);
    }
  }

  async function saveActivity(event) {
    event.preventDefault();
    const form = event.target;
    if (!validateDateControls(form) || !form.reportValidity()) return;
    const button = form.querySelector('button[type="submit"]');
    const panel = form.closest(".panel");
    setButtonBusy(button, true, "กำลังเพิ่ม...");
    setElementBusy(panel, true, "กำลังเพิ่ม Timeline...");
    try {
      const data = new FormData(form);
      const { error } = await state.client.from("customer_activities").insert({
        customer_id: form.dataset.customerId,
        activity_type: data.get("activity_type"),
        activity_date: dateValue(form, "activity_date"),
        detail: String(data.get("detail") || "").trim()
      });
      if (error) throw error;
      showToast("เพิ่ม Timeline แล้ว");
      await renderCustomerEditPage(form.dataset.customerId);
      document.getElementById("customer-timeline-section")?.scrollIntoView({ block: "start" });
    } catch (error) {
      showError(error, "เพิ่ม Timeline ไม่สำเร็จ");
    } finally {
      setElementBusy(panel, false);
      setButtonBusy(button, false);
    }
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
        "โปรไฟล์และธีม",
        "ดูข้อมูลบัญชีและกำหนดสีของระบบให้เหมาะกับการใช้งาน",
        "",
        [{ label: "โปรไฟล์และธีม" }]
      )}

      <div class="profile-layout">
        <section class="panel profile-summary-card">
          <div class="profile-hero">
            <div class="profile-avatar-large">${h(userInitials(profile.display_name))}</div>
            <div>
              <h2>${h(profile.display_name)}</h2>
              <p>${h(profile.email)}</p>
              <span class="role-badge">${h(label("role", profile.role))}</span>
            </div>
          </div>
          <div class="panel-body">
            <dl class="meta-list">
              <dt>ชื่อที่แสดง</dt><dd>${h(profile.display_name)}</dd>
              <dt>อีเมล</dt><dd>${h(profile.email)}</dd>
              <dt>Role</dt><dd>${h(label("role", profile.role))}</dd>
              <dt>สถานะ</dt><dd><span class="status-badge" data-status="${profile.is_active ? "active" : "inactive"}">${profile.is_active ? "Active" : "Inactive"}</span></dd>
              <dt>สร้างบัญชี</dt><dd>${h(formatDateTime(profile.created_at))}</dd>
              <dt>อัปเดตล่าสุด</dt><dd>${h(formatDateTime(profile.updated_at))}</dd>
            </dl>
          </div>
        </section>

        <form id="profile-theme-form" class="panel theme-settings-card" novalidate>
          <div class="panel-header">
            <div>
              <h2>Theme Settings</h2>
              <p class="muted">ค่าจะบันทึกตามบัญชีและใช้งานต่อเนื่องข้ามอุปกรณ์</p>
            </div>
            <span class="theme-preview-dot" style="--preview-color:${h(accent)}" aria-hidden="true"></span>
          </div>
          <div class="panel-body">
            <fieldset class="theme-mode-group">
              <legend>โหมดการแสดงผล</legend>
              ${[
                ["light", "Light", "พื้นหลังสว่าง เหมาะกับสำนักงาน"],
                ["dark", "Dark", "ลดแสงจ้าเมื่อใช้งานในที่มืด"],
                ["system", "System", "ใช้ค่าตามอุปกรณ์โดยอัตโนมัติ"]
              ].map(([value, title, desc]) => `
                <label class="theme-mode-card">
                  <input type="radio" name="theme_mode" value="${value}" ${(profile.theme_mode || "light") === value ? "checked" : ""}>
                  <span><strong>${title}</strong><small>${desc}</small></span>
                </label>
              `).join("")}
            </fieldset>

            <div class="form-section">
              <div class="form-section-heading">
                <h3>Accent Color</h3>
                <p>เลือกจาก Preset หรือกำหนดสี HEX เองได้</p>
              </div>

              <div class="theme-color-editor">
                <label class="native-color-label">
                  <span>Color Picker</span>
                  <input id="theme-accent-picker" type="color" value="${h(accent)}" aria-label="เลือกสีหลัก">
                </label>
                <label>
                  HEX Color
                  <input id="theme-accent-hex" name="theme_accent" type="text" value="${h(accent)}"
                         pattern="^#[0-9A-Fa-f]{6}$" maxlength="7" placeholder="#2f68e6" required>
                </label>
                <div class="theme-live-preview" style="--preview-accent:${h(accent)}">
                  <span class="theme-preview-swatch"></span>
                  <div><strong>ตัวอย่างสีหลัก</strong><small>ปุ่ม ลิงก์ ตาราง และกราฟจะใช้โทนนี้</small></div>
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

            <div class="alert alert-info">
              ระบบจะ Preview สีทันที แต่จะบันทึกลงบัญชีเมื่อกด “บันทึก Theme” เท่านั้น
            </div>
          </div>
          <div class="panel-footer-actions">
            <button type="button" class="btn btn-secondary" data-action="reset-theme-preview">${icon("refresh")} คืนค่าที่บันทึกไว้</button>
            <button id="profile-theme-save" type="submit" class="btn btn-primary">${icon("save")} บันทึก Theme</button>
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
    setElementBusy(form, true, "กำลังบันทึก Theme...");
    try {
      const { data, error } = await state.client.rpc("update_my_profile_preferences", {
        p_theme_mode: mode,
        p_theme_accent: accent
      });
      if (error) {
        if (/function .*update_my_profile_preferences.*does not exist|Could not find the function/i.test(error.message || "")) {
          throw new Error("ยังไม่ได้รัน Migration 004_profile_preferences.sql");
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
      showToast("บันทึก Theme แล้ว");
      await renderProfilePage();
    } catch (error) {
      showError(error, "บันทึก Theme ไม่สำเร็จ");
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
      ? `<button class="btn btn-secondary" data-action="print-own-report">พิมพ์ / PDF</button>`
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
            <div class="alert alert-danger"><strong>เหตุผลที่ Manager ส่งกลับ:</strong>&nbsp;${h(report.last_revision_reason || "-")}</div>
          ` : ""}

          ${!report ? `
            <div class="empty-state">
              <strong>ยังไม่มีรายงานสำหรับวันที่ ${h(formatDate(selectedDate))}</strong>
              <span>สร้างรายงานแล้วเพิ่มรายการใน Today และ Tomorrow ได้หลายข้อ</span>
              <button class="btn btn-primary" data-action="create-daily-report" data-date="${h(selectedDate)}">${icon("plus")} สร้างรายงาน</button>
            </div>
          ` : `
            ${locked ? `<div class="alert alert-info">Manager รับทราบแล้ว รายงานนี้ถูกล็อกและไม่สามารถแก้ไขได้</div>` : ""}
            ${renderDailySection("today", "Today — สิ่งที่ทำวันนี้", items, customerOptions, locked)}
            ${renderDailySection("tomorrow", "Tomorrow — แผนวันพรุ่งนี้", items, customerOptions, locked)}
            ${["draft", "revision_required"].includes(report.status) ? `
              <div class="page-actions report-submit-actions">
                <button class="btn btn-primary" data-action="submit-report" data-id="${h(report.id)}">ส่งรายงานให้ Manager</button>
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
    const ok = await confirmAction("ส่งรายงานให้ Manager ใช่หรือไม่?", "ส่งรายงาน", "ส่งรายงาน");
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
        "ตรวจรายงาน รับทราบ หรือตีกลับให้ User แก้ไข",
        "",
        [{ label: "รายงานของทีม" }]
      )}
      <section class="panel">
        <div class="toolbar">
          <div class="toolbar-row">
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
              <label for="manager-report-user">User</label>
              <select id="manager-report-user">
                <option value="">ทั้งหมด</option>
                ${state.profiles.filter((profile) => profile.role === "user").map((profile) => `
                  <option value="${h(profile.id)}" ${filters.userId === profile.id ? "selected" : ""}>${h(profile.display_name)}</option>
                `).join("")}
              </select>
            </div>
            <div class="toolbar-field">
              <label for="manager-report-status">สถานะ</label>
              <select id="manager-report-status">
                <option value="">ทั้งหมด</option>
                <option value="draft" ${filters.status === "draft" ? "selected" : ""}>ฉบับร่าง</option>
                <option value="submitted" ${filters.status === "submitted" ? "selected" : ""}>ส่งแล้ว</option>
                <option value="acknowledged" ${filters.status === "acknowledged" ? "selected" : ""}>รับทราบแล้ว</option>
                <option value="revision_required" ${filters.status === "revision_required" ? "selected" : ""}>ส่งกลับให้แก้ไข</option>
              </select>
            </div>
            <div class="toolbar-actions">
              <label class="check-label">
                <input id="manager-report-all-dates" type="checkbox" ${filters.allDates ? "checked" : ""}>
                <span>ย้อนหลัง 60 วัน</span>
              </label>
              <button class="btn btn-secondary" data-action="reset-manager-filters">${icon("refresh")} รีเซ็ต</button>
              <button class="btn btn-secondary" data-action="export-manager-reports-csv">${icon("download")} CSV</button>
            </div>
          </div>
        </div>
        <div class="grid-status-row">
          <span id="manager-grid-count" class="muted">กำลังเตรียมข้อมูล...</span>
          <span class="muted">CSV จะส่งออกเฉพาะข้อมูลที่ผ่านตัวกรองและสิทธิ์ปัจจุบัน</span>
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
    filters.allDates = document.getElementById("manager-report-all-dates")?.checked ?? filters.allDates ?? false;

    const rows = state.managerReports
      .filter((report) =>
        (filters.allDates || report.work_date === filters.date)
        && (!filters.userId || report.user_id === filters.userId)
        && (!filters.status || report.status === filters.status)
      )
      .map((report) => ({
        ...report,
        user_name: profileName(report.user_id),
        status_text: label("report_status", report.status)
      }));

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
          headerName: "User",
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
          headerName: "Version",
          field: "content_version",
          minWidth: 100,
          maxWidth: 115,
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
          width: 110,
          minWidth: 110,
          maxWidth: 110,
          sortable: false,
          filter: false,
          resizable: false,
          suppressHeaderMenuButton: true,
          cellRenderer: (params) => {
            const wrapper = document.createElement("div");
            wrapper.className = "grid-actions";
            const button = actionButtonNode({
              label: "เปิด",
              action: "open-manager-report",
              id: params.data.id
            });
            wrapper.append(button);
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
      <div class="dialog-header">
        <div>
          <h2>รายงาน ${h(formatDate(report.work_date))}</h2>
          <p class="muted">${h(profileName(report.user_id))} · Version ${h(report.content_version)}</p>
        </div>
        <button type="button" class="icon-button" data-action="close-dialog" data-dialog="report-dialog" aria-label="ปิด">✕</button>
      </div>
      <p><span class="status-badge" data-status="${h(report.status)}">${h(label("report_status", report.status))}</span></p>
      ${report.status === "revision_required" ? `<div class="alert alert-danger">${h(report.last_revision_reason || "")}</div>` : ""}
      ${renderReportReadOnlySection("Today — สิ่งที่ทำ", today)}
      ${renderReportReadOnlySection("Tomorrow — แผนงาน", tomorrow)}
      <h3>ประวัติ</h3>
      <div class="stack">
        ${state.reviewReport.events.map((event) => `
          <article class="event-item">
            <strong>${h(label("event_type", event.event_type))}</strong>
            ${event.reason ? `<div>${h(event.reason)}</div>` : ""}
            <small class="muted">${h(profileName(event.actor_id))} · ${h(formatDateTime(event.created_at))}</small>
          </article>`).join("") || '<p class="muted">ไม่มีประวัติ</p>'}
      </div>
      <div class="dialog-actions">
        <button class="btn btn-light" data-action="print-review-report">พิมพ์ / PDF</button>
        ${report.status === "submitted" ? `
          <button class="btn btn-danger" data-action="open-revision" data-id="${h(report.id)}" data-version="${h(report.content_version)}">ส่งกลับ</button>
          <button class="btn btn-success" data-action="ack-report" data-id="${h(report.id)}" data-version="${h(report.content_version)}">รับทราบ</button>
        ` : report.status === "acknowledged" ? `
          <button class="btn btn-danger" data-action="open-revision" data-id="${h(report.id)}" data-version="${h(report.content_version)}">เปิดให้แก้ไข</button>
        ` : ""}
        <button class="btn btn-light" data-action="close-dialog" data-dialog="report-dialog">ปิด</button>
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
    const ok = await confirmAction("เมื่อรับทราบแล้ว User จะแก้ไขรายงานไม่ได้ ยืนยันหรือไม่?", "รับทราบรายงาน", "รับทราบ");
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
        "กำหนด Role และสถานะบัญชีสำหรับผู้ใช้งานระบบ",
        "",
        [{ label: "จัดการผู้ใช้" }]
      )}
      <div class="alert alert-info">
        การสร้างหรือเชิญบัญชีใหม่ต้องทำใน Supabase Dashboard → Authentication → Users
        หน้านี้ไม่ใช้ Admin API และไม่มี Secret Key ใน Browser
      </div>
      <section class="panel">
        <div class="toolbar">
          <div class="toolbar-row">
            <div class="toolbar-field toolbar-search">
              <label for="admin-user-search">ค้นหาผู้ใช้</label>
              <input id="admin-user-search" type="search" placeholder="ชื่อ อีเมล หรือ Role" autocomplete="off">
            </div>
            <div class="toolbar-summary toolbar-summary-end">
              <span>${state.profiles.length.toLocaleString("th-TH")} บัญชี · Active Manager ได้เพียงหนึ่งคน</span>
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
        active_text: profile.is_active ? "Active" : "Inactive"
      })),
      getRowId: (params) => params.data.id,
      paginationPageSize: 20,
      columnDefs: [
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
          headerName: "Role",
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
            select.setAttribute("aria-label", `Role ของ ${params.data.display_name}`);
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
              return statusBadgeNode(params.data.is_active ? "Active" : "Inactive", params.data.is_active ? "active" : "inactive");
            }
            const labelNode = document.createElement("label");
            labelNode.className = "grid-switch";
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = Boolean(params.data.is_active);
            checkbox.setAttribute("aria-label", `สถานะของ ${params.data.display_name}`);
            const text = document.createElement("span");
            text.textContent = checkbox.checked ? "Active" : "Inactive";
            checkbox.addEventListener("change", () => {
              text.textContent = checkbox.checked ? "Active" : "Inactive";
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
          headerName: "Theme",
          field: "theme_accent",
          minWidth: 120,
          cellRenderer: (params) => {
            const wrapper = document.createElement("div");
            wrapper.className = "grid-theme-chip";
            const dot = document.createElement("span");
            dot.style.background = normalizeHex(params.value || "#2f68e6");
            const text = document.createElement("span");
            text.textContent = params.data.theme_mode || "light";
            wrapper.append(dot, text);
            return wrapper;
          }
        },
        {
          headerName: "",
          colId: "actions",
          pinned: "right",
          width: 120,
          minWidth: 120,
          maxWidth: 120,
          sortable: false,
          filter: false,
          resizable: false,
          suppressHeaderMenuButton: true,
          cellRenderer: (params) => {
            const wrapper = document.createElement("div");
            wrapper.className = "grid-actions";
            if (params.data.id === state.profile.id) {
              const muted = document.createElement("span");
              muted.className = "muted";
              muted.textContent = "บัญชีตนเอง";
              wrapper.append(muted);
            } else {
              wrapper.append(actionButtonNode({
                label: "บันทึก",
                action: "save-profile",
                id: params.data.id,
                className: "btn btn-primary btn-small"
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
      <h1>Daily Work Report</h1>
      <p><strong>ผู้จัดทำ:</strong> ${h(owner)}</p>
      <p><strong>วันที่:</strong> ${h(formatDate(report.work_date))}</p>
      <p><strong>สถานะ:</strong> ${h(label("report_status", report.status))}</p>
      <h2>Today — สิ่งที่ทำวันนี้</h2>
      ${renderItems(today)}
      <h2>Tomorrow — แผนวันพรุ่งนี้</h2>
      ${renderItems(tomorrow)}
      <p style="margin-top:32px;font-size:10pt">พิมพ์จาก FI Customer Tracking · ${h(formatDateTime(new Date().toISOString()))}</p>`;
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

  async function deleteContact(contactId) {
    const contact = state.currentCustomerData?.contacts.find((item) => item.id === contactId);
    if (!contact) return;
    const ok = await confirmAction(`ลบผู้ติดต่อ “${contact.contact_name}” หรือไม่?`, "ลบผู้ติดต่อ", "ลบ");
    if (!ok) return;

    await withGlobalLoading("กำลังลบผู้ติดต่อ...", async () => {
      const { error } = await state.client.from("customer_contacts").delete().eq("id", contactId);
      if (error) throw error;
      showToast("ลบผู้ติดต่อแล้ว");
      await renderCustomerEditPage(contact.customer_id);
      document.getElementById("customer-contact-section")?.scrollIntoView({ block: "start" });
    });
  }

  async function archiveCustomer(customerId) {
    const customer = state.customers.find((item) => item.id === customerId) || state.currentCustomer;
    const ok = await confirmAction(`Archive “${customer?.legal_name || "ลูกค้ารายนี้"}” หรือไม่?`, "Archive ลูกค้า", "Archive");
    if (!ok) return;
    await withGlobalLoading("กำลัง Archive ลูกค้า...", async () => {
      const { error } = await state.client.rpc("archive_customer", { p_customer_id: customerId });
      if (error) throw error;
      state.customers = [];
      state.customerOwners = [];
      showToast("Archive ลูกค้าแล้ว");
      location.hash = "#/customers";
    });
  }

  async function restoreCustomer(customerId) {
    const ok = await confirmAction("Restore ลูกค้ารายนี้หรือไม่?", "Restore ลูกค้า", "Restore");
    if (!ok) return;
    await withGlobalLoading("กำลัง Restore ลูกค้า...", async () => {
      const { error } = await state.client.rpc("restore_customer", { p_customer_id: customerId });
      if (error) throw error;
      state.customers = [];
      state.customerOwners = [];
      showToast("Restore ลูกค้าแล้ว");
      await renderCustomerDetail(customerId);
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

    window.addEventListener("hashchange", renderRoute);
    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) {
        el.sidebar.classList.remove("open");
        document.querySelector(".sidebar-backdrop")?.classList.add("hidden");
      }
    });

    window.addEventListener("beforeunload", (event) => {
      if (!state.ui.themePreviewDirty) return;
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
        else if (event.target.id === "profile-theme-form") await saveMyProfilePreferences(event);
        else if (event.target.id === "owners-form") await saveOwners(event);
        else if (event.target.id === "operations-form") await saveOperations(event);
        else if (event.target.id === "activity-form") await saveActivity(event);
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
        if (target.matches("[data-date-native]")) {
          syncDateControlFromNative(target, true);
        } else if (["customer-status-filter", "customer-owner-filter", "customer-archive-filter"].includes(target.id)) {
          state.ui.customerFilters.status = document.getElementById("customer-status-filter")?.value || "";
          state.ui.customerFilters.owner = document.getElementById("customer-owner-filter")?.value || "";
          state.ui.customerFilters.archivedOnly = Boolean(document.getElementById("customer-archive-filter")?.checked);
          renderCustomerTable();
        } else if (["manager-report-user", "manager-report-status", "manager-report-all-dates"].includes(target.id)) {
          state.ui.managerFilters.userId = document.getElementById("manager-report-user")?.value || "";
          state.ui.managerFilters.status = document.getElementById("manager-report-status")?.value || "";
          state.ui.managerFilters.allDates = Boolean(document.getElementById("manager-report-all-dates")?.checked);
          renderManagerReportTable();
        } else if (target.matches('input[name="theme_mode"]')) {
          previewThemeFromProfileForm();
        } else if (target.dataset.action === "toggle-module") {
          await toggleCustomerRelation("module", target.dataset.customerId, target.dataset.masterId, target.checked, target);
        } else if (target.dataset.action === "toggle-feature") {
          await toggleCustomerRelation("feature", target.dataset.customerId, target.dataset.masterId, target.checked, target);
        }
      } catch (error) {
        showError(error);
      }
    });

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
            state.ui.customerFilters = { search: "", status: "", owner: "", archivedOnly: false };
            const search = document.getElementById("customer-search");
            const status = document.getElementById("customer-status-filter");
            const owner = document.getElementById("customer-owner-filter");
            const archive = document.getElementById("customer-archive-filter");
            if (search) search.value = "";
            if (status) status.value = "";
            if (owner) owner.value = "";
            if (archive) archive.checked = false;
            renderCustomerTable();
            break;
          }
          case "export-customers-csv":
            state.grids.customers?.exportDataAsCsv?.({
              fileName: `fi-customers-${bangkokDate()}.csv`,
              columnKeys: ["legal_name", "tax_id", "fleet_size", "owner_text", "onboarding_text", "import_text", "updated_at"]
            });
            break;
          case "reset-manager-filters": {
            state.ui.managerFilters = { date: bangkokDate(), userId: "", status: "", allDates: false };
            const native = document.getElementById("manager-report-date");
            if (native) {
              native.value = bangkokDate();
              syncDateControlFromNative(native, false);
            }
            const user = document.getElementById("manager-report-user");
            const status = document.getElementById("manager-report-status");
            const allDates = document.getElementById("manager-report-all-dates");
            if (user) user.value = "";
            if (status) status.value = "";
            if (allDates) allDates.checked = false;
            renderManagerReportTable();
            break;
          }
          case "export-manager-reports-csv":
            state.grids.managerReports?.exportDataAsCsv?.({
              fileName: `fi-team-reports-${bangkokDate()}.csv`,
              columnKeys: ["work_date", "user_name", "status_text", "content_version", "submitted_at", "updated_at"]
            });
            break;
          case "open-customer-create":
            location.hash = "#/customers/new";
            break;
          case "edit-customer":
            location.hash = `#/customer/${target.dataset.id}/edit`;
            break;
          case "archive-customer":
            await archiveCustomer(target.dataset.id);
            break;
          case "restore-customer":
            await restoreCustomer(target.dataset.id);
            break;
          case "open-contact-create":
            openContactForm(null, target.dataset.customerId);
            break;
          case "edit-contact": {
            const contact = state.currentCustomerData?.contacts.find((item) => item.id === target.dataset.id);
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
