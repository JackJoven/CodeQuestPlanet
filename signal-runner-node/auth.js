(function () {
  const isLocalPreview =
    window.location.protocol === "file:" ||
    ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

  const api = {
    me: "/api/auth/me",
    login: "/api/auth/login",
    register: "/api/auth/register",
    recover: "/api/auth/recover-admin",
    logout: "/api/auth/logout"
  };

  const dom = {
    authStatus: document.querySelector("#authStatus"),
    userLabel: document.querySelector("#authUserLabel"),
    userAvatar: document.querySelector("#authUserAvatar"),
    adminLink: document.querySelector("#adminLink"),
    openBtn: document.querySelector("#authOpenBtn"),
    logoutBtn: document.querySelector("#authLogoutBtn"),
    adminLinks: [...document.querySelectorAll(".admin-link")],
    logoutButtons: [document.querySelector("#authLogoutBtn"), document.querySelector("#portalLogoutBtn")].filter(Boolean),
    portalUserName: document.querySelector("#portalUserName"),
    portalUserRole: document.querySelector("#portalUserRole"),
    portalUserAvatar: document.querySelector("#portalUserAvatar"),
    gateLoginBtn: document.querySelector("#authGateLoginBtn"),
    gateRegisterBtn: document.querySelector("#authGateRegisterBtn"),
    modal: document.querySelector("#authModal"),
    closeBtn: document.querySelector("#authCloseBtn"),
    tabs: document.querySelector("#authTabs"),
    form: document.querySelector("#authForm"),
    title: document.querySelector("#authTitle"),
    email: document.querySelector("#authEmail"),
    displayName: document.querySelector("#authDisplayName"),
    nameRow: document.querySelector("#authNameRow"),
    passwordLabel: document.querySelector("#authPasswordLabel"),
    password: document.querySelector("#authPassword"),
    recoveryCodeRow: document.querySelector("#authRecoveryCodeRow"),
    recoveryCode: document.querySelector("#authRecoveryCode"),
    confirmPasswordRow: document.querySelector("#authConfirmPasswordRow"),
    confirmPassword: document.querySelector("#authConfirmPassword"),
    recoveryHelp: document.querySelector("#authRecoveryHelp"),
    forgotBtn: document.querySelector("#authForgotBtn"),
    backToLoginBtn: document.querySelector("#authBackToLoginBtn"),
    message: document.querySelector("#authMessage"),
    submit: document.querySelector("#authSubmitBtn")
  };

  let mode = "login";
  let currentUser = null;
  const localPreviewState = window.CodeQuestLocalPreview;

  function setMessage(message, type = "normal") {
    dom.message.textContent = message || "";
    dom.message.dataset.type = type;
  }

  function setBusy(isBusy) {
    dom.submit.disabled = isBusy;
    dom.openBtn.disabled = isBusy;
    dom.logoutButtons.forEach((button) => (button.disabled = isBusy));
    dom.gateLoginBtn.disabled = isBusy;
    dom.gateRegisterBtn.disabled = isBusy;
    dom.forgotBtn.disabled = isBusy;
    dom.backToLoginBtn.disabled = isBusy;
  }

  function updateUser(user, options = {}) {
    const localPreview = Boolean(options.localPreview);
    currentUser = user;
    const displayName = user?.displayName || user?.email || "学习者";
    const initial = user ? userInitial(displayName) : "CQ";
    dom.authStatus.dataset.state = localPreview ? "local-preview" : user ? "signed-in" : "signed-out";
    document.body.classList.toggle("auth-locked", !user);
    dom.userLabel.textContent = user
      ? `${displayName} · ${roleLabel(user.role)}`
      : localPreview
        ? "本地模拟 · 未登录"
        : "未登录";
    dom.userAvatar.textContent = initial;
    dom.portalUserName.textContent = user ? displayName : localPreview ? "本地模拟账户" : "登录后开始远征";
    dom.portalUserRole.textContent = user
      ? localPreview
        ? `${roleLabel(user.role)} · 模拟`
        : roleLabel(user.role)
      : "访客";
    dom.portalUserAvatar.textContent = initial;
    dom.adminLinks.forEach((link) => link.classList.toggle("is-hidden", !["admin", "owner"].includes(user?.role)));
    dom.openBtn.classList.toggle("is-hidden", Boolean(user));
    dom.logoutButtons.forEach((button) => button.classList.toggle("is-hidden", !user));
    window.dispatchEvent(new CustomEvent("codequest:auth-changed", { detail: { user, localPreview } }));
  }

  function enterLocalPreview() {
    updateUser(localPreviewState?.readUser() || null, { localPreview: true });
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

  function userInitial(value) {
    const source = String(value || "CQ").trim();
    const localPart = source.includes("@") ? source.split("@")[0] : source;
    return Array.from(localPart).slice(0, 2).join("").toUpperCase() || "CQ";
  }

  function openModal(nextMode = mode) {
    setMode(nextMode);
    setMessage(
      isLocalPreview
        ? "本地模拟不会连接服务器。可输入任意邮箱和至少 8 位密码来预览账户界面。"
        : ""
    );
    dom.modal.classList.remove("is-hidden");
    window.setTimeout(() => dom.email.focus(), 0);
  }

  function closeModal() {
    dom.modal.classList.add("is-hidden");
  }

  function setMode(nextMode) {
    mode = ["login", "register", "recover"].includes(nextMode) ? nextMode : "login";
    const isRegister = mode === "register";
    const isRecovery = mode === "recover";

    dom.title.textContent = isRegister
      ? isLocalPreview
        ? "本地模拟注册"
        : "注册学习账号"
      : isRecovery
        ? isLocalPreview
          ? "本地模拟密码重设"
          : "重设管理员密码"
        : isLocalPreview
          ? "本地模拟登录"
          : "登录 Signal Runner";
    dom.submit.textContent = isRegister ? "注册并登录" : isRecovery ? "重设密码" : "登录";
    dom.tabs.classList.toggle("is-hidden", isRecovery);
    dom.nameRow.classList.toggle("is-hidden", !isRegister);
    dom.recoveryCodeRow.classList.toggle("is-hidden", !isRecovery);
    dom.confirmPasswordRow.classList.toggle("is-hidden", !isRecovery);
    dom.recoveryHelp.classList.toggle("is-hidden", !isRecovery);
    dom.forgotBtn.classList.toggle("is-hidden", mode !== "login");
    dom.backToLoginBtn.classList.toggle("is-hidden", !isRecovery);
    dom.passwordLabel.textContent = isRecovery ? "新密码" : "密码";
    dom.password.autocomplete = isRegister || isRecovery ? "new-password" : "current-password";
    dom.recoveryCode.required = isRecovery;
    dom.confirmPassword.required = isRecovery;
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
    setMessage(mode === "register" ? "正在创建账号..." : mode === "recover" ? "正在验证并重设密码..." : "正在登录...");

    try {
      if (isLocalPreview) {
        if (mode === "recover") {
          if (dom.password.value !== dom.confirmPassword.value) {
            throw new Error("两次输入的新密码不一致。");
          }
          const email = dom.email.value;
          dom.form.reset();
          setMode("login");
          dom.email.value = email;
          setMessage("本地模拟验证完成。没有密码或数据发送到服务器。", "success");
          return;
        }

        const email = dom.email.value.trim();
        const existingUser = localPreviewState?.readUser();
        const fallbackName = email.split("@")[0] || "学习者";
        const displayName =
          mode === "register"
            ? dom.displayName.value.trim() || fallbackName
            : existingUser?.email === email
              ? existingUser.displayName
              : fallbackName;
        const user = localPreviewState?.writeUser({
          id: existingUser?.id || "local-preview-user",
          email,
          displayName,
          role: existingUser?.email === email ? existingUser.role : "learner"
        }) || { id: "local-preview-user", email, displayName, role: "learner", localPreview: true };

        updateUser(user, { localPreview: true });
        setMessage("本地模拟登录成功。", "success");
        dom.form.reset();
        closeModal();
        return;
      }

      if (mode === "recover") {
        if (dom.password.value !== dom.confirmPassword.value) {
          throw new Error("两次输入的新密码不一致。");
        }

        const email = dom.email.value;
        const result = await requestJson(api.recover, {
          method: "POST",
          body: JSON.stringify({
            email,
            recoveryToken: dom.recoveryCode.value,
            newPassword: dom.password.value
          })
        });

        dom.form.reset();
        setMode("login");
        dom.email.value = email;
        setMessage(result.message || "密码已重设，请使用新密码登录。", "success");
        return;
      }

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
      if (isLocalPreview) {
        localPreviewState?.writeUser(null);
        updateUser(null, { localPreview: true });
        return;
      }
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
  dom.forgotBtn.addEventListener("click", () => {
    setMode("recover");
    setMessage("");
    window.setTimeout(() => (dom.email.value ? dom.recoveryCode : dom.email).focus(), 0);
  });
  dom.backToLoginBtn.addEventListener("click", () => {
    setMode("login");
    setMessage("");
    dom.password.value = "";
    dom.recoveryCode.value = "";
    dom.confirmPassword.value = "";
    window.setTimeout(() => dom.password.focus(), 0);
  });
  dom.logoutButtons.forEach((button) => button.addEventListener("click", logout));
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
