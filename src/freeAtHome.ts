import { EventEmitter } from 'events';
import { FreeAtHomeApi, VirtualDeviceType, Datapoint, Parameter } from './freeAtHomeApi';

import { FreeAtHomeBlindActuatorChannel } from './freeAtHomeBlindActuatorChannel';
import { FreeAtHomeDimActuatorChannel } from './freeAtHomeDimActuatorChannel'
import { FreeAtHomeWindowActuatorChannel } from './freeAtHomeWindowActuatorChannel';
import { FreeAtHomeOnOffChannel } from './freeAtHomeOnOffChannel';
import { FreeAtHomeRawChannel } from './freeAtHomeRawChannel';

import { FreeAtHomeWeatherBrightnessSensorChannel } from './freeAtHomeWeatherBrightnessSensorChannel';
import { FreeAtHomeWeatherTemperatureSensorChannel } from './freeAtHomeWeatherTemperatureSensorChannel';
import { freeAtHomeWeatherRainSensorChannel } from './freeAtHomeWeatherRainSensorChannel';
import { FreeAtHomeWeatherWindSensorChannel } from './freeAtHomeWeatherWindSensorChannel'
import { FreeAtHomeWindowSensorChannel } from './freeAtHomeWindowSensorChannel';
import { FreeAtHomeSwitchSensorChannel } from './freeAtHomeSwitchSensor';

import { MediaPlayerChannel } from '.'

import { Channel } from './channel';

export class FreeAtHome extends EventEmitter {
    freeAtHomeApi: FreeAtHomeApi;
    baseUrl: string;
    authenticationHeader: object;
    nodesBySerial: Map<string, Channel> = new Map();;


    constructor(baseUrl: string | undefined = undefined) {
        super();

        this.baseUrl = baseUrl || process.env.FREEATHOME_API_BASE_URL || "http://localhost/fhapi/v1";
        const username: string = process.env.FREEATHOME_API_USERNAME || "installer";
        const password: string = process.env.FREEATHOME_API_PASSWORD || "12345";
        this.authenticationHeader = {
            Authorization: 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
        };

        this.freeAtHomeApi = this.connectToFreeAtHomeApi();
    }

    connectToFreeAtHomeApi(): FreeAtHomeApi {

        this.freeAtHomeApi = new FreeAtHomeApi(this.baseUrl, this.authenticationHeader);

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

    createBlindDevice(serialNumber: string, name: string): FreeAtHomeBlindActuatorChannel {
        const existingDevice = this.nodesBySerial.get(serialNumber);
        if (existingDevice !== undefined)
            return <FreeAtHomeBlindActuatorChannel>existingDevice;
        const device = new FreeAtHomeBlindActuatorChannel(this.freeAtHomeApi, 0, serialNumber, name);
        this.addDevice(device);
        return device;
    }

    createDimActuatorDevice(serialNumber: string, name: string): FreeAtHomeDimActuatorChannel {
        const existingDevice = this.nodesBySerial.get(serialNumber);
        if (existingDevice !== undefined)
            return <FreeAtHomeDimActuatorChannel>existingDevice;
        const device = new FreeAtHomeDimActuatorChannel(this.freeAtHomeApi, 0, serialNumber, name);
        this.addDevice(device);
        return device;
    }

    createWindowDevice(serialNumber: string, name: string): FreeAtHomeWindowActuatorChannel {
        const existingDevice = this.nodesBySerial.get(serialNumber);
        if (existingDevice !== undefined)
            return <FreeAtHomeWindowActuatorChannel>existingDevice;
        const device = new FreeAtHomeWindowActuatorChannel(this.freeAtHomeApi, 0, serialNumber, name);
        this.addDevice(device);
        return device;
    }

    createOnOffDevice(serialNumber: string, name: string): FreeAtHomeOnOffChannel {
        const existingDevice = this.nodesBySerial.get(serialNumber);
        if (existingDevice !== undefined)
            return <FreeAtHomeOnOffChannel>existingDevice;
        const device = new FreeAtHomeOnOffChannel(this.freeAtHomeApi, 0, serialNumber, name);
        this.addDevice(device);
        return device;
    }

    createRawDevice(serialNumber: string, name: string, deviceType: VirtualDeviceType): FreeAtHomeRawChannel {
        const existingDevice = this.nodesBySerial.get(serialNumber);
        if (existingDevice !== undefined)
            return <FreeAtHomeRawChannel>existingDevice;
        const device = new FreeAtHomeRawChannel(this.freeAtHomeApi, 0, serialNumber, name, deviceType);
        this.addDevice(device);
        return device;
    }

    createWeatherBrightnessSensorDevice(serialNumber: string, name: string): FreeAtHomeWeatherBrightnessSensorChannel {
        const existingDevice = this.nodesBySerial.get(serialNumber);
        if (existingDevice !== undefined)
            return <FreeAtHomeWeatherBrightnessSensorChannel>existingDevice;
        const device = new FreeAtHomeWeatherBrightnessSensorChannel(this.freeAtHomeApi, 0, serialNumber, name);
        this.addDevice(device);
        return device;
    }

    createWeatherTemperatureSensorDevice(serialNumber: string, name: string): FreeAtHomeWeatherTemperatureSensorChannel {
        const existingDevice = this.nodesBySerial.get(serialNumber);
        if (existingDevice !== undefined)
            return <FreeAtHomeWeatherTemperatureSensorChannel>existingDevice;
        const device = new FreeAtHomeWeatherTemperatureSensorChannel(this.freeAtHomeApi, 0, serialNumber, name);
        this.addDevice(device);
        return device;
    }

    createWeatherRainSensorDevice(serialNumber: string, name: string): freeAtHomeWeatherRainSensorChannel {
        const existingDevice = this.nodesBySerial.get(serialNumber);
        if (existingDevice !== undefined)
            return <freeAtHomeWeatherRainSensorChannel>existingDevice;
        const device = new freeAtHomeWeatherRainSensorChannel(this.freeAtHomeApi, 0, serialNumber, name);
        this.addDevice(device);
        return device;
    }

    createWeatherWindSensorDevice(serialNumber: string, name: string): FreeAtHomeWeatherWindSensorChannel {
        const existingDevice = this.nodesBySerial.get(serialNumber);
        if (existingDevice !== undefined)
            return <FreeAtHomeWeatherWindSensorChannel>existingDevice;
        const device = new FreeAtHomeWeatherWindSensorChannel(this.freeAtHomeApi, 0, serialNumber, name);
        this.addDevice(device);
        return device;
    }

    createWindowSensorDevice(serialNumber: string, name: string): FreeAtHomeWindowSensorChannel {
        const existingDevice = this.nodesBySerial.get(serialNumber);
        if (existingDevice !== undefined)
            return <FreeAtHomeWindowSensorChannel>existingDevice;
        const device = new FreeAtHomeWindowSensorChannel(this.freeAtHomeApi, 0, serialNumber, name);
        this.addDevice(device);
        return device;
    }

    createSwitchSensorDevice(serialNumber: string, name: string): FreeAtHomeSwitchSensorChannel {
        const existingDevice = this.nodesBySerial.get(serialNumber);
        if (existingDevice !== undefined)
            return <FreeAtHomeSwitchSensorChannel>existingDevice;
        const device = new FreeAtHomeSwitchSensorChannel(this.freeAtHomeApi, 0, serialNumber, name);
        this.addDevice(device);
        return device;
    }

    createMediaPlayerDevice(serialNumber: string, name: string): MediaPlayerChannel {
        const existingDevice = this.nodesBySerial.get(serialNumber);
        if (existingDevice !== undefined)
            return <MediaPlayerChannel>existingDevice;
        const device = new MediaPlayerChannel(this.freeAtHomeApi, 0, serialNumber, name);
        this.addDevice(device);
        return device;
    }

    addDevice(device: Channel) {
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
