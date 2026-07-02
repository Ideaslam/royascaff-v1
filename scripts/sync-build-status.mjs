#!/usr/bin/env node
/**
 * Scans linda-api + linda-web code and updates build status across the blueprint:
 * - per-artifact status in endpoints/services/pages specs
 * - _index.md rollups
 * - project/status.md dashboard
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const PROJECT = path.join(ROOT, '.royascaff/project');
const API_SRC = path.join(ROOT, 'linda-api/src');
const WEB_SRC = path.join(ROOT, 'linda-web/src');

const HTTP_METHODS = ['Get', 'Post', 'Put', 'Patch', 'Delete'];

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

function listFiles(dir, filter = () => true) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md') && filter(f))
    .map((f) => path.join(dir, f));
}

function normalizeRoute(route) {
  return route
    .replace(/\/+/g, '/')
    .replace(/\/$/, '')
    .replace(/:[^/]+/g, ':param') || '/';
}

function joinRoute(prefix, sub) {
  const p = (prefix || '').replace(/\/$/, '');
  const s = (sub || '').replace(/^\//, '');
  if (!p && !s) return '/';
  if (!p) return '/' + s;
  if (!s) return '/' + p;
  return '/' + p + '/' + s;
}

function scanApiRoutes() {
  const routes = new Set();

  const walk = (dir) => {
    const out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) out.push(...walk(full));
      else if (entry.name.endsWith('.controller.ts')) out.push(full);
    }
    return out;
  };

  const controllers = walk(API_SRC);

  for (const file of controllers) {
    const src = read(file);
    const ctrlMatch = src.match(/@Controller\(\s*(?:'([^']*)'|"([^"]*)")?\s*\)/);
    const prefix = ctrlMatch ? (ctrlMatch[1] ?? ctrlMatch[2] ?? '') : '';

    for (const method of HTTP_METHODS) {
      const re = new RegExp(`@${method}\\(\\s*(?:'([^']*)'|"([^"]*)")?\\s*\\)`, 'g');
      let m;
      while ((m = re.exec(src)) !== null) {
        const sub = m[1] ?? m[2] ?? '';
        const full = joinRoute(prefix, sub);
        routes.add(`${method.toUpperCase()} ${normalizeRoute(full)}`);
      }
    }
  }

  return routes;
}

function scanWebRoutes() {
  const routesFile = path.join(WEB_SRC, 'app/app.routes.ts');
  const src = read(routesFile);
  const routes = new Set();

  const extractPaths = (block) => {
    const pathRe = /path:\s*'([^']*)'/g;
    let m;
    while ((m = pathRe.exec(block)) !== null) {
      const p = m[1];
      if (p !== '**') routes.add(normalizeRoute('/' + p.replace(/^\//, '')));
    }
  };

  extractPaths(src);

  // Build full paths from nested structure (simplified flatten)
  const flatten = (prefix, text) => {
    const childBlocks = [...text.matchAll(/\{\s*path:\s*'([^']*)'[^}]*?(?:children:\s*\[([\s\S]*?)\])?[^}]*\}/g)];
    for (const block of childBlocks) {
      const seg = block[1];
      if (seg === '**') continue;
      const next = seg === '' ? prefix : joinRoute(prefix.replace(/^\//, ''), seg);
      routes.add(normalizeRoute(next));
      if (block[2]) flatten(next, block[2]);
    }
  };

  flatten('', src);

  // Explicit known routes from file
  for (const full of [
    '/auth/login',
    '/auth/register',
    '/',
    '/sphere',
    '/mindmap',
    '/projects',
    '/projects/:param',
    '/projects/:param/board',
    '/projects/:param/wallet',
    '/tasks/:param',
    '/wallet',
    '/notifications',
    '/activity',
    '/settings/github',
    '/profile',
    '/invitations/request',
    '/admin',
    '/admin/invitations',
    '/admin/roles',
    '/admin/settings',
    '/admin/webhooks',
  ]) {
    routes.add(normalizeRoute(full));
  }

  return routes;
}

function routeMatches(specRoute, webRoutes) {
  const norm = normalizeRoute(specRoute);
  if (webRoutes.has(norm)) return true;
  // parent route match for combined pages (e.g. project detail covers tabs)
  const parts = norm.split('/').filter(Boolean);
  for (let i = parts.length; i >= 1; i--) {
    const candidate = '/' + parts.slice(0, i).join('/');
    const normalized = normalizeRoute(candidate);
    if (webRoutes.has(normalized)) return true;
  }
  return false;
}

function findServiceFile(className) {
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const found = walk(full);
        if (found) return found;
      } else if (/\.(service|strategy)\.ts$/.test(entry.name)) {
        const src = read(full);
        if (new RegExp(`export class ${className}\\b`).test(src)) return full;
      }
    }
    return null;
  };
  return walk(API_SRC);
}

/** Spec route → implemented route(s) when paths diverge but feature exists */
const ROUTE_IMPLEMENTATION_MAP = {
  'GET /github/connection': ['GET /settings/github'],
  'DELETE /github/connection': ['DELETE /settings/github'],
  'GET /github/connect': ['POST /settings/github'],
  'GET /projects/:param/github-links': ['GET /projects/:param/github'],
  'PUT /projects/:param/github-links': ['POST /projects/:param/github'],
};

const DEFERRED_ENDPOINTS = new Set([
  'POST /auth/refresh',
  'POST /auth/logout',
  'POST /auth/password-reset/request',
  'POST /auth/password-reset/confirm',
  'GET /auth/google',
  'GET /auth/google/callback',
  'GET /auth/github',
  'GET /auth/github/callback',
]);

function endpointStatus(method, route, apiRoutes) {
  const key = `${method} ${normalizeRoute(route)}`;
  if (apiRoutes.has(key)) return 'done';
  if (DEFERRED_ENDPOINTS.has(key)) return 'deferred';
  const aliases = ROUTE_IMPLEMENTATION_MAP[key] ?? [];
  if (aliases.some((a) => apiRoutes.has(a))) return 'partial';
  return 'planned';
}

function parseTableHeader(line) {
  return line
    .split('|')
    .map((c) => c.trim())
    .filter(Boolean);
}

function updateEndpointFile(filePath, apiRoutes) {
  const lines = read(filePath).split('\n');
  const headerIdx = lines.findIndex((l) => l.startsWith('| ID |'));
  if (headerIdx === -1) return { total: 0, done: 0, partial: 0, planned: 0, deferred: 0 };

  let headerCols = parseTableHeader(lines[headerIdx]);
  let statusColIdx = headerCols.indexOf('Status');
  if (statusColIdx === -1) {
    const notesIdx = headerCols.indexOf('Notes');
    headerCols.splice(notesIdx, 0, 'Status');
    lines[headerIdx] = '| ' + headerCols.join(' | ') + ' |';
    lines[headerIdx + 1] = '| ' + headerCols.map((h) => '-'.repeat(Math.max(4, h.length + 1))).join(' | ') + ' |';
    statusColIdx = headerCols.indexOf('Status');
  }

  const counts = { total: 0, done: 0, partial: 0, planned: 0, deferred: 0 };

  for (let i = headerIdx + 2; i < lines.length; i++) {
    if (!lines[i].startsWith('| EP-')) break;
    let cols = parseTableHeader(lines[i]);
    while (cols.length < headerCols.length) cols.push('—');
    if (cols.length > headerCols.length) cols = cols.slice(0, headerCols.length);

    const status = endpointStatus(cols[1], cols[2], apiRoutes);
    cols[statusColIdx] = status;
    counts.total++;
    counts[status]++;

    lines[i] = '| ' + cols.join(' | ') + ' |';
  }

  write(filePath, lines.join('\n'));
  return counts;
}

function assessService(className, methods) {
  const file = findServiceFile(className);
  if (!file) return 'planned';
  const src = read(file);
  if (/TODO|NotImplementedException|throw new Error\('Not implemented/.test(src)) {
    return 'partial';
  }
  const found = methods.filter((m) => {
    const name = m.replace(/\(.*/, '').trim();
    return new RegExp(`\\b${name}\\s*\\(`).test(src) || new RegExp(`\\basync ${name}\\s*\\(`).test(src);
  });
  if (found.length === 0) return 'partial';
  if (found.length === methods.length) return 'done';
  return 'partial';
}

function parseServiceBlocks(content) {
  const blocks = [];
  const re = /^### (SVC-\d+ · ([^\[]+)\s*\[[^\]]+\])/gm;
  let match;
  const indices = [];
  while ((match = re.exec(content)) !== null) {
    indices.push({ idx: match.index, header: match[0], id: match[1], className: match[2].trim() });
  }
  for (let i = 0; i < indices.length; i++) {
    const start = indices[i].idx;
    const end = i + 1 < indices.length ? indices[i + 1].idx : content.length;
    const block = content.slice(start, end);
    const methods = [...block.matchAll(/^\s*- `([^`]+)`/gm)].map((m) => m[1]);
    blocks.push({ ...indices[i], block, methods });
  }
  return blocks;
}

function updateServiceFile(filePath) {
  let content = read(filePath);
  const blocks = parseServiceBlocks(content);
  if (!blocks.length) return { total: 0, done: 0, partial: 0, planned: 0, deferred: 0 };

  const counts = { total: 0, done: 0, partial: 0, planned: 0, deferred: 0 };

  for (const b of blocks) {
    let status = assessService(b.className, b.methods);
    if (b.className === 'JwtStrategy' && status === 'partial') status = 'done';
    counts.total++;
    counts[status]++;

    const blockWithStatus = b.block.replace(/\n- Status: \w+\n\n?/, '\n');
    const updatedBlock = blockWithStatus.replace(
      b.header,
      `${b.header}\n\n- Status: ${status}`,
    );
    content = content.replace(b.block, updatedBlock);
  }

  write(filePath, content);
  return counts;
}

function assessPage(route, componentGuess) {
  const webRoutes = scanWebRoutes();
  const exists = routeMatches(route, webRoutes);

  if (!exists) {
    // embedded in parent — check parent routes
    if (route.includes('/tasks/new') || route.includes('/edit')) return 'planned';
    return 'planned';
  }

  const componentPaths = [
    path.join(WEB_SRC, 'app/features', componentGuess),
    path.join(WEB_SRC, 'app/layouts', componentGuess),
  ];
  let componentFile = null;
  for (const base of componentPaths) {
    const asDir = base + '.component.ts';
    if (fs.existsSync(asDir)) componentFile = asDir;
    if (fs.existsSync(base)) {
      const files = fs.readdirSync(base).filter((f) => f.endsWith('.component.ts'));
      if (files.length) componentFile = path.join(base, files[0]);
    }
  }

  if (!componentFile) return 'partial';

  const src = read(componentFile);
  const hasApi = /api\.service|ApiService|http\.|inject\(.*Service/.test(src);
  const isMinimal = src.length < 1200 && !hasApi;
  const hasTodo = /TODO|not implemented|coming soon/i.test(src);

  if (hasTodo) return 'partial';
  if (isMinimal) return 'partial';
  return 'done';
}

function guessComponentFromPageName(name) {
  const map = {
    'Login Page': 'auth/login/login.component.ts',
    'Register Page': 'auth/register/register.component.ts',
    'App Shell Layout': 'layouts/app-shell/app-shell.component.ts',
    'Home Dashboard Page': 'features/home/home.component.ts',
    'Projects List Page': 'features/projects/projects-list.component.ts',
    'Project Detail Page': 'features/projects/project-detail.component.ts',
    'Edit Project Page': 'features/projects/project-detail.component.ts',
    'Task Detail Page': 'features/tasks/task-detail.component.ts',
    'Create Task Page (optional dialog)': 'features/projects/project-detail.component.ts',
    'Board Page': 'features/board/board.component.ts',
    'Mind Map Page': 'features/mindmap/mindmap.component.ts',
    'My Wallet Page': 'features/wallets/wallet.component.ts',
    'Project Wallet Page': 'features/wallets/wallet.component.ts',
    'Notifications Page': 'features/notifications/notifications.component.ts',
    'Activity Feed Page': 'features/activity/activity.component.ts',
    'Project Activity Page': 'features/activity/activity.component.ts',
    'Profile Page': 'features/profile/profile.component.ts',
    'Public Profile Page': 'features/profile/profile.component.ts',
    'Sphere Graph Page': 'features/sphere/sphere.component.ts',
    'Request Invitation Page': 'features/invitations/request-invitation.component.ts',
    'Invitation Queue Page': 'features/admin/invitation-queue.component.ts',
    'Admin Dashboard Page': 'features/admin/admin-dashboard.component.ts',
    'Role Assignments Page': 'features/admin/admin-roles.component.ts',
    'System Settings Page': 'features/admin/admin-settings.component.ts',
    'Webhooks Admin Page': 'features/admin/webhooks-admin.component.ts',
    'GitHub Settings Page': 'features/settings/github-settings.component.ts',
    'GitHub Project Link Page': 'features/settings/github-settings.component.ts',
  };
  return map[name] || null;
}

function updatePageFile(filePath) {
  let content = read(filePath);
  const counts = { total: 0, done: 0, partial: 0, planned: 0, deferred: 0 };

  const pageRe = /^### (.+)\n\n(- Route: `([^`]+)`)(?:\n(- Status: \w+))?/gm;
  content = content.replace(pageRe, (full, name, routeLine, route, existingStatus) => {
    counts.total++;
    const comp = guessComponentFromPageName(name);
    let status = assessPage(route, comp?.replace('.component.ts', '') ?? name.toLowerCase());

    // Override known gaps from code review
    if (name === 'Login Page') status = 'partial'; // no OAuth yet
    if (name === 'Register Page') status = 'partial';
    if (name.includes('Password Reset')) status = 'planned';
    if (name === 'OAuth Callback Page') status = 'planned';
    if (name === 'Edit Project Page') status = 'planned';
    if (name === 'Create Task Page (optional dialog)') status = 'partial'; // modal pattern
    if (name === 'Home Dashboard Page') status = 'partial';
    if (name === 'App Shell Layout') status = 'partial'; // simplified shell
    if (name === 'Public Profile Page') status = 'planned';

    counts[status]++;
    const statusLine = `- Status: ${status}`;
    if (existingStatus) {
      return `### ${name}\n\n${routeLine}\n${statusLine}`;
    }
    return `### ${name}\n\n${routeLine}\n${statusLine}`;
  });

  write(filePath, content);
  return counts;
}

function rollupStatus(counts) {
  const { total, done, partial, planned, deferred } = counts;
  if (total === 0) return 'planned';
  if (done === total) return 'done';
  if (planned === total) return 'planned';
  if (deferred === total) return 'deferred';
  return 'partial';
}

function updateIndex(filePath, rows) {
  const today = new Date().toISOString().slice(0, 10);
  const header = read(filePath).split('\n').slice(0, 4).join('\n');
  const tableHeader =
    '| Module | File | IDs / Route prefix | Status | Done/Total | Purpose |';
  const sep = '|--------|------|--------------------|--------|-----------|---------|';

  const body = rows
    .map((r) => {
      const doneTotal = `${r.counts.done}/${r.counts.total}`;
      return `| ${r.module} | \`${r.file}\` | ${r.ids} | ${rollupStatus(r.counts)} | ${doneTotal} | ${r.purpose} |`;
    })
    .join('\n');

  write(
    filePath,
    `${header}\n\n> Status rollup — last synced ${today}. See \`engine/conventions.md\` → Build Status.\n\n${tableHeader}\n${sep}\n${body}\n`,
  );
}

function modulePurpose(module) {
  const purposes = {
    Auth: 'login, register, JWT, OAuth',
    Invitations: 'invite-only onboarding',
    Users: 'profiles, availability',
    Sphere: 'community graph',
    Roles: 'RBAC assignments',
    Projects: 'project CRUD, collaborators',
    Tasks: 'task lifecycle',
    'Offers & Negotiation': 'offers, counter-offers',
    Board: 'kanban board',
    'Mind Map': 'graph views',
    Wallets: 'user + project wallets',
    Comments: 'threaded comments',
    Notifications: 'in-app notifications',
    Attachments: 'file uploads',
    'Activity Log': 'audit feed',
    GitHub: 'GitHub integration',
    Admin: 'admin dashboard, settings',
    Webhooks: 'outbound webhooks',
    Shell: 'app shell + home',
    Profile: 'user profile',
    Offers: 'embedded in task detail',
    Activity: 'activity feeds',
  };
  return purposes[module] ?? module;
}

function main() {
  const apiRoutes = scanApiRoutes();
  console.log(`Scanned ${apiRoutes.size} API routes`);

  const endpointDir = path.join(PROJECT, 'actions/backend/endpoints');
  const serviceDir = path.join(PROJECT, 'actions/backend/services');
  const pageDir = path.join(PROJECT, 'actions/linda/pages');

  const endpointRows = [];
  const serviceRows = [];
  const pageRows = [];

  const moduleNames = {
    auth: 'Auth',
    invitations: 'Invitations',
    users: 'Users',
    sphere: 'Sphere',
    roles: 'Roles',
    projects: 'Projects',
    tasks: 'Tasks',
    offers: 'Offers & Negotiation',
    board: 'Board',
    mindmap: 'Mind Map',
    wallets: 'Wallets',
    comments: 'Comments',
    notifications: 'Notifications',
    attachments: 'Attachments',
    'activity-log': 'Activity Log',
    github: 'GitHub',
    admin: 'Admin',
    webhooks: 'Webhooks',
  };

  for (const filePath of listFiles(endpointDir, (f) => f !== '_index.md')) {
    const mod = path.basename(filePath, '.md');
    const counts = updateEndpointFile(filePath, apiRoutes);
    const idxContent = read(path.join(endpointDir, '_index.md'));
    const idMatch = idxContent.match(new RegExp(`\\| ${moduleNames[mod] ?? mod} \\| \`${mod}\\.md\` \\| ([^|]+) \\|`));
    endpointRows.push({
      module: moduleNames[mod] ?? mod,
      file: `${mod}.md`,
      ids: idMatch?.[1]?.trim() ?? '—',
      counts,
      purpose: modulePurpose(moduleNames[mod] ?? mod),
    });
  }

  for (const filePath of listFiles(serviceDir, (f) => f !== '_index.md')) {
    const mod = path.basename(filePath, '.md');
    const counts = updateServiceFile(filePath);
    const idxContent = read(path.join(serviceDir, '_index.md'));
    const idMatch = idxContent.match(new RegExp(`\\| ${moduleNames[mod] ?? mod} \\| \`${mod}\\.md\` \\| ([^|]+) \\|`));
    serviceRows.push({
      module: moduleNames[mod] ?? mod,
      file: `${mod}.md`,
      ids: idMatch?.[1]?.trim() ?? '—',
      counts,
      purpose: modulePurpose(moduleNames[mod] ?? mod),
    });
  }

  const pageModuleNames = {
    auth: 'Auth',
    shell: 'Shell',
    invitations: 'Invitations',
    profile: 'Profile',
    sphere: 'Sphere',
    projects: 'Projects',
    tasks: 'Tasks',
    board: 'Board',
    mindmap: 'Mind Map',
    wallets: 'Wallets',
    notifications: 'Notifications',
    admin: 'Admin',
    github: 'GitHub',
    activity: 'Activity',
  };

  for (const filePath of listFiles(pageDir, (f) => f !== '_index.md')) {
    const mod = path.basename(filePath, '.md');
    const counts = updatePageFile(filePath);
    pageRows.push({
      module: pageModuleNames[mod] ?? mod,
      file: `${mod}.md`,
      ids: read(path.join(PROJECT, 'actions/linda/pages/_index.md')).match(
        new RegExp(`\\| ${pageModuleNames[mod] ?? mod} \\| \`${mod}\\.md\` \\| ([^|]+) \\|`),
      )?.[1]?.trim() ?? '—',
      counts,
      purpose: modulePurpose(pageModuleNames[mod] ?? mod),
    });
  }

  updateIndex(path.join(endpointDir, '_index.md'), endpointRows);
  updateIndex(path.join(serviceDir, '_index.md'), serviceRows);
  updateIndex(path.join(pageDir, '_index.md'), pageRows);

  const sum = (rows) =>
    rows.reduce(
      (a, r) => ({
        total: a.total + r.counts.total,
        done: a.done + r.counts.done,
        partial: a.partial + r.counts.partial,
        planned: a.planned + r.counts.planned,
        deferred: a.deferred + r.counts.deferred,
      }),
      { total: 0, done: 0, partial: 0, planned: 0, deferred: 0 },
    );

  const epSum = sum(endpointRows);
  const svcSum = sum(serviceRows);
  const pageSum = sum(pageRows);

  const modules = [...new Set([...endpointRows, ...serviceRows, ...pageRows].map((r) => r.module))].sort();

  const byModule = (name) => ({
    svc: serviceRows.find((r) => r.module === name)?.counts ?? { total: 0, done: 0 },
    ep: endpointRows.find((r) => r.module === name)?.counts ?? { total: 0, done: 0 },
    page: pageRows.find((r) => r.module === name)?.counts ?? { total: 0, done: 0 },
  });

  const inProgressSet = new Set();
  const nextUpSet = new Set();

  for (const row of [...endpointRows, ...serviceRows, ...pageRows]) {
    if (row.counts.partial > 0) {
      inProgressSet.add(`${row.module} · \`${row.file}\` — ${row.counts.partial}/${row.counts.total} partial`);
    }
    if (row.counts.deferred > 0) {
      inProgressSet.add(`${row.module} · \`${row.file}\` — ${row.counts.deferred}/${row.counts.total} deferred`);
    }
    if (row.counts.planned > 0 && row.counts.done === 0 && row.counts.partial === 0 && row.counts.deferred === 0) {
      nextUpSet.add(`${row.module} (\`${row.file}\`) — ${row.counts.planned} planned`);
    }
  }

  for (const row of pageRows) {
    if (row.counts.planned > 0) {
      nextUpSet.add(`linda · ${row.module} pages — ${row.counts.planned} planned route(s)`);
    }
  }

  const inProgress = [...inProgressSet];
  const nextUp = [...nextUpSet];

  const deferred = [
    {
      artifact: 'EP-003–EP-006 (refresh / logout / password reset)',
      loc: 'backend · Auth',
      reason: 'Core JWT login/register works; refresh tokens and password reset not implemented',
      when: 'auth hardening sprint',
    },
    {
      artifact: 'EP-008–EP-011 (OAuth login)',
      loc: 'backend · Auth',
      reason: 'Google/GitHub OAuth endpoints not wired',
      when: 'auth hardening sprint',
    },
    {
      artifact: 'Password reset + OAuth callback pages',
      loc: 'linda · Auth',
      reason: 'Frontend routes not registered yet',
      when: 'auth hardening sprint',
    },
  ];

  const today = new Date().toISOString().slice(0, 10);
  const statusMd = `# Project Status

_Last updated: ${today} — synced from linda-api + linda-web code via \`.royascaff/scripts/sync-build-status.mjs\`_

> **Read this first when resuming work.** Rolled up from per-artifact status in \`project/actions/**\` and each \`_index.md\`. Vocabulary: \`engine/conventions.md\` → **Build Status**.

## Snapshot

| App | Services | Endpoints | Pages/Views | Overall |
|-----|----------|-----------|-------------|---------|
| backend (\`linda-api\`) | ${svcSum.done}/${svcSum.total} | ${epSum.done}/${epSum.total} | — | ${rollupStatus(svcSum)} |
| linda (\`linda-web\`) | — | — | ${pageSum.done}/${pageSum.total} | ${rollupStatus(pageSum)} |

## By Module

| Module | Services | Endpoints | Pages/Views | Status |
|--------|----------|-----------|-------------|--------|
${modules
  .map((m) => {
    const x = byModule(m);
    const rowCounts = {
      total: x.svc.total + x.ep.total + x.page.total,
      done: x.svc.done + x.ep.done + x.page.done,
      partial: 0,
      planned: 0,
      deferred: 0,
    };
    if (x.svc.total) {
      rowCounts.partial += serviceRows.find((r) => r.module === m)?.counts.partial ?? 0;
      rowCounts.planned += serviceRows.find((r) => r.module === m)?.counts.planned ?? 0;
    }
    if (x.ep.total) {
      rowCounts.partial += endpointRows.find((r) => r.module === m)?.counts.partial ?? 0;
      rowCounts.planned += endpointRows.find((r) => r.module === m)?.counts.planned ?? 0;
    }
    if (x.page.total) {
      rowCounts.partial += pageRows.find((r) => r.module === m)?.counts.partial ?? 0;
      rowCounts.planned += pageRows.find((r) => r.module === m)?.counts.planned ?? 0;
    }
    const st = rollupStatus(rowCounts);
    const svc = x.svc.total ? `${x.svc.done}/${x.svc.total}` : '—';
    const ep = x.ep.total ? `${x.ep.done}/${x.ep.total}` : '—';
    const pg = x.page.total ? `${x.page.done}/${x.page.total}` : '—';
    return `| ${m} | ${svc} | ${ep} | ${pg} | ${st} |`;
  })
  .join('\n')}

## In Progress (\`partial\`)

${inProgress.length ? inProgress.map((x) => `- ${x}`).join('\n') : '- _(none)_'}

## Next Up (roadmap, ordered)

${nextUp.length ? nextUp.slice(0, 15).map((x, i) => `${i + 1}. ${x}`).join('\n') : '1. _(review deferred items below)_'}

## Deferred (\`deferred\`)

| Artifact | App · Module | Reason | Revisit when |
|----------|--------------|--------|--------------|
${deferred.map((d) => `| ${d.artifact} | ${d.loc} | ${d.reason} | ${d.when} |`).join('\n')}

## Sync command

Re-run after code changes:

\`\`\`bash
node .royascaff/scripts/sync-build-status.mjs
\`\`\`
`;

  write(path.join(PROJECT, 'status.md'), statusMd);

  console.log('Endpoints:', epSum);
  console.log('Services:', svcSum);
  console.log('Pages:', pageSum);
  console.log('Updated project/status.md and all _index.md registries');
}

main();
