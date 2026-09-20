(function (root) {
  "use strict";
  const lessons = new Map();
  const required = ["mission", "draft", "source", "compile", "assess", "record", "reconcile", "render", "edit", "feedback", "reference"];
  function register(number, adapter) {
    if (!Number.isInteger(number) || number < 1 || number > 32 || lessons.has(number)) throw new Error("课程编号无效或重复注册。");
    if (!adapter.revision || required.some(key => typeof adapter[key] !== "function")) throw new Error(`第 ${number} 课缺少结构化课程接口。`);
    lessons.set(number, Object.freeze(adapter));
  }
  const get = mission => lessons.get(typeof mission === "number" ? mission : mission?.lessonNo);
  const forRevision = revision => [...lessons.values()].find(adapter => adapter.revision === revision);
  root.CodeQuestStructuredLessons = { register, get, forRevision };
})(typeof globalThis !== "undefined" ? globalThis : window);
