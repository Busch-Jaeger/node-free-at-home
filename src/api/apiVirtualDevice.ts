import { EventEmitter } from 'events';
import StrictEventEmitter from 'strict-event-emitter-types';
import * as api from "../api";
import { PairingIds } from "../pairingIds";
import { ParameterIds } from '../parameterIds';
import { FreeAtHomeApi, IndexedDatapoint, Datapoint } from '../freeAtHomeApi';
import { ApiVirtualChannel } from './apiVirtualChannel';
import { Capabilities } from '../capabilities';
import { channel } from 'diagnostics_channel';

interface DeviceEvents {
    parameterChanged(id: ParameterIds, value: string): void
}

// Typed Event emitter: https://github.com/bterlson/strict-event-emitter-types#usage-with-subclasses
type DeviceEventEmitter = StrictEventEmitter<EventEmitter, DeviceEvents>;

export class ApiVirtualDevice extends (EventEmitter as { new(): DeviceEventEmitter; }) {
    freeAtHomeApi: FreeAtHomeApi;

    nativeId: string;
    serialNumber: string;
    deviceType: api.VirtualDeviceType;
    flavor?: string;
    capabilities?: Capabilities[];
    parameters: Map<ParameterIds, string>;

    private channels: Map<number, ApiVirtualChannel> = new Map();

    constructor(freeAtHomeApi: FreeAtHomeApi, apiDevice: api.Device, serialNumber: string, nativeId: string, deviceType: api.VirtualDeviceType, flavor?: string, capabilities?: Capabilities[]) {
        super();
        this.freeAtHomeApi = freeAtHomeApi;
        this.nativeId = nativeId;
        this.serialNumber = serialNumber;
        this.deviceType = deviceType;
        this.flavor = flavor;
        this.capabilities = capabilities;
        this.parameters = new Map();

        for (const channelName in apiDevice?.channels) {
            const apiChannel = apiDevice.channels?.[channelName];
            const i = parseInt(channelName.substring(2), 16);
            const channel = new ApiVirtualChannel(this, apiChannel, i);
            this.
            channels.set(i, channel);
        }

        if(apiDevice.parameters !== undefined) {
            for (const entry in apiDevice.parameters) {
                const parameterId = parseInt(entry.substring(3), 16) as ParameterIds;
                this.parameters.set(parameterId, apiDevice.parameters[entry])
                console.log(entry);
            }
        }
        setImmediate(() => {
            for(const [key, value] of this.parameters)
                this.emit("parameterChanged", key, value);
        });
    }

    onInputDatapointChange(channelIndex: number, data: IndexedDatapoint) {
        const channel = this.channels.get(channelIndex);
        channel?.onInputDatapointChange(data);
    }

    onDeviceChanged(apiDevice: api.Device) {
    }

    onParameterChanged(channelId: number | undefined, parameterId: ParameterIds, value: string)
    {
        if(undefined !== channelId) {
            const channel = this.channels.get(channelId);
            channel?.onParameterChanged(parameterId, value);
        } else {
            this.parameters.set(parameterId, value);
            this.emit("parameterChanged", parameterId, value);
        }
    }

    onSceneTriggered(channelIndex: number, data: Datapoint[]) {
        const channel = this.channels.get(channelIndex);
        channel?.onSceneTriggered(data);
    }

    public getChannels() : IterableIterator<ApiVirtualChannel> {
        return this.channels.values();
    }

    public getParameters() {
        return this.parameters ?? {};
    }

    public async setUnresponsive() : Promise<void> {
        return this.freeAtHomeApi.setDeviceToUnresponsive(this.deviceType, this.nativeId, this.flavor, this.capabilities);
    }


    public async triggerKeepAlive() : Promise<void> {
        return this.freeAtHomeApi.setDeviceToResponsive(this.deviceType, this.nativeId, this.flavor, this.capabilities);
    }


    public async setOutputDatapoint(channelNumber: number, index: number, value: string) : Promise<void> {
        return this.freeAtHomeApi.setOutputDatapoint(this.serialNumber, channelNumber, index, value);
    }

    public async setAuxiliaryData(channel: number, index: number, auxiliaryData: string[]): Promise<void> {
        return this.freeAtHomeApi.setAuxiliaryData(this.serialNumber, channel, index, auxiliaryData);
    }
}
