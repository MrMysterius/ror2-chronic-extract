# Risk of Rain 2 Runs Chronic Extractor
> Deno CLI tool for extracting the run chronic from Risk of Rain 2 and formatting it into a CSV and JSON files.

> [!NOTE]
> This program can have bugs or not optimal results. So use at your own risk and maybe reports bugs.

## Usage

- Download the latest release from the [download/releases page](https://github.com/MrMysterius/ror2-chronic-extract/releases).
- In order to use it you have to open a command line window and navigate to the folder in which the executable is located.
- Then you can use the following command and arguments.

## Command and Arguments

> [!IMPORTANT]
> If you are on linux you should replace the name of the executable being used!

```shell
./ror2-chronic-extract.exe [sub-command] <options>
```

### Sub Command: extract

```shell
./ror2-chronic-extract.exe extract <options>
```

options:
  - `--install-dir "C:\\Path\\to\\RiskOfRain2"` - The installation directory of Risk of Rain 2 - **THIS IS REQUIRED OR IT WILL NOT BE ABLE TO EXTRACT THE INFORMATION**
  - `--out "PATH\\to\\Output\\Directory` - Used for manually setting an output directory, on default it will fallback to an `out` folder in the current working directory the application is run in.

---

> Side Note for Nerds - Risk of Rain 2 saves all runs as XML files inside a folder of the Installation Directory independent from the actual save files/profiles.
