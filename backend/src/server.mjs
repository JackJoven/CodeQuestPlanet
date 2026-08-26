import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { ensureSchema, pool, query } from "./db.mjs";
import { hashPassword, verifyPassword } from "./passwords.mjs";
import {
  createSession,
  destroySession,
  getSessionUser,
  makeClearSessionCookie,
  makeSessionCookie
} from "./sessions.mjs";
import { clientIp, normalizeEmail, publicUser, readJson, sendError, sendJson } from "./http-utils.mjs";

const port = Number(process.env.PORT || 3001);
const ownerEmails = new Set(
  String(process.env.OWNER_EMAILS || "")
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter(Boolean)
);
const ownerSetupToken = String(process.env.OWNER_SETUP_TOKEN || "").trim();
const roleRank = {
  learner: 0,
  teacher: 1,
  admin: 2,
  owner: 3
};
const validRoles = new Set(Object.keys(roleRank));

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return typeof password === "string" && password.length >= 8 && password.length <= 128;
}

function configuredRoleForEmail(email) {
  return ownerEmails.has(normalizeEmail(email)) ? "owner" : null;
}

function rowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function canAccess(user, minimumRole) {
  return roleRank[user?.role] >= roleRank[minimumRole];
}

async function applyConfiguredRole(user) {
  if (!user) return null;
  const configuredRole = configuredRoleForEmail(user.email);
  if (!configuredRole || user.role === configuredRole) return user;

  await query("UPDATE users SET role = $1, updated_at = now() WHERE id = $2", [configuredRole, user.id]);
  return { ...user, role: configuredRole };
}

async function currentUser(req) {
  return applyConfiguredRole(await getSessionUser(req));
}

async function requireUser(req, res) {
  const user = await currentUser(req);
  if (!user) {
    sendError(res, 401, "请先登录。", "unauthorized");
    return null;
  }
  return user;
}

async function requireRole(req, res, minimumRole = "admin") {
  const user = await requireUser(req, res);
  if (!user) return null;
  if (!canAccess(user, minimumRole)) {
    sendError(res, 403, "当前账号没有访问权限。", "forbidden");
    return null;
  }
  return user;
}

async function ownerCount() {
  const result = await query("SELECT count(*)::int AS count FROM users WHERE role = 'owner'");
  return Number(result.rows[0]?.count || 0);
}

async function recordLoginEvent(req, { userId = null, email, eventType }) {
  await query(
    `INSERT INTO login_events (id, user_id, email, event_type, ip, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      randomUUID(),
      userId,
      email,
      eventType,
      clientIp(req),
      String(req.headers["user-agent"] || "").slice(0, 500)
    ]
  );
}

async function register(req, res) {
  const body = await readJson(req);
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");
  const displayName = String(body.displayName || body.name || email.split("@")[0] || "学习者").trim().slice(0, 60);

  if (!validateEmail(email)) {
    sendError(res, 400, "请输入有效邮箱。", "invalid_email");
    return;
  }

  if (!validatePassword(password)) {
    sendError(res, 400, "密码至少需要 8 位。", "weak_password");
    return;
  }

  const userId = randomUUID();
  const passwordHash = await hashPassword(password);
  const role = configuredRoleForEmail(email) || "learner";

  try {
    await query(
      `INSERT INTO users (id, email, display_name, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, email, displayName || "学习者", passwordHash, role]
    );
  } catch (error) {
    if (error.code === "23505") {
      await recordLoginEvent(req, { email, eventType: "register_duplicate" });
      sendError(res, 409, "这个邮箱已经注册，可以直接登录。", "email_exists");
      return;
    }
    throw error;
  }

  await recordLoginEvent(req, { userId, email, eventType: "register_success" });
  const session = await createSession(userId);
  sendJson(
    res,
    201,
    {
      user: {
        id: userId,
        email,
        displayName: displayName || "学习者",
        role
      },
      expiresAt: session.expiresAt.toISOString()
    },
    { "Set-Cookie": makeSessionCookie(session.token) }
  );
}

async function login(req, res) {
  const body = await readJson(req);
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");

  if (!validateEmail(email) || !password) {
    sendError(res, 400, "请输入邮箱和密码。", "invalid_credentials");
    return;
  }

  const result = await query(
    `SELECT id, email, display_name, role, password_hash
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email]
  );
  const user = result.rows[0];

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    await recordLoginEvent(req, { email, eventType: "login_failed" });
    sendError(res, 401, "邮箱或密码不正确。", "invalid_credentials");
    return;
  }

  const configuredRole = configuredRoleForEmail(user.email);
  if (configuredRole && user.role !== configuredRole) {
    await query("UPDATE users SET role = $1, updated_at = now() WHERE id = $2", [configuredRole, user.id]);
    user.role = configuredRole;
  }

  await recordLoginEvent(req, { userId: user.id, email, eventType: "login_success" });
  const session = await createSession(user.id);
  sendJson(
    res,
    200,
    {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role
      },
      expiresAt: session.expiresAt.toISOString()
    },
    { "Set-Cookie": makeSessionCookie(session.token) }
  );
}

async function getProgress(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  const result = await query(
    `SELECT course_id, lesson_id, status, progress, updated_at
     FROM lesson_progress
     WHERE user_id = $1
     ORDER BY updated_at DESC`,
    [user.id]
  );

  sendJson(res, 200, { progress: result.rows });
}

async function saveProgress(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  const body = await readJson(req);
  const courseId = String(body.courseId || "signal-runner").trim().slice(0, 80);
  const lessonId = String(body.lessonId || "").trim().slice(0, 120);
  const status = body.status === "completed" ? "completed" : "started";
  const progress = body.progress && typeof body.progress === "object" ? body.progress : {};

  if (!lessonId) {
    sendError(res, 400, "缺少 lessonId。", "missing_lesson_id");
    return;
  }

  const result = await query(
    `INSERT INTO lesson_progress (id, user_id, course_id, lesson_id, status, progress, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, now())
     ON CONFLICT (user_id, course_id, lesson_id)
     DO UPDATE SET status = EXCLUDED.status, progress = EXCLUDED.progress, updated_at = now()
     RETURNING course_id, lesson_id, status, progress, updated_at`,
    [randomUUID(), user.id, courseId, lessonId, status, JSON.stringify(progress)]
  );

  sendJson(res, 200, { progress: result.rows[0] });
}

async function deleteProgress(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  const body = await readJson(req);
  const courseId = String(body.courseId || "signal-runner").trim().slice(0, 80);
  const lessonIds = Array.isArray(body.lessonIds)
    ? body.lessonIds.map((id) => String(id || "").trim()).filter(Boolean).slice(0, 200)
    : [];

  if (!lessonIds.length) {
    sendError(res, 400, "缺少 lessonIds。", "missing_lesson_ids");
    return;
  }

  const result = await query(
    `DELETE FROM lesson_progress
     WHERE user_id = $1
       AND course_id = $2
       AND lesson_id = ANY($3::text[])`,
    [user.id, courseId, lessonIds]
  );

  sendJson(res, 200, { deleted: result.rowCount });
}

async function bootstrapOwner(req, res) {
  if (!ownerSetupToken) {
    sendError(res, 404, "管理员初始化未开启。", "owner_setup_disabled");
    return;
  }

  if ((await ownerCount()) > 0) {
    sendError(res, 409, "管理员账号已经初始化。", "owner_exists");
    return;
  }

  const body = await readJson(req);
  if (String(body.token || "") !== ownerSetupToken) {
    sendError(res, 403, "初始化口令不正确。", "invalid_owner_setup_token");
    return;
  }

  const email = normalizeEmail(body.email);
  const password = String(body.password || "");
  const displayName = String(body.displayName || body.name || email.split("@")[0] || "管理员").trim().slice(0, 60);

  if (!validateEmail(email)) {
    sendError(res, 400, "请输入有效邮箱。", "invalid_email");
    return;
  }

  if (!validatePassword(password)) {
    sendError(res, 400, "密码至少需要 8 位。", "weak_password");
    return;
  }

  const passwordHash = await hashPassword(password);
  const existing = await query("SELECT id FROM users WHERE email = $1 LIMIT 1", [email]);
  const userId = existing.rows[0]?.id || randomUUID();

  if (existing.rows[0]) {
    await query(
      `UPDATE users
       SET display_name = $1, password_hash = $2, role = 'owner', updated_at = now()
       WHERE id = $3`,
      [displayName || "管理员", passwordHash, userId]
    );
  } else {
    await query(
      `INSERT INTO users (id, email, display_name, password_hash, role)
       VALUES ($1, $2, $3, $4, 'owner')`,
      [userId, email, displayName || "管理员", passwordHash]
    );
  }

  await recordLoginEvent(req, { userId, email, eventType: "owner_bootstrap" });
  const session = await createSession(userId);
  sendJson(
    res,
    201,
    {
      user: {
        id: userId,
        email,
        displayName: displayName || "管理员",
        role: "owner"
      },
      expiresAt: session.expiresAt.toISOString()
    },
    { "Set-Cookie": makeSessionCookie(session.token) }
  );
}

async function adminSummary(req, res) {
  const user = await requireRole(req, res, "admin");
  if (!user) return;

  const [users, sessions, progress, recentUsers, recentEvents] = await Promise.all([
    query(`
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE role = 'learner')::int AS learners,
        count(*) FILTER (WHERE role = 'teacher')::int AS teachers,
        count(*) FILTER (WHERE role = 'admin')::int AS admins,
        count(*) FILTER (WHERE role = 'owner')::int AS owners
      FROM users
    `),
    query("SELECT count(*)::int AS active FROM sessions WHERE expires_at > now()"),
    query(`
      SELECT
        count(*)::int AS total_rows,
        count(*) FILTER (WHERE status = 'completed')::int AS completed_rows,
        count(DISTINCT user_id)::int AS users_with_progress
      FROM lesson_progress
    `),
    query(`
      SELECT id, email, display_name, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 8
    `),
    query(`
      SELECT email, event_type, ip, user_agent, created_at
      FROM login_events
      ORDER BY created_at DESC
      LIMIT 12
    `)
  ]);

  sendJson(res, 200, {
    summary: {
      users: users.rows[0],
      activeSessions: Number(sessions.rows[0]?.active || 0),
      progress: progress.rows[0]
    },
    recentUsers: recentUsers.rows.map(rowToUser),
    recentEvents: recentEvents.rows
  });
}

async function adminUsers(req, res) {
  const user = await requireRole(req, res, "admin");
  if (!user) return;

  const result = await query(`
    SELECT
      users.id,
      users.email,
      users.display_name,
      users.role,
      users.created_at,
      users.updated_at,
      count(DISTINCT lesson_progress.id)::int AS progress_count,
      count(DISTINCT lesson_progress.id) FILTER (WHERE lesson_progress.status = 'completed')::int AS completed_count,
      max(lesson_progress.updated_at) AS last_progress_at,
      count(DISTINCT sessions.id) FILTER (WHERE sessions.expires_at > now())::int AS active_sessions
    FROM users
    LEFT JOIN lesson_progress ON lesson_progress.user_id = users.id
    LEFT JOIN sessions ON sessions.user_id = users.id
    GROUP BY users.id
    ORDER BY users.created_at DESC
    LIMIT 200
  `);

  sendJson(res, 200, {
    users: result.rows.map((row) => ({
      ...rowToUser(row),
      progressCount: Number(row.progress_count || 0),
      completedCount: Number(row.completed_count || 0),
      lastProgressAt: row.last_progress_at,
      activeSessions: Number(row.active_sessions || 0)
    }))
  });
}

async function adminProgress(req, res) {
  const user = await requireRole(req, res, "admin");
  if (!user) return;

  const [records, courses] = await Promise.all([
    query(`
      SELECT
        lesson_progress.id,
        lesson_progress.course_id,
        lesson_progress.lesson_id,
        lesson_progress.status,
        lesson_progress.progress,
        lesson_progress.updated_at,
        users.email,
        users.display_name,
        users.role
      FROM lesson_progress
      JOIN users ON users.id = lesson_progress.user_id
      ORDER BY lesson_progress.updated_at DESC
      LIMIT 200
    `),
    query(`
      SELECT
        course_id,
        count(*)::int AS records,
        count(*) FILTER (WHERE status = 'completed')::int AS completed,
        count(DISTINCT user_id)::int AS learners,
        max(updated_at) AS last_progress_at
      FROM lesson_progress
      GROUP BY course_id
      ORDER BY last_progress_at DESC NULLS LAST
      LIMIT 50
    `)
  ]);

  sendJson(res, 200, {
    courses: courses.rows,
    progress: records.rows.map((row) => ({
      id: row.id,
      courseId: row.course_id,
      lessonId: row.lesson_id,
      status: row.status,
      progress: row.progress,
      updatedAt: row.updated_at,
      user: {
        email: row.email,
        displayName: row.display_name,
        role: row.role
      }
    }))
  });
}

async function adminEvents(req, res) {
  const user = await requireRole(req, res, "admin");
  if (!user) return;

  const result = await query(`
    SELECT email, event_type, ip, user_agent, created_at
    FROM login_events
    ORDER BY created_at DESC
    LIMIT 120
  `);

  sendJson(res, 200, { events: result.rows });
}

async function updateUserRole(req, res, userId) {
  const actor = await requireRole(req, res, "owner");
  if (!actor) return;

  const body = await readJson(req);
  const role = String(body.role || "").trim();
  if (!validRoles.has(role)) {
    sendError(res, 400, "角色不正确。", "invalid_role");
    return;
  }

  if (actor.id === userId) {
    sendError(res, 400, "不能修改自己的角色。", "cannot_change_self_role");
    return;
  }

  const target = await query("SELECT id, role FROM users WHERE id = $1 LIMIT 1", [userId]);
  if (!target.rows[0]) {
    sendError(res, 404, "用户不存在。", "user_not_found");
    return;
  }

  if (target.rows[0].role === "owner" && role !== "owner" && (await ownerCount()) <= 1) {
    sendError(res, 400, "至少需要保留一个所有者账号。", "last_owner");
    return;
  }

  const result = await query(
    `UPDATE users
     SET role = $1, updated_at = now()
     WHERE id = $2
     RETURNING id, email, display_name, role, created_at, updated_at`,
    [role, userId]
  );

  sendJson(res, 200, { user: rowToUser(result.rows[0]) });
}

async function route(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const path = url.pathname;

  if (req.method === "GET" && path === "/api/health") {
    sendJson(res, 200, { ok: true, service: "codequestplanet-backend" });
    return;
  }

  if (req.method === "GET" && path === "/api/auth/me") {
    sendJson(res, 200, { user: publicUser(await currentUser(req)) });
    return;
  }

  if (req.method === "POST" && path === "/api/auth/register") {
    await register(req, res);
    return;
  }

  if (req.method === "POST" && path === "/api/auth/login") {
    await login(req, res);
    return;
  }

  if (req.method === "POST" && path === "/api/auth/logout") {
    await destroySession(req);
    sendJson(res, 200, { ok: true }, { "Set-Cookie": makeClearSessionCookie() });
    return;
  }

  if (req.method === "GET" && path === "/api/progress") {
    await getProgress(req, res);
    return;
  }

  if (req.method === "POST" && path === "/api/progress") {
    await saveProgress(req, res);
    return;
  }

  if (req.method === "DELETE" && path === "/api/progress") {
    await deleteProgress(req, res);
    return;
  }

  if (req.method === "POST" && path === "/api/admin/bootstrap") {
    await bootstrapOwner(req, res);
    return;
  }

  if (req.method === "GET" && path === "/api/admin/summary") {
    await adminSummary(req, res);
    return;
  }

  if (req.method === "GET" && path === "/api/admin/users") {
    await adminUsers(req, res);
    return;
  }

  if (req.method === "GET" && path === "/api/admin/progress") {
    await adminProgress(req, res);
    return;
  }

  if (req.method === "GET" && path === "/api/admin/events") {
    await adminEvents(req, res);
    return;
  }

  const roleMatch = path.match(/^\/api\/admin\/users\/([^/]+)\/role$/);
  if (req.method === "PATCH" && roleMatch) {
    await updateUserRole(req, res, roleMatch[1]);
    return;
  }

  sendError(res, 404, "接口不存在。", "not_found");
}

const server = createServer(async (req, res) => {
  try {
    await route(req, res);
  } catch (error) {
    console.error(error);
    sendError(res, error.statusCode || 500, "服务器暂时不可用。", "server_error");
  }
});

await ensureSchema();

server.listen(port, "0.0.0.0", () => {
  console.log(`CodeQuestPlanet API listening on http://0.0.0.0:${port}`);
});

process.on("SIGTERM", async () => {
  server.close();
  await pool.end();
});
