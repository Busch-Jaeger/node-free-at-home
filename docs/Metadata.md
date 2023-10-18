## ABB free@home Addon Metadata

Every ABB free@home Addon contains one special file `free-at-home-metadata.json`, which describes the
Addon itself. When a new Addon is added to the system access point, it will look at this file to
determine how to handle the Addon and what should be displayed to the end-user in the UI of the
free@home next app (and similarly, the Web interface of the system access point).

### Metadata attributes

The `free-at-home-metadata.json` file contains a JSON object with the following entries.
Note that the attributes marked as `required` **must** be present for every Addon, while the
attributes marked as `optional` can be omitted, if it provides no benefit for the given Addon.

- `id` (required)

  A unique identifier for an Addon. The developer must chose an id such that it does not conflict
  with any other Addon that the user may want to install. The value uses a typical reversed domain
  name, e.g. an Addon `example1` written by Busch-Jaeger would use
  ```
  de.busch-jaeger.freeathome.example1
  ```
  Typically you would use your own company name here, or real-name if no company name is available.
  Note that it is preferred to use an actual domain name (in reverse notation), but not a
  requirement, i.e. the domain name does not have to actually exist.

- `name` (required, can be localized)

  A human readable name of the Addon.

  This name is shown in the free@home next app and in the System Access Point Web interface. The name is displayed
  in the list of installed Addons - it should be relatively short, so that the end-user can
  recognize each Addon immediately.

  This attribute can be localized. Instead of a simple string, you can use a JSON object, providing
  a different value for each language (though the "en" language always must be present and is used
  as a fallback). For example:

  ```json
  {
    "name": "Sample Addon"
  }
  ```

  localized:

  ```json
  {
    "name": {
      "en": "Sample Addon",
      "de": "Beispiel Addon"
    }
  }
  ```

  The full list of valid language codes for a given System Access Point version can be obtained from the swagger
  documentation on `http://<IP of System Access Point>/swagger` in the `/rest/ref/{reference}` call of the Add-on
  API.

- `description` (required, can be localized)

  A human readable description of the ABB free@home Addon. This is similar to the name, but allows
  for a longer text. It is display in the free@home next app and in the System Access Point web interface when
  the user clicks
  on the ABB free@home Addon.

  Similar to the `name`, the description can be localized. See the documentation of `name` for
  details.

- `version` (required)

  The version of this Addon. This is displayed in the free@home next app and in the
  System Access Point Web interface.

- `entryPoint` (required)

  This should normally be set to `build/main.js` and is the
  relative path from the root of the archive to the main JavaScript file.
  This file is executed by Node.js.

- `license` (required)

  What license your Addon should be published under.

- `type` (required)

  Can be one of "app", "runtime" and "standalone". For Addons, always set this to "app".

- `author` (required)

  The name of the author of this Addon.

- `url` (required)

  If there is a website where the user can find additional information about your Addon, you can
  add the link here.

- `minSysapVersion` (optional, since System Access Point version 3.1.0)

  The minimum version of the system access point required by this Addon, for example "3.1.0". A
  System Access Point that prior to version 3.1.0 will ignore this.

- `parameters` (optional)

  This attribute can contain a JSON object containing additional parameters of your Addon.
  The end-user of the Addon can set the values of the parameters listed here to custom values, this
  can be used to configure the Addon for a specific user. One possible example use for this is
  address, username and password of an external device that should be controlled by the Addon.

  See the dedicated [parameters](Metadata#abb-freehome-addon-parameters) section below for details.

- `wizards` (optional)

  This attribute can contain a JSON object that define wizards that help the user to configure the parameters.

  See the dedicated [wizards](Metadata#abb-freehome-addon-wizards) section below for details.

A sample metadata JSON file looks like this:

```json
{
    "name": "Example for ABB free@home Addons",
    "version": "1.0.0",
    "id": "de.busch-jaeger.freeathome.example",
    "license": "MIT",
    "description": "Example for ABB free@home Addons",
    "url": "http://busch-jaeger.de",
    "author": "Busch Jaeger",
    "type": "app",
    "entryPoint": "build/main.js"
}
```

### ABB free@home Addon parameters

Some Addons will be able to run out of the box without any parameters. In those cases, the
parameters attribute in the metadata file is not needed at all.

However in many cases, the Addon needs to be adjusted to the environment of the end-user, or the
Addon may want to allow the user to configure some aspects of the Addon. This is what parameters are
used for.

A common use-case would be an Addon that adds an external device to the free@home system. Imagine an
external device, for example a smart switch, that offers a REST interface to send commands to this
device. The Addon can be written such that the "switch off" or "switch on" REST command is sent
whenever the end-user clicks the corresponding command in the free@home app. However this is only
possible when the Addon knows some data that is only available to the end-user, such as:

- The IP address (and possibly the port) of the device in the local network of the end-user
- The username and password (or similar data) of the REST interface, if the device requires
  authentication

To do this, the Addon can add these as parameters in the `free-at-home-metadata.json` and let the
user configure them after installing the Addon:

```json
{
    ...
    "parameters": {
        "default": {
            "name": "Settings",
            "items": {
                "address": {
                    "name": "Address",
                    "type": "ipv4"
                },
                "port": {
                    "name": "Port",
                    "type": "number",
                    "min": 1024,
                    "max": 65535
                },
                "username": {
                    "name": "Username",
                    "type": "string"
                },
                "password": {
                    "name": "Password",
                    "type": "password"
                }
            }
        }
    }
}
```

With this file, the free@home next App and the System Access Point web interface will display `Address`, `Port`,
`Username` and `Password` fields in the settings of the Addon and let the end-user configure them.

![Screenshot of parameters in the app](img/metadata/parameters.png)

All parameters can show additional information to explain what the user can configure with it by adding an optional `description`, e.g.

```json
"address": {
    "name": "Address",
    "description": "Enter the IP address of the server.",
    "type": "ipv4"
}
```

#### Translatable attributes

Some attributes inside the parameter definition can be defined for multiple languages. Those are `name` and `description`. Example:

```json
"address": {
    "name": "Address",
    "name@de": "Adresse",
    "description": "Enter the IP address of the server.",
    "description@de": "Geben Sie die IP-Adresse des Servers ein.",
    "type": "ipv4"
}
```

#### Types

What type of input field is displayed to the user, depends on the `type` attribute and depending on the `type`, possibly additional data (most notably `min` and `max`, specifying the range and `default` for the default value to use). The `name` is what is displayed to the user for this parameter.


Possible types are:

##### Editable types

- `number`

  This type has additional `min` and `max` fields, specifying the range of valid values.

- `string`

  The user can enter a normal string here.

- `multilinestring`

  The user can enter a string with multiple lines here.

- `password`

  Similar to `string`, but will be displayed as password instead, i.e. the text is not visible in clear text when displayed to the user.

- `boolean`

  This will display a checkbox that can either be checked or unchecked.

- `ipv4`

  This type allows the user to enter an IPv4 address.

- `date`

  The user can enter a date here.

- `time`

  Shows a time field where the user can enter a time value in format `HH:MM`

- `weekdays`

  The user can select weekdays here. The result value is a string with a concatenated list of weekday numbers (1 = Monday to 7 = Sunday), e.g. a selection
  of Tuesday, Thursday and Saturday would result in a value of "246".

- `select`

  Shows a list of values to select one. The list of selections has to be added as `options`:

  ```json
  "meterType": {
      "name": "Type",
      "type": "select",
      "options": [
          {"key": "main-meter", "name": "Main meter"},
          {"key": "sub-meter", "name": "Consumer meter"},
          {"key": "inverter", "name": "Inverter"},
          {"key": "battery", "name": "Battery"}
      ]
  }
  ```

  The `name` attribute in the options is also translatable:

  ```json
  {"key": "main-meter", "name": "Main meter", "name@de": "Hauptzähler"},
  ```

- `floor`

  Shows a list of floors to select one.

- `room`

  Shows a list of rooms to select one.

- `channel`

  Shows a list of free@home channels to select one.

- `scanQRCode`

  Shows a text-field where you can enter a code manually or scan it from
  an QR-Code.

- `jsonSelector`

  Allows the user to select a value from a complex json object. Example:

  ```json
  "power": {
      "name": "Power",
      "type": "jsonSelector",
      "json": {
        "ENERGY": {
          "Power": 10,
          "EnergyTotal": 678,
          "EnergyToday": 5
        }
      }
  }
  ```

  If the user selects the `Power` entry, the stored value would be the path to that value: `Energy.Power`.

##### Read-only types

- `text`

  The specified text is displayed to the user.

- `error`

  Like `text` but the content is displayed with red color.

- `separator`

  Shows a horizontal line. Can be used to separate a some parameters from others. If you add a `name` it is shown as a title for this groups, if you add a `description` it is shown as text below the title.

- `displayQRCode`

  Shows the value as QR-Code.

#### Additional parameter attributes

Beside the already explained `name`, `type` and `description` attributes there are some special attributes that can be optionally added to a parameter definition:

- `required`

  If this is added with a `true` value this parameter value is required. The user can not save the settings unless this parameter has a value.

- `default`

  Specifies a default value for this parameter.

- `event`

  The value of this parameter is not saved in the settings but send as an event when the user clicks on the send button that is show underneath this parameter.

- `dependsOn`

  Allows to define that a parameter is only shown, when another parameter has a specific value. Also requires the additional `dependsOnValues` attribute. Example:

  ```json
  "connectionType": {
      "name": "Connection",
      "type": "select",
      "required": true,
      "options": [{"key": "USB"}, {"key": "MQTT"}],
  },
  "mqttType": {
      "name": "MQTT type",
      "type": "select",
      "options": [
        {"key": "generic", "name": "Generic"}, 
        {"key": "tasmota", "name": "tasmota"}
      ],
      "dependsOn": "connectionType",
      "dependsOnValues": ["MQTT"]
  }
  ```

  In this example the `mqttType` parameter is only shown when the `connectionType` parameter has the value `MQTT`. `dependsOnValues` is an array of possible values to check.

  The `dependsOn` attribute has another special usage only for parameters of the `select`-type. You can change the list of `options` depending on another parameters value. Example:

  ```json
  "meterType": {
        "name": "Type",
        "type": "select",
        "required": true,
        "options": [
            {"key": "main-meter", "name": "Main meter"},
            {"key": "sub-meter", "name": "Consumer meter"},
            {"key": "inverter", "name": "Inverter"},
            {"key": "battery", "name": "Battery"},
            {"key": "gas-meter", "name": "Gas meter"},
            {"key": "water-meter", "name": "Water meter"}
        ]
    },
    "connectionType": {
        "name": "Connection",
        "type": "select",
        "required": true,
        "options": [{"key": "USB"}, {"key": "MQTT"}],
        "dependsOn": "meterType",
        "dependsOnOptions": [
              {
                "values": ["gas-meter", "water-meter"], 
                "options": [{"key": "MQTT"}]
              }
        ]
    }
    ```

    In this example the `connectionType` shows the options `"options": [{"key": "MQTT"}]` when `meterType` has the value `gas-meter` or `water-meter`.


- `debug`

  If this is added with a `true` value this parameter is only shown, when the app is in debug mode.


#### Parameter groups

If an Addon provides many parameters, grouping them may be useful.
In the `free-at-home-metadata.json`, each parameter must be in a group - in the example above, there
is only one group, named `default` and the name of the group displayed to the user is `Settings`.

Normally you can simply keep this structure. However if needed, you can add additional groups, for
example to configure authentication parameters in a `Authentication Settings` group and advanced
settings that the user will normally not changed in an `Advanced Settings` group:

```json
{
    ...
    "parameters": {
        "authentication": {
            "name": "Authentication Settings",
            "items": {
                "username": {
                    "name": "Username",
                    "type": "string"
                },
                "password": {
                    "name": "Password",
                    "type": "password"
                }
            }
        },
        "advanced": {
            "name": "Advanced Settings",
            "items": {
                "pollinginterval": {
                    "name": "Polling interval (seconds)",
                    "type": "number",
                    "min": "2",
                    "max": "2000",
                    "value": "10"
                }
            }
        }
    }
}
```

#### Using parameters in an ABB free@home Addon

When parameters are defined in the metadata file, they can be accessed from the TypeScript code in
the Addon. The configured value will show up in the `Configuration`of the Addon, the
`configurationChanged` event of the `ScriptingHost` class will provide the current configuration.

Please see the [writing Addons section](Writing-addons) for more information about using
the configuration parameters in the Addon.

### ABB free@home Addon wizards

> **NOTE:** Requires free@home app version >= 2.4.0

For complex parameter settings you have to option to divide the
configuration into separate consecutive steps by using a wizard.
A wizard can create and/or edit a parameter group.
