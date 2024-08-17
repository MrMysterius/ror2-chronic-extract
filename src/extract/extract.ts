import { join, normalize } from "https://deno.land/std@0.224.0/path/mod.ts";

import { ARGS } from "../args.ts";
import { checkPaths } from "../checkPaths.ts";
import { ensureDir } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { parse as parseXML } from "https://deno.land/x/xml@5.4.13/mod.ts";
import { readDir } from "./read-dir.ts";
import { readRuns } from "./read-runs.ts";

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

  ensureDir(out_dir);
  let runs_path = join(out_dir, "runs.json");
  console.log(`Writing: ${runs_path}`);
  await Deno.writeTextFile(runs_path, JSON.stringify(Runs));
  ensureDir(out_dir);
  runs_path = join(out_dir, "runs-all.json");
  console.log(`Writing: ${runs_path}`);
  await Deno.writeTextFile(runs_path, JSON.stringify(RawRuns));

  const csv_path = join(out_dir, "runs.csv");
  if (await checkPaths([csv_path])) await Deno.remove(csv_path);
  console.log(`Writing: ${csv_path}`);
  const csvFile = await Deno.open(csv_path, { createNew: true, write: true });
  csvFile.write(
    TEncoder.encode(
      "guid;gamemode;ending;seed;rulebook;timestart;timeend;timerun;playername;character;totalTimeAlive;totalKills;totalMinionKills;totalDamageDealt;totalMinionDamage;totalDamageTaken;totalHealthHealed;level;totalGoldCollected;totalDistanceTraveled;totalItemsCollected;items\n"
    )
  );

  for (const run of Runs) {
    csvFile.write(
      TEncoder.encode(
        `${run.guid};${run.gameModeName};${run.gameEnding};${run.seed};${run.ruleBook};${run.times.start};${run.times.end};${run.times.run};${
          run.player.name
        };${run.player.character};${run.player.stats.totalTimeAlive};${run.player.stats.totalKills};${run.player.stats.totalMinionKills};${
          run.player.stats.totalDamageDealt
        };${run.player.stats.totalMinionDamageDealt};${run.player.stats.totalDamageTaken};${run.player.stats.totalHealthHealed};${
          run.player.stats.highestLevel
        };${run.player.stats.totalGoldCollected};${run.player.stats.totalDistanceTraveled};${run.player.stats.totalItemsCollected};${run.items.reduce(
          (p, c) => (p += `${c.name}-${c.count} `),
          ""
        )}\n`
      )
    );
  }

  csvFile.close();
  console.log(`Finished - All out is in '${out_dir}'`);
}
