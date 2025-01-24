import { PairingIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';


export class HouseKeepingChannel extends Channel {
    constructor(channel: ApiVirtualChannel) {
        super(channel);
    }

    setBatteryLevel(value: number): Promise<void> {
        value = Math.min(Math.max(value, 0), 100);
        return this.setDatapoint(PairingIds.AL_BATTERY_STATUS, value.toFixed(0));
    }
}