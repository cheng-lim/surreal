import { invoke } from "@tauri-apps/api/core";

export async function getVersion(): Promise<string> {
  const version: string = await invoke("get_version");
  return version;
}
