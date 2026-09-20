(function (root) {
  "use strict";
  const clone = value => JSON.parse(JSON.stringify(value));
  function canonical(value) {
    if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
    if (value && typeof value === "object") return `{${Object.keys(value).filter(key => value[key] !== undefined).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
    return JSON.stringify(value ?? null);
  }
  // Store the canonical semantic descriptor itself: no hash collisions, no phase/index identity.
  function fingerprint(m) {
    return canonical({ revision: m.contentRevision, grid: m.grid, start: m.startOverride,
      direction: m.startDir, targets: m.targetPositions || m.early?.targets, required: m.required,
      energy: m.energy, minimumEnergy: m.minEnergy, terrain: m.terrain, rules: m.courseRules,
      inputs: m.lessonInputs, objects: m.objects, data: m.data, timedGate: m.timedGate,
      constraints: m.semanticConstraints || { limit: m.limit, ruleLimit: m.early?.ruleLimit },
      fault: m.faultDescriptor });
  }
  function expose(p, m, level = p.hintLevel || 0, assisted = p.assisted) {
    const key = fingerprint(m), old = p.semanticExposures?.[key] || {};
    p.semanticExposures = { ...p.semanticExposures, [key]: {
      hintLevel: Math.max(old.hintLevel || 0, level), assisted: Boolean(old.assisted || assisted || level >= 3),
      firstAssistedAt: old.firstAssistedAt || (assisted || level >= 3 ? new Date().toISOString() : null)
    } };
    p.currentFingerprint = key;
    p.assisted = p.semanticExposures[key].assisted;
    p.hintLevel = p.semanticExposures[key].hintLevel;
    return key;
  }
  function enter(p, m) {
    const key = fingerprint(m), seen = p.semanticExposures?.[key] || {};
    p.currentFingerprint = key;
    p.assisted = Boolean(seen.assisted);
    p.hintLevel = seen.hintLevel || 0;
    return key;
  }
  function mergeExposures(a = {}, b = {}) {
    return Object.fromEntries([...new Set([...Object.keys(a), ...Object.keys(b)])].map(key => [key, {
      assisted: Boolean(a[key]?.assisted || b[key]?.assisted),
      hintLevel: Math.max(a[key]?.hintLevel || 0, b[key]?.hintLevel || 0),
      firstAssistedAt: [a[key]?.firstAssistedAt, b[key]?.firstAssistedAt].filter(Boolean).sort()[0] || null
    }]));
  }
  function mergeTransferProofs(a = {}, b = {}) {
    const merged = { ...a };
    for (const [key, proof] of Object.entries(b)) {
      const old = merged[key];
      // Preserve an earlier independent success when later practice uses help.
      if (!old || (proof.success && !old.success) || (proof.success === old.success &&
        (old.assisted && !proof.assisted || old.assisted === proof.assisted && String(proof.at) < String(old.at)))) merged[key] = proof;
    }
    return merged;
  }
  function parameterGate(p, revision) {
    const eligible = a => {
      const exposure = p.semanticExposures?.[a?.fingerprint];
      const exposedBefore = exposure?.assisted && (!exposure.firstAssistedAt || exposure.firstAssistedAt <= a.at);
      return a?.contentRevision === revision && a.success && !a.assisted && !exposedBefore;
    };
    const guided = p.guidedEvidence?.contentRevision === revision && p.guidedEvidence.success;
    const repair = eligible(p.repairEvidence?.after) && p.repairEvidence.before?.contentRevision === revision
      && p.repairEvidence.before.fingerprint === p.repairEvidence.after.fingerprint
      && p.repairEvidence.before.isFaulty && !p.repairEvidence.before.success
      && p.repairEvidence.before.programVersion !== p.repairEvidence.after.programVersion;
    const transfers = Object.values(p.transferEvidence || {}).filter(a => eligible(a) && a.independent
      && a.phase === "challenge" && !a.practiceOnly);
    // Construction followed by one independent transfer; repair is not a universal prerequisite.
    const transfer = Boolean(guided && transfers.some(a => a.fingerprint !== p.guidedEvidence.fingerprint
      && a.ruleVersion === p.guidedEvidence.ruleVersion));
    const explanation = Boolean(repair && p.explanationEvidence?.beforeId === p.repairEvidence.before.id
      && p.explanationEvidence?.afterId === p.repairEvidence.after.id && p.explanationEvidence.valid);
    const mastered = Boolean(guided && transfer);
    return { guided: Boolean(guided), repair: Boolean(repair), transfer, explanation, mastered,
      status: mastered ? "mastered" : p.completed ? "completed" : "in-progress" };
  }
  function stateGate(p, revision) {
    const eligible = a => {
      const exposure = p.semanticExposures?.[a?.fingerprint];
      const exposedBefore = exposure?.assisted && (!exposure.firstAssistedAt || exposure.firstAssistedAt <= a.at);
      return a?.contentRevision === revision && a.success && !a.assisted && !exposedBefore;
    };
    const guided = p.guidedEvidence?.contentRevision === revision && p.guidedEvidence.success;
    const transfers = Object.values(p.transferEvidence || {}).filter(a => eligible(a) && a.independent && a.phase === "challenge");
    const transfer = Boolean(guided && transfers.some(a => a.fingerprint !== p.guidedEvidence.fingerprint
      && a.ruleVersion === p.guidedEvidence.ruleVersion));
    return { guided: Boolean(guided), transfer, mastered: Boolean(guided && transfer),
      status: guided && transfer ? "mastered" : p.completed ? "completed" : "in-progress" };
  }
  root.CodeQuestEvidence = { clone, canonical, fingerprint, expose, enter, mergeExposures, mergeTransferProofs, parameterGate, stateGate };
})(typeof globalThis !== "undefined" ? globalThis : window);
