import { FreeAtHomeApi, PairingIds, ParameterIds } from './freeAtHomeApi';

import { Channel } from './channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
    absoluteValueChanged(value: number): void;
    isOnChanged(isOn: boolean): void;
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

enum DimmerSwitchOnMode {
    previousBrightness = "01",
    maxBrightness = "02",
}
export class FreeAtHomeDimActuatorChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    brightness: number = 0;
    isOn: boolean = false;
    isNight: boolean = false;

    minBrightness = 0;
    maxBrightnessDay = 0;
    maxBrightnessNight = 0;
    autonomousSwitchOffTimeDuration = 30 * 1000;
    dimmerSwitchOnMode = DimmerSwitchOnMode.maxBrightness;

    isForced = false;

    intervalTimer: NodeJS.Timeout | undefined = undefined;
    timedMovementTimer: NodeJS.Timeout | undefined = undefined;

    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, serialNumber: string, name: string) {
        super(freeAtHome, channelNumber, serialNumber, name, "DimActuator");
    }

    private handleSwitchOnOff(value: string) {
        if (value === "1") {
            this.isOn = true;
            this.emit("isOnChanged", true);

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

            this.emit("absoluteValueChanged", brightness)
            if (this.isAutoConfirm) {
                this.setDatapoint(PairingIds.infoActualDimmingValue, brightness.toString());
            }
        } else if (value === "0") {
            this.isOn = false;
            this.emit("isOnChanged", false);
            if (this.isAutoConfirm) {
                this.setDatapoint(PairingIds.infoActualDimmingValue, "0");
            }
        }
        if (this.isAutoConfirm) {
            this.setDatapoint(PairingIds.infoOnOff, value);
        }
    }

    private handleRelativeSetValue(value: string) {
        switch (value) {
            case "15": //dim up
                if (false === this.isOn) {
                    this.isOn = true;
                    this.brightness = this.minBrightness;
                    this.setDatapoint(PairingIds.infoOnOff, "1");
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
                    this.setDatapoint(PairingIds.infoOnOff, "1");
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
        this.emit("absoluteValueChanged", this.brightness)
        if (this.isAutoConfirm) {
            this.setDatapoint(PairingIds.infoActualDimmingValue, this.brightness.toString());
        }
    }

    private handleAbsoluteSetValue(value: string) {
        const parsedValue = parseInt(value);
        if (parsedValue === undefined)
            return;
        this.brightness = parsedValue;
        if (this.brightness < this.minBrightness)
            this.brightness = this.minBrightness;
        this.emit("absoluteValueChanged", this.brightness)
        if (this.isAutoConfirm) {
            this.setDatapoint(PairingIds.infoActualDimmingValue, this.brightness.toString());
        }
    }

    dataPointChanged(channel: number, id: PairingIds, value: string): void {
        switch (id) {
            case PairingIds.switchOnOff:
                if (false === this.isForced)
                    this.handleSwitchOnOff(value);
                break;
            case PairingIds.relativeSetValue:
                if (false === this.isForced)
                    this.handleRelativeSetValue(value);
                break;
            case PairingIds.absoluteSetValue:
                if (false === this.isForced)
                    this.handleAbsoluteSetValue(value);
                break;
            case PairingIds.timedStartStop:
                break;
            case PairingIds.forced:
                console.log("forced %s", value);
                switch (value) {
                    case "0":
                        this.isForced = false;
                        if (undefined !== this.timedMovementTimer)
                            this.handleSwitchOnOff("1");
                        this.setDatapoint(PairingIds.forcePositionInfo, "0");
                        break;
                    case "1":
                        this.isForced = false;
                        if (undefined === this.timedMovementTimer)
                            this.handleSwitchOnOff("0");
                        this.setDatapoint(PairingIds.forcePositionInfo, "0");
                        break;
                    case "2": //forced off
                        this.isForced = true;
                        this.setDatapoint(PairingIds.forcePositionInfo, "2");
                        this.handleSwitchOnOff("0");
                        break;
                    case "3": //forced on
                        this.isForced = true;
                        this.setDatapoint(PairingIds.forcePositionInfo, "3");
                        this.handleSwitchOnOff("1");
                        break;
                }
                break;
            case PairingIds.night:
                this.isNight = (value === "1");
                break;
            case PairingIds.timedMovement:
                console.log("timedMovement %s", value);
                if (undefined !== this.timedMovementTimer)
                    clearTimeout(this.timedMovementTimer);

                if (false === this.isForced && false === this.isOn)
                    this.handleSwitchOnOff("1");
                this.timedMovementTimer = setTimeout(this.timedMovement.bind(this), this.autonomousSwitchOffTimeDuration);

                break;
            case PairingIds.infoActualDimmingValue: { //this is a input datapoint, used for scenes
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

    private intervalUp() {
        console.log("test" + this.brightness);
        this.brightness += 8;
        console.log("test" + this.brightness);
        if (this.brightness > 100)
            this.brightness = 100;
        this.emit("absoluteValueChanged", this.brightness)
        if (this.isAutoConfirm) {
            this.setDatapoint(PairingIds.infoActualDimmingValue, this.brightness.toString());
        }
        console.log("test2" + this.brightness);
    }

    private intervalDown() {
        this.brightness -= 8;
        if (this.brightness < 0)
            this.brightness = 0;
        if (this.brightness < this.minBrightness)
            this.brightness = this.minBrightness;
        this.emit("absoluteValueChanged", this.brightness)
        if (this.isAutoConfirm) {
            this.setDatapoint(PairingIds.infoActualDimmingValue, this.brightness.toString());
        }
    }

    private timedMovement() {
        this.timedMovementTimer = undefined;
        if (false === this.isForced)
            this.handleSwitchOnOff("0");
    }

    setValue(value: number): void {
        this.setDatapoint(PairingIds.infoActualDimmingValue, <string><unknown>value);
    }

    setOnOff(isOn: boolean): void {
        this.setDatapoint(PairingIds.infoOnOff, (isOn) ? "1" : "0");
    }
}
