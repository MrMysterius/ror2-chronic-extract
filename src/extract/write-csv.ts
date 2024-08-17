import { TItemRarity, VItemRarity } from "../data/item-mapping.ts";

import { ARGS } from "../args.ts";
import { VRunData } from "./run-data-types.ts";
import { checkPaths } from "../checkPaths.ts";
import { z } from "https://deno.land/x/zod/mod.ts";

const Encoder = new TextEncoder();

export async function writeCSVFile(path: string, runs: z.infer<typeof VRunData>[]) {
  console.log(`%c[CSV] Writing file... - ${path}`, "color: yellow");

  if (await checkPaths([path])) {
    if (ARGS["--force"] || ARGS["-f"]) {
      await Deno.remove(path);
    } else {
      console.error(`%c[CSV] File already exists and won't be overwritten - ${path}`, "color: red");
      console.error(`%cUse -f | --force , if you want to overwrite the existing file.`, "color: red");
      Deno.exit(1);
    }
  }

  const File = await Deno.open(path, { createNew: true, write: true });

  console.log(`%c[CSV]: Getting headers...`, "color: yellow");

  const headers: Set<string> = new Set();
  for (const run of runs) {
    for (const player of run.RunReport.playerInfos.PlayerInfo) {
      for (const key of Object.keys(player.statSheet.fields)) {
        headers.add(key);
      }
    }
  }

  console.log(`%c[CSV]: Writing header... - ${path}`, "color: yellow");
  const defaultHeaders = [
    "runID",
    "seed",
    "playerName",
    "gameMode",
    "gameEnding",
    "runStartTimeUtc",
    "runEndTimeUtc",
    "runTotalTime",
    "runTimer",
    "ruleBook",
    "characterName",
    "isDead",
    "itemsTotal",
    "itemsTotalNoVoid",
    "itemsTotalNoTier",
    "itemsTotalWhite",
    "itemsTotalGreen",
    "itemsTotalBoss",
    "itemsTotalRed",
    "itemsTotalLunar",
    "itemsTotalVoid",
    "itemsTotalVoidWhite",
    "itemsTotalVoidGreen",
    "itemsTotalVoidBoss",
    "itemsTotalVoidRed",
    "equipment",
    "deathMessageToken",
    "deathMessage",
    "itemAcquisitionOrder",
  ];
  await writeToFile(File, `${defaultHeaders.join(";")};${Array.from(headers.entries()).join(";")}\n`);

  console.log(`%c[CSV]: Writing rows/runs... - ${path}`, "color: yellow");
  for (const run of runs) {
    for (const player of run.RunReport.playerInfos.PlayerInfo) {
      let line = "";
      line += `${run.RunReport.runGuid};`;
      line += `"${run.RunReport.seed}";`;
      line += `${player.name};`;
      line += `${run.RunReport.gameModeName};`;
      line += `${run.RunReport.gameEnding};`;
      line += `"${run.RunReport.runStartTimeUtc}";`;
      line += `"${run.RunReport.snapshotTimeUtc}";`;
      line += `${run.RunReport.snapshotRunTime};`;
      line += `${run.RunReport.runStopwatchValue};`;
      line += `${run.RunReport.ruleBook.join(" ")};`;
      line += `${player.bodyName};`;
      line += `${player.isDead};`;

      const ItemTotals: Map<TItemRarity, number> = new Map();
      for (const rarity of Object.values(VItemRarity.Values)) {
        ItemTotals.set(rarity, 0);
      }
      for (const item of player.itemAcquisitionOrder) {
        ItemTotals.set(item.item.rarity as TItemRarity, (ItemTotals.get(item.item.rarity as TItemRarity) as number) + player.itemStacks[item.item.real_name]);
      }

      line += `${Array.from(ItemTotals.values()).reduce((p, c) => (p += c), 0)};`;
      line += `${Array.from(ItemTotals.entries())
        .filter((v) => !v[0].includes("Void"))
        .reduce((p, c) => (p += c[1]), 0)};`;
      line += `${ItemTotals.get("No Tier")};`;
      line += `${ItemTotals.get("White")};`;
      line += `${ItemTotals.get("Green")};`;
      line += `${ItemTotals.get("Boss")};`;
      line += `${ItemTotals.get("Red")};`;
      line += `${ItemTotals.get("Lunar")};`;
      line += `${Array.from(ItemTotals.entries())
        .filter((v) => v[0].includes("Void"))
        .reduce((p, c) => (p += c[1]), 0)};`;
      line += `${ItemTotals.get("Void White")};`;
      line += `${ItemTotals.get("Void Green")};`;
      line += `${ItemTotals.get("Void Boss")};`;
      line += `${ItemTotals.get("Void Red")};`;
      line += `${player.equipment};`;
      line += `${player.finalMessageToken.token};`;
      line += `${player.finalMessageToken.message};`;
      line += `${player.itemAcquisitionOrder.map((v) => v.item.display_name).join(" ")};`;

      for (const header of headers.values()) {
        line += `${player.statSheet.fields[header]};`;
      }

      await writeToFile(File, line.replace(/\;$/, "\n"));
    }
  }

  console.log(`%c[CSV]: DONE - ${path}`, "color: yellow");
  File.close();
}

async function writeToFile(file: Deno.FsFile, data: string) {
  await file.write(Encoder.encode(data));
}
