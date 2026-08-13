(function () {
  const roleLabels = {
    learner: "学习者",
    teacher: "老师",
    admin: "管理员",
    owner: "所有者"
  };
  const roleOptions = Object.keys(roleLabels);
  const sectionTitles = {
    overview: ["Dashboard", "运营总览"],
    users: ["Accounts", "用户和权限"],
    progress: ["Learning", "学习进度"],
    courses: ["Content", "课程管理"],
    orders: ["Commerce", "订单和开通"],
    audit: ["Audit", "审计日志"],
    settings: ["Settings", "系统设置"]
  };

  const dom = {
    auth: document.querySelector("#consoleAuth"),
    shell: document.querySelector("#consoleShell"),
    denied: document.querySelector("#consoleDenied"),
    nav: document.querySelector(".console-nav"),
    sectionKicker: document.querySelector("#consoleSectionKicker"),
    sectionTitle: document.querySelector("#consoleSectionTitle"),
    search: document.querySelector("#consoleSearch"),
    userLabel: document.querySelector("#adminUserLabel"),
    logoutBtn: document.querySelector("#adminLogoutBtn"),
    refreshBtn: document.querySelector("#adminRefreshBtn"),
    loginForm: document.querySelector("#adminLoginForm"),
    loginEmail: document.querySelector("#adminLoginEmail"),
    loginPassword: document.querySelector("#adminLoginPassword"),
    loginMessage: document.querySelector("#adminLoginMessage"),
    ownerSetupForm: document.querySelector("#ownerSetupForm"),
    ownerSetupToken: document.querySelector("#ownerSetupToken"),
    ownerSetupEmail: document.querySelector("#ownerSetupEmail"),
    ownerSetupName: document.querySelector("#ownerSetupName"),
    ownerSetupPassword: document.querySelector("#ownerSetupPassword"),
    ownerSetupMessage: document.querySelector("#ownerSetupMessage"),
    overviewStats: document.querySelector("#overviewStats"),
    overviewUsers: document.querySelector("#overviewUsers"),
    overviewEvents: document.querySelector("#overviewEvents"),
    usersCount: document.querySelector("#usersCount"),
    usersTable: document.querySelector("#usersTable"),
    courseProgressList: document.querySelector("#courseProgressList"),
    progressRecords: document.querySelector("#progressRecords"),
    eventsCount: document.querySelector("#eventsCount"),
    eventsTable: document.querySelector("#eventsTable")
  };

  let currentUser = null;
  let activeSection = "overview";
  let cache = {
    summary: null,
    users: [],
    progress: [],
    courses: [],
    events: []
  };

  function isAdmin(user) {
    return ["admin", "owner"].includes(user?.role);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(value) {
    if (!value) return "无";
    return new Intl.DateTimeFormat("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  }

  function setMessage(node, message, type = "normal") {
    node.textContent = message || "";
    node.dataset.type = type;
  }

  function show(node, visible) {
    node.classList.toggle("is-hidden", !visible);
  }

  function setBusy(isBusy) {
    document.querySelectorAll("button, input, select").forEach((item) => {
      if (isBusy) {
        item.dataset.wasDisabled = item.disabled ? "true" : "false";
        item.disabled = true;
        return;
      }

      if (item.dataset.wasDisabled === "false") item.disabled = false;
      delete item.dataset.wasDisabled;
    });
  }

  function searchText() {
    return dom.search.value.trim().toLowerCase();
  }

  function includesSearch(values) {
    const term = searchText();
    if (!term) return true;
    return values.some((value) => String(value || "").toLowerCase().includes(term));
  }

  async function requestJson(url, options = {}) {
    const response = await fetch(url, {
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error?.message || "请求失败，请稍后再试。");
    }
    return payload;
  }

  function updateShell(user) {
    currentUser = user;
    const admin = isAdmin(user);
    dom.userLabel.textContent = user
      ? `${user.displayName || user.email} · ${roleLabels[user.role] || user.role}`
      : "未登录";
    show(dom.auth, !user);
    show(dom.shell, Boolean(user));
    show(dom.denied, Boolean(user) && !admin);
    document.querySelectorAll(".console-section").forEach((section) => show(section, admin && section.id === `section-${activeSection}`));
  }

  async function refreshMe() {
    try {
      const payload = await requestJson("/api/auth/me");
      updateShell(payload.user || null);
      if (isAdmin(payload.user)) await loadDashboard();
    } catch (error) {
      updateShell(null);
    }
  }

  async function loadDashboard() {
    if (!isAdmin(currentUser)) return;
    setBusy(true);
    try {
      const [summary, users, progress, events] = await Promise.all([
        requestJson("/api/admin/summary"),
        requestJson("/api/admin/users"),
        requestJson("/api/admin/progress"),
        requestJson("/api/admin/events")
      ]);

      cache = {
        summary: summary.summary || {},
        users: users.users || [],
        progress: progress.progress || [],
        courses: progress.courses || [],
        events: events.events || summary.recentEvents || []
      };
      renderAll();
    } finally {
      setBusy(false);
    }
  }

  function setSection(section) {
    activeSection = sectionTitles[section] ? section : "overview";
    const [kicker, title] = sectionTitles[activeSection];
    dom.sectionKicker.textContent = kicker;
    dom.sectionTitle.textContent = title;
    dom.nav.querySelectorAll("[data-section]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.section === activeSection);
    });
    document.querySelectorAll(".console-section").forEach((node) => {
      node.classList.toggle("is-hidden", node.id !== `section-${activeSection}`);
    });
    renderAll();
  }

  function renderStats() {
    const summary = cache.summary || {};
    const users = summary.users || {};
    const progress = summary.progress || {};
    const stats = [
      ["总用户", users.total || 0, "账户池"],
      ["学习者", users.learners || 0, "learner"],
      ["管理员", Number(users.admins || 0) + Number(users.owners || 0), "admin / owner"],
      ["活跃会话", summary.activeSessions || 0, "未过期 session"],
      ["完成记录", progress.completed_rows || 0, "lesson_progress"],
      ["有进度用户", progress.users_with_progress || 0, "跨设备同步"]
    ];

    dom.overviewStats.innerHTML = stats.map(([label, value, note]) => `
      <article class="console-stat">
        <small>${label}</small>
        <strong>${value}</strong>
        <span>${note}</span>
      </article>
    `).join("");
  }

  function renderOverviewLists() {
    const recentUsers = cache.users.slice(0, 6);
    dom.overviewUsers.innerHTML = recentUsers.length ? recentUsers.map((user) => `
      <div class="console-list-row">
        <div>
          <strong>${escapeHtml(user.displayName || user.email)}</strong>
          <small>${escapeHtml(user.email)}</small>
        </div>
        <span>${roleLabels[user.role] || user.role}</span>
      </div>
    `).join("") : `<p class="console-empty">暂无用户</p>`;

    dom.overviewEvents.innerHTML = cache.events.slice(0, 8).map((event) => `
      <div class="console-list-row">
        <div>
          <strong>${escapeHtml(event.event_type)}</strong>
          <small>${escapeHtml(event.email)}</small>
        </div>
        <span>${formatDate(event.created_at)}</span>
      </div>
    `).join("") || `<p class="console-empty">暂无事件</p>`;
  }

  function roleSelect(user) {
    const disabled = currentUser?.role !== "owner" || currentUser?.id === user.id ? " disabled" : "";
    const options = roleOptions.map((role) => `
      <option value="${role}"${role === user.role ? " selected" : ""}>${roleLabels[role]}</option>
    `).join("");
    return `<select data-role-select="${escapeHtml(user.id)}"${disabled}>${options}</select>`;
  }

  function renderUsers() {
    const users = cache.users.filter((user) => includesSearch([user.displayName, user.email, user.role]));
    dom.usersCount.textContent = `${users.length} 个用户`;
    if (!users.length) {
      dom.usersTable.innerHTML = `<tr><td colspan="6">暂无匹配用户</td></tr>`;
      return;
    }

    dom.usersTable.innerHTML = users.map((user) => {
      const canEdit = currentUser?.role === "owner" && currentUser?.id !== user.id;
      return `
        <tr>
          <td>
            <strong>${escapeHtml(user.displayName || user.email)}</strong>
            <small>${escapeHtml(user.email)}</small>
          </td>
          <td>${roleSelect(user)}</td>
          <td>${user.completedCount || 0} / ${user.progressCount || 0}</td>
          <td>${user.activeSessions || 0}</td>
          <td>${formatDate(user.createdAt)}</td>
          <td>
            <button class="tool-button compact" data-save-role="${escapeHtml(user.id)}"${canEdit ? "" : " disabled"} type="button">保存</button>
          </td>
        </tr>
      `;
    }).join("");
  }

  function renderProgress() {
    const courses = cache.courses.filter((course) => includesSearch([course.course_id]));
    dom.courseProgressList.innerHTML = courses.length ? courses.map((course) => `
      <div class="console-list-row">
        <div>
          <strong>${escapeHtml(course.course_id)}</strong>
          <small>${course.learners || 0} 位学习者 · ${course.records || 0} 条记录</small>
        </div>
        <span>${course.completed || 0} 完成</span>
      </div>
    `).join("") : `<p class="console-empty">暂无课程进度</p>`;

    const records = cache.progress.filter((record) => includesSearch([
      record.courseId,
      record.lessonId,
      record.user?.email,
      record.user?.displayName,
      record.progress?.title
    ]));

    dom.progressRecords.innerHTML = records.length ? records.slice(0, 80).map((record) => `
      <div class="console-list-row">
        <div>
          <strong>${escapeHtml(record.progress?.title || record.lessonId)}</strong>
          <small>${escapeHtml(record.user?.email)} · ${escapeHtml(record.courseId)}</small>
        </div>
        <span>${formatDate(record.updatedAt)}</span>
      </div>
    `).join("") : `<p class="console-empty">暂无进度记录</p>`;
  }

  function renderEvents() {
    const events = cache.events.filter((event) => includesSearch([event.email, event.event_type, event.ip, event.user_agent]));
    dom.eventsCount.textContent = `${events.length} 条记录`;
    if (!events.length) {
      dom.eventsTable.innerHTML = `<tr><td colspan="5">暂无匹配记录</td></tr>`;
      return;
    }

    dom.eventsTable.innerHTML = events.map((event) => `
      <tr>
        <td><strong>${escapeHtml(event.event_type)}</strong></td>
        <td>${escapeHtml(event.email)}</td>
        <td>${escapeHtml(event.ip || "unknown")}</td>
        <td><small>${escapeHtml(event.user_agent || "unknown")}</small></td>
        <td>${formatDate(event.created_at)}</td>
      </tr>
    `).join("");
  }

  function renderAll() {
    renderStats();
    renderOverviewLists();
    renderUsers();
    renderProgress();
    renderEvents();
  }

  dom.nav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-section]");
    if (button) setSection(button.dataset.section);
  });

  dom.search.addEventListener("input", renderAll);

  dom.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage(dom.loginMessage, "正在登录...");
    try {
      await requestJson("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: dom.loginEmail.value,
          password: dom.loginPassword.value
        })
      });
      setMessage(dom.loginMessage, "登录成功。", "success");
      dom.loginForm.reset();
      await refreshMe();
    } catch (error) {
      setMessage(dom.loginMessage, error.message, "error");
    } finally {
      setBusy(false);
    }
  });

  dom.ownerSetupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage(dom.ownerSetupMessage, "正在创建...");
    try {
      await requestJson("/api/admin/bootstrap", {
        method: "POST",
        body: JSON.stringify({
          token: dom.ownerSetupToken.value,
          email: dom.ownerSetupEmail.value,
          displayName: dom.ownerSetupName.value,
          password: dom.ownerSetupPassword.value
        })
      });
      setMessage(dom.ownerSetupMessage, "Owner 已创建。", "success");
      dom.ownerSetupForm.reset();
      await refreshMe();
    } catch (error) {
      setMessage(dom.ownerSetupMessage, error.message, "error");
    } finally {
      setBusy(false);
    }
  });

  dom.usersTable.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-save-role]");
    if (!button) return;
    const userId = button.dataset.saveRole;
    const select = dom.usersTable.querySelector(`[data-role-select="${CSS.escape(userId)}"]`);
    if (!select) return;

    setBusy(true);
    try {
      await requestJson(`/api/admin/users/${encodeURIComponent(userId)}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: select.value })
      });
      await loadDashboard();
    } catch (error) {
      window.alert(error.message);
    } finally {
      setBusy(false);
    }
  });

  dom.refreshBtn.addEventListener("click", loadDashboard);
  dom.logoutBtn.addEventListener("click", async () => {
    setBusy(true);
    try {
      await requestJson("/api/auth/logout", { method: "POST", body: "{}" });
      updateShell(null);
    } finally {
      setBusy(false);
    }
  });

  setSection("overview");
  refreshMe();
})();
