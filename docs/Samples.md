## Samples for Common Use-Cases in ABB free@home Addons

------------------------------------------------------------------------

### Configuration of target System Access Point for development

The finished ABB free@home Addon will run on the free@home System Access Point, but during
development it is often convenient to run it on a local development machine, for example to enable
support for debuggers. The js library in the ABB free@home Addon Development Kit (ADK) can be
configured to run locally and connect to a remote System Access Point to manage the devices.

To do this, configure your development machine to set environment variables that point to your
System Access Point. Instead of sending relevant commands (such as "create device", "switch light",
etc.) to the local system, the Addon will then send them to that System Access Point instead:

Windows
```shell
$env:FREEATHOME_BASE_URL = 'http://[IP of System Access Point]'
$env:FREEATHOME_API_USERNAME = '[Username shown for local API in the free@home NEXT app]'
$env:FREEATHOME_API_PASSWORD = '[Password shown for local API in the free@home NEXT app]'
```

Linux / Unix
```bash
export FREEATHOME_BASE_URL=http://[IP of System Access Point]
export FREEATHOME_API_USERNAME=[Username shown for local API in the free@home NEXT app]
export FREEATHOME_API_PASSWORD=[Password shown for local API in the free@home NEXT app]
```

### Debug an ABB free@home Addon in a NodeJS IDE

The following Visual Studio Code configuration file (`.vscode/launch.json`) can be used to allow debugging
of a ABB free@home Addon that runs on a local development system. Replace the values for
`FREEATHOME_BASE_URL`, `FREEATHOME_API_USERNAME` and
`FREEATHOME_API_PASSWORD` to match your setup:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "pwa-node",
            "request": "launch",
            "name": "Launch Program",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "program": "${workspaceFolder}/build/main.js",
            "args": [
            ],
            "env": {
                "FREEATHOME_BASE_URL":"http://192.168.42.90",
                "FREEATHOME_API_USERNAME": "installer",
                "FREEATHOME_API_PASSWORD": "12345"
            },
            "outFiles": [
                "${workspaceFolder}/**/*.js"
            ],
            "preLaunchTask": "tsc: build - tsconfig.json",
        }
    ]
}
```


### Attachment of virtual devices via the local API

The [free@home local API](https://developer.eu.mybuildings.abb.com/fah_local/) allows to create
virtual devices using REST calls to the System Access Point. The use of the free@home JavaScript
library that is provided by the Addon Development Kit (ADK) provides functionality to simplify this.
In addition, the library also helps to handle events on the device and to concentrate on the
implementation of the business logic.

Quality of life features are:
- automatic handling of keep alive calls for virtual devices
- automatic reflection of input datapoints to matching output datapoints. This can be used to simplify the implementation.

```javascript
import { FreeAtHome } from 'free-at-home';

const freeAtHome = new FreeAtHome();

const virtualSwitch = await freeAtHome.createSwitchingActuatorDevice("123switch", "Virtual Switch");
virtualSwitch.setAutoKeepAlive(true);
virtualSwitch.isAutoConfirm = true; // reflects inputs to output Datapoints
virtualSwitch.on('isOnChanged', (value: boolean) => {
  console.log("switch state is:", (value) ? "on" : "off");
});
```

### Use of the parameters for the configuration of ABB free@home Addons

To allow the end-user of an Addon to modify the behavior of an Addon without modification of the
Addon itself, the ABB free@home Addons provide parameters that can be configured in the free@home
next App (once the Addon is installed). For this, the Addon must configure the available parameters
in the `free-at-home-metadata.json` and use the parameters in the JavaScript implementation.

An excerpt from `free-at-home-metadata.json`:

```json
    "parameters": {
        "default": {
            "name": "Settings",
            "items": {
                "username": {
                    "name": "Username",
                    "type": "string"
                },
                "ignoreReachability": {
                    "name": "Ignore reachability",
                    "type": "boolean"
                },
                "port": {
                    "name": "Port",
                    "type": "number",
                    "min": 1024,
                    "max": 65535,
                    "value": "9672"
                }
            }
        }
    }
```

Usage in JavaScript, simple variant:

```javascript
import {ScriptingHost as Addons} from 'free-at-home';

const metaData = Addons.readMetaData();

const addons = new Addons.ScriptingHost(metaData.id);

addons.on("configurationChanged", (configuration: API.Configuration) => {
  console.log(configuration);
});

addons.connectToConfiguration();
```

Alternatively, an extended variant with typed configuration:

```javascript
import {ScriptingHost as Addons} from 'free-at-home';
import {ScriptingAPI as API} from 'free-at-home'

export interface ConfigurationProperties extends API.Configuration {
    default: {
        items: {
            username: string,
            ignoreReachability: boolean,
            port: number,
        }
    },
};

const metaData = Addons.readMetaData();

const addons = new Addons.ScriptingHost<ConfigurationProperties>(metaData.id);

addons.on("configurationChanged", (configuration: ConfigurationProperties) => {
  console.log(configuration);
});

addons.connectToConfiguration();
```

See also the section on configuration parameters in the [Writing ABB free@home Addons]( Writing-addons) documentation for more information.

### Automatic logout of virtual devices on completion of an ABB free@home Addon

When an ABB free@home Addon terminates, all virtual devices created by that addon should be
unregistered as unresponsive from the system access point.
This can be achieved by calling the method `markAllDevicesAsUnresponsive()` in the class `FreeAtHome`.

```javascript
import { FreeAtHome } from 'free-at-home';

const freeAtHome = new FreeAtHome();

if (process.platform === "win32") {
  var rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on("SIGINT", function () {
    process.emit("SIGINT" as any);
  });
}

process.on('SIGINT', async () => {
  console.log("SIGINT received, cleaning up...")
  await freeAtHome.markAllDevicesAsUnresponsive();
  console.log("clean up finished, exiting procces")
  process.exit();
});
process.on('SIGTERM', async () => {
  console.log("SIGTERM received, cleaning up...")
  await freeAtHome.markAllDevicesAsUnresponsive();
  console.log("clean up finished, exiting procces")
  process.exit();
});
```
