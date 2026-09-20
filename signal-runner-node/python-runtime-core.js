(function (root) {
  "use strict";

  const defaultAllowedFunctions = new Set([
    "move",
    "turn_left",
    "turn_right",
    "shield",
    "collect",
    "try_collect",
    "check_count",
    "upload",
    "is_spike_ahead",
    "is_blocked_ahead",
    "is_path_clear",
    "shield_is_active",
    "at_gem",
    "at_relay",
    "energy_remaining"
  ]);

  function createStudentError(message, line, category) {
    const error = new Error(message);
    error.studentLine = line;
    error.category = category;
    return error;
  }

  function validateSource(source, allowedFunctions = defaultAllowedFunctions, languageFeatures = []) {
    if (!source.trim()) throw createStudentError("代码还是空的。", 1, "syntax");
    if (source.length > 4000 || source.split("\n").length > 80) {
      throw createStudentError("这个验证页最多运行 80 行代码。", 1, "syntax");
    }

    const features = new Set(languageFeatures || []);
    const allowsFunctions = features.has("functions");
    const allowsForLoops = features.has("for-loops");
    const forbiddenStatements = [
      "class", "import", "from", "try", "with", "lambda", "async", "await", "match", "case",
      "else", "elif", "pass", "global", "nonlocal", "yield", "raise", "del"
    ];
    if (!allowsForLoops) forbiddenStatements.push("for");
    if (!allowsFunctions) forbiddenStatements.push("def", "return");
    const forbidden = new RegExp(`^\\s*(${forbiddenStatements.join("|")})\\b`);
    const lines = source.split("\n");
    const callableFunctions = new Set(allowedFunctions);

    if (allowsFunctions) {
      lines.forEach((line, index) => {
        const definition = line.match(/^def\s+([A-Za-z_]\w*)\(([^)]*)\):\s*(?:#.*)?$/);
        if (!definition) {
          if (/^\s*def\b/.test(line)) {
            throw createStudentError("函数定义请使用 def 名称(参数):，并保持在最外层。", index + 1, "syntax");
          }
          return;
        }
        const parameters = definition[2].trim()
          ? definition[2].split(",").map((item) => item.trim())
          : [];
        if (parameters.some((item) => !/^[A-Za-z_]\w*$/.test(item))) {
          throw createStudentError("本阶段的函数参数只使用简单变量名。", index + 1, "syntax");
        }
        callableFunctions.add(definition[1]);
      });
    }

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      if (/\t/.test(line)) throw createStudentError("请使用 4 个空格缩进，不要使用 Tab。", index + 1, "syntax");
      const indent = line.match(/^ */)[0].length;
      if (line.trim() && indent % 4 !== 0) throw createStudentError("这一行的缩进不是 4 个空格。", index + 1, "syntax");
      if (forbidden.test(line)) throw createStudentError("这个验证页暂时只开放本课已解锁的 Python 语句。", index + 1, "syntax");

      const codeOnly = line.replace(/#.*$/, "");
      const codeWithoutStrings = codeOnly.replace(/(["'])(?:\\.|(?!\1).)*\1/g, "");
      if (/\b__\w+__\b/.test(codeWithoutStrings)) {
        throw createStudentError("双下划线内部名称不属于本课程接口。", index + 1, "runtime");
      }
      for (const match of codeOnly.matchAll(/\b([A-Za-z_]\w*)\s*\(/g)) {
        if (match[1] === "def" || callableFunctions.has(match[1])) continue;
        if (!callableFunctions.has(match[1])) {
          throw createStudentError(`还没有开放函数 ${match[1]}()。`, index + 1, "runtime");
        }
      }
    }
  }

  function instrumentSource(source) {
    const output = [];
    const lineMap = new Map();
    const functionStack = [];
    let bracketDepth = 0;
    let pendingCollectionAssignment = null;
    const bracketDelta = (line) => {
      const structural = line
        .replace(/#.*$/, "")
        .replace(/(["'])(?:\\.|(?!\1).)*\1/g, "");
      return [...structural].reduce((depth, character) => {
        if ("([{ ".replace(" ", "").includes(character)) return depth + 1;
        if (")] }".replace(" ", "").includes(character)) return depth - 1;
        return depth;
      }, 0);
    };
    source.split("\n").forEach((line, index) => {
      const studentLine = index + 1;
      const trimmed = line.trim();
      const indent = line.match(/^ */)[0];
      const indentSize = indent.length;
      if (bracketDepth > 0) {
        output.push(line);
        lineMap.set(output.length, studentLine);
        bracketDepth += bracketDelta(line);
        if (bracketDepth === 0 && pendingCollectionAssignment) {
          output.push(`${pendingCollectionAssignment.indent}__trace_variable__("${pendingCollectionAssignment.name}", ${pendingCollectionAssignment.name})`);
          lineMap.set(output.length, studentLine);
          pendingCollectionAssignment = null;
        }
        return;
      }
      if (!trimmed || trimmed.startsWith("#")) {
        output.push(line);
        lineMap.set(output.length, studentLine);
        return;
      }

      while (functionStack.length && indentSize <= functionStack[functionStack.length - 1].indent) {
        const ending = functionStack.pop();
        output.push(`${" ".repeat(ending.indent + 4)}__trace_function_exit__("${ending.name}")`);
        lineMap.set(output.length, studentLine);
      }

      const activeFunction = functionStack[functionStack.length - 1] || null;
      const returnMatch = activeFunction && trimmed.match(/^return(?:\s+(.+))?$/);
      if (returnMatch) {
        output.push(`${indent}__trace_line__(${studentLine})`);
        lineMap.set(output.length, studentLine);
        output.push(`${indent}__course_return_value__ = ${returnMatch[1] || "None"}`);
        lineMap.set(output.length, studentLine);
        output.push(`${indent}__trace_return__("${activeFunction.name}", __course_return_value__)`);
        lineMap.set(output.length, studentLine);
        output.push(`${indent}return __course_return_value__`);
        lineMap.set(output.length, studentLine);
        return;
      }

      output.push(`${indent}__trace_line__(${studentLine})`);
      lineMap.set(output.length, studentLine);
      const rangeLoop = line.match(/^(\s*for\s+\w+\s+in\s+range\()([^,]+)(\):\s*(?:#.*)?)$/);
      output.push(rangeLoop ? `${rangeLoop[1]}__trace_range__(${rangeLoop[2]}, ${JSON.stringify(rangeLoop[2].trim())})${rangeLoop[3]}` : line);
      lineMap.set(output.length, studentLine);

      const assignment = trimmed.match(/^([A-Za-z_]\w*)\s*=(?!=)/);
      if (assignment) {
        const nextBracketDepth = bracketDelta(line);
        if (nextBracketDepth > 0) {
          bracketDepth = nextBracketDepth;
          pendingCollectionAssignment = { name: assignment[1], indent };
        } else {
          output.push(`${indent}__trace_variable__("${assignment[1]}", ${assignment[1]})`);
          lineMap.set(output.length, studentLine);
        }
      }

      const augmentedAssignment = trimmed.match(/^([A-Za-z_]\w*)\s*(?:\+=|-=|\*=|\/=)/);
      if (augmentedAssignment) {
        output.push(`${indent}__trace_variable__("${augmentedAssignment[1]}", ${augmentedAssignment[1]})`);
        lineMap.set(output.length, studentLine);
      }

      const mutation = trimmed.match(/^([A-Za-z_]\w*)\.(append|insert|remove|pop)\s*\(/);
      if (mutation) {
        output.push(`${indent}__trace_variable__("${mutation[1]}", ${mutation[1]})`);
        lineMap.set(output.length, studentLine);
      }

      const itemAssignment = trimmed.match(/^([A-Za-z_]\w*)\s*\[[^\]]+\]\s*=(?!=)/);
      if (itemAssignment) {
        output.push(`${indent}__trace_variable__("${itemAssignment[1]}", ${itemAssignment[1]})`);
        lineMap.set(output.length, studentLine);
      }

      const definition = trimmed.match(/^def\s+([A-Za-z_]\w*)\(([^)]*)\):/);
      if (definition) {
        const parameters = definition[2].trim()
          ? definition[2].split(",").map((item) => item.trim())
          : [];
        const parameterNames = parameters.map((name) => `"${name}"`).join(", ");
        const parameterValues = parameters.join(", ");
        output.push(`${indent}    __trace_function__("${definition[1]}", [${parameterNames}], [${parameterValues}])`);
        lineMap.set(output.length, studentLine);
        functionStack.push({ name: definition[1], indent: indentSize });
      }

      if (/^while\b/.test(trimmed)) {
        output.push(`${indent}    __trace_line__(${studentLine})`);
        lineMap.set(output.length, studentLine);
      }

      const forLoop = trimmed.match(/^for\s+([A-Za-z_]\w*)\s+in\s+.+:/);
      if (forLoop) {
        output.push(`${indent}    __trace_line__(${studentLine})`);
        lineMap.set(output.length, studentLine);
        if (forLoop[1] !== "_") {
          output.push(`${indent}    __trace_variable__("${forLoop[1]}", ${forLoop[1]})`);
          lineMap.set(output.length, studentLine);
        }
      }
    });
    while (functionStack.length) {
      const ending = functionStack.pop();
      output.push(`${" ".repeat(ending.indent + 4)}__trace_function_exit__("${ending.name}")`);
      lineMap.set(output.length, source.split("\n").length);
    }
    return { code: output.join("\n"), lineMap };
  }

  function objectModelPrelude() {
    return [
      "class Explorer:",
      "    kind = 'Explorer'",
      "    def __init__(self, name, energy, x=None, y=None, direction='E', cargo=0, capacity=1):",
      "        self.name = name",
      "        self.energy = energy",
      "        self.cargo = cargo",
      "        self.capacity = capacity",
      "        __object_created__(name, self.kind, energy, x, y, direction, cargo, capacity)",
      "    def move(self):",
      "        __object_select__(self.name)",
      "        __object_before_action__(self.name, 'move')",
      "        move()",
      "        self.energy = self.energy - 1",
      "        __object_action__(self.name, self.kind, 'move')",
      "    def collect(self):",
      "        __object_select__(self.name)",
      "        __object_before_action__(self.name, 'collect')",
      "        collect()",
      "        self.cargo = self.cargo + 1",
      "        __object_action__(self.name, self.kind, 'collect')",
      "    def upload(self):",
      "        __object_select__(self.name)",
      "        __object_before_action__(self.name, 'upload')",
      "        upload()",
      "        self.cargo = 0",
      "        __object_action__(self.name, self.kind, 'upload')",
      "    def scan(self):",
      "        __object_select__(self.name)",
      "        __object_action__(self.name, self.kind, 'scan')",
      "        return is_path_clear()",
      "    def wait(self):",
      "        __object_select__(self.name)",
      "        wait()",
      "        __object_action__(self.name, self.kind, 'wait')",
      "    def transfer_to(self, other, amount=1):",
      "        __object_transfer__(self.name, other.name, amount)",
      "        self.cargo = self.cargo - amount",
      "        other.cargo = other.cargo + amount",
      "",
      "class Flyer:",
      "    kind = 'Flyer'",
      "    def __init__(self, name, energy, x=None, y=None, direction='E', cargo=0, capacity=0):",
      "        self.name = name",
      "        self.energy = energy",
      "        self.cargo = cargo",
      "        self.capacity = capacity",
      "        __object_created__(name, self.kind, energy, x, y, direction, cargo, capacity)",
      "    def move(self):",
      "        __object_select__(self.name)",
      "        __object_before_action__(self.name, 'move')",
      "        move()",
      "        self.energy = self.energy - 1",
      "        __object_action__(self.name, self.kind, 'move')",
      "    def scan(self):",
      "        __object_select__(self.name)",
      "        __object_action__(self.name, self.kind, 'scan')",
      "        return is_path_clear()",
      "    def collect(self):",
      "        __object_capability_error__(self.name, self.kind, 'collect')",
      "    def upload(self):",
      "        __object_capability_error__(self.name, self.kind, 'upload')",
      "    def wait(self):",
      "        __object_select__(self.name)",
      "        wait()",
      "        __object_action__(self.name, self.kind, 'wait')",
      "",
      "class Spaceship:",
      "    kind = 'Spaceship'",
      "    def __init__(self, name, energy, x=None, y=None, direction='E', cargo=0, capacity=2):",
      "        self.name = name",
      "        self.energy = energy",
      "        self.cargo = cargo",
      "        self.capacity = capacity",
      "        __object_created__(name, self.kind, energy, x, y, direction, cargo, capacity)",
      "    def move(self):",
      "        __object_select__(self.name)",
      "        __object_before_action__(self.name, 'move')",
      "        move()",
      "        self.energy = self.energy - 1",
      "        __object_action__(self.name, self.kind, 'move')",
      "    def upload(self):",
      "        __object_select__(self.name)",
      "        __object_before_action__(self.name, 'upload')",
      "        upload()",
      "        self.cargo = 0",
      "        __object_action__(self.name, self.kind, 'upload')",
      "    def collect(self):",
      "        __object_capability_error__(self.name, self.kind, 'collect')",
      "    def wait(self):",
      "        __object_select__(self.name)",
      "        wait()",
      "        __object_action__(self.name, self.kind, 'wait')",
      "    def transfer_to(self, other, amount=1):",
      "        __object_transfer__(self.name, other.name, amount)",
      "        self.cargo = self.cargo - amount",
      "        other.cargo = other.cargo + amount",
      "",
      "class RescueKit:",
      "    kind = 'RescueKit'",
      "    def __init__(self, name, energy, components, x=None, y=None, direction='E'):",
      "        self.name = name",
      "        self.energy = energy",
      "        self.components = components",
      "        __component_created__(name, self.kind, energy, components, x, y, direction)",
      "    def move(self):",
      "        __object_select__(self.name)",
      "        __object_before_action__(self.name, 'move')",
      "        __require_component__(self.name, self.kind, 'move', self.components)",
      "        move()",
      "        self.energy = self.energy - 1",
      "        __object_action__(self.name, self.kind, 'move')",
      "    def scan(self):",
      "        __object_select__(self.name)",
      "        __require_component__(self.name, self.kind, 'scan', self.components)",
      "        __object_action__(self.name, self.kind, 'scan')",
      "        return is_path_clear()",
      "    def collect(self):",
      "        __object_select__(self.name)",
      "        __object_before_action__(self.name, 'collect')",
      "        __require_component__(self.name, self.kind, 'collect', self.components)",
      "        collect()",
      "        __object_action__(self.name, self.kind, 'collect')",
      "    def upload(self):",
      "        __object_select__(self.name)",
      "        __object_before_action__(self.name, 'upload')",
      "        __require_component__(self.name, self.kind, 'upload', self.components)",
      "        upload()",
      "        __object_action__(self.name, self.kind, 'upload')",
      "    def wait(self):",
      "        __object_select__(self.name)",
      "        wait()",
      "        __object_action__(self.name, self.kind, 'wait')"
    ].join("\n");
  }

  function extractSkulptLine(error, lineMap, fallbackLine) {
    if (error.studentLine) return error.studentLine;
    const traceback = Array.isArray(error.traceback) ? error.traceback : [];
    const generatedLine = traceback.length ? Number(traceback[traceback.length - 1].lineno) : 0;
    if (generatedLine && lineMap?.has(generatedLine)) return lineMap.get(generatedLine);
    const match = String(error).match(/line\s+(\d+)/i);
    return match ? Number(match[1]) : fallbackLine;
  }

  function friendlyErrorMessage(error) {
    const rawSource = error.category && error.message ? String(error.message) : String(error);
    const raw = rawSource
      .replace(/^ExternalError:\s*/i, "")
      .replace(/\s+on line \d+\s*$/i, "");
    if (/bad input|invalid syntax|SyntaxError/i.test(raw)) return "这一行的 Python 语法不完整，请检查冒号和缩进。";
    if (/IndexError.*list index out of range/i.test(raw)) return "列表索引超出范围：当前索引位置在列表中不存在。";
    if (/TimeLimitError|program exceeded run time|exec limit/i.test(raw)) return "循环运行时间过长，页面已经安全停止。请检查 while 的停止条件。";
    return raw.replace(/^(RuntimeError|TypeError|NameError):\s*/i, "") || "代码运行失败。";
  }

  function create(options) {
    const Sk = options.Sk;
    if (!Sk) throw new Error("缺少 Python 运行器。");

    const initialEnergy = options.initialEnergy ?? 8;
    const hazardPosition = options.hazardPosition ?? 3;
    const beaconPosition = options.beaconPosition ?? 4;
    const apiCallLimit = options.apiCallLimit ?? 48;
    const allowedFunctions = options.allowedFunctions || defaultAllowedFunctions;
    const world = options.world || null;
    const terrain = world?.terrain || null;
    const terrainRules = root.CodeQuestWorldRules;
    if (terrain) {
      if (!terrainRules) throw new Error("地形运行器未加载。");
      terrainRules.validate(world, terrain);
    }
    const objectModel = Boolean(options.objectModel);
    const multiObject = Boolean(options.multiObject);
    const languageFeatures = new Set(options.languageFeatures || []);
    const courseInputs = options.courseInputs && typeof options.courseInputs === "object" ? options.courseInputs : {};
    const courseRules = options.courseRules && typeof options.courseRules === "object" ? options.courseRules : {};
    const baseWorld = world ? {
      grid: world.grid.slice(),
      start: { ...world.start },
      startDir: world.startDir,
      required: world.required,
      targetPositions: Array.isArray(world.targetPositions) ? world.targetPositions.map((point) => ({ ...point })) : []
    } : null;
    const directionNames = ["N", "E", "S", "W"];
    const directionVectors = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 }
    ];
    let plannedState;
    let plannedEvents;
    let currentStudentLine;
    let apiCallCount;
    let worldPortals;
    let activeObjectName;
    let callStack;
    let lastEventState;
    let callSequence;

    function initialState() {
      if (world) {
        const startDirection = Math.max(0, directionNames.indexOf(world.startDir || "E"));
        return {
          x: Number(world.start?.x || 0),
          y: Number(world.start?.y || 0),
          direction: startDirection,
          directionName: directionNames[startDirection],
          energy: initialEnergy,
          shieldActive: false,
          collected: false,
          collectedKeys: [],
          uploaded: false,
          gates: Object.fromEntries((terrain?.gates || []).map(g => [g.id, false])),
          variables: {},
          objects: {},
          functions: {},
          reports: [],
          rescues: [],
          transfers: [],
          ticks: 0,
          environmentObjects: (courseRules.movingObjects || []).map((item) => ({ ...item, cleared: item.clearAt !== null && item.clearAt !== undefined && Number(item.clearAt) <= 0 })),
          worldBuild: { active: false, grid: null, placements: [], portals: [], schema: null, schemaValidated: false }
        };
      }
      return {
        position: 0,
        direction: 0,
        energy: initialEnergy,
        shieldActive: false,
        collected: false,
        variables: {},
        objects: {},
        functions: {},
        reports: [],
        rescues: [],
        transfers: [],
        ticks: 0,
        environmentObjects: (courseRules.movingObjects || []).map((item) => ({ ...item, cleared: item.clearAt !== null && item.clearAt !== undefined && Number(item.clearAt) <= 0 })),
        worldBuild: { active: false, grid: null, placements: [], portals: [], schema: null, schemaValidated: false }
      };
    }

    function worldTile(x, y) {
      if (!world || y < 0 || y >= world.grid.length) return "_";
      const row = world.grid[y] || "";
      return x < 0 || x >= row.length ? "_" : row[x];
    }

    function worldKey(x, y) {
      return `${x},${y}`;
    }

    function isWorldBlocked(x, y) {
      return ["_", " ", "~", "#"].includes(worldTile(x, y));
    }

    function worldAhead() {
      const vector = directionVectors[plannedState.direction];
      return { x: plannedState.x + vector.x, y: plannedState.y + vector.y };
    }

    function collectedCount() {
      return Array.isArray(plannedState.collectedKeys) ? plannedState.collectedKeys.length : plannedState.collected ? 1 : 0;
    }

    function isBeaconAt(x, y) {
      if (worldTile(x, y) === "B") return true;
      return Array.isArray(world?.targetPositions) && world.targetPositions.some((point) => Number(point.x) === x && Number(point.y) === y);
    }

    function activeEnvironmentObjectAt(x, y) {
      return (plannedState.environmentObjects || []).find((item) => !item.cleared && Number(item.x) === x && Number(item.y) === y);
    }

    function advanceEnvironment() {
      plannedState.ticks += 1;
      plannedState.environmentObjects = (plannedState.environmentObjects || []).map((item) => {
        if (item.clearAt === null || item.clearAt === undefined) return { ...item };
        return plannedState.ticks >= Number(item.clearAt) ? { ...item, cleared: true } : { ...item };
      });
    }

    function passageIsClear() {
      const configured = Array.isArray(courseRules.passageCell)
        ? { x: Number(courseRules.passageCell[0]), y: Number(courseRules.passageCell[1]) }
        : worldAhead();
      return !isWorldBlocked(configured.x, configured.y)
        && !activeEnvironmentObjectAt(configured.x, configured.y)
        && !Object.values(plannedState.objects || {}).some((item) => item.name !== activeObjectName && item.x === configured.x && item.y === configured.y);
    }

    function guardApiCall() {
      apiCallCount += 1;
      if (apiCallCount > apiCallLimit) {
        throw new Sk.builtin.RuntimeError("循环已经执行太多次，目标状态没有改变。请检查 while 的停止条件。");
      }
    }

    function pushEvent(type, message, details = {}) {
      guardApiCall();
      if (terrain && ["move", "turn", "collect", "collect-attempt", "upload", "shield", "teleport", "switch"].includes(type)) advanceEnvironment();
      const position = state => ({ x: state.x, y: state.y, height: terrainRules.height(terrain, state), direction: state.directionName });
      const transition = terrain && ["move", "turn", "teleport", "collision-fail", "hazard-fail"].includes(type)
        ? { actor: activeObjectName || "Nova", from: position(lastEventState), to: position(plannedState), tick: plannedState.ticks, trigger: type } : undefined;
      plannedEvents.push({ type, message, line: currentStudentLine, callId: callStack?.at(-1)?.id || null,
        state: JSON.parse(JSON.stringify(plannedState)), ...(transition ? { transition } : {}), ...details });
      lastEventState = { ...plannedState };
    }

    function runtimeFailure(message) {
      throw new Sk.builtin.RuntimeError(message);
    }

    function animatedFailure(type, message, details = {}) {
      pushEvent(type, `第 ${currentStudentLine} 行：${message}`, details);
      runtimeFailure(message);
    }

    function normalizeWorldGrid(value) {
      const matrix = Array.isArray(value) ? value : serializePythonValue(value);
      if (!Array.isArray(matrix) || !matrix.length) runtimeFailure("地图数据必须是至少包含一行的二维列表。");
      const rows = matrix.map((row) => {
        if (typeof row === "string") return row;
        if (Array.isArray(row)) return row.map((tile) => String(tile)).join("");
        runtimeFailure("地图的每一行都必须是字符列表或字符串。");
      });
      const width = rows[0].length;
      if (width < 3 || rows.some((row) => row.length !== width)) runtimeFailure("二维地图的每一行必须具有相同长度。");
      const allowedTiles = new Set(["_", " ", ".", "g", "s", "S", "B", "R", "H", "#", "~", "P"]);
      const normalized = rows.map((row) => [...row].map((tile) => {
        if (!allowedTiles.has(tile)) runtimeFailure(`地图字符 ${tile} 还没有对应的格子类型。`);
        return tile === "." ? "g" : tile;
      }).join(""));
      const starts = [];
      let required = 0;
      normalized.forEach((row, y) => [...row].forEach((tile, x) => {
        if (tile === "S") starts.push({ x, y });
        if (tile === "B") required += 1;
      }));
      if (starts.length !== 1) runtimeFailure(`地图必须且只能包含一个起点 S；当前找到 ${starts.length} 个。`);
      if (!required) runtimeFailure("地图至少需要一座宝石 B。");
      return { rows: normalized, start: starts[0], required };
    }

    function updateWorldGrid(rows, details = {}) {
      if (!world) runtimeFailure("当前课程没有开放世界建造。 ");
      world.grid = rows.slice();
      plannedState.worldBuild = {
        ...plannedState.worldBuild,
        active: true,
        grid: rows.slice(),
        ...details
      };
    }

    function replaceWorldTile(x, y, tile) {
      if (!plannedState.worldBuild.active || !Array.isArray(world?.grid)) runtimeFailure("请先用 build_world(map_data) 建立世界蓝图。");
      if (!Number.isInteger(x) || !Number.isInteger(y) || y < 0 || y >= world.grid.length || x < 0 || x >= world.grid[0].length) {
        runtimeFailure(`格子坐标 (${x}, ${y}) 超出地图范围。`);
      }
      const row = [...world.grid[y]];
      row[x] = tile;
      const rows = world.grid.slice();
      rows[y] = row.join("");
      updateWorldGrid(rows);
      return rows;
    }

    function serializePythonValue(value) {
      const remappedValue = Sk.ffi.remapToJs(value);
      function cloneValue(item) {
        if (item === null || ["string", "number", "boolean"].includes(typeof item)) return item;
        if (Array.isArray(item)) return item.map(cloneValue);
        if (item && typeof item === "object") {
          return Object.fromEntries(Object.entries(item).map(([key, nested]) => [key, cloneValue(nested)]));
        }
        return String(item);
      }
      if (remappedValue !== undefined) return cloneValue(remappedValue);
      let objectType = value?.ob$type?.tp$name || value?.tp$name || "object";
      try {
        objectType = String(Sk.ffi.remapToJs(Sk.abstr.gattr(value, new Sk.builtin.str("kind"), false)) || objectType);
      } catch (_) {
        // Keep the runtime type name when this value does not expose a course object kind.
      }
      return `<${objectType}>`;
    }

    function installGameBuiltins() {
      Sk.builtins.__trace_line__ = new Sk.builtin.func(function (line) {
        currentStudentLine = Number(Sk.ffi.remapToJs(line)) || 1;
        return Sk.builtin.none.none$;
      });

      Sk.builtins.__trace_variable__ = new Sk.builtin.func(function (name, value) {
        const variableName = String(Sk.ffi.remapToJs(name));
        const nextValue = serializePythonValue(value);
        const hadPreviousValue = Object.prototype.hasOwnProperty.call(plannedState.variables, variableName);
        const previousValue = plannedState.variables[variableName];
        plannedState.variables = {
          ...plannedState.variables,
          [variableName]: nextValue
        };
        const displayValue = (item) => item !== null && typeof item === "object" ? JSON.stringify(item) : String(item);
        pushEvent(
          "variable",
          `第 ${currentStudentLine} 行 ${variableName}：${hadPreviousValue ? displayValue(previousValue) : "未设置"} → ${displayValue(nextValue)}。`,
          {
            variable: {
              name: variableName,
              previousValue: hadPreviousValue ? previousValue : null,
              value: nextValue
            }
          }
        );
        return Sk.builtin.none.none$;
      });

      Sk.builtins.__trace_function__ = new Sk.builtin.func(function (name, parameterNames, parameterValues) {
        const functionName = String(Sk.ffi.remapToJs(name));
        const names = serializePythonValue(parameterNames);
        const values = serializePythonValue(parameterValues);
        const args = Array.isArray(names) && Array.isArray(values)
          ? Object.fromEntries(names.map((parameterName, index) => [String(parameterName), values[index]]))
          : {};
        callStack.push({ id: ++callSequence, name: functionName, args });
        const currentFunction = plannedState.functions[functionName] || { name: functionName, calls: [], returns: [] };
        plannedState.functions = {
          ...plannedState.functions,
          [functionName]: {
            ...currentFunction,
            calls: [...currentFunction.calls, args]
          }
        };
        const argumentText = Object.entries(args).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join(", ") || "无参数";
        pushEvent(
          "function-call",
          `第 ${currentStudentLine} 行：调用 ${functionName}(${argumentText})。`,
          { functionCall: { name: functionName, arguments: args } }
        );
        return Sk.builtin.none.none$;
      });

      Sk.builtins.__trace_range__ = new Sk.builtin.func(function (value, expression) {
        const expr = String(Sk.ffi.remapToJs(expression));
        const args = callStack.at(-1)?.args || {};
        const bindings = Object.fromEntries(Object.entries(args).filter(([name]) => new RegExp(`\\b${name}\\b`).test(expr)));
        pushEvent("range-input", `循环读取 ${expr} → ${Sk.ffi.remapToJs(value)}。`,
          { range: { expression: expr, value: Sk.ffi.remapToJs(value), bindings } });
        return value;
      });
      function endFunction(name) {
        if (callStack.at(-1)?.name !== name) return;
        pushEvent("function-end", `函数 ${name} 调用结束。`, { functionEnd: { name } });
        callStack.pop();
      }
      Sk.builtins.__trace_function_exit__ = new Sk.builtin.func(function (name) {
        endFunction(String(Sk.ffi.remapToJs(name)));
        return Sk.builtin.none.none$;
      });

      Sk.builtins.__trace_return__ = new Sk.builtin.func(function (name, value) {
        const functionName = String(Sk.ffi.remapToJs(name));
        const result = serializePythonValue(value);
        const currentFunction = plannedState.functions[functionName] || { name: functionName, calls: [], returns: [] };
        plannedState.functions = {
          ...plannedState.functions,
          [functionName]: {
            ...currentFunction,
            returns: [...currentFunction.returns, result]
          }
        };
        pushEvent(
          "function-return",
          `第 ${currentStudentLine} 行：${functionName}() 返回 ${JSON.stringify(result)}。`,
          { functionReturn: { name: functionName, value: result } }
        );
        endFunction(functionName);
        return Sk.builtin.none.none$;
      });

      Sk.builtins.course_value = new Sk.builtin.func(function (name) {
        const key = String(Sk.ffi.remapToJs(name));
        if (!Object.prototype.hasOwnProperty.call(courseInputs, key)) runtimeFailure(`当前验证场没有输入 ${key}。`);
        return Sk.ffi.remapToPy(courseInputs[key]);
      });

      Sk.builtins.report = new Sk.builtin.func(function (value) {
        const result = serializePythonValue(value);
        plannedState.reports = [...(plannedState.reports || []), result];
        pushEvent("report", `第 ${currentStudentLine} 行 report()：提交 ${JSON.stringify(result)}。`, { report: result });
        return Sk.builtin.none.none$;
      });

      Sk.builtins.rescue = new Sk.builtin.func(function (name) {
        const targetName = String(Sk.ffi.remapToJs(name));
        const costs = courseInputs.costs && typeof courseInputs.costs === "object" ? courseInputs.costs : {};
        if (!Object.prototype.hasOwnProperty.call(costs, targetName)) runtimeFailure(`救援表中找不到 ${targetName} 的费用。`);
        plannedState.rescues = [...(plannedState.rescues || []), targetName];
        pushEvent("rescue", `第 ${currentStudentLine} 行 rescue(${JSON.stringify(targetName)})：调度完成。`, { rescue: { name: targetName, cost: Number(costs[targetName]) } });
        return Sk.builtin.none.none$;
      });

      Sk.builtins.is_passage_clear = new Sk.builtin.func(function () {
        const result = passageIsClear();
        pushEvent("condition", `第 ${currentStudentLine} 行 is_passage_clear() → ${result ? "True" : "False"}。`);
        return new Sk.builtin.bool(result);
      });

      Sk.builtins.current_tick = new Sk.builtin.func(function () {
        return new Sk.builtin.int_(Number(plannedState.ticks || 0));
      });

      Sk.builtins.build_world = new Sk.builtin.func(function (mapData) {
        if (!world) runtimeFailure("当前课程没有开放世界建造。");
        const blueprint = normalizeWorldGrid(mapData);
        world.grid = blueprint.rows.slice();
        world.start = { ...blueprint.start };
        world.required = blueprint.required;
        plannedState.x = blueprint.start.x;
        plannedState.y = blueprint.start.y;
        plannedState.collected = false;
        plannedState.collectedKeys = [];
        plannedState.uploaded = false;
        worldPortals = new Map();
        updateWorldGrid(blueprint.rows, { placements: [], portals: [] });
        pushEvent(
          "world-build",
          `第 ${currentStudentLine} 行：由二维数据生成 ${blueprint.rows[0].length} × ${blueprint.rows.length} 世界，包含 ${blueprint.required} 座宝石。`,
          { worldBuild: { action: "build", width: blueprint.rows[0].length, height: blueprint.rows.length } }
        );
        return Sk.builtin.none.none$;
      });

      Sk.builtins.validate_world = new Sk.builtin.func(function (schemaValue) {
        const schema = serializePythonValue(schemaValue);
        if (!schema || typeof schema !== "object" || Array.isArray(schema)) runtimeFailure("关卡 schema 必须使用字典。 ");
        const requiredFields = ["name", "map", "gems", "upload"];
        const missing = requiredFields.filter((field) => !Object.prototype.hasOwnProperty.call(schema, field));
        if (missing.length) runtimeFailure(`关卡 schema 缺少字段：${missing.join("、")}。`);
        const blueprint = normalizeWorldGrid(schema.map);
        if (blueprint.required !== Number(schema.gems)) {
          runtimeFailure(`schema 声明 ${schema.gems} 座宝石，但地图实际编码了 ${blueprint.required} 座。`);
        }
        const hasRelay = blueprint.rows.some((row) => row.includes("R"));
        if (Boolean(schema.upload) !== hasRelay) {
          runtimeFailure(schema.upload ? "schema 要求上传，但地图中没有中继站 R。" : "地图包含中继站 R，但 schema 没有声明上传目标。");
        }
        plannedState.worldBuild = {
          ...plannedState.worldBuild,
          schema,
          schemaValidated: true
        };
        pushEvent(
          "world-validate",
          `第 ${currentStudentLine} 行：关卡 ${schema.name} 的 schema 已通过校验。`,
          { worldBuild: { action: "validate", schema } }
        );
        return new Sk.builtin.bool(true);
      });

      Sk.builtins.place_tile = new Sk.builtin.func(function (xValue, yValue, tileValue) {
        const x = Number(Sk.ffi.remapToJs(xValue));
        const y = Number(Sk.ffi.remapToJs(yValue));
        const tile = String(Sk.ffi.remapToJs(tileValue));
        if (!["g", "s", "H", "#", "B", "R", "P"].includes(tile)) runtimeFailure(`还不能放置格子类型 ${tile}。`);
        const rows = replaceWorldTile(x, y, tile);
        plannedState.worldBuild = {
          ...plannedState.worldBuild,
          grid: rows.slice(),
          placements: [...plannedState.worldBuild.placements, { action: "place", x, y, tile }]
        };
        pushEvent(
          "world-place",
          `第 ${currentStudentLine} 行：在 (${x}, ${y}) 放置 ${tile} 格。`,
          { worldBuild: { action: "place", x, y, tile } }
        );
        return Sk.builtin.none.none$;
      });

      Sk.builtins.remove_tile = new Sk.builtin.func(function (xValue, yValue) {
        const x = Number(Sk.ffi.remapToJs(xValue));
        const y = Number(Sk.ffi.remapToJs(yValue));
        const rows = replaceWorldTile(x, y, "_");
        plannedState.worldBuild = {
          ...plannedState.worldBuild,
          grid: rows.slice(),
          placements: [...plannedState.worldBuild.placements, { action: "remove", x, y, tile: "_" }]
        };
        pushEvent(
          "world-remove",
          `第 ${currentStudentLine} 行：移除 (${x}, ${y}) 的格子。`,
          { worldBuild: { action: "remove", x, y } }
        );
        return Sk.builtin.none.none$;
      });

      Sk.builtins.pair_portals = new Sk.builtin.func(function (x1Value, y1Value, x2Value, y2Value) {
        const x1 = Number(Sk.ffi.remapToJs(x1Value));
        const y1 = Number(Sk.ffi.remapToJs(y1Value));
        const x2 = Number(Sk.ffi.remapToJs(x2Value));
        const y2 = Number(Sk.ffi.remapToJs(y2Value));
        replaceWorldTile(x1, y1, "P");
        const rows = replaceWorldTile(x2, y2, "P");
        worldPortals.set(worldKey(x1, y1), { x: x2, y: y2 });
        worldPortals.set(worldKey(x2, y2), { x: x1, y: y1 });
        const portal = { from: { x: x1, y: y1 }, to: { x: x2, y: y2 } };
        plannedState.worldBuild = {
          ...plannedState.worldBuild,
          grid: rows.slice(),
          portals: [...plannedState.worldBuild.portals, portal]
        };
        pushEvent(
          "world-portal",
          `第 ${currentStudentLine} 行：传送门 (${x1}, ${y1}) ↔ (${x2}, ${y2}) 已配对。`,
          { worldBuild: { action: "portal", ...portal } }
        );
        return Sk.builtin.none.none$;
      });

      Sk.builtins.__component_created__ = new Sk.builtin.func(function (name, type, energy, componentsValue) {
        const objectName = String(Sk.ffi.remapToJs(name));
        const objectType = String(Sk.ffi.remapToJs(type));
        const initialObjectEnergy = Number(Sk.ffi.remapToJs(energy));
        const components = serializePythonValue(componentsValue);
        const xValue = arguments[4];
        const yValue = arguments[5];
        const directionValue = arguments[6];
        const x = xValue && xValue !== Sk.builtin.none.none$ ? Number(Sk.ffi.remapToJs(xValue)) : Number(world?.start?.x || 0);
        const y = yValue && yValue !== Sk.builtin.none.none$ ? Number(Sk.ffi.remapToJs(yValue)) : Number(world?.start?.y || 0);
        const directionName = directionValue ? String(Sk.ffi.remapToJs(directionValue)) : String(world?.startDir || "E");
        plannedState.objects = {
          ...plannedState.objects,
          [objectName]: {
            name: objectName,
            type: objectType,
            initialEnergy: initialObjectEnergy,
            energy: initialObjectEnergy,
            components: Array.isArray(components) ? components.slice() : [],
            x,
            y,
            directionName,
            waits: 0,
            actions: []
          }
        };
        pushEvent(
          "component-create",
          `第 ${currentStudentLine} 行：创建 ${objectType} 实例 ${objectName}，组件为 ${JSON.stringify(components)}。`,
          { object: { name: objectName, type: objectType, action: "compose", components } }
        );
        return Sk.builtin.none.none$;
      });

      Sk.builtins.__object_select__ = new Sk.builtin.func(function (name) {
        if (!multiObject) return Sk.builtin.none.none$;
        const objectName = String(Sk.ffi.remapToJs(name));
        const objectState = plannedState.objects[objectName];
        if (!objectState) runtimeFailure(`找不到对象 ${objectName} 的运行状态。`);
        activeObjectName = objectName;
        plannedState.x = objectState.x;
        plannedState.y = objectState.y;
        const directionIndex = directionNames.indexOf(objectState.directionName || "E");
        plannedState.direction = directionIndex < 0 ? 1 : directionIndex;
        plannedState.directionName = directionNames[plannedState.direction];
        return Sk.builtin.none.none$;
      });

      Sk.builtins.__object_before_action__ = new Sk.builtin.func(function (name, action) {
        if (!multiObject) return Sk.builtin.none.none$;
        const objectName = String(Sk.ffi.remapToJs(name));
        const objectAction = String(Sk.ffi.remapToJs(action));
        const objectState = plannedState.objects[objectName];
        if (objectAction === "upload" && courseRules.requireCargoForUpload && Number(objectState?.cargo || 0) < 1) {
          animatedFailure("action-fail", `${objectName} 还没有收到货物，不能上传。`, {
            failureKind: "missing-cargo",
            object: { name: objectName, action: objectAction }
          });
        }
        if (objectAction !== "move") return Sk.builtin.none.none$;
        const directionIndex = Math.max(0, directionNames.indexOf(objectState.directionName || "E"));
        const vector = directionVectors[directionIndex];
        const destination = { x: objectState.x + vector.x, y: objectState.y + vector.y };
        const occupied = Object.values(plannedState.objects).find((item) => {
          return item.name !== objectName
            && item.x === destination.x
            && item.y === destination.y;
        });
        const environmentOccupied = activeEnvironmentObjectAt(destination.x, destination.y);
        if (occupied || environmentOccupied) {
          const occupiedName = occupied?.name || environmentOccupied?.name || "移动物体";
          animatedFailure(
            "action-fail",
            `${objectName} 前往 (${destination.x}, ${destination.y}) 时与 ${occupiedName} 发生占位冲突。等待后也必须重新确认格子已经空出。`,
            {
              failureKind: "object-conflict",
              conflict: { actor: objectName, occupiedBy: occupiedName, ...destination }
            }
          );
        }
        return Sk.builtin.none.none$;
      });

      Sk.builtins.__require_component__ = new Sk.builtin.func(function (name, type, action, componentsValue) {
        const objectName = String(Sk.ffi.remapToJs(name));
        const objectType = String(Sk.ffi.remapToJs(type));
        const objectAction = String(Sk.ffi.remapToJs(action));
        const components = serializePythonValue(componentsValue);
        if (!Array.isArray(components) || !components.includes(objectAction)) {
          animatedFailure(
            "action-fail",
            `${objectType} 实例 ${objectName} 缺少 ${objectAction} 组件，无法执行该方法。`,
            {
              failureKind: "component-capability",
              object: { name: objectName, type: objectType, action: objectAction, components }
            }
          );
        }
        return Sk.builtin.none.none$;
      });

      Sk.builtins.__object_created__ = new Sk.builtin.func(function (name, type, energy, xValue, yValue, directionValue, cargoValue, capacityValue) {
        const objectName = String(Sk.ffi.remapToJs(name));
        const objectType = String(Sk.ffi.remapToJs(type));
        const initialObjectEnergy = Number(Sk.ffi.remapToJs(energy));
        const x = xValue && xValue !== Sk.builtin.none.none$ ? Number(Sk.ffi.remapToJs(xValue)) : Number(world?.start?.x || 0);
        const y = yValue && yValue !== Sk.builtin.none.none$ ? Number(Sk.ffi.remapToJs(yValue)) : Number(world?.start?.y || 0);
        const directionName = directionValue ? String(Sk.ffi.remapToJs(directionValue)) : String(world?.startDir || "E");
        const cargo = cargoValue && cargoValue !== Sk.builtin.none.none$ ? Number(Sk.ffi.remapToJs(cargoValue)) : 0;
        const capacity = capacityValue && capacityValue !== Sk.builtin.none.none$ ? Number(Sk.ffi.remapToJs(capacityValue)) : 0;
        const replaced = Object.prototype.hasOwnProperty.call(plannedState.objects, objectName);
        plannedState.objects = {
          ...plannedState.objects,
          [objectName]: {
            name: objectName,
            type: objectType,
            initialEnergy: initialObjectEnergy,
            energy: initialObjectEnergy,
            x,
            y,
            directionName,
            cargo,
            capacity,
            waits: 0,
            actions: []
          }
        };
        pushEvent(
          "object-create",
          `第 ${currentStudentLine} 行：创建 ${objectType} 实例 ${objectName}，初始能量 ${initialObjectEnergy}${replaced ? "；同名档案已被覆盖" : ""}。`,
          { object: { name: objectName, type: objectType, action: "create", replaced } }
        );
        return Sk.builtin.none.none$;
      });

      Sk.builtins.__object_action__ = new Sk.builtin.func(function (name, type, action) {
        const objectName = String(Sk.ffi.remapToJs(name));
        const objectType = String(Sk.ffi.remapToJs(type));
        const objectAction = String(Sk.ffi.remapToJs(action));
        const currentObject = plannedState.objects[objectName] || {
          name: objectName,
          type: objectType,
          initialEnergy: 0,
          energy: 0,
          actions: []
        };
        const energyCost = ["move", "fly"].includes(objectAction) ? 1 : 0;
        const nextObject = {
          ...currentObject,
          energy: Math.max(0, Number(currentObject.energy || 0) - energyCost),
          x: multiObject && activeObjectName === objectName ? plannedState.x : currentObject.x,
          y: multiObject && activeObjectName === objectName ? plannedState.y : currentObject.y,
          directionName: multiObject && activeObjectName === objectName ? plannedState.directionName : currentObject.directionName,
          cargo: objectAction === "upload" ? 0 : Number(currentObject.cargo || 0) + (objectAction === "collect" ? 1 : 0),
          waits: Number(currentObject.waits || 0) + (objectAction === "wait" ? 1 : 0),
          actions: [...(currentObject.actions || []), objectAction]
        };
        plannedState.objects = { ...plannedState.objects, [objectName]: nextObject };
        pushEvent(
          "object-action",
          `第 ${currentStudentLine} 行：${objectName}（${objectType}）执行 ${objectAction}。`,
          { object: { name: objectName, type: objectType, action: objectAction } }
        );
        return Sk.builtin.none.none$;
      });

      Sk.builtins.__object_transfer__ = new Sk.builtin.func(function (fromValue, toValue, amountValue) {
        const from = String(Sk.ffi.remapToJs(fromValue));
        const to = String(Sk.ffi.remapToJs(toValue));
        const amount = Number(Sk.ffi.remapToJs(amountValue));
        const sender = plannedState.objects[from];
        const receiver = plannedState.objects[to];
        if (!sender || !receiver) runtimeFailure("交接双方必须是已经创建的两个对象。");
        if (!Number.isInteger(amount) || amount <= 0) runtimeFailure("交接数量必须是正整数。");
        if (Number(sender.cargo || 0) < amount) runtimeFailure(`${from} 没有足够货物可以交接。`);
        if (Number(receiver.cargo || 0) + amount > Number(receiver.capacity || 0)) runtimeFailure(`${to} 的容量不足，交接没有发生。`);
        const adjacent = Math.abs(Number(sender.x) - Number(receiver.x)) + Math.abs(Number(sender.y) - Number(receiver.y)) === 1;
        if (!adjacent) runtimeFailure("交接双方必须位于相邻格。");
        const handoffCells = Array.isArray(courseRules.handoffCells) ? courseRules.handoffCells : [];
        const inHandoff = !handoffCells.length || [sender, receiver].every((objectState) => handoffCells.some((cell) => Number(cell[0]) === Number(objectState.x) && Number(cell[1]) === Number(objectState.y)));
        if (!inHandoff) runtimeFailure("交接双方必须同时位于交接区。");
        plannedState.objects = {
          ...plannedState.objects,
          [from]: { ...sender, cargo: Number(sender.cargo || 0) - amount },
          [to]: { ...receiver, cargo: Number(receiver.cargo || 0) + amount }
        };
        const transfer = { from, to, amount };
        plannedState.transfers = [...(plannedState.transfers || []), transfer];
        pushEvent("transfer", `第 ${currentStudentLine} 行：${from} 向 ${to} 交接 ${amount} 件货物。`, { transfer });
        return Sk.builtin.none.none$;
      });

      Sk.builtins.__object_capability_error__ = new Sk.builtin.func(function (name, type, action) {
        const objectName = String(Sk.ffi.remapToJs(name));
        const objectType = String(Sk.ffi.remapToJs(type));
        const objectAction = String(Sk.ffi.remapToJs(action));
        animatedFailure(
          "action-fail",
          `${objectType} 实例 ${objectName} 不具备 ${objectAction} 能力。请根据类型说明书选择对象。`,
          {
            failureKind: "object-capability",
            object: { name: objectName, type: objectType, action: objectAction }
          }
        );
      });

      Sk.builtins.move = new Sk.builtin.func(function () {
        if (world) {
          const next = worldAhead();
          if (terrain) {
            const problem = terrainRules.movement(world, terrain, plannedState, next);
            if (problem) animatedFailure("collision-fail", problem, { failureKind: "terrain", attemptedX: next.x, attemptedY: next.y });
          }
          if (isWorldBlocked(next.x, next.y)) {
            const blockedTile = worldTile(next.x, next.y);
            const failureType = blockedTile === "#" ? "collision-fail" : "fall";
            const failureMessage = blockedTile === "#"
              ? "Nova 撞上了岩石，移动已经停止。"
              : "Nova 朝通道外执行了 move()，已经从边缘跌落。";
            animatedFailure(failureType, failureMessage, {
              failureKind: blockedTile === "#" ? "wall" : "side-edge",
              fallDirection: plannedState.direction,
              attemptedX: next.x,
              attemptedY: next.y
            });
          }
          if (plannedState.energy <= 0) runtimeFailure("能量已经用完，无法继续移动。");
          const hazard = worldTile(next.x, next.y) === "H";
          plannedState.x = next.x;
          plannedState.y = next.y;
          plannedState.energy -= 1;
          if (hazard && !plannedState.shieldActive) {
            animatedFailure("hazard-fail", "Nova 没有开启护盾，进入尖刺格后停止运行。", {
              failureKind: "unshielded-hazard"
            });
          }
          const portalDestination = !terrain && worldPortals.get(worldKey(plannedState.x, plannedState.y));
          if (portalDestination) {
            const entrance = { x: plannedState.x, y: plannedState.y };
            plannedState.x = portalDestination.x;
            plannedState.y = portalDestination.y;
            pushEvent(
              "teleport",
              `第 ${currentStudentLine} 行 move()：进入传送门 (${entrance.x}, ${entrance.y})，到达 (${plannedState.x}, ${plannedState.y})。`,
              { portal: { from: entrance, to: { ...portalDestination } } }
            );
          } else {
            pushEvent("move", `第 ${currentStudentLine} 行 move()：前进到 (${plannedState.x}, ${plannedState.y})。`);
          }
          if (hazard) plannedState.shieldActive = false;
          return Sk.builtin.none.none$;
        }
        if (plannedState.direction !== 0) {
          animatedFailure("fall", "Nova 朝通道外执行了 move()，已经从边缘跌落。", {
            fallDirection: plannedState.direction,
            failureKind: "side-edge"
          });
        }
        if (plannedState.position >= beaconPosition) {
          animatedFailure("fall", "Nova 走过了终点，从维修桥尽头跌落。", {
            fallDirection: 0,
            failureKind: "overshoot"
          });
        }
        if (plannedState.energy <= 0) runtimeFailure("能量已经用完，无法继续移动。");
        const nextPosition = plannedState.position + 1;
        if (nextPosition === hazardPosition && !plannedState.shieldActive) {
          plannedState.position = nextPosition;
          plannedState.energy -= 1;
          animatedFailure("hazard-fail", "Nova 没有开启护盾，进入尖刺格后停止运行。", {
            failureKind: "unshielded-hazard"
          });
        }
        plannedState.position = nextPosition;
        plannedState.energy -= 1;
        pushEvent("move", `第 ${currentStudentLine} 行 move()：前进到位置 ${plannedState.position}。`);
        if (nextPosition === hazardPosition) plannedState.shieldActive = false;
        return Sk.builtin.none.none$;
      });

      Sk.builtins.turn_left = new Sk.builtin.func(function () {
        plannedState.direction = (plannedState.direction + 3) % 4;
        if (world) plannedState.directionName = directionNames[plannedState.direction];
        pushEvent("turn", `第 ${currentStudentLine} 行 turn_left()：改变朝向，但位置没有变化。`);
        return Sk.builtin.none.none$;
      });

      Sk.builtins.turn_right = new Sk.builtin.func(function () {
        plannedState.direction = (plannedState.direction + 1) % 4;
        if (world) plannedState.directionName = directionNames[plannedState.direction];
        pushEvent("turn", `第 ${currentStudentLine} 行 turn_right()：改变朝向，但位置没有变化。`);
        return Sk.builtin.none.none$;
      });

      Sk.builtins.wait = new Sk.builtin.func(function () {
        advanceEnvironment();
        pushEvent("wait", `第 ${currentStudentLine} 行 wait()：当前对象保持位置，把这一拍让给协作对象。`, {
          object: activeObjectName ? { name: activeObjectName, action: "wait" } : undefined
        });
        return Sk.builtin.none.none$;
      });

      Sk.builtins.teleport = new Sk.builtin.func(function () {
        if (!terrain) runtimeFailure("当前任务没有独立传送动作。");
        const from = { x: plannedState.x, y: plannedState.y };
        const to = terrainRules.destination(terrain, plannedState);
        if (!to) animatedFailure("action-fail", "先站上传送台，再执行传送。", { failureKind: "portal-away" });
        const problem = terrainRules.landing(world, terrain, plannedState, to);
        if (problem) animatedFailure("action-fail", `传送未发生：${problem}`, { failureKind: "portal-blocked" });
        if (worldTile(to.x, to.y) === "H" && !plannedState.shieldActive)
          animatedFailure("action-fail", "传送未发生：出口是尖刺格，需要先开启护盾。", { failureKind: "portal-hazard" });
        plannedState.x = to.x; plannedState.y = to.y;
        pushEvent("teleport", `传送：(${from.x}, ${from.y}) → (${to.x}, ${to.y})；朝向与物品保持。`, { portal: { from, to } });
        return Sk.builtin.none.none$;
      });

      Sk.builtins.activate_switch = new Sk.builtin.func(function () {
        const control = terrain?.switches?.find(s => terrainRules.same(s.at, plannedState));
        if (!control) animatedFailure("action-fail", "当前位置没有开关。", { failureKind: "switch-away" });
        const ids = terrain.gates.filter(g => g.switchId === control.id).map(g => g.id);
        plannedState.gates = { ...plannedState.gates, ...Object.fromEntries(ids.map(id => [id, true])) };
        pushEvent("switch", "开关已激活；离开后门仍保持打开。", { switchId: control.id, openedGates: ids });
        return Sk.builtin.none.none$;
      });

      Sk.builtins.shield = new Sk.builtin.func(function () {
        if (plannedState.energy <= 0) runtimeFailure("没有足够能量开启护盾。");
        plannedState.energy -= 1;
        plannedState.shieldActive = true;
        pushEvent("shield", `第 ${currentStudentLine} 行 shield()：护盾已经开启。`);
        return Sk.builtin.none.none$;
      });

      Sk.builtins.collect = new Sk.builtin.func(function () {
        if (world) {
          const key = worldKey(plannedState.x, plannedState.y);
          if (!isBeaconAt(plannedState.x, plannedState.y)) {
            animatedFailure("action-fail", "当前位置没有可以采集的宝石。", { failureKind: "empty-collect" });
          }
          if (plannedState.collectedKeys.includes(key)) {
            animatedFailure("action-fail", "这座宝石已经采集过了。", { failureKind: "duplicate-collect" });
          }
          plannedState.collectedKeys = [...plannedState.collectedKeys, key];
          plannedState.collected = collectedCount() >= Number(world.required || 1);
          pushEvent("collect", `第 ${currentStudentLine} 行 collect()：已采集 ${collectedCount()} / ${Number(world.required || 1)} 座宝石。`);
          return Sk.builtin.none.none$;
        }
        if (plannedState.position !== beaconPosition) runtimeFailure("当前位置没有可以采集的宝石。");
        plannedState.collected = true;
        pushEvent("collect", `第 ${currentStudentLine} 行 collect()：宝石采集完成。`);
        return Sk.builtin.none.none$;
      });

      Sk.builtins.try_collect = new Sk.builtin.func(function () {
        if (!world) runtimeFailure("当前任务没有可恢复的采集尝试。");
        const key = worldKey(plannedState.x, plannedState.y);
        const before = collectedCount();
        const onGem = isBeaconAt(plannedState.x, plannedState.y);
        const duplicate = onGem && plannedState.collectedKeys.includes(key);
        const success = onGem && !duplicate;
        if (success) {
          plannedState.collectedKeys = [...plannedState.collectedKeys, key];
          plannedState.collected = collectedCount() >= Number(world.required || 0);
        }
        const after = collectedCount();
        const reason = success ? "collected" : duplicate ? "already-collected" : "empty";
        const resultText = success ? "成功" : duplicate ? "重复采集，不增加宝石" : "空采，不增加宝石";
        pushEvent("collect-attempt", `第 ${currentStudentLine} 行 try_collect()：${resultText}；实际宝石 ${before} → ${after}。`, {
          collectAttempt: { x: plannedState.x, y: plannedState.y, success, reason, worldCountBefore: before, worldCountAfter: after }
        });
        return new Sk.builtin.bool(success);
      });

      Sk.builtins.check_count = new Sk.builtin.func(function (value) {
        if (!world || !terrain) runtimeFailure("当前任务没有计数门。");
        const count = Number(Sk.ffi.remapToJs(value));
        const actual = collectedCount();
        const expected = Number(world.required || 0);
        const gateIds = (terrain.gates || []).filter(g => g.kind === "count").map(g => g.id);
        const passed = Number.isFinite(count) && count === actual && actual === expected;
        if (passed) plannedState.gates = { ...plannedState.gates, ...Object.fromEntries(gateIds.map(id => [id, true])) };
        pushEvent("count-check", passed
          ? `第 ${currentStudentLine} 行 check_count()：count=${count}，实际宝石=${actual}，计数门已打开。`
          : `第 ${currentStudentLine} 行 check_count()：count=${count}，实际宝石=${actual}，目标=${expected}；计数门拒绝打开。`,
        { countCheck: { value: count, actual, expected, passed, gateIds } });
        if (!passed) runtimeFailure(`计数没有通过：count=${count}，实际宝石=${actual}，目标=${expected}。`);
        return new Sk.builtin.bool(true);
      });

      Sk.builtins.is_spike_ahead = new Sk.builtin.func(function () {
        const result = world
          ? worldTile(worldAhead().x, worldAhead().y) === "H"
          : plannedState.position + 1 === hazardPosition;
        pushEvent("condition", `第 ${currentStudentLine} 行 is_spike_ahead() → ${result ? "True" : "False"}。`);
        return new Sk.builtin.bool(result);
      });

      Sk.builtins.is_blocked_ahead = new Sk.builtin.func(function () {
        const result = world
          ? terrain ? Boolean(terrainRules.movement(world, terrain, plannedState, worldAhead())) : isWorldBlocked(worldAhead().x, worldAhead().y)
          : plannedState.position >= beaconPosition;
        pushEvent("condition", `第 ${currentStudentLine} 行 is_blocked_ahead() → ${result ? "True" : "False"}。`);
        return new Sk.builtin.bool(result);
      });

      Sk.builtins.is_path_clear = new Sk.builtin.func(function () {
        const result = world
          ? terrain ? !terrainRules.movement(world, terrain, plannedState, worldAhead()) : !isWorldBlocked(worldAhead().x, worldAhead().y)
          : plannedState.position < beaconPosition;
        pushEvent("condition", `第 ${currentStudentLine} 行 is_path_clear() → ${result ? "True" : "False"}。`);
        return new Sk.builtin.bool(result);
      });

      Sk.builtins.shield_is_active = new Sk.builtin.func(function () {
        pushEvent("condition", `第 ${currentStudentLine} 行 shield_is_active() → ${plannedState.shieldActive ? "True" : "False"}。`);
        return new Sk.builtin.bool(plannedState.shieldActive);
      });

      Sk.builtins.at_gem = new Sk.builtin.func(function () {
        const result = world
          ? isBeaconAt(plannedState.x, plannedState.y) && !plannedState.collectedKeys.includes(worldKey(plannedState.x, plannedState.y))
          : plannedState.position === beaconPosition;
        pushEvent("condition", `第 ${currentStudentLine} 行 at_gem() → ${result ? "True" : "False"}。`);
        return new Sk.builtin.bool(result);
      });

      Sk.builtins.at_relay = new Sk.builtin.func(function () {
        const result = world ? worldTile(plannedState.x, plannedState.y) === "R" : false;
        pushEvent("condition", `第 ${currentStudentLine} 行 at_relay() → ${result ? "True" : "False"}。`);
        return new Sk.builtin.bool(result);
      });

      Sk.builtins.upload = new Sk.builtin.func(function () {
        if (!world) runtimeFailure("当前验证场没有中继站。");
        if (worldTile(plannedState.x, plannedState.y) !== "R") {
          animatedFailure("action-fail", "上传失败：Nova 还没有到达中继站。", { failureKind: "upload-away-from-relay" });
        }
        if (collectedCount() < Number(world.required || 1)) {
          animatedFailure("action-fail", `上传失败：还需要 ${Number(world.required || 1) - collectedCount()} 座宝石。`, { failureKind: "missing-beacons" });
        }
        plannedState.uploaded = true;
        pushEvent("upload", `第 ${currentStudentLine} 行 upload()：任务数据上传完成。`);
        return Sk.builtin.none.none$;
      });

      Sk.builtins.energy_remaining = new Sk.builtin.func(function () {
        pushEvent("condition", `第 ${currentStudentLine} 行 energy_remaining() → ${plannedState.energy}。`);
        return new Sk.builtin.int_(plannedState.energy);
      });
    }

    async function compile(source) {
      currentStudentLine = 1;
      apiCallCount = 0;
      callStack = [];
      callSequence = 0;
      if (world && baseWorld) {
        world.grid = baseWorld.grid.slice();
        world.start = { ...baseWorld.start };
        world.startDir = baseWorld.startDir;
        world.required = baseWorld.required;
        world.targetPositions = baseWorld.targetPositions.map((point) => ({ ...point }));
      }
      worldPortals = new Map();
      activeObjectName = null;
      plannedState = initialState();
      lastEventState = { ...plannedState };
      plannedEvents = [];

      validateSource(source, allowedFunctions, languageFeatures);
      Sk.configure({
        output: function () {},
        read: function () { throw new Error("这个验证页不开放文件读取。"); },
        __future__: Sk.python3,
        execLimit: 900,
        killableWhile: true,
        killableFor: true,
        timeoutMsg: function () { return "循环运行时间过长，页面已经安全停止。"; }
      });

      try {
        Sk.parse("student.py", source);
      } catch (error) {
        error.studentLine = extractSkulptLine(error, null, 1);
        error.category = "syntax";
        throw error;
      }

      const instrumented = instrumentSource(source);
      const prelude = objectModel ? objectModelPrelude() : "";
      const preludeLineCount = prelude ? prelude.split("\n").length + 1 : 0;
      const runtimeSource = prelude ? `${prelude}\n${instrumented.code}` : instrumented.code;
      const runtimeLineMap = preludeLineCount
        ? new Map([...instrumented.lineMap].map(([line, studentLine]) => [line + preludeLineCount, studentLine]))
        : instrumented.lineMap;
      installGameBuiltins();
      try {
        await Sk.misceval.asyncToPromise(function () {
          return Sk.importMainWithBody("student", false, runtimeSource, true);
        });
      } catch (error) {
        error.studentLine = extractSkulptLine(error, runtimeLineMap, currentStudentLine);
        error.category = error.category || (/SyntaxError/i.test(String(error)) ? "syntax" : "runtime");
        error.partialEvents = plannedEvents.map((event) => ({ ...event, state: { ...event.state } }));
        error.partialState = { ...plannedState };
        throw error;
      }

      return { events: plannedEvents, finalState: { ...plannedState } };
    }

    return { compile };
  }

  root.CodeQuestPythonRuntime = {
    create,
    createStudentError,
    friendlyErrorMessage,
    instrumentSource,
    validateSource
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
