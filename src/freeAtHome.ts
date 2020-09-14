import { EventEmitter } from 'events';
import { FreeAtHomeApi, VirtualDeviceType, Datapoint, Parameter } from './freeAtHomeApi';

import { FreeAtHomeBlindActuatorChannel, FreeAtHomeBlindActuatorDelegateInterface } from './freeAtHomeBlindActuatorChannel';
import { FreeAtHomeDimActuatorChannel, FreeAtHomeDimActuatorDelegateInterface } from './freeAtHomeDimActuatorChannel'
import { FreeAtHomeWindowActuatorChannel, FreeAtHomeWindowActuatorDelegateInterface } from './freeAtHomeWindowActuatorChannel';
import { FreeAtHomeOnOffChannel } from './freeAtHomeOnOffChannel';
import { FreeAtHomeRawChannel } from './freeAtHomeRawChannel';

import { FreeAtHomeWeatherBrightnessSensorChannel } from './freeAtHomeWeatherBrightnessSensorChannel';
import { FreeAtHomeWeatherTemperatureSensorChannel, FreeAtHomeWeatherTemperatureSensorDelegateInterface } from './freeAtHomeWeatherTemperatureSensorChannel';
import { freeAtHomeWeatherRainSensorChannel, FreeAtHomeWeatherRainSensorDelegateInterface } from './freeAtHomeWeatherRainSensorChannel';
import { FreeAtHomeWeatherWindSensorChannel, FreeAtHomeWeatherWindSensorDelegateInterface } from './freeAtHomeWeatherWindSensorChannel'
import { FreeAtHomeWindowSensorChannel, FreeAtHomeWindowSensorDelegateInterface } from './freeAtHomeWindowSensorChannel';
import { FreeAtHomeSwitchSensorChannel, FreeAtHomeSwitchSensorDelegateInterface } from './freeAtHomeSwitchSensor';
import {
    FreeAtHomeChannelInterface,
    FreeAtHomeOnOffDelegateInterface,
    FreeAtHomeRawDelegateInterface,
    FreeAtHomeWeatherBrightnessSensorDelegateInterface,
} from './freeAtHomeDeviceInterface';

export class FreeAtHome extends EventEmitter {
    freeAtHomeApi: FreeAtHomeApi;
    baseUrl: string;
    authentificationHeader: object;
    nodesBySerial: Map<string, FreeAtHomeChannelInterface>


    constructor(baseUrl: string | undefined = undefined) {
        super();

        this.baseUrl = baseUrl || process.env.FREEATHOME_API_BASE_URL || "http://localhost/fhapi/v1";
        const username: string = process.env.FREEATHOME_API_USERNAME || "installer";
        const password: string = process.env.FREEATHOME_API_PASSWORD || "12345";
        this.authentificationHeader = {
            Authorization: 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
        };

        this.freeAtHomeApi = this.connectToFreeAtHomeApi();

        this.nodesBySerial = new Map();
    }



    connectToFreeAtHomeApi(): FreeAtHomeApi {

        this.freeAtHomeApi = new FreeAtHomeApi(this.baseUrl, this.authentificationHeader);

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
        console.log("try to reconnect in 10 seconds...");
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

    createBlindDevice(serialNumber: string, name: string, delegate: FreeAtHomeBlindActuatorDelegateInterface, isAutoConfirm: boolean = false) {
        if (true === this.nodesBySerial.has(serialNumber))
            return;
        const device = new FreeAtHomeBlindActuatorChannel(this.freeAtHomeApi, 0, serialNumber, name, delegate, isAutoConfirm);
        this.addDevice(device);
    }

    createDimActuatorDevice(serialNumber: string, name: string, delegate: FreeAtHomeDimActuatorDelegateInterface, isAutoConfirm: boolean = false) {
        if (true === this.nodesBySerial.has(serialNumber))
            return;
        const device = new FreeAtHomeDimActuatorChannel(this.freeAtHomeApi, 0, serialNumber, name, delegate, isAutoConfirm);
        this.addDevice(device);
    }

    createWindowDevice(serialNumber: string, name: string, delegate: FreeAtHomeWindowActuatorDelegateInterface) {
        if (true === this.nodesBySerial.has(serialNumber))
            return;
        const device = new FreeAtHomeWindowActuatorChannel(this.freeAtHomeApi, 0, serialNumber, name, delegate);
        this.addDevice(device);
    }

    createOnOffDevice(serialNumber: string, name: string, delegate: FreeAtHomeOnOffDelegateInterface, isAutoConfirm: boolean = false) {
        if (true === this.nodesBySerial.has(serialNumber))
            return;
        const device = new FreeAtHomeOnOffChannel(this.freeAtHomeApi, 0, serialNumber, name, delegate, isAutoConfirm);
        this.addDevice(device);
    }

    createRawDevice(serialNumber: string, name: string, deviceType: VirtualDeviceType, delegate: FreeAtHomeRawDelegateInterface) {
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

    createWeatherRainSensorDevice(serialNumber: string, name: string, delegate: FreeAtHomeWeatherRainSensorDelegateInterface) {
        if (true === this.nodesBySerial.has(serialNumber))
            return;
        const device = new freeAtHomeWeatherRainSensorChannel(this.freeAtHomeApi, 0, serialNumber, name, delegate);
        this.addDevice(device);
    }

    createWeatherWindSensorDevice(serialNumber: string, name: string, delegate: FreeAtHomeWeatherWindSensorDelegateInterface) {
        if (true === this.nodesBySerial.has(serialNumber))
            return;
        const device = new FreeAtHomeWeatherWindSensorChannel(this.freeAtHomeApi, 0, serialNumber, name, delegate);
        this.addDevice(device);
    }

    createWindowSensorDevice(serialNumber: string, name: string, delegate: FreeAtHomeWindowSensorDelegateInterface) {
        if (true === this.nodesBySerial.has(serialNumber))
            return;
        const device = new FreeAtHomeWindowSensorChannel(this.freeAtHomeApi, 0, serialNumber, name, delegate);
        this.addDevice(device);
    }

    createSwitchSensorDevice(serialNumber: string, name: string, delegate: FreeAtHomeSwitchSensorDelegateInterface) {
        if (true === this.nodesBySerial.has(serialNumber))
            return;
        const device = new FreeAtHomeSwitchSensorChannel(this.freeAtHomeApi, 0, serialNumber, name, delegate);
        this.addDevice(device);
    }

    addDevice(device: FreeAtHomeChannelInterface) {
        const { serialNumber, name, deviceType } = device;
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

