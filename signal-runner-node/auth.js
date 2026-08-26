(function () {
  const isLocalPreview =
    window.location.protocol === "file:" ||
    ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

  const api = {
    me: "/api/auth/me",
    login: "/api/auth/login",
    register: "/api/auth/register",
    logout: "/api/auth/logout"
  };

  const dom = {
    authStatus: document.querySelector("#authStatus"),
    userLabel: document.querySelector("#authUserLabel"),
    adminLink: document.querySelector("#adminLink"),
    openBtn: document.querySelector("#authOpenBtn"),
    logoutBtn: document.querySelector("#authLogoutBtn"),
    gateLoginBtn: document.querySelector("#authGateLoginBtn"),
    gateRegisterBtn: document.querySelector("#authGateRegisterBtn"),
    modal: document.querySelector("#authModal"),
    closeBtn: document.querySelector("#authCloseBtn"),
    tabs: document.querySelector(".auth-tabs"),
    form: document.querySelector("#authForm"),
    title: document.querySelector("#authTitle"),
    email: document.querySelector("#authEmail"),
    displayName: document.querySelector("#authDisplayName"),
    nameRow: document.querySelector("#authNameRow"),
    password: document.querySelector("#authPassword"),
    message: document.querySelector("#authMessage"),
    submit: document.querySelector("#authSubmitBtn")
  };

  let mode = "login";
  let currentUser = null;

  function setMessage(message, type = "normal") {
    dom.message.textContent = message || "";
    dom.message.dataset.type = type;
  }

  function setBusy(isBusy) {
    dom.submit.disabled = isBusy;
    dom.openBtn.disabled = isBusy;
    dom.logoutBtn.disabled = isBusy;
    dom.gateLoginBtn.disabled = isBusy;
    dom.gateRegisterBtn.disabled = isBusy;
  }

  function updateUser(user) {
    currentUser = user;
    dom.authStatus.dataset.state = user ? "signed-in" : "signed-out";
    document.body.classList.toggle("auth-locked", !user);
    dom.userLabel.textContent = user ? `${user.displayName || user.email} · ${roleLabel(user.role)}` : "未登录";
    dom.adminLink?.classList.toggle("is-hidden", !["admin", "owner"].includes(user?.role));
    dom.openBtn.classList.toggle("is-hidden", Boolean(user));
    dom.logoutBtn.classList.toggle("is-hidden", !user);
    window.dispatchEvent(new CustomEvent("codequest:auth-changed", { detail: { user } }));
  }

  function enterLocalPreview() {
    currentUser = null;
    dom.authStatus.dataset.state = "local-preview";
    document.body.classList.remove("auth-locked");
    dom.userLabel.textContent = "本地预览 · 进度仅存本机";
    dom.adminLink?.classList.add("is-hidden");
    dom.openBtn.classList.add("is-hidden");
    dom.logoutBtn.classList.add("is-hidden");
    window.dispatchEvent(
      new CustomEvent("codequest:auth-changed", {
        detail: { user: null, localPreview: true }
      })
    );
  }

  function roleLabel(role) {
    const labels = {
      learner: "学习者",
      teacher: "老师",
      admin: "管理员",
      owner: "所有者"
    };
    return labels[role] || "学习者";
  }

  function openModal(nextMode = mode) {
    setMode(nextMode);
    setMessage("");
    dom.modal.classList.remove("is-hidden");
    window.setTimeout(() => dom.email.focus(), 0);
  }

  function closeModal() {
    dom.modal.classList.add("is-hidden");
  }

  function setMode(nextMode) {
    mode = nextMode === "register" ? "register" : "login";
    dom.title.textContent = mode === "register" ? "注册学习账号" : "登录 Signal Runner";
    dom.submit.textContent = mode === "register" ? "注册并登录" : "登录";
    dom.nameRow.classList.toggle("is-hidden", mode !== "register");
    dom.password.autocomplete = mode === "register" ? "new-password" : "current-password";
    [...dom.tabs.querySelectorAll("[data-auth-mode]")].forEach((button) => {
      button.classList.toggle("is-active", button.dataset.authMode === mode);
    });
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

  async function refreshMe() {
    try {
      const payload = await requestJson(api.me);
      updateUser(payload.user || null);
    } catch (error) {
      updateUser(null);
    }
  }

  async function submitAuth(event) {
    event.preventDefault();
    setBusy(true);
    setMessage(mode === "register" ? "正在创建账号..." : "正在登录...");

    try {
      const payload = {
        email: dom.email.value,
        password: dom.password.value
      };
      if (mode === "register") payload.displayName = dom.displayName.value;

      const result = await requestJson(mode === "register" ? api.register : api.login, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      updateUser(result.user);
      setMessage("登录成功。", "success");
      dom.form.reset();
      closeModal();
    } catch (error) {
      setMessage(error.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    try {
      await requestJson(api.logout, { method: "POST", body: "{}" });
      updateUser(null);
    } catch (error) {
      openModal("login");
      setMessage(error.message, "error");
    } finally {
      setBusy(false);
    }
  }

  dom.openBtn.addEventListener("click", () => openModal("login"));
  dom.gateLoginBtn.addEventListener("click", () => openModal("login"));
  dom.gateRegisterBtn.addEventListener("click", () => openModal("register"));
  dom.logoutBtn.addEventListener("click", logout);
  dom.closeBtn.addEventListener("click", closeModal);
  dom.modal.addEventListener("click", (event) => {
    if (event.target === dom.modal) closeModal();
  });
  dom.tabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-auth-mode]");
    if (!button) return;
    setMode(button.dataset.authMode);
    setMessage("");
  });
  dom.form.addEventListener("submit", submitAuth);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !dom.modal.classList.contains("is-hidden")) {
      closeModal();
    }
  });

  if (isLocalPreview) {
    enterLocalPreview();
  } else {
    refreshMe();
  }
})();
