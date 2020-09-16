import { EventEmitter } from 'events';
import { FreeAtHomeApi, VirtualDeviceType, Datapoint, Parameter } from './freeAtHomeApi';

import { FreeAtHomeBlindActuatorChannel } from './channels/freeAtHomeBlindActuatorChannel';
import { FreeAtHomeDimActuatorChannel } from './channels/freeAtHomeDimActuatorChannel'
import { FreeAtHomeWindowActuatorChannel } from './channels/freeAtHomeWindowActuatorChannel';
import { SwitchingActuatorChannel } from './channels/switchingActuatorChannel';
import { FreeAtHomeRawChannel } from './channels/freeAtHomeRawChannel';

import { FreeAtHomeWeatherBrightnessSensorChannel } from './channels/freeAtHomeWeatherBrightnessSensorChannel';
import { FreeAtHomeWeatherTemperatureSensorChannel } from './channels/freeAtHomeWeatherTemperatureSensorChannel';
import { freeAtHomeWeatherRainSensorChannel } from './channels/freeAtHomeWeatherRainSensorChannel';
import { FreeAtHomeWeatherWindSensorChannel } from './channels/freeAtHomeWeatherWindSensorChannel'
import { FreeAtHomeWindowSensorChannel } from './channels/freeAtHomeWindowSensorChannel';
import { FreeAtHomeSwitchSensorChannel } from './channels/freeAtHomeSwitchSensor';

import { MediaPlayerChannel } from '.'

import { StrictEventEmitter } from 'strict-event-emitter-types';

interface Events {
    open(): void,
    close(reason: string): void,
}

type Emitter = StrictEventEmitter<EventEmitter, Events>;

export class FreeAtHome extends (EventEmitter as { new(): Emitter }) {
    freeAtHomeApi: FreeAtHomeApi;

    constructor(baseUrlIn: string | undefined = undefined) {
        super();

        const baseUrl = baseUrlIn || process.env.FREEATHOME_API_BASE_URL || "http://localhost/fhapi/v1";
        const username: string = process.env.FREEATHOME_API_USERNAME || "installer";
        const password: string = process.env.FREEATHOME_API_PASSWORD || "12345";
        const authenticationHeader = {
            Authorization: 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
        };

        this.freeAtHomeApi = new FreeAtHomeApi(baseUrl, authenticationHeader);

        this.freeAtHomeApi.on('close', this.onClose.bind(this));
        this.freeAtHomeApi.on('open', this.onOpen.bind(this));
    }

    disconnectFreeAtHomeApi() {
        this.freeAtHomeApi.removeAllListeners('close');
        this.freeAtHomeApi.disconnect();
    }

    private onClose(code: number, reason: string) {
        this.emit("close", reason);
    }

    private onOpen() {
        this.emit("open");
    }

    async createBlindDevice(nativeId: string, name: string): Promise<FreeAtHomeBlindActuatorChannel> {
        const device = await this.freeAtHomeApi.createDevice("BlindActuator", nativeId, name);
        return new FreeAtHomeBlindActuatorChannel(device, 0);
    }

    async createDimActuatorDevice(nativeId: string, name: string): Promise<FreeAtHomeDimActuatorChannel> {
        const device = await this.freeAtHomeApi.createDevice("DimActuator", nativeId, name);
        return new FreeAtHomeDimActuatorChannel(device, 0);
    }

    async createWindowDevice(nativeId: string, name: string): Promise<FreeAtHomeWindowActuatorChannel> {
        const device = await this.freeAtHomeApi.createDevice("WindowActuator", nativeId, name);
        return new FreeAtHomeWindowActuatorChannel(device, 0);
    }

    async createSwitchingActuatorDevice(nativeId: string, name: string): Promise<SwitchingActuatorChannel> {
        const device = await this.freeAtHomeApi.createDevice("SwitchingActuator", nativeId, name);
        return new SwitchingActuatorChannel(device, 0);
    }

    async createRawDevice(nativeId: string, name: string, deviceType: VirtualDeviceType): Promise<FreeAtHomeRawChannel> {
        const device = await this.freeAtHomeApi.createDevice(deviceType, nativeId, name);
        return new FreeAtHomeRawChannel(device, 0);
    }

    async createWeatherBrightnessSensorDevice(nativeId: string, name: string): Promise<FreeAtHomeWeatherBrightnessSensorChannel> {
        const device = await this.freeAtHomeApi.createDevice("Weather-BrightnessSensor", nativeId, name);
        return new FreeAtHomeWeatherBrightnessSensorChannel(device, 0);
    }

    async createWeatherTemperatureSensorDevice(nativeId: string, name: string): Promise<FreeAtHomeWeatherTemperatureSensorChannel> {
        const device = await this.freeAtHomeApi.createDevice("Weather-TemperatureSensor", nativeId, name);
        return new FreeAtHomeWeatherTemperatureSensorChannel(device, 0);
    }

    async createWeatherRainSensorDevice(nativeId: string, name: string): Promise<freeAtHomeWeatherRainSensorChannel> {
        const device = await this.freeAtHomeApi.createDevice("Weather-RainSensor", nativeId, name);
        return new freeAtHomeWeatherRainSensorChannel(device, 0);
    }

    async createWeatherWindSensorDevice(nativeId: string, name: string): Promise<FreeAtHomeWeatherWindSensorChannel> {
        const device = await this.freeAtHomeApi.createDevice("Weather-WindSensor", nativeId, name);
        return new FreeAtHomeWeatherWindSensorChannel(device, 0);
    }

    async createWindowSensorDevice(nativeId: string, name: string): Promise<FreeAtHomeWindowSensorChannel> {
        const device = await this.freeAtHomeApi.createDevice("WindowSensor", nativeId, name);
        return new FreeAtHomeWindowSensorChannel(device, 0);
    }

    async createSwitchSensorDevice(nativeId: string, name: string): Promise<FreeAtHomeSwitchSensorChannel> {
        const device = await this.freeAtHomeApi.createDevice("KNX-SwitchSensor", nativeId, name);
        return new FreeAtHomeSwitchSensorChannel(device, 0);
    }

    async createMediaPlayerDevice(nativeId: string, name: string): Promise<MediaPlayerChannel> {
        const device = await this.freeAtHomeApi.createDevice("MediaPlayer", nativeId, name);
        return new MediaPlayerChannel(device, 0);
    }
}
