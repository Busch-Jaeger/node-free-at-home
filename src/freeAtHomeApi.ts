import { EventEmitter } from 'events';
import StrictEventEmitter from 'strict-event-emitter-types';
import WebSocket from 'ws';




export enum DatapointIds {
    switchOnOff = 0x0001,
    timedStartStop = 0x0002,
    forced = 0x0003,
    timedMovement = 0x0006,

    relativeSetValue = 0x0010,
    absoluteSetValue = 0x0011,
    night = 0x0012,

    moveUpDown = 0x20,
    adjustUpDown = 0x21,
    setAbsolutePositionBlinds = 0x23,
    setAbsolutePositionSlats = 0x24,
    forcePositionBlind = 0x28,
    windAlarm = 0x25,
    rainAlarm = 0x27,
    frostAlarm = 0x26,
    sceneControl = 0x4,
    windowDoorPosition = 0x0029,
    windowDoor = 0x0035,


    infoOnOff = 0x0100,

    infoActualDimmingValue = 0x0110,
    infoMoveUpDown = 0x120,
    currentAbsolutePositionBlindsPercentage = 0x121,
    currentAbsolutePositionSlatsPercentage = 0x122,
    infoError = 0x111,
    forcePositionInfo = 0x101,

    outdoorTemperature = 0x0400,
    windForce = 0x0401,
    brightnessAlarm = 0x0402,
    brightnessLevel = 0x0403,
    windSpeed = 0x0404,
    rainSensorActivation_Percentage = 0x0405,
    rainSensorFrequency = 0x0406,

}

export enum ParameterIds {
    dummy = 0x01,

    dimmingActuatorMinBrightness = 0x0004,
    dimmingActuatorMaxBrightnessDay = 0x0005,
    dimmingActuatorMaxBrightnessNight = 0x0012,
    autonomousSwitchOffTimeDuration = 0x0015,
    dimmerSwitchOnMode = 0x0029,

    biContactType = 0x0010,
    sensorType = 0x0043,

    brightnessAlertActivationLevel = 0x002B,
    /** Hysteresis brightness alert **/
    hysteresis = 0x002C,
    /** Frost Alarm activation level **/
    frostAlarmActivationLevel = 0x002D,
    windForce = 0x002E,

    alertActivationDelay = 0x0047,
    /** Alert deactivation delay **/
    dealertActivationDelay = 0x0048,
}

interface Packet {
    type: string,
    name: string,
    payload: Datapoint | Parameter | CreateDevice,
}

export interface Datapoint {
    nativeId: string,
    channelId: number,
    pairingId: DatapointIds,
    value: string
}

export interface Parameter {
    nativeId: string,
    parameterId: ParameterIds,
    value: string
}

interface CreateDevice {
    nativeId: string,
    deviceType: DeviceType,
    displayName: string
}

export enum DeviceType {
    binarySensor = "BinarySensor",
    blindActuator = "BlindActuator",
    ceilingFanActuator = "CeilingFanActuator",
    cODetector = "CODetector",
    dimActuator = "DimActuator",
    entity_4A00_0001 = "entity_4A00_0001",
    entity_4A01_0001 = "entity_4A01_0001",
    evcharging = "evcharging",
    fireDetector = "FireDetector",
    group_4000_0001 = "group_4000_0001",
    group_4000_0002 = "group_4000_0002",
    group_4001_0001 = "group_4001_0001",
    group_4001_0002 = "group_4001_0002",
    group_4001_0003 = "group_4001_0003",
    group_4002_0001 = "group_4002_0001",
    group_4002_0002 = "group_4002_0002",
    group_4003_0001 = "group_4003_0001",
    group_4003_0002 = "group_4003_0002",
    group_4003_0003 = "group_4003_0003",
    group_4003_0004 = "group_4003_0004",
    group_4004_0001 = "group_4004_0001",
    homeApplianceCoffeeMachine = "HomeAppliance-CoffeeMachine",
    homeApplianceDishwasher = "HomeAppliance-Dishwasher",
    homeApplianceDryer = "HomeAppliance-Dryer",
    homeApplianceFreezer = "HomeAppliance-Freezer",
    homeApplianceFridgeFreezer = "HomeAppliance-FridgeFreezer",
    homeApplianceFridge = "HomeAppliance-Fridge",
    homeApplianceHob = "HomeAppliance-Hob",
    homeApplianceHood = "HomeAppliance-Hood",
    homeApplianceLaundry = "HomeAppliance-Laundry",
    homeApplianceOven = "HomeAppliance-Oven",
    knxDimActuator = "KNX-DimActuator",
    knxDimSensor = "KNX-DimSensor",
    knxSwitchingActuator = "KNX-SwitchingActuator",
    knxSwitchSensor = "KNX-SwitchSensor",
    powerone_v2 = "powerone_v2",
    poweroneWoBattery_v2 = "powerone-wo-battery_v2",
    poweroneWoBattery = "powerone-wo-battery",
    powerone = "powerone",
    redarrowXX = "redarrow-x-x",
    rTC = "RTC",
    scene_4800_0001 = "scene_4800_0001",
    scene_4801_0001 = "scene_4801_0001",
    scene_4802_0001 = "scene_4802_0001",
    scene_4803_0001 = "scene_4803_0001",
    scene_4804_0001 = "scene_4804_0001",
    shutterActuator = "ShutterActuator",
    switchingActuator = "SwitchingActuator",
    weatherBrightnessSensor = "Weather-BrightnessSensor",
    weatherRainSensor = "Weather-RainSensor",
    weatherStation = "WeatherStation",
    weatherTemperatureSensor = "Weather-TemperatureSensor",
    weatherWindSensor = "Weather-WindSensor",
    windowActuator = "WindowActuator",
    windowSensor = "WindowSensor",
}

export enum ConnectionStates {
    connecting,
    open,
    closing,
    closed,
    unknown,
}

interface Events {
    open: FreeAtHomeApi,
    close: (code: number, reason: string) => void,
    dataPointChanged: Datapoint,
    parameterChanged: Parameter,
}

// Typed Event emitter: https://github.com/bterlson/strict-event-emitter-types#usage-with-subclasses
type MyEmitter = StrictEventEmitter<EventEmitter, Events>;

export class FreeAtHomeApi extends (EventEmitter as { new(): MyEmitter }) {
    websocket: WebSocket;

    constructor(host: string) {
        super();
        this.websocket = new WebSocket(host);

        // this.websocket.on('error', (err: any) => {
        // })

        this.websocket.on('open', this.onOpen.bind(this));
        this.websocket.on('close', this.onClose.bind(this));
        this.websocket.on('error', this.onError.bind(this));

        this.websocket.on('message', this.incoming.bind(this));
    }

    disconnect() {
        this.websocket.removeAllListeners('close');
        this.websocket.close();
    }

    getConnectionState(): ConnectionStates {
        const state = this.websocket.readyState;
        switch (state) {
            case WebSocket.CONNECTING:
                return ConnectionStates.connecting;
            case WebSocket.OPEN:
                return ConnectionStates.open;
            case WebSocket.CLOSING:
                return ConnectionStates.closing;
            case WebSocket.CLOSED:
                return ConnectionStates.closed;
            default:
                return ConnectionStates.unknown;
        }
    }

    onOpen() {
        this.emit("open", this);
    }

    onClose(code: number, reason: string) {
        this.emit('close', code, reason);
    }

    onError(err: Error) {
        console.error('❌', err.toString())
    }

    end() {
        this.websocket.removeAllListeners();
        this.websocket.close();
    }

    incoming(data: WebSocket.Data) {
        // console.log(data);
        const obj = JSON.parse(data as string);
        // console.log(obj);
        const packet = obj as Packet;
        switch (packet.name) {
            case "DatapointChanged": {
                let datapoint = packet.payload as Datapoint;
                datapoint.pairingId = <number>parseInt((<string><unknown>(datapoint.pairingId)));
                console.log(datapoint);
                this.emit("dataPointChanged", datapoint);
                break;
            }
            case "ParameterChanged": {
                console.log(packet.payload);
                let parameter = packet.payload as Parameter;
                parameter.parameterId = <number>parseInt((<string><unknown>(parameter.parameterId)));
                console.log(parameter.parameterId);
                this.emit("parameterChanged", parameter);
                break;
            }
        }
    }

    setDatapoint(nativeId: string, channel: number, pairingId: number, value: string) {
        if (this.getConnectionState() !== ConnectionStates.open)
            return;
        const packet: Packet = {
            name: "setDatapoint",
            type: "rpc",
            payload: {
                nativeId: nativeId,
                channelId: channel,
                pairingId: pairingId,
                value: value,
            }
        }
        const jsonString = JSON.stringify(packet);
        this.websocket.send(jsonString);
    }

    createDevice(deviceType: DeviceType, nativeId: string, displayName: string) {
        if (this.getConnectionState() !== ConnectionStates.open)
            return;
        const rpc: Packet = {
            type: "rpc",
            name: "createDevice",
            payload: {
                deviceType: deviceType,
                nativeId: nativeId,
                displayName: displayName
            }
        }
        this.websocket.send(JSON.stringify(rpc));
    }

}

