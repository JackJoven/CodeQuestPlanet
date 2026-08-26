(function (global) {
  const isLocalPreview =
    global.location.protocol === "file:" ||
    ["localhost", "127.0.0.1", "::1"].includes(global.location.hostname);
  const userStorageKey = "codequest.localPreview.user.v1";
  const progressStorageKey = "signalRunnerNode.progress";
  const windowStatePrefix = "codequest-local-preview:";

  function parseJson(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function readWindowState() {
    if (!global.name.startsWith(windowStatePrefix)) return {};
    const state = parseJson(global.name.slice(windowStatePrefix.length), {});
    return state && typeof state === "object" && !Array.isArray(state) ? state : {};
  }

  function writeWindowState(patch) {
    if (!isLocalPreview) return;
    global.name = `${windowStatePrefix}${JSON.stringify({ ...readWindowState(), ...patch })}`;
  }

  function readStorage(key, fallback) {
    try {
      return parseJson(global.localStorage.getItem(key), fallback);
    } catch (error) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      if (value === null) global.localStorage.removeItem(key);
      else global.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // window.name still carries preview state between local files when storage is unavailable.
    }
  }

  function normalizeUser(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const email = String(value.email || "").trim();
    const displayName = String(value.displayName || email.split("@")[0] || "学习者").trim();
    if (!displayName) return null;
    return {
      id: String(value.id || "local-preview-user"),
      email,
      displayName,
      role: ["learner", "teacher", "admin", "owner"].includes(value.role) ? value.role : "learner",
      localPreview: true
    };
  }

  function readUser() {
    if (!isLocalPreview) return null;
    const windowState = readWindowState();
    if (Object.prototype.hasOwnProperty.call(windowState, "user")) {
      const transferredUser = normalizeUser(windowState.user);
      writeStorage(userStorageKey, transferredUser);
      return transferredUser;
    }

    const storedUser = normalizeUser(readStorage(userStorageKey, null));
    if (storedUser) {
      writeWindowState({ user: storedUser });
      return storedUser;
    }
    return null;
  }

  function writeUser(user) {
    if (!isLocalPreview) return null;
    const normalizedUser = normalizeUser(user);
    writeStorage(userStorageKey, normalizedUser);
    writeWindowState({ user: normalizedUser });
    return normalizedUser;
  }

  function normalizeProgress(value) {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((lessonId) => typeof lessonId === "string" && lessonId))];
  }

  function readProgress() {
    if (!isLocalPreview) return [];
    const windowState = readWindowState();
    if (Object.prototype.hasOwnProperty.call(windowState, "progress")) {
      const transferredProgress = normalizeProgress(windowState.progress);
      writeStorage(progressStorageKey, transferredProgress);
      return transferredProgress;
    }

    const storedProgress = normalizeProgress(readStorage(progressStorageKey, []));
    writeWindowState({ progress: storedProgress });
    return storedProgress;
  }

  function writeProgress(progress) {
    if (!isLocalPreview) return [];
    const normalizedProgress = normalizeProgress(progress);
    writeStorage(progressStorageKey, normalizedProgress);
    writeWindowState({ progress: normalizedProgress });
    return normalizedProgress;
  }

  global.CodeQuestLocalPreview = {
    isLocalPreview,
    readUser,
    writeUser,
    readProgress,
    writeProgress
  };
})(window);
