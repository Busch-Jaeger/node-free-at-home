import { FreeAtHome } from '.';

const freeAtHome = new FreeAtHome("http://192.168.0.132/fhapi/v1");


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
