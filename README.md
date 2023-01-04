Library for free@home local device api

This api is unstable.

# Install

Npm packages for this project are available [here](https://www.npmjs.com/package/@busch-jaeger/free-at-home).

To install this packages run:
```bash
npm install @busch-jaeger/free-at-home
```

# Documentation

The Documentation of this project is available [here](https://busch-jaeger.github.io/free-at-home-addon-development-kit-documentation-preview).

# Example

```typescript
import { FreeAtHome } from '@busch-jaeger/free-at-home';

const freeAtHome = new FreeAtHome();
freeAtHome.activateSignalHandling();

async function main() {
  const virtualSwitch = await freeAtHome.createSwitchingActuatorDevice("123switch", "Virtual Switch");
  virtualSwitch.setAutoKeepAlive(true);
  virtualSwitch.setAutoConfirm(true);
  virtualSwitch.on('isOnChanged', (value) => {
    console.log("switch state is:", (value) ? "on" : "off");
  });
}

main();
```
