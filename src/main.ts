import { ARGS } from "./args.ts";
import { runCommand } from "./command.ts";

runCommand(ARGS._[0].toString());
