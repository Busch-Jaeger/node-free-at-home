import { EventEmitter } from 'events';
import StrictEventEmitter from 'strict-event-emitter-types';
import * as api from "../api";
import { PairingIds } from "../pairingIds";
import { ParameterIds } from '../parameterIds';
import { FreeAtHomeApi, IndexedDatapoint } from '../freeAtHomeApi';
import { ApiVirtualChannel } from './apiVirtualChannel';

interface DeviceEvents {
}

// Typed Event emitter: https://github.com/bterlson/strict-event-emitter-types#usage-with-subclasses
type DeviceEventEmitter = StrictEventEmitter<EventEmitter, DeviceEvents>;

export class ApiVirtualDevice extends (EventEmitter as { new(): DeviceEventEmitter; }) {
    freeAtHomeApi: FreeAtHomeApi;

    nativeId: string;
    serialNumber: string;
    deviceType: api.VirtualDeviceType;

    private channels: Array<ApiVirtualChannel> = new Array();

    constructor(freeAtHomeApi: FreeAtHomeApi, apiDevice: api.Device, serialNumber: string, deviceType: api.VirtualDeviceType) {
        super();
        this.freeAtHomeApi = freeAtHomeApi;
        this.nativeId = apiDevice.nativeId || "";
        this.serialNumber = serialNumber;
        this.deviceType = deviceType;

        let i = 0;
        for (const channelName in apiDevice?.channels) {
            const apiChannel = apiDevice.channels?.[channelName];
            const channel = new ApiVirtualChannel(this, apiChannel, i);
            this.channels.push(channel);
            i++
        }
    }

    onInputDatapointChange(channelIndex: number, data: IndexedDatapoint) {
        const channel = this.channels[channelIndex];
        channel.onInputDatapointChange(data);
    }

    public getChannels() : IterableIterator<ApiVirtualChannel> {
        return this.channels[Symbol.iterator]();
    }

    public async setUnresponsive() : Promise<void> {
        return this.freeAtHomeApi.setDeviceToUnresponsive(this.deviceType, this.nativeId);
    }


    public async triggerKeepAlive() : Promise<void> {
        return this.freeAtHomeApi.setDeviceToResponsive(this.deviceType, this.nativeId);
    }


    public async setOutputDatapoint(channelNumber: number, index: number, value: string) : Promise<void> {
        return this.freeAtHomeApi.setOutputDatapoint(this.serialNumber, channelNumber, index, value);
    }
}
