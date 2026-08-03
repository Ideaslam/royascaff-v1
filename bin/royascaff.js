#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const PACKAGE_ROOT = path.resolve(__dirname, "..");

function printHelp() {
  console.log(`
royascaff — scaffold the AI-Control engine into your project

Usage:
  royascaff init [targetDir] [options]

Options:
  --force   Overwrite existing royascaff/engine/ or .cursor/skills/ if present
  --git     Run git init inside royascaff/ only (skipped if royascaff/.git exists)
  --help    Show this help

Examples:
  npx royascaff init
  npx royascaff init ./my-app --git
  npx royascaff init --force
`);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const flags = { force: false, git: false, help: false };
  const positional = [];

  for (const arg of args) {
    if (arg === "--force") flags.force = true;
    else if (arg === "--git") flags.git = true;
    else if (arg === "--help" || arg === "-h") flags.help = true;
    else if (arg.startsWith("-")) {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    } else {
      positional.push(arg);
    }
  }

  const command = positional[0];
  const targetDir = positional[1] || ".";

  return { flags, command, targetDir };
}

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function copyDir(src, dest, force) {
  if (exists(dest)) {
    if (!force) {
      throw new Error(
        `Target already exists: ${dest}\nUse --force to overwrite.`
      );
    }
    fs.rmSync(dest, { recursive: true, force: true });
  }

  fs.cpSync(src, dest, { recursive: true });
}

function initGit(royascaffDir) {
  const gitDir = path.join(royascaffDir, ".git");
  if (exists(gitDir)) {
    console.log("  git: skipped (royascaff/ is already a git repository)");
    return;
  }

  execSync("git init", { cwd: royascaffDir, stdio: "inherit" });
  console.log("  git: initialized repository in royascaff/");
}

function init(targetDir, flags) {
  const resolvedTarget = path.resolve(process.cwd(), targetDir);

  if (!exists(resolvedTarget)) {
    fs.mkdirSync(resolvedTarget, { recursive: true });
  }

  const engineSrc = path.join(PACKAGE_ROOT, "engine");
  const skillsSrc = path.join(PACKAGE_ROOT, "skills");
  const royascaffDir = path.join(resolvedTarget, "royascaff");
  const engineDest = path.join(royascaffDir, "engine");
  const skillsDest = path.join(resolvedTarget, ".cursor", "skills");

  console.log(`Scaffolding RoyaScaff into ${resolvedTarget}\n`);

  fs.mkdirSync(path.dirname(engineDest), { recursive: true });
  copyDir(engineSrc, engineDest, flags.force);
  console.log("  copied royascaff/engine/");

  fs.mkdirSync(path.join(resolvedTarget, ".cursor"), { recursive: true });
  copyDir(skillsSrc, skillsDest, flags.force);
  console.log("  copied .cursor/skills/");

  if (flags.git) {
    initGit(royascaffDir);
  }

  console.log(`
Done. Next steps:
  1. Open royascaff/engine/flow.md
  2. Run /initial-build (greenfield) or /reverse-engineer (existing code)
`);
}

function main() {
  const { flags, command, targetDir } = parseArgs(process.argv);

  if (flags.help || !command) {
    printHelp();
    process.exit(command ? 0 : 0);
  }

  if (command !== "init") {
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
  }

  try {
    init(targetDir, flags);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
