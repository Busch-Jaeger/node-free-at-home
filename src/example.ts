import {
    FreeAtHome,
    FreeAtHomeOnOffChannel
} from '.';

const freeAtHome = new FreeAtHome("http://192.168.0.132/fhapi/v1");

class SwitchActuator {
    onOffChannel: FreeAtHomeOnOffChannel;

    constructor(onOffChannel: FreeAtHomeOnOffChannel) {
        this.onOffChannel = onOffChannel;
        this.onOffChannel.isAutoConfirm = false;
        this.onOffChannel.on("isOnChanged", this.onIsOnChanged.bind(this));
    }

    private onIsOnChanged(value: boolean): void {
        console.log((value) ? "on" : "off");
        this.onOffChannel.setOn(value)
    }
}

const switchActuator = new SwitchActuator(freeAtHome.createOnOffDevice("444555888", "test22"));
