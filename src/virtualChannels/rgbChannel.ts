import { PairingIds, ParameterIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';
import { Datapoint } from '..';

import { uint32ToHSV, hsvTouint32, hsvToRgb, rgbToHsv } from './utilities/colorSpaceConversion';

export type ColorMode = "hsv" | "ct" | "dim";

interface ChannelEvents {
    isOnChanged(value: boolean): void;
    isForcedChanged(value: boolean): void;
    hsvChanged(h: number, s: number, v: number): void;
    colorModeChanged(mode: ColorMode): void;
    /**
     * @param ct {number} color temperature in percent
     */
    colorTemperatureChanged(ct: number): void;
    /**
     * @param brightness {number} brightness in percent
     */
    brightnessChanged(brightness: number): void;
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class RGBChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    constructor(channel: ApiVirtualChannel) {
        super(channel);
        channel.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        channel.on("parameterChanged", this.parameterChanged.bind(this));
        channel.on("sceneTriggered", this.sceneTriggered.bind(this));
    }

    setOn(isOn: boolean) {
        this.setDatapoint(PairingIds.AL_INFO_ON_OFF, (isOn) ? "1" : "0");
    }

    setForced(isForced: boolean) {
        this.setDatapoint(PairingIds.AL_INFO_FORCE, (isForced) ? "1" : "0");
    }

    setHSV(h: number, s: number, v: number) {
        this.setDatapoint(PairingIds.AL_INFO_HSV, (hsvTouint32(h, s, v)).toString());
        this.setDatapoint(PairingIds.AL_INFO_ACTUAL_DIMMING_VALUE, (v * 100).toFixed(4));
        const [r, g, b] = hsvToRgb(h, s, v);
        this.setDatapoint(PairingIds.AL_INFO_RGB, ((r << 16) + (g << 8) + (b << 0)).toString());
    }

    setColorMode(mode: ColorMode) {
        this.setDatapoint(PairingIds.AL_INFO_COLOR_MODE, mode);
    }

    setColorTemperature(ct: number) {
        this.setDatapoint(PairingIds.AL_INFO_COLOR_TEMPERATURE, ct.toFixed(0));
    }

    setBrightness(brightness: number) {
        this.setDatapoint(PairingIds.AL_INFO_ACTUAL_DIMMING_VALUE, brightness.toFixed(0));
    }

    protected dataPointChanged(id: PairingIds, value: string): void {
        switch (<PairingIds>id) {
            case PairingIds.AL_SWITCH_ON_OFF: {
                switch (value) {
                    case "1": {
                        this.emit("isOnChanged", true);
                        if (this.isAutoConfirm)
                            this.setDatapoint(PairingIds.AL_INFO_ON_OFF, value);
                        break;
                    }
                    case "0": {
                        this.emit("isOnChanged", false);
                        if (this.isAutoConfirm)
                            this.setDatapoint(PairingIds.AL_INFO_ON_OFF, value);
                        break;
                    }
                }
                break;
            }

            case PairingIds.AL_HSV: {
                const intValue = parseInt(value);
                const [h, s, v] = uint32ToHSV(intValue);
                this.emit("hsvChanged", h, s, v);
                if (this.isAutoConfirm)
                    this.setHSV(h, s, v);
                break;
            }

            case PairingIds.AL_NIGHT: {
                break;
            }

            case PairingIds.AL_COLOR_MODE: {
                const mode = value as ColorMode;
                this.emit("colorModeChanged", mode);
                if (this.isAutoConfirm) {
                    this.setColorMode(mode);
                }
                break;
            }

            case PairingIds.AL_COLOR_TEMPERATURE: {
                const ct = parseInt(value);
                this.emit("colorTemperatureChanged", ct);
                if (this.isAutoConfirm) {
                    this.setColorTemperature(ct);
                }
                break;
            }

            case PairingIds.AL_ABSOLUTE_SET_VALUE_CONTROL: {
                const brightness = parseInt(value);
                this.emit("brightnessChanged", brightness);
                if (this.isAutoConfirm) {
                    this.setBrightness(brightness);
                }
                break;
            }

        }
    }

    protected parameterChanged(id: ParameterIds, value: string): void {
    }

    protected sceneTriggered(scene: Datapoint[]): void {
        const isOn = scene.find(value => value.pairingID === PairingIds.AL_INFO_ON_OFF);
        for (const datapoint of scene) {
            switch (datapoint.pairingID) {
                case PairingIds.AL_INFO_ON_OFF:
                    this.emit("isOnChanged", ("1" === datapoint.value));
                    if (this.isAutoConfirm)
                        this.setDatapoint(PairingIds.AL_INFO_ON_OFF, datapoint.value);
                    break;
                case PairingIds.AL_INFO_HSV:
                    {
                        if (isOn?.value === "0")
                            break;
                        const intValue = parseInt(datapoint.value);
                        const [h, s, v] = uint32ToHSV(intValue);
                        this.emit("hsvChanged", h, s, v);
                        if (this.isAutoConfirm)
                            this.setHSV(h, s, v);
                        break;
                    }
            }
        }
    }
}