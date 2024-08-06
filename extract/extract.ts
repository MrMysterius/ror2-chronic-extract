import { join, normalize } from "https://deno.land/std@0.224.0/path/mod.ts";

import { ARGS } from "../args.ts";
import { checkPaths } from "./checkPaths.ts";

export async function extract() {
  const directory = normalize(ARGS["install-dir"].toString() || "C:\\Program Files (x86)\\Steamsteamapps\\common\\Risk of Rain 2");

  if (!(await checkPaths([directory, join(directory, "Risk of Rain 2_Data/RunReports/History")]))) {
    console.log(`The installation directory at '${directory}', doesn't exist or subsequent required sub directories.`);
  }
}
