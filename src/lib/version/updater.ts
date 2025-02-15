import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export async function checkAppUpdate(): Promise<boolean> {
  const update = await check();
  const hasUpdate = update ? true : false;
  return hasUpdate;
}

export async function updateApp() {
  const update = await check();
  if (update) {
    await update.downloadAndInstall();
  }
}

export async function relaunchApp() {
  await relaunch();
}
