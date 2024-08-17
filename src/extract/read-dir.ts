import { join } from "https://deno.land/std@0.224.0/path/mod.ts";

export async function readDir(dir: string) {
  const files: Array<{ info: Deno.FileInfo; path: string; name: string }> = [];

  for await (const file of Deno.readDir(dir)) {
    if (!file.isFile) continue;
    const fPath = join(dir, file.name);
    const stat = await Deno.stat(fPath);
    files.push({ info: stat, path: fPath, name: file.name });
  }

  return files;
}
