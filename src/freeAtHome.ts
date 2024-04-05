import { EventEmitter } from 'events';
import { FreeAtHomeApi } from './freeAtHomeApi';
import { VirtualDeviceType } from './fhapi';

import { BlindActuatorChannel } from './virtualChannels/blindActuatorChannel';
import { DimActuatorChannel } from './virtualChannels/dimActuatorChannel'
import { WindowActuatorChannel } from './virtualChannels/windowActuatorChannel';
import { SwitchingActuatorChannel } from './virtualChannels/switchingActuatorChannel';
import { RGBChannel } from './virtualChannels/rgbChannel';
import { RawChannel } from './virtualChannels/rawChannel';

import { WeatherBrightnessSensorChannel } from './virtualChannels/weatherBrightnessSensorChannel';
import { WeatherTemperatureSensorChannel } from './virtualChannels/weatherTemperatureSensorChannel';
import { WeatherRainSensorChannel } from './virtualChannels/weatherRainSensorChannel';
import { WeatherWindSensorChannel } from './virtualChannels/weatherWindSensorChannel'
import { WindowSensorChannel } from './virtualChannels/windowSensorChannel';
import { SwitchSensorChannel } from './virtualChannels/switchSensor';

import { MediaPlayerChannel } from './virtualChannels/mediaPlayerChannel';

import { EnergyBatteryChannel } from './virtualChannels/energyBatteryChannel';
import { EnergyInverterChannel } from './virtualChannels/energyInverterChannel';
import { EnergyMeterChannel } from './virtualChannels/energyMeterChannel';

import { EnergyBatteryV2Channel } from './virtualChannels/energyBatteryV2Channel';
import { EnergyInverterV2Channel } from './virtualChannels/energyInverterV2Channel';
import { EnergyTwoWayMeterV2Channel } from './virtualChannels/energyTwoWayMeterV2Channel';
import { EnergyOneWayMeterV2Channel } from './virtualChannels/energyOneWayMeterV2Channel';

import { AirCO2Channel } from './virtualChannels/airCO2Channel';
import { AirCOChannel } from './virtualChannels/airCOChannel';
import { AirHumidityChannel } from './virtualChannels/airHumidityChannel';
import { AirNO2Channel } from './virtualChannels/airNO2Channel';
import { AirO3Channel } from './virtualChannels/airO3Channel';
import { AirPM10Channel } from './virtualChannels/airPM10Channel';
import { AirPM25Channel } from './virtualChannels/airPM25Channel';
import { AirPressureChannel } from './virtualChannels/airPressureChannel';
import { AirTemperatureChannel } from './virtualChannels/airTemperatureChannel';
import { AirVOCChannel } from './virtualChannels/airVOCChannel';
import { EvChargerChannel } from './virtualChannels/evCharger';
import { HomeApplianceChannel } from './virtualChannels/homeApplianceChannel';
import { HVACChannel } from './virtualChannels/hvacChannel';
import { SplitUnitChannel } from './virtualChannels/splitUnitChannel';


import { StrictEventEmitter } from 'strict-event-emitter-types';
import { ApiDevice } from './api/apiDevice';
import { ApiChannel } from './api/apiChannel';
import { RoomTemperatureControllerChannel } from './virtualChannels/roomTemperatureControllerChannel';
import { Device, Notification } from './fhapi';
import { CeilingFanChannel } from './virtualChannels/ceilingFanChannel';
import { ApiVirtualDevice } from './api/apiVirtualDevice';
import { BinarySensorChannel } from './virtualChannels/binarySensorChannel';
import { WaterMeterChannel } from './virtualChannels/waterMeterChannel';
import { GasMeterChannel } from './virtualChannels/gasMeterChannel';
import { Capabilities } from './capabilities';
import { HVAC2Channel } from './virtualChannels/hvac2Channel';
import { MeterSensorChannel } from './virtualChannels/meterSensorChannel';

export interface WeatherStationChannels {
    brightness: WeatherBrightnessSensorChannel;
    rain: WeatherRainSensorChannel;
    temperature: WeatherTemperatureSensorChannel;
    wind: WeatherWindSensorChannel;
};

export interface EnergyInverterMeterBatteryChannels {
    battery: EnergyBatteryChannel;
    inverter: EnergyInverterChannel;
    meter: EnergyMeterChannel;
};

export interface EnergyV2Channels {
    battery?: EnergyBatteryV2Channel;
    inverter?: EnergyInverterV2Channel;
    oneWayMeter?: EnergyOneWayMeterV2Channel;
    twoWayMeter?: EnergyTwoWayMeterV2Channel;
};

export interface EnergyInverterMeterChannels {
    inverter: EnergyInverterChannel;
    meter: EnergyMeterChannel;
};

export interface EnergyMeterBatteryChannels {
    battery: EnergyBatteryChannel;
    meter: EnergyMeterChannel;
};

export interface AirQualityFullChannels {
    co2: AirCO2Channel;
    co: AirCOChannel;
    humidity: AirHumidityChannel;
    no2: AirNO2Channel;
    o3: AirO3Channel;
    pm10: AirPM10Channel;
    pm25: AirPM25Channel;
    temperature: AirTemperatureChannel;
    voc: AirVOCChannel;
}

export interface AirQualityKaiterraChannels {
    co2: AirCO2Channel;
    co: AirCOChannel;
    humidity: AirHumidityChannel;
    o3: AirO3Channel;
    pm10: AirPM10Channel;
    pm25: AirPM25Channel;
    temperature: AirTemperatureChannel;
    voc: AirVOCChannel;
}

interface Events {
    open(): void,
    close(reason: string): void,
}

type Emitter = StrictEventEmitter<EventEmitter, Events>;

export class FreeAtHome extends (EventEmitter as { new(): Emitter }) {
    freeAtHomeApi: FreeAtHomeApi;

    constructor(baseUrlIn: string | undefined = undefined) {
        super();

        const baseUrl = baseUrlIn
            ?? process.env.FREEATHOME_API_BASE_URL
            ?? ((process.env.FREEATHOME_BASE_URL) ? process.env.FREEATHOME_BASE_URL + "/api/fhapi/v1" : "http://localhost/api/fhapi/v1");
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

    async createBlindDevice(nativeId: string, name?: string): Promise<BlindActuatorChannel> {
        const device = await this.freeAtHomeApi.createDevice("BlindActuator", nativeId, name);
        const channel = device.getChannels().next().value;
        return new BlindActuatorChannel(channel);
    }

    async createDimActuatorDevice(nativeId: string, name?: string): Promise<DimActuatorChannel> {
        const device = await this.freeAtHomeApi.createDevice("DimActuator", nativeId, name);
        const channel = device.getChannels().next().value;
        return new DimActuatorChannel(channel);
    }

    async createWindowDevice(nativeId: string, name?: string): Promise<WindowActuatorChannel> {
        const device = await this.freeAtHomeApi.createDevice("WindowActuator", nativeId, name);
        const channel = device.getChannels().next().value;
        return new WindowActuatorChannel(channel);
    }

    async createSwitchingActuatorDevice(nativeId: string, name?: string): Promise<SwitchingActuatorChannel> {
        const device = await this.freeAtHomeApi.createDevice("SwitchingActuator", nativeId, name);
        const channel = device.getChannels().next().value;
        return new SwitchingActuatorChannel(channel);
    }

    async createSmartPlugDevice(nativeId: string, name?: string) {
        const device = await this.freeAtHomeApi.createDevice("SmartPlug" as VirtualDeviceType, nativeId, name, "02");
        const channelIterator = device.getChannels();
        const channels = {
            actuator: new SwitchingActuatorChannel(channelIterator.next().value),
            sensor: new MeterSensorChannel(channelIterator.next().value),
        }
        return channels;
    }

    async createRawDevice(nativeId: string, name: string | undefined, deviceType: VirtualDeviceType, flavor?: string, capabilities?: Capabilities[]): Promise<RawChannel> {
        const device = await this.freeAtHomeApi.createDevice(deviceType, nativeId, name, flavor, capabilities);
        const channel = device.getChannels().next().value;
        return new RawChannel(channel);
    }

    async createWeatherBrightnessSensorDevice(nativeId: string, name?: string): Promise<WeatherBrightnessSensorChannel> {
        const device = await this.freeAtHomeApi.createDevice("Weather-BrightnessSensor", nativeId, name);
        const channel = device.getChannels().next().value;
        return new WeatherBrightnessSensorChannel(channel);
    }

    async createWeatherTemperatureSensorDevice(nativeId: string, name?: string): Promise<WeatherTemperatureSensorChannel> {
        const device = await this.freeAtHomeApi.createDevice("Weather-TemperatureSensor", nativeId, name);
        const channel = device.getChannels().next().value;
        return new WeatherTemperatureSensorChannel(channel);
    }

    async createWeatherRainSensorDevice(nativeId: string, name?: string): Promise<WeatherRainSensorChannel> {
        const device = await this.freeAtHomeApi.createDevice("Weather-RainSensor", nativeId, name);
        const channel = device.getChannels().next().value;
        return new WeatherRainSensorChannel(channel);
    }

    async createWeatherWindSensorDevice(nativeId: string, name?: string): Promise<WeatherWindSensorChannel> {
        const device = await this.freeAtHomeApi.createDevice("Weather-WindSensor", nativeId, name);
        const channel = device.getChannels().next().value;
        return new WeatherWindSensorChannel(channel);
    }

    async createWeatherStationDevice(nativeId: string, name?: string): Promise<WeatherStationChannels> {
        const device = await this.freeAtHomeApi.createDevice("WeatherStation", nativeId, name);
        const channelIterator = device.getChannels();
        const channels = {
            brightness: new WeatherBrightnessSensorChannel(channelIterator.next().value),
            rain: new WeatherRainSensorChannel(channelIterator.next().value),
            temperature: new WeatherTemperatureSensorChannel(channelIterator.next().value),
            wind: new WeatherWindSensorChannel(channelIterator.next().value),
        }
        return channels;
    }

    async createWindowSensorDevice(nativeId: string, name?: string): Promise<WindowSensorChannel> {
        const device = await this.freeAtHomeApi.createDevice("WindowSensor", nativeId, name);
        const channel = device.getChannels().next().value;
        return new WindowSensorChannel(channel);
    }

    async createSwitchSensorDevice(nativeId: string, name?: string): Promise<SwitchSensorChannel> {
        const device = await this.freeAtHomeApi.createDevice("KNX-SwitchSensor", nativeId, name);
        const channel = device.getChannels().next().value;
        return new SwitchSensorChannel(channel);
    }

    async createMediaPlayerDevice(nativeId: string, name?: string): Promise<MediaPlayerChannel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"MediaPlayer_Type1", nativeId, name);
        const channel = device.getChannels().next().value;
        return new MediaPlayerChannel(channel);
    }

    async createRoomTemperatureControllerDevice(nativeId: string, name?: string): Promise<RoomTemperatureControllerChannel> {
        const device = await this.freeAtHomeApi.createDevice("RTC", nativeId, name);
        const channel = device.getChannels().next().value;
        return new RoomTemperatureControllerChannel(channel);
    }

    public async getAllDevices(): Promise<IterableIterator<ApiDevice>> {
        return this.freeAtHomeApi.getAllDevices();
    }

    public async getDevice(deviceId: string): Promise<Device> {
        return this.freeAtHomeApi.getDevice(deviceId);
    }

    async createEnergyBatteryDevice(nativeId: string, name?: string): Promise<EnergyBatteryChannel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"EnergyBattery", nativeId, name);
        const channel = device.getChannels().next().value;
        return new EnergyBatteryChannel(channel);
    }

    async createEnergyInverterDevice(nativeId: string, name?: string): Promise<EnergyInverterChannel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"EnergyInverter", nativeId, name);
        const channel = device.getChannels().next().value;
        return new EnergyInverterChannel(channel);
    }

    async createEnergyMeterDevice(nativeId: string, name?: string): Promise<EnergyMeterChannel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"EnergyMeter", nativeId, name);
        const channel = device.getChannels().next().value;
        return new EnergyMeterChannel(channel);
    }

    // Device Flavors
    // 0001 -> one-way meter
    // 0010 -> two-way meter
    // 0100 -> battery
    // 1000 -> inverter
    // 1100 -> inverter with battery
    async createEnergyBatteryV2Device(nativeId: string, name?: string, capabilities?: Capabilities[]): Promise<EnergyBatteryV2Channel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"EnergyMeterv2", nativeId, name, "04", capabilities);
        const channel = device.getChannels().next().value;
        return new EnergyBatteryV2Channel(channel);
    }

    async createEnergyInverterV2Device(nativeId: string, name?: string, capabilities?: Capabilities[]): Promise<EnergyInverterV2Channel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"EnergyMeterv2", nativeId, name, "08", capabilities);
        const channel = device.getChannels().next().value;
        return new EnergyInverterV2Channel(channel);
    }

    async createEnergyTwoWayMeterV2Device(nativeId: string, name?: string, capabilities?: Capabilities[]): Promise<EnergyTwoWayMeterV2Channel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"EnergyMeterv2", nativeId, name, "02", capabilities);
        const channel = device.getChannels().next().value;
        return new EnergyTwoWayMeterV2Channel(channel);
    }

    async createEnergyOneWayMeterV2Device(nativeId: string, name?: string, capabilities?: Capabilities[]): Promise<EnergyOneWayMeterV2Channel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"EnergyMeterv2", nativeId, name, "01", capabilities);
        const channel = device.getChannels().next().value;
        return new EnergyOneWayMeterV2Channel(channel);
    }

    async createEnergyInverterBatteryV2Device(nativeId: string, name?: string, capabilities?: Capabilities[]): Promise<EnergyV2Channels> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"EnergyMeterv2", nativeId, name, "0C", capabilities);
        const channelIterator = device.getChannels();
        const channels = {
            battery: new EnergyBatteryV2Channel(channelIterator.next().value),
            inverter: new EnergyInverterV2Channel(channelIterator.next().value)
        }
        return channels;
    }

    async createEnergyInverterMeterDevice(nativeId: string, name?: string): Promise<EnergyInverterMeterChannels> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"EnergyInverterMeter", nativeId, name);
        const channelIterator = device.getChannels();
        const Iterator = channelIterator.next().value;
        const channels = {
            inverter: new EnergyInverterChannel(Iterator),
            meter: new EnergyMeterChannel(Iterator),
        }
        return channels;
    }

    async createWaterMeterDevice(nativeId: string, name?: string): Promise<WaterMeterChannel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"WaterMeter", nativeId, name);
        const channel = device.getChannels().next().value;
        return new WaterMeterChannel(channel);
    }

    async createGasMeterDevice(nativeId: string, name?: string): Promise<GasMeterChannel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"GasMeter", nativeId, name);
        const channel = device.getChannels().next().value;
        return new GasMeterChannel(channel);
    }

    async createEnergyMeterBatteryDevice(nativeId: string, name?: string): Promise<EnergyMeterBatteryChannels> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"EnergyMeterBattery", nativeId, name);
        const channelIterator = device.getChannels();
        const Iterator = channelIterator.next().value;
        const channels = {
            battery: new EnergyBatteryChannel(Iterator),
            meter: new EnergyMeterChannel(Iterator),
        }
        return channels;
    }

    async createEnergyInverterMeterBatteryDevice(nativeId: string, name?: string): Promise<EnergyInverterMeterBatteryChannels> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"EnergyInverterMeterBattery", nativeId, name);
        const channelIterator = device.getChannels();
        const Iterator = channelIterator.next().value;
        const channels = {
            inverter: new EnergyInverterChannel(Iterator),
            meter: new EnergyMeterChannel(Iterator),
            battery: new EnergyBatteryChannel(Iterator),
        }
        return channels;
    }

    async createAirQualityCO2Device(nativeId: string, name?: string): Promise<AirCO2Channel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"AirQualityCO2", nativeId, name);
        const channel = device.getChannels().next().value;
        return new AirCO2Channel(channel);
    }

    async createAirQualityCODevice(nativeId: string, name?: string): Promise<AirCOChannel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"AirQualityCO", nativeId, name);
        const channel = device.getChannels().next().value;
        return new AirCOChannel(channel);
    }

    async createAirQualityHumidityDevice(nativeId: string, name?: string): Promise<AirHumidityChannel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"AirQualityHumidity", nativeId, name);
        const channel = device.getChannels().next().value;
        return new AirHumidityChannel(channel);
    }

    async createAirQualityNO2Device(nativeId: string, name?: string): Promise<AirNO2Channel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"AirQualityNO2", nativeId, name);
        const channel = device.getChannels().next().value;
        return new AirNO2Channel(channel);
    }

    async createAirQualityO3Device(nativeId: string, name?: string): Promise<AirO3Channel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"AirQualityO3", nativeId, name);
        const channel = device.getChannels().next().value;
        return new AirO3Channel(channel);
    }

    async createAirQualityPM10Device(nativeId: string, name?: string): Promise<AirPM10Channel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"AirQualityPM10", nativeId, name);
        const channel = device.getChannels().next().value;
        return new AirPM10Channel(channel);
    }

    async createAirQualityPM25Device(nativeId: string, name?: string): Promise<AirPM25Channel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"AirQualityPM25", nativeId, name);
        const channel = device.getChannels().next().value;
        return new AirPM25Channel(channel);
    }

    async createAirQualityPressureDevice(nativeId: string, name?: string): Promise<AirPressureChannel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"AirQualityPressure", nativeId, name);
        const channel = device.getChannels().next().value;
        return new AirPressureChannel(channel);
    }

    async createAirQualityTemperatureDevice(nativeId: string, name?: string): Promise<AirTemperatureChannel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"AirQualityTemperature", nativeId, name);
        const channel = device.getChannels().next().value;
        return new AirTemperatureChannel(channel);
    }

    async createAirQualityVOCDevice(nativeId: string, name?: string): Promise<AirVOCChannel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"AirQualityVOC", nativeId, name);
        const channel = device.getChannels().next().value;
        return new AirVOCChannel(channel);
    }

    async createAirQualityFullDevice(nativeId: string, name?: string): Promise<AirQualityFullChannels> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"AirQualityFull", nativeId, name);
        const channelIterator = device.getChannels();
        const Iterator = channelIterator.next().value;
        const channels = {
            co2: new AirCO2Channel(Iterator),
            co: new AirCOChannel(Iterator),
            humidity: new AirHumidityChannel(Iterator),
            no2: new AirNO2Channel(Iterator),
            o3: new AirO3Channel(Iterator),
            pm10: new AirPM10Channel(Iterator),
            pm25: new AirPM25Channel(Iterator),
            pressure: new AirPressureChannel(Iterator),
            temperature: new AirTemperatureChannel(Iterator),
            voc: new AirVOCChannel(Iterator),
        }
        return channels;
    }
    async createAirQualityKaiterra(nativeId: string, name?: string): Promise<AirQualityKaiterraChannels> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"AirQualityKaiterra", nativeId, name);
        const channelIterator = device.getChannels();
        const Iterator = channelIterator.next().value;
        const channels = {
            co2: new AirCO2Channel(Iterator),
            co: new AirCOChannel(Iterator),
            humidity: new AirHumidityChannel(Iterator),
            o3: new AirO3Channel(Iterator),
            pm10: new AirPM10Channel(Iterator),
            pm25: new AirPM25Channel(Iterator),
            temperature: new AirTemperatureChannel(Iterator),
            voc: new AirVOCChannel(Iterator),
        }
        return channels;
    }

    async createCeilingFan(nativeId: string, name?: string): Promise<CeilingFanChannel> {
        const device = await this.freeAtHomeApi.createDevice("CeilingFanActuator", nativeId, name);
        const channel = device.getChannels().next().value;
        return new CeilingFanChannel(channel);
    }

    async createEvCharger(nativeId: string, name?: string, capabilities?: Capabilities[]): Promise<EvChargerChannel> {
        const device = await this.freeAtHomeApi.createDevice("evcharging", nativeId, name, undefined, capabilities);
        const channel = device.getChannels().next().value;
        return new EvChargerChannel(channel);
    }

    async createHomeApplianceLaundry(nativeId: string, name?: string): Promise<HomeApplianceChannel> {
        const device = await this.freeAtHomeApi.createDevice("HomeAppliance-Laundry", nativeId, name);
        const channel = device.getChannels().next().value;
        return new HomeApplianceChannel(channel);
    }

    async createBinarySensor(nativeId: string, name?: string): Promise<BinarySensorChannel> {
        const device = await this.freeAtHomeApi.createDevice("BinarySensor", nativeId, name);
        const channel = device.getChannels().next().value;
        return new BinarySensorChannel(channel);
    }

    async createHVACWithEnergyDevice(nativeId: string, name?: string, capabilities?: Capabilities[]): Promise<HVAC2Channel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"HVACWithEnergy", nativeId, name, undefined, capabilities);
        const channel = device.getChannels().next().value;
        return new HVAC2Channel(channel);
    }

    async createHVACDevice(nativeId: string, name?: string): Promise<HVACChannel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"HVAC", nativeId, name);
        const channel = device.getChannels().next().value;
        return new HVACChannel(channel);
    }

    async createSplitUnitDevice(nativeId: string, name?: string): Promise<SplitUnitChannel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"SplitUnit", nativeId, name);
        const channel = device.getChannels().next().value;
        return new SplitUnitChannel(channel);
    }

    async createRGBDevice(nativeId: string, name?: string): Promise<RGBChannel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"ledvance-rgb", nativeId, name);
        const channel = device.getChannels().next().value;
        return new RGBChannel(channel);
    }

    async createRGBWDevice(nativeId: string, name?: string): Promise<RGBChannel> {
        const device = await this.freeAtHomeApi.createDevice(<VirtualDeviceType>"RGBW", nativeId, name);
        const channel = device.getChannels().next().value;
        return new RGBChannel(channel);
    }

    public async markAllDevicesAsUnresponsive(): Promise<void[]> {
        const promises = [] as PromiseLike<void>[];
        this.freeAtHomeApi.virtualDevicesBySerial.forEach((device: ApiVirtualDevice) => {
            promises.push(device.setUnresponsive());
        });
        return Promise.all(promises);
    }

    public async getAllChannels(): Promise<IterableIterator<ApiChannel>> {
        return this.freeAtHomeApi.getAllChannels();
    }

    public async postNotification(notification: Notification) {
        return this.freeAtHomeApi.postNotification(notification);
    }

    public activateSignalHandling() {
        // Signal handling for a smooth shutdown of an add on
        //#################################################################################

        if (process.platform === "win32") {
            const rl = require("readline").createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.on("SIGINT", function () {
                process.emit("SIGINT" as any);
            });
        }

        process.on('SIGINT', async () => {
            console.log("SIGINT received, cleaning up...")
            await this.markAllDevicesAsUnresponsive();
            console.log("clean up finished, exiting process")
            process.exit();
        });
        process.on('SIGTERM', async () => {
            console.log("SIGTERM received, cleaning up...")
            await this.markAllDevicesAsUnresponsive();
            console.log("clean up finished, exiting process")
            process.exit();
        });
    }

    public setEnableLogging(enableLogging: boolean) {
        this.freeAtHomeApi.enableLogging = true;
    }
}
