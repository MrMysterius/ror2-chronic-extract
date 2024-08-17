import { Items, TItem } from "./item-mapping.ts";

import { Equipment } from "./equipmen-mapping.ts";
import { z } from "https://deno.land/x/zod/mod.ts";

export const VPlayerInfo = z.object({
  name: z.number(),
  bodyName: z.string(),
  killerBodyName: z.string(),
  isDead: z.string().transform((v) => parseInt(v)),
  statSheet: z.object({
    fields: z.record(
      z.string(),
      z.string().transform((v) => parseInt(v))
    ),
    itemAcquisitionOrder: z.string().transform((v) => {
      const out = [];
      for (const [i, str] of Object.entries(v.split(" "))) {
        const index = parseInt(i);
        const item = Items[str as keyof typeof Items];
        if (!item) continue;
        out.push({ acquisitionOrder: index, item: item as unknown as TItem });
      }
      return out;
    }),
    itemStacks: z.record(
      z.string(),
      z.string().transform((v) => parseInt(v))
    ),
    equipment: z.string().transform((v) => {
      const display_name = Equipment[v as keyof typeof Equipment];
      return display_name;
    }),
    finalMessageToken: z.string(), //TODO Implement Mapping for additional info https://riskofrain2.fandom.com/wiki/Death_Messages
    localPlayerIndex: z.string().transform((v) => parseInt(v)),
    userProfileFileName: z.string(),
  }),
});

export const VRunData = z.object({
  RunReport: z.object({
    version: z.string().transform((v) => parseInt(v)),
    runGuid: z.string(),
    gameModeName: z.string(),
    gameEnding: z.string(),
    seed: z.string(),
    runStartTimeUtc: z.string(),
    snapshotTimeUtc: z.string(),
    snapshotRunTime: z.string().transform((v) => parseInt(v)),
    runStopwatchValue: z.string().transform((v) => parseInt(v)),
    ruleBook: z.string().transform((v) => v.split(" ")),
    playerInfos: z.object({
      PlayerInfo: z.union([z.array(VPlayerInfo), VPlayerInfo]),
    }),
  }),
});
