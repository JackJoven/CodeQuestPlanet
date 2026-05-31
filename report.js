(function () {
  const storageKey = "gameMakerPlanet.stateLabEvidence";
  const aiStorageKey = "gameMakerPlanet.aiVerifyEvidence";

  function readEvidence(key) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function renderEvidence(stateEvidence, aiEvidence) {
    if (!stateEvidence && !aiEvidence) {
      return;
    }

    const completedMetric = document.querySelector("#completedMetric");
    const evidenceMetric = document.querySelector("#evidenceMetric");
    const nextMetric = document.querySelector("#nextMetric");
    const title = document.querySelector("#reportTitle");
    const summary = document.querySelector("#reportSummary");
    const list = document.querySelector("#reportEvidenceList");
    const transfer = stateEvidence && stateEvidence.transfer
      ? stateEvidence.transfer
      : { title: "迁移挑战", state: "待补充" };
    const completedCount = [stateEvidence, aiEvidence].filter(Boolean).length;

    completedMetric.querySelector("strong").textContent = `${completedCount} / 2 课`;
    completedMetric.querySelector("p").textContent = "已完成的课程证据会在这里汇总。";
    evidenceMetric.querySelector("strong").textContent = aiEvidence ? "测试证据" : `${stateEvidence.rules.length} 条规则`;
    evidenceMetric.querySelector("p").textContent = aiEvidence
      ? "包含失败测试、AI 风险、正确补丁和新增测试。"
      : "包含状态链路、门规则 debug 和学生复盘。";
    nextMetric.querySelector("strong").textContent = aiEvidence ? "扩展 L2 项目" : "扩展 L1 规则";
    nextMetric.querySelector("p").textContent = aiEvidence
      ? "下一步可以加入更多真实代码片段和测试设计。"
      : "下一步可以把同样机制扩展到更多单屏规则小游戏。";

    title.textContent = aiEvidence ? "孩子已经开始验证 AI 代码建议" : "孩子已经能用状态解释游戏规则";
    summary.textContent = aiEvidence
      ? `L2-18 证据显示：孩子能用测试发现 AI 建议的风险，并选择完整补丁。`
      : `${stateEvidence.level} 证据显示：孩子修好了 hasKey 到 doorOpen 的状态链路，完成了修错诊断，并能把状态迁移到“${transfer.title}”。`;

    const links = [];
    if (stateEvidence) {
      links.push(`<a href="./state-lab.html">L1 作品证据：${stateEvidence.level}</a>`);
      links.push(`<a href="./state-lab.html#evidencePanel">L1 迁移：${transfer.title} / ${transfer.state}</a>`);
    }
    if (aiEvidence) {
      links.push(`<a href="./ai-verify-lab.html">L2 证据：${aiEvidence.title}</a>`);
      links.push(`<a href="./ai-verify-lab.html">AI 风险：${aiEvidence.aiRisk[0]}</a>`);
      links.push(`<a href="./ai-verify-lab.html">新增测试：${aiEvidence.newTest}</a>`);
    }
    list.innerHTML = links.join("");
  }

  renderEvidence(readEvidence(storageKey), readEvidence(aiStorageKey));
})();
