(function () {
  const isLocalPreview =
    window.location.protocol === "file:" ||
    ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  const courseUrl = "./signal-runner-node/index.html?release=20260823.6";
  const visibleLessonLimit = 32;
  const allMissions = window.SignalRunnerCourseData?.missions || [];
  const missions = allMissions.filter((mission) => Number(mission.lessonNo) <= visibleLessonLimit);
  const missionIds = new Set(missions.map((mission) => mission.id));
  const localPreviewState = window.CodeQuestLocalPreview;

  const dom = {
    body: document.body,
    accountAvatar: document.querySelector("#accountAvatar"),
    accountName: document.querySelector("#accountName"),
    accountRole: document.querySelector("#accountRole"),
    syncState: document.querySelector("#syncState"),
    headerLogin: document.querySelector("#headerLogin"),
    logoutButton: document.querySelector("#logoutButton"),
    adminLinks: [...document.querySelectorAll(".admin-only")],
    welcomeName: document.querySelector("#welcomeName"),
    heroLead: document.querySelector("#heroLead"),
    continueAction: document.querySelector("#continueAction"),
    continueActionLabel: document.querySelector("#continueActionLabel"),
    heroCompleted: document.querySelector("#heroCompleted"),
    heroStage: document.querySelector("#heroStage"),
    heroSync: document.querySelector("#heroSync"),
    heroPercent: document.querySelector("#heroPercent"),
    signInNotice: document.querySelector("#signInNotice"),
    signInTitle: document.querySelector("#signInTitle"),
    signInDescription: document.querySelector("#signInDescription"),
    nextMissionNumber: document.querySelector("#nextMissionNumber"),
    nextMissionStage: document.querySelector("#nextMissionStage"),
    nextMissionTitle: document.querySelector("#nextMissionTitle"),
    nextMissionDescription: document.querySelector("#nextMissionDescription"),
    progressRing: document.querySelector("#progressRing"),
    progressPercent: document.querySelector("#progressPercent"),
    progressCount: document.querySelector("#progressCount"),
    progressNote: document.querySelector("#progressNote"),
    pathProgressBar: document.querySelector("#pathProgressBar"),
    pathProgressText: document.querySelector("#pathProgressText")
  };

  function roleLabel(role) {
    const labels = {
      learner: "学习者",
      teacher: "老师",
      admin: "管理员",
      owner: "所有者"
    };
    return labels[role] || "学习者";
  }

  function displayName(user) {
    return user?.displayName || user?.email?.split("@")[0] || "探索者";
  }

  function userInitial(value) {
    const source = String(value || "CQ").trim();
    return Array.from(source.includes("@") ? source.split("@")[0] : source)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "CQ";
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
    if (!response.ok) throw new Error(payload.error?.message || "请求失败");
    return payload;
  }

  function completedMissionIds(rows = []) {
    return new Set(
      rows
        .filter((row) => row.status === "completed")
        .map((row) => row.lesson_id || row.lessonId)
        .filter((lessonId) => missionIds.has(lessonId))
    );
  }

  function setAdminVisibility(role) {
    const canManage = ["admin", "owner"].includes(role);
    dom.adminLinks.forEach((link) => link.classList.toggle("is-hidden", !canManage));
  }

  function renderAccount(user, options = {}) {
    const localPreview = Boolean(options.localPreview);
    const name = displayName(user);
    dom.accountName.textContent = name;
    dom.accountRole.textContent = localPreview ? `${roleLabel(user?.role)} · 模拟` : roleLabel(user?.role);
    dom.accountAvatar.textContent = userInitial(name);
    dom.welcomeName.textContent = name;
    dom.headerLogin.classList.add("is-hidden");
    dom.logoutButton.classList.remove("is-hidden");
    dom.signInNotice.classList.add("is-hidden");
    setAdminVisibility(user?.role);
  }

  function renderSignedOut(options = {}) {
    const localPreview = Boolean(options.localPreview);
    dom.accountName.textContent = "尚未登录";
    dom.accountRole.textContent = "访客";
    dom.accountAvatar.textContent = "CQ";
    dom.welcomeName.textContent = "探索者";
    dom.syncState.textContent = localPreview ? "本地模拟" : "等待登录";
    dom.heroSync.textContent = localPreview ? "未登录" : "等待登录";
    dom.heroLead.textContent = localPreview
      ? "使用本地模拟账号预览完整登录流程；所有账户和进度数据只保存在本机。"
      : "登录学习账号，继续完成任务并在不同设备同步课程进度。";
    dom.continueAction.href = courseUrl;
    dom.continueActionLabel.textContent = "登录并进入课程";
    dom.headerLogin.classList.remove("is-hidden");
    dom.logoutButton.classList.add("is-hidden");
    dom.signInNotice.classList.remove("is-hidden");
    dom.signInTitle.textContent = localPreview ? "使用本地模拟账号预览登录状态" : "登录后同步你的课程进度";
    dom.signInDescription.textContent = localPreview
      ? "进入学习世界后，可使用任意邮箱和至少 8 位密码模拟登录；不会连接服务器或修改线上数据。"
      : "使用现有账号进入学习世界；登录后再点“首页”，这里就会显示你的下一节任务和真实进度。";
    setAdminVisibility(null);
    renderProgress(new Set(), localPreview ? "local-signed-out" : "signed-out");
  }

  function stageName(mission) {
    const stage = window.SignalRunnerCourseData?.stages?.find((item) => item.id === mission?.stage);
    return stage?.chapter || stage?.title || "信标启航";
  }

  function missionDescription(mission) {
    return mission?.story || mission?.target || mission?.focus || "观察任务地图，把目标拆成可运行、可调试的程序步骤。";
  }

  function renderProgress(completedIds, source = "cloud") {
    const isCloud = source === "cloud";
    const isLocal = source === "local";
    const completedCount = missions.filter((mission) => completedIds.has(mission.id)).length;
    const percent = missions.length ? Math.round((completedCount / missions.length) * 100) : 0;
    const nextMission = missions.find((mission) => !completedIds.has(mission.id)) || missions.at(-1);
    const isComplete = missions.length > 0 && completedCount === missions.length;
    const lessonNumber = Number(nextMission?.lessonNo || 1);

    dom.heroCompleted.textContent = String(completedCount);
    dom.heroStage.textContent = stageName(nextMission);
    dom.heroSync.textContent = isCloud ? "云端已同步" : isLocal ? "本机已保存" : "登录后同步";
    dom.heroPercent.textContent = `${percent}%`;
    dom.nextMissionNumber.textContent = String(lessonNumber).padStart(2, "0");
    dom.nextMissionStage.textContent = stageName(nextMission);
    dom.nextMissionTitle.textContent = isComplete ? "共同核心已完成" : nextMission?.title || "启动任务";
    dom.nextMissionDescription.textContent = isComplete
      ? "你已经完成当前开放的共同核心课程，可以回到学习世界重访任务或继续打磨作品。"
      : missionDescription(nextMission);
    dom.progressRing.style.setProperty("--progress", `${percent}%`);
    dom.progressPercent.textContent = `${percent}%`;
    dom.progressCount.textContent = `${completedCount} / ${missions.length || visibleLessonLimit}`;
    dom.pathProgressBar.style.width = `${percent}%`;
    dom.pathProgressText.textContent = `${completedCount} / ${missions.length || visibleLessonLimit} 节完成`;
    dom.progressNote.textContent = isCloud
      ? completedCount > 0
        ? `进度已同步。下一站：${nextMission?.lesson || `第 ${lessonNumber} 节`} · ${nextMission?.title || "启动任务"}。`
        : "进度已连接云端。完成第一节任务后，这里会自动更新。"
      : isLocal
        ? completedCount > 0
          ? `本机模拟进度已读取。下一站：${nextMission?.lesson || `第 ${lessonNumber} 节`} · ${nextMission?.title || "启动任务"}。`
          : "本地模拟账户已就绪。完成第一节任务后，这里会自动更新。"
        : "登录后，你在学习世界完成的课程会自动同步到这里。";
    dom.continueActionLabel.textContent = isComplete ? "返回学习世界" : completedCount > 0 ? "继续下一节" : "开始第一节";
  }

  async function loadDashboard() {
    if (isLocalPreview) {
      const previewUser = localPreviewState?.readUser() || null;
      if (previewUser) {
        renderAccount(previewUser, { localPreview: true });
        renderProgress(new Set(localPreviewState?.readProgress() || []), "local");
        dom.syncState.textContent = "模拟进度已读取";
      } else {
        renderSignedOut({ localPreview: true });
      }
      dom.body.classList.remove("is-loading");
      return;
    }

    try {
      const auth = await requestJson("/api/auth/me");
      if (!auth.user) {
        renderSignedOut();
        return;
      }

      renderAccount(auth.user);
      dom.syncState.textContent = "正在同步";
      const progress = await requestJson("/api/progress");
      renderProgress(completedMissionIds(progress.progress));
      dom.syncState.textContent = "云端已同步";
    } catch (error) {
      renderSignedOut();
      dom.syncState.textContent = "暂未连接";
      dom.heroSync.textContent = "暂未连接";
    } finally {
      dom.body.classList.remove("is-loading");
    }
  }

  async function logout() {
    if (isLocalPreview) {
      localPreviewState?.writeUser(null);
      renderSignedOut({ localPreview: true });
      return;
    }

    dom.logoutButton.disabled = true;
    try {
      await requestJson("/api/auth/logout", { method: "POST", body: "{}" });
      renderSignedOut();
    } catch (error) {
      dom.syncState.textContent = "退出失败，请重试";
    } finally {
      dom.logoutButton.disabled = false;
    }
  }

  dom.logoutButton.addEventListener("click", logout);
  loadDashboard();
})();
