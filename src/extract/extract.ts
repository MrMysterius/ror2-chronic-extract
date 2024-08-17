import { join, normalize } from "https://deno.land/std@0.224.0/path/mod.ts";

import { ARGS } from "../args.ts";
import { checkPaths } from "../checkPaths.ts";
import { ensureDir } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { parse as parseXML } from "https://deno.land/x/xml@5.4.13/mod.ts";
import { readDir } from "./read-dir.ts";
import { readRuns } from "./read-runs.ts";
import { writeCSVFile } from "./write-csv.ts";

const TEncoder = new TextEncoder();

export async function extract() {
  const directory = normalize(ARGS["install-dir"]?.toString() || "C:\\Program Files (x86)\\Steamsteamapps\\common\\Risk of Rain 2");
  const run_reports_dir = join(directory, "Risk of Rain 2_Data/RunReports/History");

  const out_dir = normalize(ARGS["out"]?.toString() || join(Deno.cwd(), "out"));

  if (!(await checkPaths([directory, run_reports_dir]))) {
    console.error(`%cThe installation directory at '${directory}', doesn't exist or subsequent required sub directories.`, "color: red;");
    return;
  }

  const files = await readDir(run_reports_dir);
  files.sort((a, b) => (b.info.birthtime?.getTime() || 0) - (a.info.birthtime?.getTime() || 0));

  const ExtractedRuns = await readRuns(files, out_dir);

  {
    const transformed_runs_outpath = join(out_dir, "runs-transformed-all.json");
    console.log(`[WRITING] ${transformed_runs_outpath}`);
    ensureDir(out_dir);
    await Deno.writeTextFile(transformed_runs_outpath, JSON.stringify(ExtractedRuns.map((v) => v.transformed)));
    console.log(`[DONE] ${transformed_runs_outpath}`);

    const raw_runs_outpath = join(out_dir, "runs-raw-all.json");
    console.log(`[WRITING] ${raw_runs_outpath}`);
    ensureDir(out_dir);
    await Deno.writeTextFile(raw_runs_outpath, JSON.stringify(ExtractedRuns.map((v) => v.raw)));
    console.log(`[DONE] ${raw_runs_outpath}`);
  }

  const csv_path = join(out_dir, "runs.csv");
  writeCSVFile(
    csv_path,
    ExtractedRuns.map((v) => v.transformed)
  );

  console.log(`Finished - All output is in '${out_dir}'`);
}
