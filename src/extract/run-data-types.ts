import { Items, TItem } from "../data/item-mapping.ts";

import { DeathMessages } from "../data/death-message.ts";
import { Equipment } from "../data/equipmen-mapping.ts";
import { z } from "https://deno.land/x/zod/mod.ts";

export const VPlayerInfo = z.object({
  name: z.string(),
  bodyName: z.string(),
  killerBodyName: z.string(),
  isDead: z.string().transform((v) => parseInt(v)),
  statSheet: z.object({
    fields: z.record(
      z.string(),
      z.string().transform((v) => parseInt(v))
    ),
  }),
  itemAcquisitionOrder: z.string().transform((v) => {
    const out = [];
    for (const [i, str] of Object.entries(v.split(" "))) {
      const index = parseInt(i);
      const item = Items[str as keyof typeof Items];
      if (!item) continue;
      out.push({ acquisitionOrder: index, item: Object.assign(item, { real_name: str }) as unknown as TItem });
    }
    return out;
  }),
  itemStacks: z.record(
    z.string(),
    z.string().transform((v) => parseInt(v))
  ),
  equipment: z.union([
    z.null().transform(() => "None"),
    z.string().transform((v) => {
      const display_name = Equipment[v as keyof typeof Equipment];
      return display_name;
    }),
  ]),
  finalMessageToken: z.union([
    z.null().transform(() => {
      return { token: "none", message: "-" };
    }),
    z.string().transform((v) => {
      return { token: v, message: DeathMessages[v as keyof typeof DeathMessages] };
    }),
  ]),
  localPlayerIndex: z.string().transform((v) => parseInt(v)),
  userProfileFileName: z.union([z.null(), z.string()]),
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
      PlayerInfo: z.union([z.array(VPlayerInfo), VPlayerInfo.transform((v) => [v])]),
    }),
  }),
});

export type TRunData = z.output<typeof VRunData>;
