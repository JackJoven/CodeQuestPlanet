(function (root) {
  "use strict";
  const key = p => `${p.x},${p.y}`;
  const same = (a, b) => a.x === b.x && a.y === b.y;
  const height = (terrain, p) => Number(terrain?.heights?.[key(p)] || 0);
  function tile(world, p) { return world.grid[p.y]?.[p.x] || "_"; }
  function landing(world, terrain, state, p) {
    if (["_", " ", "~", "#"].includes(tile(world, p))) return "这里没有可通行的地面。";
    const gate = terrain?.gates?.find(g => same(g.at, p));
    if (gate && !state.gates?.[gate.id]) return gate.kind === "count"
      ? "计数门还没有打开，先用 check_count() 核对变量。"
      : "门还没有打开，先激活对应开关。";
    if (Object.values(state.objects || {}).some(o => same(o, p) && !same(o, state))) return "出口被另一个对象占用。";
    return "";
  }
  function movement(world, terrain, state, next) {
    const blocked = landing(world, terrain, state, next);
    if (blocked) return blocked;
    const reverseOnly = terrain?.oneWays?.find(edge => same(edge.to, state) && same(edge.from, next));
    if (reverseOnly) return "这是单向通道，只能沿箭头通过。";
    const delta = height(terrain, next) - height(terrain, state);
    if (!delta) return "";
    const stair = terrain?.stairs?.some(s => same(s.from, state) && same(s.to, next) || same(s.to, state) && same(s.from, next));
    return Math.abs(delta) === 1 && stair ? "" : "高差之间没有相连台阶，不能直接前进。";
  }
  function destination(terrain, state) {
    const portal = terrain?.portals?.find(p => same(p.from, state) || same(p.to, state));
    return portal ? { ...(same(portal.from, state) ? portal.to : portal.from) } : null;
  }
  function validate(world, terrain) {
    if (!terrain) return;
    if (terrain.version !== "1.8") throw new Error("地形版本必须明确为 1.8。");
    const floor = p => Number.isInteger(p?.x) && Number.isInteger(p?.y) && !["_", " ", "~", "#"].includes(tile(world, p));
    for (const [cell, h] of Object.entries(terrain.heights || {})) {
      const [x, y] = cell.split(",").map(Number);
      if (![0, 1, 2].includes(h) || !floor({ x, y })) throw new Error(`无效高度：${cell}`);
    }
    for (const s of terrain.stairs || []) {
      if (!floor(s.from) || !floor(s.to) || Math.abs(s.from.x - s.to.x) + Math.abs(s.from.y - s.to.y) !== 1
        || Math.abs(height(terrain, s.from) - height(terrain, s.to)) !== 1) throw new Error("台阶必须连接相邻且相差一层的地面。");
    }
    const endpoints = new Set();
    for (const p of terrain.portals || []) {
      for (const point of [p.from, p.to]) {
        if (!floor(point) || endpoints.has(key(point))) throw new Error("传送端点必须在独立的地面格。");
        endpoints.add(key(point));
      }
    }
    const switches = new Set();
    for (const s of terrain.switches || []) {
      if (!floor(s.at) || !s.id || switches.has(s.id)) throw new Error("开关位置或编号无效。");
      switches.add(s.id);
    }
    const gates = new Set();
    for (const g of terrain.gates || []) {
      const validControl = g.kind === "count" ? !g.switchId : switches.has(g.switchId);
      if (!floor(g.at) || !validControl || !g.id || gates.has(g.id)) throw new Error("门必须在地面上，并绑定有效控制规则。");
      gates.add(g.id);
    }
    for (const edge of terrain.oneWays || []) {
      if (!floor(edge.from) || !floor(edge.to)
        || Math.abs(edge.from.x - edge.to.x) + Math.abs(edge.from.y - edge.to.y) !== 1) {
        throw new Error("单向通道必须连接相邻地面格。");
      }
    }
    for (const device of [...(terrain.rotators || []), ...(terrain.conveyors || [])]) {
      if (!floor(device.at)) throw new Error("转向盘和输送格必须放在地面上。");
      if (device.direction && !["N", "E", "S", "W"].includes(device.direction)) throw new Error("输送方向无效。");
    }
    const supplies = new Set();
    for (const supply of terrain.supplies || []) {
      if (!floor(supply.at) || !supply.id || supplies.has(supply.id) || !Number.isFinite(Number(supply.amount)) || Number(supply.amount) < 0) {
        throw new Error("补给站必须在地面上，且编号和补给量有效。");
      }
      supplies.add(supply.id);
    }
  }
  root.CodeQuestWorldRules = { key, height, same, tile, landing, movement, destination, validate };
})(typeof globalThis !== "undefined" ? globalThis : window);
