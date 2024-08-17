import { TRunData, VRunData } from "./run-data-types.ts";

import { TDetailedFileInfo } from "./read-dir.ts";
import { ensureDir } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { parse as parseXML } from "https://deno.land/x/xml@5.4.13/mod.ts";

export async function readRuns(files: TDetailedFileInfo[], out_dir: string) {
  console.log(`[FILES] Reading...`);
  const ExtractedRuns: Array<{ raw: unknown; transformed: TRunData }> = [];

  for (const file of files) {
    ensureDir(out_dir);

    console.log(`[READING] ${file.name}`);

    let rawData: unknown;
    try {
      rawData = parseXML(await Deno.readTextFile(file.path));
    } catch (_err) {
      console.log(`[ERROR] File Corrupted/Invalid - ${file.name}`);
      continue;
    }

    const runOutputPath = join(out_dir, `${file.name}.json`);
    try {
      console.log(`[WRITING] ${runOutputPath}`);
      await Deno.writeTextFile(runOutputPath, JSON.stringify(rawData));
    } catch (_err) {
      console.log(`[ERROR] Couldn't write file - ${runOutputPath}`);
      continue;
    }

    const res = VRunData.safeParse(rawData);
    if (!res.success) {
      console.log(`[ERROR] Couldn't parse/transform the raw data - ${res.error.message}`);
      continue;
    }

    ExtractedRuns.push({ raw: rawData, transformed: res.data });
    console.log(`[DONE] ${file.name}`);
  }

  console.log(`[FILES] Done`);
  return ExtractedRuns;
}
