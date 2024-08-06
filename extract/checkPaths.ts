import { exists } from "https://deno.land/std@0.224.0/fs/mod.ts";

export async function checkPaths(paths: string[]) {
  for (const path of paths) {
    console.log(`Checking: ${path}`);
    if (await exists(path)) return false;
  }
  return true;
}
