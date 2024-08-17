import { ARGS } from "../args.ts";
import { VRunData } from "./run-data-types.ts";
import { checkPaths } from "../checkPaths.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { z } from "https://deno.land/x/zod/mod.ts";

const Encoder = new TextEncoder();

export async function writeCSVFile(path: string, runs: z.infer<typeof VRunData>[]) {
  console.log(`%cCSV: Writing file... - ${path}`, "color: yellow");
  path = join(path, "runs.csv");

  if (await checkPaths([path])) {
    if (ARGS["--force"] || ARGS["-f"]) {
      await Deno.remove(path);
    } else {
      console.log(`%cCSV: File already exists and won't be overwritten - ${path}`, "color: red");
      console.log(`%cUse -f | --force , if you want to overwrite the existing file.`, "color: red");
      Deno.exit(1);
    }
  }

  const File = await Deno.open(path, { createNew: true, write: true });

  console.log(`%cCSV: Writing header... - ${path}`, "color: yellow");
}

// const csv_path = join(out_dir, "runs.csv");
//   if (await checkPaths([csv_path])) await Deno.remove(csv_path);
//   console.log(`Writing: ${csv_path}`);
//   const csvFile = await Deno.open(csv_path, { createNew: true, write: true });
//   csvFile.write(
//     TEncoder.encode(
//       "guid;gamemode;ending;seed;rulebook;timestart;timeend;timerun;playername;character;totalTimeAlive;totalKills;totalMinionKills;totalDamageDealt;totalMinionDamage;totalDamageTaken;totalHealthHealed;level;totalGoldCollected;totalDistanceTraveled;totalItemsCollected;items\n"
//     )
//   );

//   for (const run of Runs) {
//     csvFile.write(
//       TEncoder.encode(
//         `${run.guid};${run.gameModeName};${run.gameEnding};${run.seed};${run.ruleBook};${run.times.start};${run.times.end};${run.times.run};${
//           run.player.name
//         };${run.player.character};${run.player.stats.totalTimeAlive};${run.player.stats.totalKills};${run.player.stats.totalMinionKills};${
//           run.player.stats.totalDamageDealt
//         };${run.player.stats.totalMinionDamageDealt};${run.player.stats.totalDamageTaken};${run.player.stats.totalHealthHealed};${
//           run.player.stats.highestLevel
//         };${run.player.stats.totalGoldCollected};${run.player.stats.totalDistanceTraveled};${run.player.stats.totalItemsCollected};${run.items.reduce(
//           (p, c) => (p += `${c.name}-${c.count} `),
//           ""
//         )}\n`
//       )
//     );
//   }

//   csvFile.close();
//   console.log(`Finished - All out is in '${out_dir}'`);
// }
