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
import { Channel } from './channel';

export class FreeAtHome extends EventEmitter {
    freeAtHomeApi: FreeAtHomeApi;
    baseUrl: string;
    authentificationHeader: object;
    nodesBySerial: Map<string, Channel> = new Map();;


    constructor(baseUrl: string | undefined = undefined) {
        super();

        this.baseUrl = baseUrl || process.env.FREEATHOME_API_BASE_URL || "http://localhost/fhapi/v1";
        const username: string = process.env.FREEATHOME_API_USERNAME || "installer";
        const password: string = process.env.FREEATHOME_API_PASSWORD || "12345";
        this.authentificationHeader = {
            Authorization: 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
        };

        this.freeAtHomeApi = this.connectToFreeAtHomeApi();
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

    createBlindDevice(serialNumber: string, name: string): FreeAtHomeBlindActuatorChannel {
        const exsistingDevice = this.nodesBySerial.get(serialNumber);
        if (exsistingDevice !== undefined)
            return <FreeAtHomeBlindActuatorChannel>exsistingDevice;
        const device = new FreeAtHomeBlindActuatorChannel(this.freeAtHomeApi, 0, serialNumber, name);
        this.addDevice(device);
        return device;
    }

    createDimActuatorDevice(serialNumber: string, name: string): FreeAtHomeDimActuatorChannel {
        const exsistingDevice = this.nodesBySerial.get(serialNumber);
        if (exsistingDevice !== undefined)
            return <FreeAtHomeDimActuatorChannel>exsistingDevice;
        const device = new FreeAtHomeDimActuatorChannel(this.freeAtHomeApi, 0, serialNumber, name);
        this.addDevice(device);
        return device;
    }

    createWindowDevice(serialNumber: string, name: string): FreeAtHomeWindowActuatorChannel {
        const exsistingDevice = this.nodesBySerial.get(serialNumber);
        if (exsistingDevice !== undefined)
            return <FreeAtHomeWindowActuatorChannel>exsistingDevice;
        const device = new FreeAtHomeWindowActuatorChannel(this.freeAtHomeApi, 0, serialNumber, name);
        this.addDevice(device);
        return device;
    }

    createOnOffDevice(serialNumber: string, name: string): FreeAtHomeOnOffChannel {
        const exsistingDevice = this.nodesBySerial.get(serialNumber);
        if (exsistingDevice !== undefined)
            return <FreeAtHomeOnOffChannel>exsistingDevice;
        const device = new FreeAtHomeOnOffChannel(this.freeAtHomeApi, 0, serialNumber, name);
        this.addDevice(device);
        return device;
    }

    createRawDevice(serialNumber: string, name: string, deviceType: VirtualDeviceType): FreeAtHomeRawChannel {
        const exsistingDevice = this.nodesBySerial.get(serialNumber);
        if (exsistingDevice !== undefined)
            return <FreeAtHomeRawChannel>exsistingDevice;
        const device = new FreeAtHomeRawChannel(this.freeAtHomeApi, 0, serialNumber, name, deviceType);
        this.addDevice(device);
        return device;
    }

    createWeatherBrightnessSensorDevice(serialNumber: string, name: string): FreeAtHomeWeatherBrightnessSensorChannel {
        const exsistingDevice = this.nodesBySerial.get(serialNumber);
        if (exsistingDevice !== undefined)
            return <FreeAtHomeWeatherBrightnessSensorChannel>exsistingDevice;
        const device = new FreeAtHomeWeatherBrightnessSensorChannel(this.freeAtHomeApi, 0, serialNumber, name);
        this.addDevice(device);
        return device;
    }

    createWeatherTemperatureSensorDevice(serialNumber: string, name: string): FreeAtHomeWeatherTemperatureSensorChannel {
        const exsistingDevice = this.nodesBySerial.get(serialNumber);
        if (exsistingDevice !== undefined)
            return <FreeAtHomeWeatherTemperatureSensorChannel>exsistingDevice;
        const device = new FreeAtHomeWeatherTemperatureSensorChannel(this.freeAtHomeApi, 0, serialNumber, name);
        this.addDevice(device);
        return device;
    }

    createWeatherRainSensorDevice(serialNumber: string, name: string): freeAtHomeWeatherRainSensorChannel {
        const exsistingDevice = this.nodesBySerial.get(serialNumber);
        if (exsistingDevice !== undefined)
            return <freeAtHomeWeatherRainSensorChannel>exsistingDevice;
        const device = new freeAtHomeWeatherRainSensorChannel(this.freeAtHomeApi, 0, serialNumber, name);
        this.addDevice(device);
        return device;
    }

    createWeatherWindSensorDevice(serialNumber: string, name: string): FreeAtHomeWeatherWindSensorChannel {
        const exsistingDevice = this.nodesBySerial.get(serialNumber);
        if (exsistingDevice !== undefined)
            return <FreeAtHomeWeatherWindSensorChannel>exsistingDevice;
        const device = new FreeAtHomeWeatherWindSensorChannel(this.freeAtHomeApi, 0, serialNumber, name);
        this.addDevice(device);
        return device;
    }

    createWindowSensorDevice(serialNumber: string, name: string): FreeAtHomeWindowSensorChannel {
        const exsistingDevice = this.nodesBySerial.get(serialNumber);
        if (exsistingDevice !== undefined)
            return <FreeAtHomeWindowSensorChannel>exsistingDevice;
        const device = new FreeAtHomeWindowSensorChannel(this.freeAtHomeApi, 0, serialNumber, name);
        this.addDevice(device);
        return device;
    }

    createSwitchSensorDevice(serialNumber: string, name: string): FreeAtHomeSwitchSensorChannel {
        const exsistingDevice = this.nodesBySerial.get(serialNumber);
        if (exsistingDevice !== undefined)
            return <FreeAtHomeSwitchSensorChannel>exsistingDevice;
        const device = new FreeAtHomeSwitchSensorChannel(this.freeAtHomeApi, 0, serialNumber, name);
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
