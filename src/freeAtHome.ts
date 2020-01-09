import { EventEmitter } from 'events';
import { FreeAtHomeApi, DeviceType, Datapoint, Parameter } from './freeAtHomeApi';
import { FreeAtHomeBlindChannel } from './freeAtHomeBlindChannel';
import { FreeAtHomeOnOffChannel } from './freeAtHomeOnOffChannel';
import { FreeAtHomeWindowChannel } from './freeAtHomeWindowChannel';
import { FreeAtHomeRawChannel } from './freeAtHomeRawChannel';
import { FreeAtHomeWeatherBrightnessSensorChannel } from './freeAtHomeWeatherBrightnessSensorChannel';
import {
    FreeAtHomeChannelInterface,
    FreeAtHomeBlindDelegateInterface,
    FreeAtHomeOnOffDelegateInterface,
    FreeAtHomeRawDelegateInterface,
    FreeAtHomeWeatherBrightnessSensorDelegateInterface,
} from './freeAtHomeDeviceInterface';

export class FreeAtHome extends EventEmitter {
    freeAtHomeApi: FreeAtHomeApi;
    host: string;
    nodesBySerial: Map<string, FreeAtHomeChannelInterface>

    constructor(host: string | undefined = process.env.FREEATHOME_API_HOST) {
        super();
        if ("undefined" === typeof host)
            host = "ws://localhost:8888";
        this.host = host;
        this.freeAtHomeApi = this.connectToFreeAtHomeApi();

        this.nodesBySerial = new Map();
    }



    connectToFreeAtHomeApi(): FreeAtHomeApi {
        this.freeAtHomeApi = new FreeAtHomeApi(this.host);

        this.freeAtHomeApi.on('close', this.onClose.bind(this));
        this.freeAtHomeApi.on('open', this.onOpen.bind(this));
        this.freeAtHomeApi.on('dataPointChanged', this.dataPointChanged.bind(this));
        this.freeAtHomeApi.on('parameterChanged', this.parameterChanged.bind(this));
        return this.freeAtHomeApi;
    }

    disconnectFreeAtHomeApi() {
        this.freeAtHomeApi.removeAllListeners('close');
        this.freeAtHomeApi.disconnect();
    }

    onClose(code: number, reason: string) {
        console.log("try to reconnect in 10 secounds...");
        setTimeout(
            () => {
                console.log("reconnecting...");
                this.freeAtHomeApi = this.connectToFreeAtHomeApi();
            }, 10000);
        this.emit("close", reason);
    }

    onOpen() {
        for (const node of this.nodesBySerial.values()) {
            this.addDevice(node);
            node.freeAtHome = this.freeAtHomeApi;
        }
        this.emit("open");
    }

    createBlindDevice(delegate: FreeAtHomeBlindDelegateInterface) {
        if (true === this.nodesBySerial.has(delegate.getSerialNumber()))
            return;
        const device = new FreeAtHomeBlindChannel(this.freeAtHomeApi, 0, delegate);
        this.addDevice(device);
    }

    createWindowDevice(delegate: FreeAtHomeBlindDelegateInterface) {
        if (true === this.nodesBySerial.has(delegate.getSerialNumber()))
            return;
        const device = new FreeAtHomeWindowChannel(this.freeAtHomeApi, 0, delegate);
        this.addDevice(device);
    }

    createOnOffDevice(delegate: FreeAtHomeOnOffDelegateInterface) {
        if (true === this.nodesBySerial.has(delegate.getSerialNumber()))
            return;
        const device = new FreeAtHomeOnOffChannel(this.freeAtHomeApi, 0, delegate);
        this.addDevice(device);
    }

    createRawDevice(delegate: FreeAtHomeRawDelegateInterface) {
        if (true === this.nodesBySerial.has(delegate.getSerialNumber()))
            return;
        const device = new FreeAtHomeRawChannel(this.freeAtHomeApi, 0, delegate);
        this.addDevice(device);
    }

    createWeatherBrightnessSensorDevice(delegate: FreeAtHomeWeatherBrightnessSensorDelegateInterface) {
        if (true === this.nodesBySerial.has(delegate.getSerialNumber()))
            return;
        const device = new FreeAtHomeWeatherBrightnessSensorChannel(this.freeAtHomeApi, 0, delegate);
        this.addDevice(device);
    }

    addDevice(device: FreeAtHomeChannelInterface) {
        const delegate = device.delegate;
        this.freeAtHomeApi.createDevice(device.deviceType, delegate.getSerialNumber(), delegate.getFrindlyName());
        this.nodesBySerial.set(delegate.getSerialNumber(), device);
    }

    dataPointChanged(datapoint: Datapoint) {
        const node = this.nodesBySerial.get(datapoint.nativeId);
        if (node === undefined)
            return;
        node.dataPointChanged(datapoint.channelId, datapoint.pairingId, datapoint.value);
    }

    parameterChanged(parameter: Parameter) {
        const node = this.nodesBySerial.get(parameter.nativeId);
        if (node === undefined)
            return;
        node.parameterChanged(parameter.parameterId, parameter.value);
    }
}

