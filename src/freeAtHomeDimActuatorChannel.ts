import { FreeAtHomeApi, DatapointIds, ParameterIds } from './freeAtHomeApi';
import { NodeState, FreeAtHomeChannelInterface, FreeAtHomeDelegateInterface } from './freeAtHomeDeviceInterface';
import { DeviceType } from '.';

export declare interface FreeAtHomeDimActuatorDelegateInterface extends FreeAtHomeDelegateInterface {
    setAbsoluteValue(value: number): void;
    setIsOn(isOn: boolean): void;

    on(event: 'valueChanged', listener: (position: number) => void): this;
    on(event: 'isOnChanged', listener: (isOn: boolean) => void): this;
}

enum DimmerSwitchOnMode {
    previousBrightness = "01",
    maxBrightness = "02",
}

export class FreeAtHomeDimActuatorChannel implements FreeAtHomeChannelInterface {
    deviceType: DeviceType = DeviceType.dimActuator;
    channelNumber: number;
    serialNumber: string;
    name: string;
    freeAtHome: FreeAtHomeApi;
    delegate: FreeAtHomeDimActuatorDelegateInterface;

    brightness: number = 0;
    isOn: boolean = false;
    isNight: boolean;
    isAutoConfirm: boolean;

    minBrightness = 0;
    maxBrightnessDay = 0;
    maxBrightnessNight = 0;
    autonomousSwitchOffTimeDuration = 30 * 1000;
    dimmerSwitchOnMode = DimmerSwitchOnMode.maxBrightness;

    isForced = false;

    intervalTimer: NodeJS.Timeout | undefined = undefined;
    timedMovementTimer: NodeJS.Timeout | undefined = undefined;

    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, serialNumber: string, name: string, delegate: FreeAtHomeDimActuatorDelegateInterface, isAutoConfirm: boolean = false) {
        this.freeAtHome = freeAtHome;
        this.channelNumber = channelNumber;
        this.serialNumber = serialNumber;
        this.name = name;
        this.isAutoConfirm = isAutoConfirm;

        this.isNight = false;

        this.delegate = delegate;

        delegate.on("valueChanged", this.delegateValueChanged.bind(this));
        delegate.on("isOnChanged", this.delegateIsOnChanged.bind(this));
    }

    handleSwitchOnOff(value: string) {
        if (value === "1") {
            this.isOn = true;
            this.delegate.setIsOn(true);

            const maxTurnOnBrightness = (true === this.isNight) ? this.maxBrightnessNight : this.maxBrightnessDay;
            let brightness = 0;
            if (this.dimmerSwitchOnMode === DimmerSwitchOnMode.maxBrightness)
                brightness = maxTurnOnBrightness;
            else if (this.dimmerSwitchOnMode === DimmerSwitchOnMode.previousBrightness)
                brightness = this.brightness;

            if (brightness < this.minBrightness)
                brightness = this.minBrightness;

            if (brightness > maxTurnOnBrightness) {
                brightness = maxTurnOnBrightness;
            }
            this.brightness = brightness;

            this.delegate.setAbsoluteValue(brightness);
            if (this.isAutoConfirm) {
                this.setDatapoint(this.freeAtHome, DatapointIds.infoActualDimmingValue, brightness.toString());
            }
        } else if (value === "0") {
            this.isOn = false;
            this.delegate.setIsOn(false);
            if (this.isAutoConfirm) {
                this.setDatapoint(this.freeAtHome, DatapointIds.infoActualDimmingValue, "0");
            }
        }
        if (this.isAutoConfirm) {
            this.setDatapoint(this.freeAtHome, DatapointIds.infoOnOff, value);

        }
    }

    handleRelativeSetValue(value: string) {
        switch (value) {
            case "15": //dim up
                if (false === this.isOn) {
                    this.isOn = true;
                    this.brightness = this.minBrightness;
                    this.setDatapoint(this.freeAtHome, DatapointIds.infoOnOff, "1");
                }
                this.brightness += 2;
                if (this.brightness > 100)
                    this.brightness = 100;
                if (this.brightness < this.minBrightness)
                    this.brightness = this.minBrightness;
                break;

            case "7": // dim down
                if (false === this.isOn) {
                    return;
                }
                this.brightness -= 2;
                if (this.brightness < 0)
                    this.brightness = 0;
                if (this.brightness < this.minBrightness)
                    this.brightness = this.minBrightness;
                break;

            case "9": //start dim up
                if (false === this.isOn) {
                    this.isOn = true;
                    this.brightness = this.minBrightness;
                    this.setDatapoint(this.freeAtHome, DatapointIds.infoOnOff, "1");
                }
                if (this.intervalTimer !== undefined)
                    clearInterval(this.intervalTimer);
                this.intervalTimer = setInterval(this.intervalUp.bind(this), 500);
                break;

            case "1": //start dim down
                if (this.intervalTimer !== undefined)
                    clearInterval(this.intervalTimer);
                if (false === this.isOn) {
                    return;
                }
                this.intervalTimer = setInterval(this.intervalDown.bind(this), 500);
                break;

            case "8": //stop dim up
            case "0": //stop dim down
                if (this.intervalTimer !== undefined) {
                    clearInterval(this.intervalTimer);
                    this.intervalTimer = undefined;
                }
                return;
        }
        this.delegate.setAbsoluteValue(this.brightness);
        if (this.isAutoConfirm) {
            this.setDatapoint(this.freeAtHome, DatapointIds.infoActualDimmingValue, this.brightness.toString());
        }
    }

    handleAbsoluteSetValue(value: string) {
        const parsedValue = parseInt(value);
        if (parsedValue === undefined)
            return;
        this.brightness = parsedValue;
        if (this.brightness < this.minBrightness)
            this.brightness = this.minBrightness;
        this.delegate.setAbsoluteValue(this.brightness);
        if (this.isAutoConfirm) {
            this.setDatapoint(this.freeAtHome, DatapointIds.infoActualDimmingValue, this.brightness.toString());
        }
    }

    dataPointChanged(channel: number, id: DatapointIds, value: string): void {
        switch (id) {
            case DatapointIds.switchOnOff:
                if (false === this.isForced)
                    this.handleSwitchOnOff(value);
                break;
            case DatapointIds.relativeSetValue:
                if (false === this.isForced)
                    this.handleRelativeSetValue(value);
                break;
            case DatapointIds.absoluteSetValue:
                if (false === this.isForced)
                    this.handleAbsoluteSetValue(value);
                break;
            case DatapointIds.timedStartStop:
                break;
            case DatapointIds.forced:
                console.log("forced %s", value);
                switch (value) {
                    case "0":
                        this.isForced = false;
                        if (undefined !== this.timedMovementTimer)
                            this.handleSwitchOnOff("1");
                        this.setDatapoint(this.freeAtHome, DatapointIds.forcePositionInfo, "0");
                        break;
                    case "1":
                        this.isForced = false;
                        if (undefined === this.timedMovementTimer)
                            this.handleSwitchOnOff("0");
                        this.setDatapoint(this.freeAtHome, DatapointIds.forcePositionInfo, "0");
                        break;
                    case "2": //forced off
                        this.isForced = true;
                        this.setDatapoint(this.freeAtHome, DatapointIds.forcePositionInfo, "2");
                        this.handleSwitchOnOff("0");
                        break;
                    case "3": //forced on
                        this.isForced = true;
                        this.setDatapoint(this.freeAtHome, DatapointIds.forcePositionInfo, "3");
                        this.handleSwitchOnOff("1");
                        break;
                }
                break;
            case DatapointIds.night:
                this.isNight = (value === "1");
                break;
            case DatapointIds.timedMovement:
                console.log("timedMovement %s", value);
                if (undefined !== this.timedMovementTimer)
                    clearTimeout(this.timedMovementTimer);

                if (false === this.isForced && false === this.isOn)
                    this.handleSwitchOnOff("1");
                this.timedMovementTimer = setTimeout(this.timedMovement.bind(this), this.autonomousSwitchOffTimeDuration);

                break;
            case DatapointIds.infoActualDimmingValue: { //this is a input datapoint, used for scenes
                if (false === this.isForced) {
                    if (value === "0")
                        this.handleSwitchOnOff("0");
                    else
                        this.handleSwitchOnOff("1");
                    this.handleAbsoluteSetValue(value);
                }
            }
            default:
                console.log("unknown id: %s", id);
                break;
        }
        // throw new Error("Method not implemented.");
    }

    parameterChanged(id: ParameterIds, value: string): void {
        // throw new Error("Method not implemented.");
        switch (id) {
            case ParameterIds.dimmingActuatorMinBrightness: {
                const parsedValue = parseInt(value);
                if (parsedValue !== undefined)
                    this.minBrightness = parsedValue;
                break;
            }
            case ParameterIds.dimmingActuatorMaxBrightnessDay: {
                const parsedValue = parseInt(value);
                if (parsedValue !== undefined)
                    this.maxBrightnessDay = parsedValue;
                break;
            }
            case ParameterIds.dimmingActuatorMaxBrightnessNight: {
                const parsedValue = parseInt(value);
                if (parsedValue !== undefined)
                    this.maxBrightnessNight = parsedValue;
                break;
            }
            case ParameterIds.autonomousSwitchOffTimeDuration: {
                const parsedValue = parseInt(value);
                if (parsedValue !== undefined)
                    this.autonomousSwitchOffTimeDuration = parsedValue * 1000;
                break;
            }
            case ParameterIds.dimmerSwitchOnMode:
                this.dimmerSwitchOnMode = <DimmerSwitchOnMode>value;
                break;


            default:
                console.log("parameter %s : %s", id, value);
                break;
        }
    }

    intervalUp() {
        console.log("test" + this.brightness);
        this.brightness += 8;
        console.log("test" + this.brightness);
        if (this.brightness > 100)
            this.brightness = 100;
        this.delegate.setAbsoluteValue(this.brightness);
        if (this.isAutoConfirm) {
            this.setDatapoint(this.freeAtHome, DatapointIds.infoActualDimmingValue, this.brightness.toString());
        }
        console.log("test2" + this.brightness);
    }

    intervalDown() {
        this.brightness -= 8;
        if (this.brightness < 0)
            this.brightness = 0;
        if (this.brightness < this.minBrightness)
            this.brightness = this.minBrightness;
        this.delegate.setAbsoluteValue(this.brightness);
        if (this.isAutoConfirm) {
            this.setDatapoint(this.freeAtHome, DatapointIds.infoActualDimmingValue, this.brightness.toString());
        }
    }

    timedMovement() {
        this.timedMovementTimer = undefined;
        if (false === this.isForced)
            this.handleSwitchOnOff("0");
    }

    delegateValueChanged(value: number): void {
        this.setDatapoint(this.freeAtHome, DatapointIds.infoActualDimmingValue, <string><unknown>value);
    }

    delegateIsOnChanged(isOn: boolean): void {
        this.setDatapoint(this.freeAtHome, DatapointIds.infoOnOff, (isOn) ? "1" : "0");
    }

    setDatapoint(freeAtHome: FreeAtHomeApi, datapointId: DatapointIds, value: string) {
        const { channelNumber, serialNumber } = this;
        freeAtHome.setDatapoint(serialNumber, channelNumber, datapointId, value);
    }
}
