##  Structure of ABB free@home Addons

An Addon is a single `.tar` archive that contains the following files:

- `free-at-home-metadata.json`

  This file contains information about the Addon that will be used by the system access point.
  See the [metadata](metadata) documentation for details.

- TypeScript or JavaScript files that implement the logic of the Addon.

- The `node_modules` directory with all dependencies necessary to run the Addon.

### Metadata

The `free-at-home-metadata.json` file contains information about the Addon that is used by the
system access point. Every Addon must provide this file and has to adjust a few attributes, such as
`id` and `name` of the Addon.

See the [metadata](metadata) documentation for details.

### Building the Addon archive

The Addon archive `.tar` file can be built using the command line tool provided in the ABB free@home
Addon Development Kit (ADK), for example in the example Addon.

Please refer to the [walkthrough](getting-started) for usage details. This tool will
copy all required files and create the final `.tar` file that can be uploaded to the system access
point.
