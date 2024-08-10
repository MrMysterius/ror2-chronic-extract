import { extract } from "./extract/extract.ts";

export function runCommand(command: string) {
  switch (command) {
    case "extract": {
      extract();
      break;
    }
    default: {
      help();
      break;
    }
  }
}

export function help() {
  console.log(`%cRun a command like 'extract'...`, "color: blue");
  console.log(`%cSpecify the directory where Risk of Rain 2 is installed with the argument '--install-dir "C:\\Path\\to\\Installation"`, "color: blue");
  console.log(`%cAlso you can specify the output directory directly with -o "Path/to/Output"`, "color: blue");
}
