import { EventEmitter } from 'events';
import { FreeAtHomeApi, DeviceType, Datapoint, Parameter } from './freeAtHomeApi';
import { FreeAtHomeBlindChannel } from './freeAtHomeBlindChannel';
import { FreeAtHomeDimActuatorChannel, FreeAtHomeDimActuatorDelegateInterface } from './freeAtHomeDimActuatorChannel'
import { FreeAtHomeOnOffChannel } from './freeAtHomeOnOffChannel';
import { FreeAtHomeWindowChannel } from './freeAtHomeWindowChannel';
import { FreeAtHomeRawChannel } from './freeAtHomeRawChannel';
import { FreeAtHomeWeatherBrightnessSensorChannel } from './freeAtHomeWeatherBrightnessSensorChannel';
import { FreeAtHomeWeatherTemperatureSensorChannel, FreeAtHomeWeatherTemperatureSensorDelegateInterface} from './freeAtHomeWeatherTemperatureSensorChannel';
import { FreeAtHomeSwitchSensorChannel, FreeAtHomeSwitchSensorDelegateInterface} from './freeAtHomeSwitchSensor';
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

    createBlindDevice(serialNumber: string, name: string, delegate: FreeAtHomeBlindDelegateInterface,) {
        if (true === this.nodesBySerial.has(serialNumber))
            return;
        const device = new FreeAtHomeBlindChannel(this.freeAtHomeApi, 0, serialNumber, name, delegate);
        this.addDevice(device);
    }

    createDimActuatorDevice(serialNumber: string, name: string, delegate: FreeAtHomeDimActuatorDelegateInterface, isAutoConfirm: boolean = false) {
        if (true === this.nodesBySerial.has(serialNumber))
            return;
        const device = new FreeAtHomeDimActuatorChannel(this.freeAtHomeApi, 0, serialNumber, name, delegate, isAutoConfirm);
        this.addDevice(device);
    }

    createWindowDevice(serialNumber: string, name: string, delegate: FreeAtHomeBlindDelegateInterface) {
        if (true === this.nodesBySerial.has(serialNumber))
            return;
        const device = new FreeAtHomeWindowChannel(this.freeAtHomeApi, 0, serialNumber, name, delegate);
        this.addDevice(device);
    }

    createOnOffDevice(serialNumber: string, name: string, delegate: FreeAtHomeOnOffDelegateInterface) {
        if (true === this.nodesBySerial.has(serialNumber))
            return;
        const device = new FreeAtHomeOnOffChannel(this.freeAtHomeApi, 0, serialNumber, name, delegate);
        this.addDevice(device);
    }

    createRawDevice(serialNumber: string, name: string, deviceType: DeviceType, delegate: FreeAtHomeRawDelegateInterface) {
        if (true === this.nodesBySerial.has(serialNumber))
            return;
        const device = new FreeAtHomeRawChannel(this.freeAtHomeApi, 0, serialNumber, name, deviceType, delegate);
        this.addDevice(device);
    }

    createWeatherBrightnessSensorDevice(serialNumber: string, name: string, delegate: FreeAtHomeWeatherBrightnessSensorDelegateInterface) {
        if (true === this.nodesBySerial.has(serialNumber))
            return;
        const device = new FreeAtHomeWeatherBrightnessSensorChannel(this.freeAtHomeApi, 0, serialNumber, name, delegate);
        this.addDevice(device);
    }

    createWeatherTemperatureSensorDevice(serialNumber: string, name: string, delegate: FreeAtHomeWeatherTemperatureSensorDelegateInterface) {
        if (true === this.nodesBySerial.has(serialNumber))
            return;
        const device = new FreeAtHomeWeatherTemperatureSensorChannel(this.freeAtHomeApi, 0, serialNumber, name, delegate);
        this.addDevice(device);
    }

    createSwitchSensorDevice(serialNumber: string, name: string, delegate: FreeAtHomeSwitchSensorDelegateInterface) {
        if (true === this.nodesBySerial.has(serialNumber))
            return;
        const device = new FreeAtHomeSwitchSensorChannel(this.freeAtHomeApi, 0, serialNumber, name, delegate);
        this.addDevice(device);
    }

    addDevice(device: FreeAtHomeChannelInterface) {
        const {serialNumber, name, deviceType } = device;
        this.freeAtHomeApi.createDevice(deviceType, serialNumber, name);
        this.nodesBySerial.set(serialNumber, device);
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

