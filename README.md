Library for free@home local device api

This api is unstable.

# Install

Npm packages for this project are available [here](https://dev.azure.com/ABB-BHC-BHAS/DEBJE-FreeAtHomeExtensions/_packaging?_a=feed&feed=DEBJE-FreeAtHomeExtensions).

To use this registry, add a .npmrc to the project directory.

```
registry=https://pkgs.dev.azure.com/ABB-BHC-BHAS/DEBJE-FreeAtHomeExtensions/_packaging/DEBJE-FreeAtHomeExtensions/npm/registry/ 
                        
always-auth=true
```

Follow the steps for a npm registry that are documented [here](https://dev.azure.com/ABB-BHC-BHAS/DEBJE-FreeAtHomeExtensions/_packaging?_a=connect&feed=DEBJE-FreeAtHomeExtensions).

To install this packages run:
```
npm install free-at-home
```

# Example

```
import { FreeAtHome } from 'free-at-home';

const freeAtHome = new FreeAtHome("http://{ip of your System Access Point}/fhapi/v1");


async function main() {
    const switchActuatorChannel = await freeAtHome.createSwitchingActuatorDevice("mySerialNumber", "Switching Actuator");

    switchActuatorChannel.setAutoKeepAlive(true);
    switchActuatorChannel.on('isOnChanged', (value: boolean) => {
        switchActuatorChannel.setOn(value);
    })
}


try{
    main();
} catch(error) {
    console.error(error);
}
```

# Prepare for local development

Change prefix to user writeable directory.
```
npm config set prefix ~/.npm
```

Install dependencies
```
npm install
```

Add link to local package
```
cd node-free-at-home
npm link
```

For the package that uses this library:
```
npm link free-at-home
```

Build project
```
npm run build
```