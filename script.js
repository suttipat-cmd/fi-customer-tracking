(() => {
  "use strict";

  const APP_VERSION = "0.4.0-enterprise-ui";

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
    ui: {
      customerPage: 1,
      customerPageSize: 20,
      customerSort: "updated_desc",
      managerPage: 1,
      managerPageSize: 20
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
    customerDialog: document.getElementById("customer-dialog"),
    customerForm: document.getElementById("customer-form"),
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
      chevronRight: '<path d="m9 18 6-6-6-6"/>'
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

  function formatDate(value) {
    if (!value) return "-";
    const parts = String(value).split("-");
    if (parts.length !== 3) return h(value);
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  function formatDateTime(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return h(value);
    return new Intl.DateTimeFormat("th-TH-u-ca-gregory", {
      timeZone: "Asia/Bangkok",
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
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
    el.loadingText.textContent = text;
    el.loadingOverlay.classList.toggle("hidden", !active);
  }

  function setButtonBusy(button, busy, busyText = "กำลังบันทึก...") {
    if (!button) return;
    if (busy) {
      button.dataset.originalText = button.textContent;
      button.textContent = busyText;
      button.disabled = true;
    } else {
      button.textContent = button.dataset.originalText || button.textContent;
      button.disabled = false;
      delete button.dataset.originalText;
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

  async function init() {
    document.querySelectorAll("[data-app-version]").forEach((node) => {
      node.textContent = APP_VERSION;
    });

    bindGlobalEvents();

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
        showLogin();
        return;
      }

      const sameUser = state.session?.user?.id === session.user.id && state.profile;
      state.session = session;

      if (!sameUser) {
        const { data: profile, error } = await state.client
          .from("profiles")
          .select("id,display_name,email,role,is_active,created_at,updated_at")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;
        if (!profile.is_active) {
          await state.client.auth.signOut();
          showLogin();
          showToast("บัญชีนี้ถูกปิดการใช้งาน", "error");
          return;
        }
        state.profile = profile;
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
      id: parts[1] || null
    };
  }

  function routeAllowed(routeName) {
    const role = state.profile?.role;
    const rules = {
      dashboard: ["admin", "manager", "user"],
      customers: ["admin", "manager", "user"],
      customer: ["admin", "manager", "user"],
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
      customers: "ข้อมูลลูกค้า",
      customer: "รายละเอียดลูกค้า",
      "daily-report": "รายงานประจำวัน",
      "manager-reports": "รายงานของทีม",
      "admin-users": "จัดการผู้ใช้"
    };
    if (el.topbarPageLabel) {
      el.topbarPageLabel.textContent = pageLabels[route.name] || "FI Workspace";
    }
    renderNavigation();
    el.sidebar.classList.remove("open");

    if (!routeAllowed(route.name)) {
      location.hash = "#/dashboard";
      return;
    }

    setLoading(true);
    try {
      switch (route.name) {
        case "dashboard":
          await renderDashboard();
          break;
        case "customers":
          await renderCustomersPage();
          break;
        case "customer":
          await renderCustomerDetail(route.id);
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
      }
      if (token === state.routeRenderToken) {
        document.title = `${pageLabels[route.name] || "FI Workspace"} · FI Customer Tracking`;
        el.mainContent.focus({ preventScroll: true });
      }
    } catch (error) {
      showError(error, "โหลดหน้าไม่สำเร็จ");
      el.mainContent.innerHTML = `
        <div class="alert alert-danger" role="alert">
          โหลดข้อมูลไม่สำเร็จ
          <button class="btn btn-secondary btn-small" data-action="refresh-route">ลองใหม่</button>
        </div>`;
    } finally {
      setLoading(false);
    }
  }

  async function loadCommonData(force = false) {
    if (!force && state.profiles.length && state.modules.length && state.features.length) return;

    const [profilesResult, modulesResult, featuresResult] = await Promise.all([
      state.client.from("profiles").select("id,display_name,email,role,is_active").order("display_name"),
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

    let rolePanel = "";
    if (state.profile.role === "user") {
      const { data, error } = await state.client
        .from("daily_reports")
        .select("id,status,content_version,work_date,updated_at,last_revision_reason")
        .eq("user_id", state.profile.id)
        .eq("work_date", bangkokDate())
        .maybeSingle();
      if (error) throw error;
      rolePanel = `
        <section class="panel">
          <div class="panel-header">
            <div>
              <h2>รายงานประจำวันนี้</h2>
              <p class="muted">บันทึกสิ่งที่ทำวันนี้และแผนงานวันพรุ่งนี้</p>
            </div>
            ${data ? `<span class="status-badge" data-status="${h(data.status)}">${h(label("report_status", data.status))}</span>` : ""}
          </div>
          <div class="panel-body">
            ${data ? `
              ${data.last_revision_reason && data.status === "revision_required"
                ? `<div class="alert alert-danger"><strong>Manager ส่งกลับ:</strong>&nbsp;${h(data.last_revision_reason)}</div>`
                : ""}
              <div class="toolbar-summary">
                <span>อัปเดตล่าสุด ${h(formatDateTime(data.updated_at))}</span>
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
      const { data, error } = await state.client
        .from("daily_reports")
        .select("id,status,work_date")
        .eq("work_date", bangkokDate());
      if (error) throw error;
      const reports = data || [];
      const pending = reports.filter((report) => report.status === "submitted").length;
      const acknowledged = reports.filter((report) => report.status === "acknowledged").length;
      const revision = reports.filter((report) => report.status === "revision_required").length;
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
            <div class="cards-grid">
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
      ${rolePanel}`;
  }

  async function renderCustomersPage() {
    await Promise.all([loadCommonData(), loadCustomers(true)]);
    el.mainContent.innerHTML = `
      ${pageHeader(
        "ข้อมูลลูกค้า",
        "ค้นหา เพิ่ม แก้ไข และติดตามประวัติลูกค้าทั้งหมด",
        `<button class="btn btn-primary" data-action="open-customer-create">${icon("plus")} เพิ่มลูกค้า</button>`,
        [{ label: "ข้อมูลลูกค้า" }]
      )}
      <section class="panel">
        <div class="toolbar">
          <div class="toolbar-row">
            <div class="toolbar-field toolbar-search">
              <label for="customer-search">ค้นหา</label>
              <input id="customer-search" type="search" placeholder="ชื่อบริษัท ชื่อย่อ หรือ Tax ID" autocomplete="off">
            </div>
            <div class="toolbar-field">
              <label for="customer-status-filter">สถานะบัญชี</label>
              <select id="customer-status-filter">
                <option value="">ทั้งหมด</option>
                <option value="active">ใช้งาน</option>
                <option value="inactive">ไม่ใช้งาน</option>
              </select>
            </div>
            <div class="toolbar-field">
              <label for="customer-owner-filter">Owner</label>
              <select id="customer-owner-filter">
                <option value="">ทั้งหมด</option>
                <option value="unassigned">ยังไม่มี Owner</option>
                ${state.profiles.filter((p) => p.is_active).map((p) => `<option value="${h(p.id)}">${h(p.display_name)}</option>`).join("")}
              </select>
            </div>
            <div class="toolbar-field">
              <label for="customer-sort">เรียงตาม</label>
              <select id="customer-sort">
                <option value="updated_desc" ${state.ui.customerSort === "updated_desc" ? "selected" : ""}>อัปเดตล่าสุด</option>
                <option value="name_asc" ${state.ui.customerSort === "name_asc" ? "selected" : ""}>ชื่อลูกค้า A–Z</option>
                <option value="fleet_desc" ${state.ui.customerSort === "fleet_desc" ? "selected" : ""}>จำนวนรถมากไปน้อย</option>
              </select>
            </div>
            <div class="toolbar-actions">
              <label class="check-label">
                <input id="customer-archive-filter" type="checkbox">
                <span>เฉพาะ Archive</span>
              </label>
              <button class="btn btn-secondary" data-action="reset-customer-filters">${icon("refresh")} รีเซ็ต</button>
            </div>
          </div>
        </div>
        <div id="customer-table-container" aria-live="polite"></div>
      </section>`;
    renderCustomerTable();
  }

  function renderCustomerTable() {
    const container = document.getElementById("customer-table-container");
    if (!container) return;
    const query = document.getElementById("customer-search")?.value.trim().toLowerCase() || "";
    const status = document.getElementById("customer-status-filter")?.value || "";
    const owner = document.getElementById("customer-owner-filter")?.value || "";
    const archivedOnly = document.getElementById("customer-archive-filter")?.checked || false;
    const sort = document.getElementById("customer-sort")?.value || state.ui.customerSort;
    state.ui.customerSort = sort;

    const filtered = state.customers.filter((customer) => {
      const haystack = `${customer.legal_name} ${customer.short_name || ""} ${customer.tax_id}`.toLowerCase();
      const owners = state.customerOwners.filter((item) => item.customer_id === customer.id);
      const ownerMatch = !owner
        || (owner === "unassigned" && owners.length === 0)
        || owners.some((item) => item.profile_id === owner);
      return (
        (!query || haystack.includes(query))
        && (!status || customer.account_status === status)
        && ownerMatch
        && (archivedOnly ? customer.is_archived : !customer.is_archived)
      );
    });

    filtered.sort((a, b) => {
      if (sort === "name_asc") return a.legal_name.localeCompare(b.legal_name, "th");
      if (sort === "fleet_desc") return Number(b.fleet_size || 0) - Number(a.fleet_size || 0);
      return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
    });

    const meta = paginationMeta(filtered.length, state.ui.customerPage, state.ui.customerPageSize);
    state.ui.customerPage = meta.page;
    const pageRows = filtered.slice((meta.page - 1) * state.ui.customerPageSize, meta.page * state.ui.customerPageSize);

    if (!filtered.length) {
      container.innerHTML = `
        <div class="empty-state">
          <strong>ไม่พบข้อมูลลูกค้า</strong>
          <span>ลองเปลี่ยนคำค้นหา ตัวกรอง หรือรีเซ็ตเงื่อนไข</span>
          <button class="btn btn-secondary btn-small" data-action="reset-customer-filters">รีเซ็ตตัวกรอง</button>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="table-wrap">
        <table aria-label="รายชื่อลูกค้า">
          <thead>
            <tr>
              <th>ลูกค้า</th>
              <th>Tax ID</th>
              <th class="text-right">จำนวนรถ</th>
              <th>Owner</th>
              <th>Onboarding</th>
              <th>Import</th>
              <th>อัปเดตล่าสุด</th>
              <th aria-label="การทำงาน"></th>
            </tr>
          </thead>
          <tbody>
            ${pageRows.map((customer) => `
              <tr>
                <td class="table-primary-cell">
                  <strong>${h(customer.legal_name)}</strong>
                  <div class="table-secondary">${h(customer.short_name || "ไม่มีชื่อย่อ")}</div>
                  ${customer.is_archived ? `<span class="status-badge" data-status="inactive">Archive</span>` : ""}
                </td>
                <td class="nowrap">${h(customer.tax_id)}</td>
                <td class="text-right">${Number(customer.fleet_size || 0).toLocaleString("th-TH")}</td>
                <td>${ownerNames(customer.id).map(h).join("<br>") || '<span class="muted">ยังไม่มี Owner</span>'}</td>
                <td>${h(label("onboarding_stage", customer.onboarding_stage))}</td>
                <td><span class="status-badge" data-status="${h(customer.import_status)}">${h(label("import_status", customer.import_status))}</span></td>
                <td class="nowrap">${h(formatDateTime(customer.updated_at))}<div class="table-secondary">${h(profileName(customer.updated_by))}</div></td>
                <td>
                  <div class="table-actions">
                    <a class="btn btn-secondary btn-small" href="#/customer/${h(customer.id)}">เปิด</a>
                    ${!customer.is_archived ? `<button class="btn btn-tertiary btn-small" data-action="edit-customer" data-id="${h(customer.id)}">แก้ไข</button>` : ""}
                  </div>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <div class="pagination-info">แสดง ${meta.start}–${meta.end} จาก ${filtered.length} รายการ</div>
        <div class="pagination">
          <label class="muted" for="customer-page-size">ต่อหน้า</label>
          <select id="customer-page-size" style="width:auto;min-height:34px">
            ${[10, 20, 50, 100].map((size) => `<option value="${size}" ${state.ui.customerPageSize === size ? "selected" : ""}>${size}</option>`).join("")}
          </select>
          <button class="btn btn-secondary btn-small" data-action="customer-page-prev" ${meta.page <= 1 ? "disabled" : ""} aria-label="หน้าก่อนหน้า">${icon("chevronLeft")}</button>
          <span class="pagination-page active" aria-current="page">${meta.page}</span>
          <span class="pagination-info">/ ${meta.totalPages}</span>
          <button class="btn btn-secondary btn-small" data-action="customer-page-next" ${meta.page >= meta.totalPages ? "disabled" : ""} aria-label="หน้าถัดไป">${icon("chevronRight")}</button>
        </div>
      </div>`;
  }

  function openCustomerForm(customer = null) {
    el.customerForm.reset();
    const form = el.customerForm.elements;
    document.getElementById("customer-dialog-title").textContent = customer ? "แก้ไขลูกค้า" : "เพิ่มลูกค้า";
    form.id.value = customer?.id || "";
    form.legal_name.value = customer?.legal_name || "";
    form.short_name.value = customer?.short_name || "";
    form.tax_id.value = customer?.tax_id || "";
    form.fleet_size.value = customer?.fleet_size ?? 0;
    form.account_status.value = customer?.account_status || "active";
    form.onboarding_stage.value = customer?.onboarding_stage || "";
    form.import_status.value = customer?.import_status || "waiting";
    form.engagement_level.value = customer?.engagement_level || "";
    form.start_date.value = customer?.start_date || "";
    form.billing_date.value = customer?.billing_date || "";
    openDialog(el.customerDialog);
  }

  async function saveCustomer(event) {
    event.preventDefault();
    if (!el.customerForm.reportValidity()) return;
    const button = document.getElementById("customer-save-button");
    setButtonBusy(button, true);
    try {
      const form = new FormData(el.customerForm);
      const id = form.get("id");
      const payload = {
        legal_name: String(form.get("legal_name")).trim(),
        short_name: nullable(form.get("short_name")),
        tax_id: String(form.get("tax_id")).trim(),
        fleet_size: Number(form.get("fleet_size")),
        account_status: form.get("account_status"),
        onboarding_stage: nullable(form.get("onboarding_stage")),
        import_status: form.get("import_status"),
        engagement_level: nullable(form.get("engagement_level")),
        start_date: nullable(form.get("start_date")),
        billing_date: nullable(form.get("billing_date"))
      };

      let result;
      if (id) {
        result = await state.client.from("customers").update(payload).eq("id", id).select().single();
      } else {
        result = await state.client.from("customers").insert(payload).select().single();
      }
      if (result.error) throw result.error;

      closeDialog(el.customerDialog);
      state.customers = [];
      showToast(id ? "บันทึกข้อมูลลูกค้าแล้ว" : "เพิ่มลูกค้าแล้ว");
      if (id && parseRoute().name === "customer") {
        await renderCustomerDetail(id);
      } else {
        await renderCustomersPage();
      }
    } catch (error) {
      showError(error, "บันทึกลูกค้าไม่สำเร็จ");
    } finally {
      setButtonBusy(button, false);
    }
  }

  async function loadCustomerDetail(customerId) {
    await Promise.all([loadCommonData(), loadCustomers()]);
    const customer = state.customers.find((item) => item.id === customerId)
      || (await state.client.from("customers").select("*").eq("id", customerId).single()).data;
    if (!customer) throw new Error("ไม่พบข้อมูลลูกค้า");

    const [
      ownersResult,
      contactsResult,
      modulesResult,
      featuresResult,
      operationsResult,
      activitiesResult,
      auditResult
    ] = await Promise.all([
      state.client.from("customer_owners").select("*").eq("customer_id", customerId),
      state.client.from("customer_contacts").select("*").eq("customer_id", customerId).order("is_primary", { ascending: false }).order("contact_name"),
      state.client.from("customer_modules").select("customer_id,module_id").eq("customer_id", customerId),
      state.client.from("customer_features").select("customer_id,feature_id").eq("customer_id", customerId),
      state.client.from("customer_operations").select("*").eq("customer_id", customerId).maybeSingle(),
      state.client.from("customer_activities").select("*").eq("customer_id", customerId).order("activity_date", { ascending: false }).order("created_at", { ascending: false }).limit(100),
      state.client.from("customer_audit_logs").select("*").eq("customer_id", customerId).order("created_at", { ascending: false }).limit(100)
    ]);

    [ownersResult, contactsResult, modulesResult, featuresResult, operationsResult, activitiesResult, auditResult]
      .forEach((result) => { if (result.error) throw result.error; });

    return {
      customer,
      owners: ownersResult.data || [],
      contacts: contactsResult.data || [],
      moduleIds: (modulesResult.data || []).map((row) => row.module_id),
      featureIds: (featuresResult.data || []).map((row) => row.feature_id),
      operations: operationsResult.data || null,
      activities: activitiesResult.data || [],
      auditLogs: auditResult.data || []
    };
  }

  async function renderCustomerDetail(customerId) {
    if (!customerId) {
      location.hash = "#/customers";
      return;
    }
    const data = await loadCustomerDetail(customerId);
    state.currentCustomer = data.customer;
    state.currentCustomerData = data;
    const c = data.customer;
    const locked = c.is_archived && state.profile.role !== "admin";
    const allProfiles = state.profiles.filter((profile) => profile.is_active);
    const selectedOwnerIds = new Set(data.owners.map((row) => row.profile_id));
    const primaryOwner = data.owners.find((row) => row.is_primary)?.profile_id || "";

    const customerActions = !c.is_archived
      ? `<button class="btn btn-secondary" data-action="edit-customer" data-id="${h(c.id)}">แก้ข้อมูลหลัก</button>
         <button class="btn btn-danger" data-action="archive-customer" data-id="${h(c.id)}">Archive</button>`
      : state.profile.role === "admin"
        ? `<button class="btn btn-success" data-action="restore-customer" data-id="${h(c.id)}">Restore</button>`
        : "";

    el.mainContent.innerHTML = `
      ${pageHeader(
        c.legal_name,
        c.short_name || c.tax_id,
        customerActions,
        [{ label: "ข้อมูลลูกค้า", href: "#/customers" }, { label: c.short_name || c.legal_name }]
      )}

      ${c.is_archived ? `<div class="alert alert-warning">ลูกค้ารายนี้ถูก Archive ${locked ? "และเป็นแบบอ่านอย่างเดียว" : ""}</div>` : ""}

      <div class="detail-grid">
        <section class="panel">
          <div class="panel-header"><h2>ข้อมูลหลัก</h2></div>
          <div class="panel-body">
            <dl class="meta-list">
              <dt>Tax ID</dt><dd>${h(c.tax_id)}</dd>
              <dt>จำนวนรถ</dt><dd>${h(c.fleet_size)}</dd>
              <dt>สถานะบัญชี</dt><dd>${h(label("account_status", c.account_status))}</dd>
              <dt>Onboarding</dt><dd>${h(label("onboarding_stage", c.onboarding_stage))}</dd>
              <dt>Import</dt><dd>${h(label("import_status", c.import_status))}</dd>
              <dt>Engagement</dt><dd>${h(label("engagement_level", c.engagement_level))}</dd>
              <dt>วันที่เริ่ม</dt><dd>${h(formatDate(c.start_date))}</dd>
              <dt>วันที่ Billing</dt><dd>${h(formatDate(c.billing_date))}</dd>
              <dt>สร้างโดย</dt><dd>${h(profileName(c.created_by))} · ${h(formatDateTime(c.created_at))}</dd>
              <dt>แก้ล่าสุดโดย</dt><dd>${h(profileName(c.updated_by))} · ${h(formatDateTime(c.updated_at))}</dd>
            </dl>
          </div>
        </section>

        <section class="panel">
          <div class="panel-header"><h2>Owner</h2></div>
          <div class="panel-body">
            <form id="owners-form" data-customer-id="${h(c.id)}">
              <div class="owner-grid">
                ${allProfiles.map((profile) => `
                  <label class="choice-card">
                    <input type="checkbox" name="owner_id" value="${h(profile.id)}" ${selectedOwnerIds.has(profile.id) ? "checked" : ""} ${locked ? "disabled" : ""}>
                    <span>${h(profile.display_name)}<br><small class="muted">${h(label("role", profile.role))}</small></span>
                  </label>
                `).join("") || '<p class="muted">ยังไม่มีผู้ใช้งานที่ Active</p>'}
              </div>
              <label style="margin-top:14px">Primary Owner
                <select name="primary_owner" ${locked ? "disabled" : ""}>
                  <option value="">ไม่ระบุ</option>
                  ${allProfiles.map((profile) => `<option value="${h(profile.id)}" ${profile.id === primaryOwner ? "selected" : ""}>${h(profile.display_name)}</option>`).join("")}
                </select>
              </label>
              ${!locked ? `<button class="btn btn-primary" type="submit">บันทึก Owner</button>` : ""}
            </form>
          </div>
        </section>

        <section class="panel">
          <div class="panel-header">
            <h2>ผู้ติดต่อ</h2>
            ${!locked ? `<button class="btn btn-light btn-small" data-action="open-contact-create" data-customer-id="${h(c.id)}">+ เพิ่ม</button>` : ""}
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
                      <div class="muted">${h(contact.position || "")}</div>
                      <div>${h(contact.phone || "-")} · ${h(contact.email || "-")} · LINE: ${h(contact.line_id || "-")}</div>
                    </div>
                    ${!locked ? `
                      <div class="list-card-actions">
                        <button class="btn btn-light btn-small" data-action="edit-contact" data-id="${h(contact.id)}">แก้ไข</button>
                        <button class="btn btn-danger btn-small" data-action="delete-contact" data-id="${h(contact.id)}">ลบ</button>
                      </div>` : ""}
                  </div>
                </article>
              `).join("") || '<p class="muted">ยังไม่มีผู้ติดต่อ</p>'}
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-header"><h2>Modules และ Functions</h2></div>
          <div class="panel-body">
            <h3>Modules</h3>
            <div class="choice-grid">
              ${state.modules.filter((item) => item.is_active).map((item) => `
                <label class="choice-card">
                  <input type="checkbox" data-action="toggle-module" data-customer-id="${h(c.id)}" data-master-id="${h(item.id)}" ${data.moduleIds.includes(item.id) ? "checked" : ""} ${locked ? "disabled" : ""}>
                  <span>${h(item.name)}</span>
                </label>`).join("")}
            </div>
            <h3 style="margin-top:18px">Functions</h3>
            <div class="choice-grid">
              ${state.features.filter((item) => item.is_active).map((item) => `
                <label class="choice-card">
                  <input type="checkbox" data-action="toggle-feature" data-customer-id="${h(c.id)}" data-master-id="${h(item.id)}" ${data.featureIds.includes(item.id) ? "checked" : ""} ${locked ? "disabled" : ""}>
                  <span>${h(item.name)}</span>
                </label>`).join("")}
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-header"><h2>รูปแบบการดำเนินงาน</h2></div>
          <div class="panel-body">
            <form id="operations-form" data-customer-id="${h(c.id)}">
              <label>วิธีจ่ายพนักงานขับรถ
                <textarea name="driver_payment_method" maxlength="5000" ${locked ? "disabled" : ""}>${h(data.operations?.driver_payment_method || "")}</textarea>
              </label>
              <label>การจัดการค่าใช้จ่ายเที่ยว
                <textarea name="trip_expense_management" maxlength="5000" ${locked ? "disabled" : ""}>${h(data.operations?.trip_expense_management || "")}</textarea>
              </label>
              ${!locked ? `<button class="btn btn-primary" type="submit">บันทึก</button>` : ""}
            </form>
          </div>
        </section>

        <section class="panel">
          <div class="panel-header"><h2>Timeline / หมายเหตุ</h2></div>
          <div class="panel-body">
            ${!locked ? `
              <form id="activity-form" data-customer-id="${h(c.id)}">
                <div class="form-grid">
                  <label>ประเภท
                    <select name="activity_type">
                      <option value="note">หมายเหตุ</option>
                      <option value="call">โทร</option>
                      <option value="meeting">ประชุม</option>
                      <option value="follow_up">ติดตาม</option>
                    </select>
                  </label>
                  <label>วันที่
                    <input name="activity_date" type="date" value="${h(bangkokDate())}" required>
                  </label>
                  <label class="span-2">รายละเอียด
                    <textarea name="detail" maxlength="10000" required></textarea>
                  </label>
                </div>
                <button class="btn btn-primary" type="submit">เพิ่ม Timeline</button>
              </form>
              <hr style="border:0;border-top:1px solid var(--border);margin:20px 0">
            ` : ""}
            <div class="stack">
              ${data.activities.map((activity) => `
                <article class="activity-item">
                  <strong>${h(label("activity_type", activity.activity_type))} · ${h(formatDate(activity.activity_date))}</strong>
                  <p>${h(activity.detail).replaceAll("\n", "<br>")}</p>
                  <small class="muted">${h(profileName(activity.created_by))} · ${h(formatDateTime(activity.created_at))}</small>
                </article>`).join("") || '<p class="muted">ยังไม่มี Timeline</p>'}
            </div>
          </div>
        </section>

        <section class="panel span-2">
          <div class="panel-header"><h2>Audit Log</h2></div>
          <div class="panel-body">
            <div class="stack">
              ${data.auditLogs.map((log) => `
                <article class="audit-item">
                  <strong>${h(log.action.toUpperCase())} · ${h(log.source_table)}</strong>
                  <div>${h((log.changed_fields || []).join(", ") || "-")}</div>
                  <small class="muted">${h(profileName(log.actor_id))} · ${h(formatDateTime(log.created_at))}</small>
                  <details>
                    <summary>ดูข้อมูลเปลี่ยนแปลง</summary>
                    <pre class="audit-json">${h(JSON.stringify({ old: log.old_data, new: log.new_data }, null, 2))}</pre>
                  </details>
                </article>`).join("") || '<p class="muted">ยังไม่มี Audit Log</p>'}
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
    setButtonBusy(button, true);
    try {
      const selected = [...form.querySelectorAll('input[name="owner_id"]:checked')].map((input) => input.value);
      let primary = form.elements.primary_owner.value || null;
      if (primary && !selected.includes(primary)) primary = null;

      const { error } = await state.client.rpc("save_customer_owners", {
        p_customer_id: customerId,
        p_owner_ids: selected,
        p_primary_owner_id: primary
      });
      if (error) throw error;

      state.customers = [];
      showToast("บันทึก Owner แล้ว");
      await renderCustomerDetail(customerId);
    } catch (error) {
      showError(error, "บันทึก Owner ไม่สำเร็จ");
      await renderCustomerDetail(customerId);
    } finally {
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
    setButtonBusy(button, true);
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
      await renderCustomerDetail(customerId);
    } catch (error) {
      showError(error, "บันทึกผู้ติดต่อไม่สำเร็จ");
    } finally {
      setButtonBusy(button, false);
    }
  }

  async function toggleCustomerRelation(kind, customerId, masterId, checked, input) {
    input.disabled = true;
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
    }
  }

  async function saveOperations(event) {
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('button[type="submit"]');
    setButtonBusy(button, true);
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
      await renderCustomerDetail(form.dataset.customerId);
    } catch (error) {
      showError(error, "บันทึกไม่สำเร็จ");
    } finally {
      setButtonBusy(button, false);
    }
  }

  async function saveActivity(event) {
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;
    const button = form.querySelector('button[type="submit"]');
    setButtonBusy(button, true);
    try {
      const data = new FormData(form);
      const { error } = await state.client.from("customer_activities").insert({
        customer_id: form.dataset.customerId,
        activity_type: data.get("activity_type"),
        activity_date: data.get("activity_date"),
        detail: String(data.get("detail")).trim()
      });
      if (error) throw error;
      showToast("เพิ่ม Timeline แล้ว");
      await renderCustomerDetail(form.dataset.customerId);
    } catch (error) {
      showError(error, "เพิ่ม Timeline ไม่สำเร็จ");
    } finally {
      setButtonBusy(button, false);
    }
  }

  async function renderDailyReportPage(workDate = null) {
    await loadCustomers();
    const selectedDate = workDate || document.getElementById("daily-report-date")?.value || bangkokDate();
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
              <label for="daily-report-date">วันที่รายงาน</label>
              <input id="daily-report-date" type="date" value="${h(selectedDate)}">
            </div>
            <div class="toolbar-field">
              <label>สถานะ</label>
              <div style="min-height:42px;display:flex;align-items:center">
                ${report
                  ? `<span class="status-badge" data-status="${h(report.status)}">${h(label("report_status", report.status))}</span>`
                  : `<span class="muted">ยังไม่มีรายงาน</span>`}
              </div>
            </div>
            ${report ? `
              <div class="toolbar-summary" style="margin-left:auto">
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
              <div class="page-actions" style="border-top:1px solid var(--border);padding-top:20px">
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
              <label for="manager-report-date">วันที่</label>
              <input id="manager-report-date" type="date" value="${h(bangkokDate())}">
            </div>
            <div class="toolbar-field">
              <label for="manager-report-user">User</label>
              <select id="manager-report-user">
                <option value="">ทั้งหมด</option>
                ${state.profiles.filter((profile) => profile.role === "user").map((profile) => `<option value="${h(profile.id)}">${h(profile.display_name)}</option>`).join("")}
              </select>
            </div>
            <div class="toolbar-field">
              <label for="manager-report-status">สถานะ</label>
              <select id="manager-report-status">
                <option value="">ทั้งหมด</option>
                <option value="draft">ฉบับร่าง</option>
                <option value="submitted">ส่งแล้ว</option>
                <option value="acknowledged">รับทราบแล้ว</option>
                <option value="revision_required">ส่งกลับให้แก้ไข</option>
              </select>
            </div>
            <div class="toolbar-actions">
              <label class="check-label">
                <input id="manager-report-all-dates" type="checkbox">
                <span>ย้อนหลัง 60 วัน</span>
              </label>
              <button class="btn btn-secondary" data-action="reset-manager-filters">${icon("refresh")} รีเซ็ต</button>
            </div>
          </div>
        </div>
        <div id="manager-report-table" aria-live="polite"></div>
      </section>`;
    renderManagerReportTable();
  }

  function renderManagerReportTable() {
    const container = document.getElementById("manager-report-table");
    if (!container) return;
    const date = document.getElementById("manager-report-date")?.value || "";
    const userId = document.getElementById("manager-report-user")?.value || "";
    const status = document.getElementById("manager-report-status")?.value || "";
    const allDates = document.getElementById("manager-report-all-dates")?.checked || false;
    const reports = state.managerReports.filter((report) =>
      (allDates || report.work_date === date)
      && (!userId || report.user_id === userId)
      && (!status || report.status === status)
    );

    const meta = paginationMeta(reports.length, state.ui.managerPage, state.ui.managerPageSize);
    state.ui.managerPage = meta.page;
    const pageRows = reports.slice((meta.page - 1) * state.ui.managerPageSize, meta.page * state.ui.managerPageSize);

    if (!reports.length) {
      container.innerHTML = `
        <div class="empty-state">
          <strong>ไม่พบรายงานที่ตรงกับเงื่อนไข</strong>
          <span>ลองเลือกวันที่ User หรือสถานะใหม่</span>
          <button class="btn btn-secondary btn-small" data-action="reset-manager-filters">รีเซ็ตตัวกรอง</button>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="table-wrap">
        <table aria-label="รายงานของทีม">
          <thead>
            <tr>
              <th>วันที่</th>
              <th>User</th>
              <th>สถานะ</th>
              <th>Version</th>
              <th>อัปเดตล่าสุด</th>
              <th aria-label="การทำงาน"></th>
            </tr>
          </thead>
          <tbody>
            ${pageRows.map((report) => `
              <tr>
                <td class="nowrap"><strong>${h(formatDate(report.work_date))}</strong></td>
                <td>${h(profileName(report.user_id))}</td>
                <td><span class="status-badge" data-status="${h(report.status)}">${h(label("report_status", report.status))}</span></td>
                <td>${h(report.content_version)}</td>
                <td class="nowrap">${h(formatDateTime(report.updated_at))}</td>
                <td class="text-right"><button class="btn btn-secondary btn-small" data-action="open-manager-report" data-id="${h(report.id)}">เปิดรายงาน</button></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <div class="pagination-info">แสดง ${meta.start}–${meta.end} จาก ${reports.length} รายงาน</div>
        <div class="pagination">
          <label class="muted" for="manager-page-size">ต่อหน้า</label>
          <select id="manager-page-size" style="width:auto;min-height:34px">
            ${[10, 20, 50].map((size) => `<option value="${size}" ${state.ui.managerPageSize === size ? "selected" : ""}>${size}</option>`).join("")}
          </select>
          <button class="btn btn-secondary btn-small" data-action="manager-page-prev" ${meta.page <= 1 ? "disabled" : ""} aria-label="หน้าก่อนหน้า">${icon("chevronLeft")}</button>
          <span class="pagination-page active">${meta.page}</span>
          <span class="pagination-info">/ ${meta.totalPages}</span>
          <button class="btn btn-secondary btn-small" data-action="manager-page-next" ${meta.page >= meta.totalPages ? "disabled" : ""} aria-label="หน้าถัดไป">${icon("chevronRight")}</button>
        </div>
      </div>`;
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
    await loadCommonData(true);
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
        <div class="panel-header">
          <div>
            <h2>บัญชีผู้ใช้งาน</h2>
            <p class="muted">Active Manager มีได้เพียงหนึ่งคนตามกฎของระบบ</p>
          </div>
          <span class="tag">${state.profiles.length} บัญชี</span>
        </div>
        <div class="table-wrap">
          <table aria-label="รายชื่อผู้ใช้งาน">
            <thead>
              <tr>
                <th>ชื่อ</th>
                <th>อีเมล</th>
                <th>Role</th>
                <th>สถานะ</th>
                <th aria-label="การทำงาน"></th>
              </tr>
            </thead>
            <tbody>
              ${state.profiles.map((profile) => {
                const self = profile.id === state.profile.id;
                return `
                  <tr data-profile-id="${h(profile.id)}">
                    <td class="table-primary-cell">
                      <strong>${h(profile.display_name)}</strong>
                      ${self ? ' <span class="tag">บัญชีของคุณ</span>' : ""}
                    </td>
                    <td>${h(profile.email)}</td>
                    <td style="min-width:180px">
                      <select data-field="role" ${self ? "disabled" : ""} aria-label="Role ของ ${h(profile.display_name)}">
                        <option value="user" ${profile.role === "user" ? "selected" : ""}>User</option>
                        <option value="manager" ${profile.role === "manager" ? "selected" : ""}>Manager</option>
                        <option value="admin" ${profile.role === "admin" ? "selected" : ""}>Admin</option>
                      </select>
                    </td>
                    <td>
                      <label class="check-label">
                        <input data-field="is_active" type="checkbox" ${profile.is_active ? "checked" : ""} ${self ? "disabled" : ""}>
                        <span>${profile.is_active ? "Active" : "Inactive"}</span>
                      </label>
                    </td>
                    <td class="text-right">
                      ${self ? '<span class="muted">แก้บัญชีตัวเองไม่ได้</span>' : `<button class="btn btn-primary btn-small" data-action="save-profile" data-id="${h(profile.id)}">บันทึก</button>`}
                    </td>
                  </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>
      </section>`;
  }

  async function saveProfile(profileId, button) {
    const row = button.closest("tr");
    const role = row.querySelector('[data-field="role"]').value;
    const isActive = row.querySelector('[data-field="is_active"]').checked;
    setButtonBusy(button, true);
    try {
      const { error } = await state.client.rpc("admin_update_profile", {
        p_profile_id: profileId,
        p_role: role,
        p_is_active: isActive
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
    const { error } = await state.client.from("customer_contacts").delete().eq("id", contactId);
    if (error) throw error;
    showToast("ลบผู้ติดต่อแล้ว");
    await renderCustomerDetail(contact.customer_id);
  }

  async function archiveCustomer(customerId) {
    const customer = state.customers.find((item) => item.id === customerId);
    const ok = await confirmAction(`Archive “${customer?.legal_name || "ลูกค้ารายนี้"}” หรือไม่?`, "Archive ลูกค้า", "Archive");
    if (!ok) return;
    const { error } = await state.client.rpc("archive_customer", { p_customer_id: customerId });
    if (error) throw error;
    state.customers = [];
    showToast("Archive ลูกค้าแล้ว");
    location.hash = "#/customers";
  }

  async function restoreCustomer(customerId) {
    const ok = await confirmAction("Restore ลูกค้ารายนี้หรือไม่?", "Restore ลูกค้า", "Restore");
    if (!ok) return;
    const { error } = await state.client.rpc("restore_customer", { p_customer_id: customerId });
    if (error) throw error;
    state.customers = [];
    showToast("Restore ลูกค้าแล้ว");
    await renderCustomerDetail(customerId);
  }

  async function deleteDailyItem(itemId) {
    const ok = await confirmAction("ลบรายการนี้หรือไม่?", "ลบรายการรายงาน", "ลบ");
    if (!ok) return;
    const { error } = await state.client.from("daily_report_items").delete().eq("id", itemId);
    if (error) throw error;
    showToast("ลบรายการแล้ว");
    await renderDailyReportPage(state.currentDailyReport.work_date);
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

    el.customerForm.addEventListener("submit", saveCustomer);
    el.contactForm.addEventListener("submit", saveContact);
    el.revisionForm.addEventListener("submit", requestRevision);

    window.addEventListener("hashchange", renderRoute);
    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) {
        el.sidebar.classList.remove("open");
      }
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
        if (event.target.id === "owners-form") await saveOwners(event);
        else if (event.target.id === "operations-form") await saveOperations(event);
        else if (event.target.id === "activity-form") await saveActivity(event);
        else if (event.target.classList.contains("new-report-item-form")) await addDailyReportItem(event);
      } catch (error) {
        showError(error);
      }
    });

    document.addEventListener("input", (event) => {
      if (event.target.id === "customer-search") {
        state.ui.customerPage = 1;
        renderCustomerTable();
      }
    });

    document.addEventListener("change", async (event) => {
      const target = event.target;
      try {
        if (["customer-status-filter", "customer-owner-filter", "customer-archive-filter", "customer-sort"].includes(target.id)) {
          state.ui.customerPage = 1;
          renderCustomerTable();
        } else if (target.id === "customer-page-size") {
          state.ui.customerPageSize = Number(target.value) || 20;
          state.ui.customerPage = 1;
          renderCustomerTable();
        } else if (target.id === "daily-report-date") {
          await renderDailyReportPage(target.value);
        } else if (["manager-report-date", "manager-report-user", "manager-report-status", "manager-report-all-dates"].includes(target.id)) {
          state.ui.managerPage = 1;
          renderManagerReportTable();
        } else if (target.id === "manager-page-size") {
          state.ui.managerPageSize = Number(target.value) || 20;
          state.ui.managerPage = 1;
          renderManagerReportTable();
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
          case "toggle-sidebar":
            if (window.innerWidth <= 820) {
              el.sidebar.classList.toggle("open");
            } else {
              const collapsed = !el.appView.classList.contains("sidebar-collapsed");
              el.appView.classList.toggle("sidebar-collapsed", collapsed);
              window.localStorage.setItem("fi-sidebar-collapsed", String(collapsed));
            }
            break;
          case "close-sidebar":
            el.sidebar.classList.remove("open");
            break;
          case "logout":
            setLoading(true, "กำลังออกจากระบบ...");
            await state.client.auth.signOut();
            setLoading(false);
            break;
          case "close-dialog":
            closeDialog(document.getElementById(target.dataset.dialog));
            break;
          case "refresh-route":
            await renderRoute();
            break;
          case "reset-customer-filters": {
            const search = document.getElementById("customer-search");
            const status = document.getElementById("customer-status-filter");
            const owner = document.getElementById("customer-owner-filter");
            const archive = document.getElementById("customer-archive-filter");
            const sort = document.getElementById("customer-sort");
            if (search) search.value = "";
            if (status) status.value = "";
            if (owner) owner.value = "";
            if (archive) archive.checked = false;
            if (sort) sort.value = "updated_desc";
            state.ui.customerSort = "updated_desc";
            state.ui.customerPage = 1;
            renderCustomerTable();
            break;
          }
          case "customer-page-prev":
            state.ui.customerPage = Math.max(1, state.ui.customerPage - 1);
            renderCustomerTable();
            break;
          case "customer-page-next":
            state.ui.customerPage += 1;
            renderCustomerTable();
            break;
          case "reset-manager-filters": {
            const date = document.getElementById("manager-report-date");
            const user = document.getElementById("manager-report-user");
            const status = document.getElementById("manager-report-status");
            const allDates = document.getElementById("manager-report-all-dates");
            if (date) date.value = bangkokDate();
            if (user) user.value = "";
            if (status) status.value = "";
            if (allDates) allDates.checked = false;
            state.ui.managerPage = 1;
            renderManagerReportTable();
            break;
          }
          case "manager-page-prev":
            state.ui.managerPage = Math.max(1, state.ui.managerPage - 1);
            renderManagerReportTable();
            break;
          case "manager-page-next":
            state.ui.managerPage += 1;
            renderManagerReportTable();
            break;
          case "open-customer-create":
            openCustomerForm();
            break;
          case "edit-customer": {
            await loadCustomers();
            const customer = state.customers.find((item) => item.id === target.dataset.id);
            if (!customer) throw new Error("ไม่พบลูกค้า");
            openCustomerForm(customer);
            break;
          }
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
            setLoading(true);
            await openManagerReport(target.dataset.id);
            setLoading(false);
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
          default:
            break;
        }
      } catch (error) {
        setLoading(false);
        showError(error);
      }
    });
  }

  init().catch((error) => {
    showError(error, "เริ่มระบบไม่สำเร็จ");
    setLoading(false);
  });
})();
