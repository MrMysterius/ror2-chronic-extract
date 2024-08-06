import { join, normalize } from "https://deno.land/std@0.224.0/path/mod.ts";

import { ARGS } from "../args.ts";
import { checkPaths } from "./checkPaths.ts";
import { ensureDir } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { parse as parseXML } from "https://deno.land/x/xml@5.4.13/mod.ts";

const TEncoder = new TextEncoder();

export async function extract() {
  const directory = normalize(ARGS["install-dir"].toString() || "C:\\Program Files (x86)\\Steamsteamapps\\common\\Risk of Rain 2");
  const run_reports_dir = join(directory, "Risk of Rain 2_Data/RunReports/History");

  if (!(await checkPaths([directory, run_reports_dir]))) {
    console.log(`The installation directory at '${directory}', doesn't exist or subsequent required sub directories.`);
  }

  const files: Array<{ info: Deno.FileInfo; path: string; name: string }> = [];

  for await (const file of Deno.readDir(run_reports_dir)) {
    if (!file.isFile) continue;
    const fPath = join(run_reports_dir, file.name);
    const stat = await Deno.stat(fPath);
    files.push({ info: stat, path: fPath, name: file.name });
  }

  files.sort((a, b) => (b.info.birthtime?.getTime() || 0) - (a.info.birthtime?.getTime() || 0));

  //probably time spend, item rarity, item count, total damage done perhaps as well
  const Runs: {
    guid: string;
    gameModeName: string;
    gameEnding: string;
    seed: string;
    ruleBook: string;
    times: {
      start: number;
      end: number;
      run: number;
    };
    items: {
      name: string;
      count: number;
      rarity: string;
    }[];
    player: {
      name: string;
      character: string;
      stats: {
        totalTimeAlive: number;
        totalKills: number;
        totalMinionKills: number;
        totalDamageDealt: number;
        totalMinionDamageDealt: number;
        totalDamageTaken: number;
        totalHealthHealed: number;
        highestLevel: number;
        totalGoldCollected: number;
        totalDistanceTraveled: number;
        totalItemsCollected: number;
      };
    };
  }[] = [];

  for (const file of files) {
    ensureDir("out");
    console.log(`Reading: ${file.name}`);
    const data = parseXML(await Deno.readTextFile(file.path)) as any;
    console.log(`Writing: out/${file.name}.json`);
    await Deno.writeTextFile(`out/${file.name}.json`, JSON.stringify(data));

    const player = data.RunReport.playerInfos.PlayerInfo[0] || data.RunReport.playerInfos.PlayerInfo;

    const Run = {
      guid: data.RunReport.runGuid,
      gameModeName: data.RunReport.gameModeName,
      gameEnding: data.RunReport.gameEnding,
      seed: data.RunReport.seed,
      ruleBook: data.RunReport.ruleBook,
      times: {
        start: data.RunReport.runStartTimeUtc,
        end: data.RunReport.snapshotTimeUtc,
        run: data.RunReport.snapshotRunTime,
      },
      player: {
        name: player.name,
        character: player.bodyName,
        stats: {
          totalTimeAlive: player.statSheet.fields.totalTimeAlive,
          totalKills: player.statSheet.fields.totalKills,
          totalMinionKills: player.statSheet.fields.totalMinionKills,
          totalDamageDealt: player.statSheet.fields.totalDamageDealt,
          totalMinionDamageDealt: player.statSheet.fields.totalMinionDamageDealt,
          totalDamageTaken: player.statSheet.fields.totalDamageTaken,
          totalHealthHealed: player.statSheet.fields.totalHealthHealed,
          highestLevel: player.statSheet.fields.highestLevel,
          totalGoldCollected: player.statSheet.fields.totalGoldCollected,
          totalDistanceTraveled: player.statSheet.fields.totalDistanceTraveled,
          totalItemsCollected: player.statSheet.fields.totalItemsCollected,
        },
      },
      items:
        (player.itemAcquisitionOrder.split(" ") as string[]).map((a) => {
          return { name: a, count: 0, rarity: "idk" };
        }) || [],
    };

    for (const [name, count] of Object.entries(player.itemStacks)) {
      const index = Run.items.findIndex((i) => i.name == name);
      if (index == -1) continue;
      Run.items[index].count = count as number;
    }

    Runs.push(Run);
  }

  console.log(`Writing: out/runs.json`);
  await Deno.writeTextFile("out/runs.json", JSON.stringify(Runs));

  if (await checkPaths(["out/runs.csv"])) await Deno.remove("out/runs.csv");
  console.log(`Writing: out/runs.csv`);
  const csvFile = await Deno.open("out/runs.csv", { createNew: true, write: true });
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
        };${run.player.stats.totalMinionDamageDealt};${run.player.stats.totalDamageDealt};${run.player.stats.totalHealthHealed};${
          run.player.stats.highestLevel
        };${run.player.stats.totalGoldCollected};${run.player.stats.totalDistanceTraveled};${run.player.stats.totalItemsCollected};${run.items.reduce(
          (p, c) => (p += `${c.name}-${c.count} `),
          ""
        )}\n`
      )
    );
  }

  csvFile.close();
  console.log(`Finished - All out is in '${join(Deno.cwd(), "out")}'`);
}
