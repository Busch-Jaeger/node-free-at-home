import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

import { FreeAtHomeApi, PairingIds, VirtualDeviceType } from '.';
import { ParameterIds } from './parameterIds';

interface ChannelEvents {
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class Channel extends (EventEmitter as { new(): ChannelEmitter }) {
    deviceType: VirtualDeviceType;
    serialNumber: string;
    name: string;
    channelNumber: number;
    freeAtHome: FreeAtHomeApi;

    private autoKeepAliveTimer: NodeJS.Timeout | undefined = undefined;

    public isAutoConfirm: boolean = false;

    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, serialNumber: string, name: string, deviceType: VirtualDeviceType) {
        super();
        this.freeAtHome = freeAtHome;
        this.channelNumber = channelNumber;
        this.serialNumber = serialNumber;
        this.name = name;
        this.deviceType = deviceType;
    }

    dataPointChanged(channel: number, id: PairingIds, value: string): void {
        throw new Error("Method not implemented.");
    }

    parameterChanged(id: ParameterIds, value: string): void {
        throw new Error("Method not implemented.");
    }

    public setAutoKeepAlive(value: boolean) {
        if (value == true) {
            if (this.autoKeepAliveTimer === undefined)
                this.autoKeepAliveTimer = setInterval(() => {
                    this.triggerKeepAlive();
                }, 1000 * 120);
        } else {
            if (this.autoKeepAliveTimer !== undefined)
                clearInterval(this.autoKeepAliveTimer);
        }
    }

    protected setDatapoint(datapointId: PairingIds, value: string) {
        const { channelNumber, serialNumber } = this;
        this.freeAtHome.setDatapoint(serialNumber, channelNumber, datapointId, value);
    }

    public setUnresponsive() {
        this.freeAtHome.setDeviceToUnresponsive(this.deviceType, this.serialNumber);
    }

    public triggerKeepAlive() {
        this.freeAtHome.setDeviceToResponsive(this.deviceType, this.serialNumber);
    }
}