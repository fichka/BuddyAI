import { spawnSync } from "node:child_process";

const env = { ...process.env };
delete env.NO_COLOR;
delete env.FORCE_COLOR;

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(command, ["expo", "export", "--platform", "web"], {
  env,
  shell: process.platform === "win32",
  stdio: "inherit"
});

if (result.error) {
  console.error(result.error.message);
}

process.exit(result.status ?? 1);
