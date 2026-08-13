(function (root) {
  "use strict";

  const defaultAllowedFunctions = new Set([
    "move",
    "turn_left",
    "turn_right",
    "shield",
    "collect",
    "upload",
    "is_hazard_ahead",
    "is_blocked_ahead",
    "is_path_clear",
    "shield_is_active",
    "at_beacon",
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
        functionStack.pop();
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
      output.push(line);
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
    return { code: output.join("\n"), lineMap };
  }

  function objectModelPrelude() {
    return [
      "class Explorer:",
      "    kind = 'Explorer'",
      "    def __init__(self, name, energy, x=None, y=None, direction='E'):",
      "        self.name = name",
      "        self.energy = energy",
      "        __object_created__(name, self.kind, energy, x, y, direction)",
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
      "        __object_action__(self.name, self.kind, 'collect')",
      "    def upload(self):",
      "        __object_select__(self.name)",
      "        __object_before_action__(self.name, 'upload')",
      "        upload()",
      "        __object_action__(self.name, self.kind, 'upload')",
      "    def scan(self):",
      "        __object_select__(self.name)",
      "        __object_action__(self.name, self.kind, 'scan')",
      "        return is_path_clear()",
      "    def wait(self):",
      "        __object_select__(self.name)",
      "        wait()",
      "        __object_action__(self.name, self.kind, 'wait')",
      "",
      "class Flyer:",
      "    kind = 'Flyer'",
      "    def __init__(self, name, energy, x=None, y=None, direction='E'):",
      "        self.name = name",
      "        self.energy = energy",
      "        __object_created__(name, self.kind, energy, x, y, direction)",
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
      "    def __init__(self, name, energy, x=None, y=None, direction='E'):",
      "        self.name = name",
      "        self.energy = energy",
      "        __object_created__(name, self.kind, energy, x, y, direction)",
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
      "        __object_action__(self.name, self.kind, 'upload')",
      "    def collect(self):",
      "        __object_capability_error__(self.name, self.kind, 'collect')",
      "    def wait(self):",
      "        __object_select__(self.name)",
      "        wait()",
      "        __object_action__(self.name, self.kind, 'wait')",
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
    const objectModel = Boolean(options.objectModel);
    const multiObject = Boolean(options.multiObject);
    const languageFeatures = new Set(options.languageFeatures || []);
    const baseWorld = world ? {
      grid: world.grid.slice(),
      start: { ...world.start },
      startDir: world.startDir,
      required: world.required
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
          variables: {},
          objects: {},
          functions: {},
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

    function guardApiCall() {
      apiCallCount += 1;
      if (apiCallCount > apiCallLimit) {
        throw new Sk.builtin.RuntimeError("循环已经执行太多次，目标状态没有改变。请检查 while 的停止条件。");
      }
    }

    function pushEvent(type, message, details = {}) {
      guardApiCall();
      plannedEvents.push({ type, message, line: currentStudentLine, state: { ...plannedState }, ...details });
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
      if (!required) runtimeFailure("地图至少需要一座信标 B。");
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
        return Sk.builtin.none.none$;
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
          `第 ${currentStudentLine} 行：由二维数据生成 ${blueprint.rows[0].length} × ${blueprint.rows.length} 世界，包含 ${blueprint.required} 座信标。`,
          { worldBuild: { action: "build", width: blueprint.rows[0].length, height: blueprint.rows.length } }
        );
        return Sk.builtin.none.none$;
      });

      Sk.builtins.validate_world = new Sk.builtin.func(function (schemaValue) {
        const schema = serializePythonValue(schemaValue);
        if (!schema || typeof schema !== "object" || Array.isArray(schema)) runtimeFailure("关卡 schema 必须使用字典。 ");
        const requiredFields = ["name", "map", "beacons", "upload"];
        const missing = requiredFields.filter((field) => !Object.prototype.hasOwnProperty.call(schema, field));
        if (missing.length) runtimeFailure(`关卡 schema 缺少字段：${missing.join("、")}。`);
        const blueprint = normalizeWorldGrid(schema.map);
        if (blueprint.required !== Number(schema.beacons)) {
          runtimeFailure(`schema 声明 ${schema.beacons} 座信标，但地图实际编码了 ${blueprint.required} 座。`);
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
        if (objectAction !== "move") return Sk.builtin.none.none$;
        const objectState = plannedState.objects[objectName];
        const directionIndex = Math.max(0, directionNames.indexOf(objectState.directionName || "E"));
        const vector = directionVectors[directionIndex];
        const destination = { x: objectState.x + vector.x, y: objectState.y + vector.y };
        const occupied = Object.values(plannedState.objects).find((item) => {
          return item.name !== objectName
            && item.x === destination.x
            && item.y === destination.y;
        });
        const actorWaited = objectState.actions?.at(-1) === "wait";
        if (occupied && !actorWaited) {
          animatedFailure(
            "action-fail",
            `${objectName} 前往 (${destination.x}, ${destination.y}) 时与 ${occupied.name} 发生占位冲突。让其中一个对象等待或调整顺序。`,
            {
              failureKind: "object-conflict",
              conflict: { actor: objectName, occupiedBy: occupied.name, ...destination }
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

      Sk.builtins.__object_created__ = new Sk.builtin.func(function (name, type, energy, xValue, yValue, directionValue) {
        const objectName = String(Sk.ffi.remapToJs(name));
        const objectType = String(Sk.ffi.remapToJs(type));
        const initialObjectEnergy = Number(Sk.ffi.remapToJs(energy));
        const x = xValue && xValue !== Sk.builtin.none.none$ ? Number(Sk.ffi.remapToJs(xValue)) : Number(world?.start?.x || 0);
        const y = yValue && yValue !== Sk.builtin.none.none$ ? Number(Sk.ffi.remapToJs(yValue)) : Number(world?.start?.y || 0);
        const directionName = directionValue ? String(Sk.ffi.remapToJs(directionValue)) : String(world?.startDir || "E");
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
          if (isWorldBlocked(next.x, next.y)) {
            const blockedTile = worldTile(next.x, next.y);
            const failureType = blockedTile === "#" ? "collision-fail" : "fall";
            const failureMessage = blockedTile === "#"
              ? "探测员撞上了岩石，移动已经停止。"
              : "探测员朝通道外执行了 move()，已经从边缘跌落。";
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
            animatedFailure("hazard-fail", "探测员没有开启护盾，进入危险格后停止运行。", {
              failureKind: "unshielded-hazard"
            });
          }
          const portalDestination = worldPortals.get(worldKey(plannedState.x, plannedState.y));
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
          animatedFailure("fall", "探测员朝通道外执行了 move()，已经从边缘跌落。", {
            fallDirection: plannedState.direction,
            failureKind: "side-edge"
          });
        }
        if (plannedState.position >= beaconPosition) {
          animatedFailure("fall", "探测员走过了终点，从维修桥尽头跌落。", {
            fallDirection: 0,
            failureKind: "overshoot"
          });
        }
        if (plannedState.energy <= 0) runtimeFailure("能量已经用完，无法继续移动。");
        const nextPosition = plannedState.position + 1;
        if (nextPosition === hazardPosition && !plannedState.shieldActive) {
          plannedState.position = nextPosition;
          plannedState.energy -= 1;
          animatedFailure("hazard-fail", "探测员没有开启护盾，进入危险格后停止运行。", {
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
        pushEvent("wait", `第 ${currentStudentLine} 行 wait()：当前对象保持位置，把这一拍让给协作对象。`, {
          object: activeObjectName ? { name: activeObjectName, action: "wait" } : undefined
        });
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
          if (worldTile(plannedState.x, plannedState.y) !== "B") {
            animatedFailure("action-fail", "当前位置没有可以采集的信标。", { failureKind: "empty-collect" });
          }
          if (plannedState.collectedKeys.includes(key)) {
            animatedFailure("action-fail", "这座信标已经采集过了。", { failureKind: "duplicate-collect" });
          }
          plannedState.collectedKeys = [...plannedState.collectedKeys, key];
          plannedState.collected = collectedCount() >= Number(world.required || 1);
          pushEvent("collect", `第 ${currentStudentLine} 行 collect()：已采集 ${collectedCount()} / ${Number(world.required || 1)} 座信标。`);
          return Sk.builtin.none.none$;
        }
        if (plannedState.position !== beaconPosition) runtimeFailure("当前位置没有可以采集的信标。");
        plannedState.collected = true;
        pushEvent("collect", `第 ${currentStudentLine} 行 collect()：信标采集完成。`);
        return Sk.builtin.none.none$;
      });

      Sk.builtins.is_hazard_ahead = new Sk.builtin.func(function () {
        const result = world
          ? worldTile(worldAhead().x, worldAhead().y) === "H"
          : plannedState.position + 1 === hazardPosition;
        pushEvent("condition", `第 ${currentStudentLine} 行 is_hazard_ahead() → ${result ? "True" : "False"}。`);
        return new Sk.builtin.bool(result);
      });

      Sk.builtins.is_blocked_ahead = new Sk.builtin.func(function () {
        const result = world
          ? isWorldBlocked(worldAhead().x, worldAhead().y)
          : plannedState.position >= beaconPosition;
        pushEvent("condition", `第 ${currentStudentLine} 行 is_blocked_ahead() → ${result ? "True" : "False"}。`);
        return new Sk.builtin.bool(result);
      });

      Sk.builtins.is_path_clear = new Sk.builtin.func(function () {
        const result = world
          ? !isWorldBlocked(worldAhead().x, worldAhead().y)
          : plannedState.position < beaconPosition;
        pushEvent("condition", `第 ${currentStudentLine} 行 is_path_clear() → ${result ? "True" : "False"}。`);
        return new Sk.builtin.bool(result);
      });

      Sk.builtins.shield_is_active = new Sk.builtin.func(function () {
        pushEvent("condition", `第 ${currentStudentLine} 行 shield_is_active() → ${plannedState.shieldActive ? "True" : "False"}。`);
        return new Sk.builtin.bool(plannedState.shieldActive);
      });

      Sk.builtins.at_beacon = new Sk.builtin.func(function () {
        const result = world
          ? worldTile(plannedState.x, plannedState.y) === "B" && !plannedState.collectedKeys.includes(worldKey(plannedState.x, plannedState.y))
          : plannedState.position === beaconPosition;
        pushEvent("condition", `第 ${currentStudentLine} 行 at_beacon() → ${result ? "True" : "False"}。`);
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
          animatedFailure("action-fail", "上传失败：探测员还没有到达中继站。", { failureKind: "upload-away-from-relay" });
        }
        if (collectedCount() < Number(world.required || 1)) {
          animatedFailure("action-fail", `上传失败：还需要 ${Number(world.required || 1) - collectedCount()} 座信标。`, { failureKind: "missing-beacons" });
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
      if (world && baseWorld) {
        world.grid = baseWorld.grid.slice();
        world.start = { ...baseWorld.start };
        world.startDir = baseWorld.startDir;
        world.required = baseWorld.required;
      }
      worldPortals = new Map();
      activeObjectName = null;
      plannedState = initialState();
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
