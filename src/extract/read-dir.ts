import { join } from "https://deno.land/std@0.224.0/path/mod.ts";

export async function readDir(dir: string) {
  console.log(`[DIR] Scanning - ${dir}`);
  const files: TDetailedFileInfo[] = [];

  for await (const file of Deno.readDir(dir)) {
    if (!file.isFile) continue;
    const fPath = join(dir, file.name);
    const stat = await Deno.stat(fPath);
    files.push({ info: stat, path: fPath, name: file.name });
  }

  console.log(`[DIR] Scanned - ${dir}`);
  return files;
}

export interface TDetailedFileInfo {
  info: Deno.FileInfo;
  path: string;
  name: string;
}
