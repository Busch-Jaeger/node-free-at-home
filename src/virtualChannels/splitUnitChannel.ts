import { PairingIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';
import { Mixin } from 'ts-mixer';
import { Capabilities, Datapoint } from '..';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
    setPointTemperatureChanged(value: number): void;
    isOnChanged(value: boolean): void;
    setModeAuto(): void;
    setModeCooling(): void;
    setModeDry(): void;
    setModeAiComfort(): void;
    setModeCoolClean(): void;
    setModeDryClean(): void;
    setModeWind(): void;
    setModeHeating(): void;
    setFanSpeed(value: number): void;
    setSwingMode(value: SplitUnitChannel.SupportedSwingModes): void;
    isWindowOpen(value: boolean): void;
}

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class SplitUnitChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    private setPointTemperature: number = 21.0;
    private swingOn = false;
    private windowOpen = false;
    private isOn = false;
    private mode = 1; // AUTO

    constructor(channel: ApiVirtualChannel, supportedOperations?: SplitUnitChannel.SupportedOperations, capabilities?: Capabilities.CAP_SWING_MODES[]) {
        super(channel);
        channel.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        channel.on("sceneTriggered", this.sceneTriggered.bind(this));
        this.sendStatus();
        if (undefined !== supportedOperations) {
            this.sendSupportedFeatures(supportedOperations);
            this.setSupportedOperations(supportedOperations);
        }
        else {
            this.sendSupportedFeatures({ auto: true, cool: true, heat: true });
            this.setSupportedOperations({ auto: true, cool: true, heat: true });
        }
        this.setSupportedSwingModes(supportedOperations?.swingModes);
    }

    /**
    * handle changes in incoming datapoints. Those events trigger a channel event.
    * @param id 
    * @param value 
    */
    protected dataPointChanged(id: PairingIds, value: string): void {
        switch (<PairingIds>id) {
            case PairingIds.AL_RELATIVE_SET_POINT_REQUEST: {
                const intValue = Number.parseFloat(value);
                this.setPointTemperature = 21 + intValue;
                if (this.isAutoConfirm)
                    this.sendSetPointTemperature(this.setPointTemperature);
                this.emit("setPointTemperatureChanged", this.setPointTemperature);
            }
                break;
            case PairingIds.AL_INFO_ABSOLUTE_SET_POINT_REQUEST:
                {
                    const intValue = Number.parseFloat(value);
                    if (this.isAutoConfirm)
                        this.sendSetPointTemperature(intValue);
                    this.emit("setPointTemperatureChanged", intValue);
                }
                break;

            case PairingIds.AL_CONTROLLER_ON_OFF_REQUEST:
                this.emit("isOnChanged", value === "1");
                if (this.isAutoConfirm)
                    this.setOn(value === "1");
                break;

            case PairingIds.AL_INFO_SWING_MODE:
                this.setSwingOn(value === "1");
                break;

            case PairingIds.AL_FAN_STAGE_REQUEST:
                if (value === '4')
                    value = '0';
                if (this.isAutoConfirm) {
                    this.setDatapoint(PairingIds.AL_FAN_COIL_LEVEL, value);
                }
                this.emit("setFanSpeed", parseInt(value));
                break;
            case PairingIds.AL_OPERATION_MODE:
                {
                    const intValue = Number.parseInt(value) & 0xf;
                    switch (intValue) {
                        case 1:
                            if (this.isAutoConfirm)
                                this.setModeAuto();
                            this.emit("setModeAuto");
                            break;
                        case 2:
                            if (this.isAutoConfirm)
                                this.setModeHeating();
                            this.emit("setModeHeating");
                            break;
                        case 3:
                            if (this.isAutoConfirm)
                                this.setModeCooling();
                            this.emit("setModeCooling");
                            break;
                        case 4:
                            if (this.isAutoConfirm)
                                this.setModeWind();
                            this.emit("setModeWind");
                            break;
                        case 5:
                            if (this.isAutoConfirm)
                                this.setModeDry();
                            this.emit("setModeDry");
                            break;
                    }
                }
                break;
            case PairingIds.AL_OPERATION_MODE_32:
                {
                    const enumValue = Number.parseInt(value) as SplitUnitChannel.Operations;

                    switch (enumValue) {
                        case SplitUnitChannel.Operations.auto:
                            if (this.isAutoConfirm)
                                this.setModeAuto();
                            this.emit("setModeAuto");
                            break;
                        case SplitUnitChannel.Operations.cool:
                            if (this.isAutoConfirm)
                                this.setModeCooling();
                            this.emit("setModeCooling");
                            break;
                        case SplitUnitChannel.Operations.dry:
                            if (this.isAutoConfirm)
                                this.setModeDry();
                            this.emit("setModeDry");
                            break;
                        case SplitUnitChannel.Operations.wind:
                            if (this.isAutoConfirm)
                                this.setModeWind();
                            this.emit("setModeWind")
                            break;
                        case SplitUnitChannel.Operations.ai_comfort:
                            if (this.isAutoConfirm)
                                this.setModeAiComfort();
                            this.emit("setModeAiComfort")
                            break;
                        case SplitUnitChannel.Operations.cool_clean:
                            if (this.isAutoConfirm)
                                this.setModeCoolClean();
                            this.emit("setModeCoolClean")
                            break;
                        case SplitUnitChannel.Operations.dry_clean:
                            if (this.isAutoConfirm)
                                this.setModeDryClean();
                            this.emit("setModeDryClean")
                            break;
                        case SplitUnitChannel.Operations.heat:
                            if (this.isAutoConfirm)
                                this.setModeHeating();
                            this.emit("setModeHeating");
                            break;
                        default:
                            return;
                    }
                }
                break;
            case PairingIds.AL_WINDOW_DOOR:
                this.emit("isWindowOpen", value === "1");
                if (this.isAutoConfirm) {
                    this.windowOpen = value === "1";
                    this.sendStatus();
                }
                break;
        }
    }

    public setDatapoint(id: PairingIds, value: string): Promise<void> {
        return super.setDatapoint(id, value);
    }

    async setOn(isOn: boolean) {
        this.isOn = isOn;
        await this.sendStatus();

        if (this.channel.outputPairingToPosition.has(PairingIds.AL_CONTROLLER_ON_OFF))
            await this.setDatapoint(PairingIds.AL_CONTROLLER_ON_OFF, (isOn) ? "1" : "0");
    }

    async setSupportedSwingModes(modes?: SplitUnitChannel.SupportedSwingModes) {
        let value = 0;
        if (modes?.horizontal)
            value += 1 << 0;
        if (modes?.vertical)
            value += 1 << 1;
        
        if(this.channel.outputPairingToPosition.has(PairingIds.AL_INFO_SUPPORTED_SWING_MODE))
            await this.setDatapoint(PairingIds.AL_INFO_SUPPORTED_SWING_MODE, value.toString());
    }

    setSwingOn(swingOn: boolean) {
        if (this.swingOn !== swingOn) {
            this.swingOn = swingOn;
            this.sendStatus();
        }
    }

    protected async setSupportedOperations(supportedOperations: SplitUnitChannel.SupportedOperations) {
        let value: number = 0;
        if (supportedOperations?.auto)
            value |= SplitUnitChannel.Operations.auto as number;
        if (supportedOperations?.cool)
            value |= SplitUnitChannel.Operations.cool as number;
        if (supportedOperations?.dry)
            value |= SplitUnitChannel.Operations.dry as number;
        if (supportedOperations?.wind)
            value |= SplitUnitChannel.Operations.wind as number;
        if (supportedOperations?.ai_comfort)
            value |= SplitUnitChannel.Operations.ai_comfort as number;
        if (supportedOperations?.cool_clean)
            value |= SplitUnitChannel.Operations.cool_clean as number;
        if (supportedOperations?.dry_clean)
            value |= SplitUnitChannel.Operations.dry_clean as number;
        if (supportedOperations?.heat)
            value |= SplitUnitChannel.Operations.heat as number;
        
        if(this.channel.outputPairingToPosition.has(PairingIds.AL_INFO_SUPPORTED_OPERATION_MODE_32))
            this.setDatapoint(PairingIds.AL_INFO_SUPPORTED_OPERATION_MODE_32, value.toString());
    }

    public async setModeAuto() {
        await this.setMode(1);
        if (this.channel.outputPairingToPosition.has(PairingIds.AL_INFO_OPERATION_MODE_32))
            await this.setDatapoint(PairingIds.AL_INFO_OPERATION_MODE_32, (SplitUnitChannel.Operations.auto as number).toString());
    }

    public async setModeHeating() {
        await this.setMode(2);
        if (this.channel.outputPairingToPosition.has(PairingIds.AL_INFO_OPERATION_MODE_32))
            await this.setDatapoint(PairingIds.AL_INFO_OPERATION_MODE_32, (SplitUnitChannel.Operations.heat as number).toString());
    }

    public async setModeCooling() {
        await this.setMode(3);
        if (this.channel.outputPairingToPosition.has(PairingIds.AL_INFO_OPERATION_MODE_32))
            await this.setDatapoint(PairingIds.AL_INFO_OPERATION_MODE_32, (SplitUnitChannel.Operations.cool as number).toString());
    }

    public async setModeDry() {
        await this.setMode(5);
        if (this.channel.outputPairingToPosition.has(PairingIds.AL_INFO_OPERATION_MODE_32))
            await this.setDatapoint(PairingIds.AL_INFO_OPERATION_MODE_32, (SplitUnitChannel.Operations.dry as number).toString());
    }

    public async setModeAiComfort() {
        await this.setMode(1);
        if (this.channel.outputPairingToPosition.has(PairingIds.AL_INFO_OPERATION_MODE_32))
            await this.setDatapoint(PairingIds.AL_INFO_OPERATION_MODE_32, (SplitUnitChannel.Operations.ai_comfort as number).toString());
    }

    public async setModeCoolClean() {
        await this.setMode(1);
        if (this.channel.outputPairingToPosition.has(PairingIds.AL_INFO_OPERATION_MODE_32))
            await this.setDatapoint(PairingIds.AL_INFO_OPERATION_MODE_32, (SplitUnitChannel.Operations.cool_clean as number).toString());
    }

    public async setModeDryClean() {
        await this.setMode(1);
        if (this.channel.outputPairingToPosition.has(PairingIds.AL_INFO_OPERATION_MODE_32))
            await this.setDatapoint(PairingIds.AL_INFO_OPERATION_MODE_32, (SplitUnitChannel.Operations.dry_clean as number).toString());
    }

    public async setModeWind() {
        await this.setMode(4);
        if (this.channel.outputPairingToPosition.has(PairingIds.AL_INFO_OPERATION_MODE_32))
            await this.setDatapoint(PairingIds.AL_INFO_OPERATION_MODE_32, (SplitUnitChannel.Operations.wind as number).toString());
    }

    public async setFanSpeed(value: number) {
        if(value > 3)
            value = 3;
        await this.setDatapoint(PairingIds.AL_FAN_COIL_LEVEL, value.toString());
    }

    public async setSwingMode(value: SplitUnitChannel.SupportedSwingModes) {
        let mode = 0;
        if (value?.horizontal)
            mode |= 1 << 0;
        if (value?.vertical)
            mode |= 1 << 1;
        if (this.channel.outputPairingToPosition.has(PairingIds.AL_INFO_SWING_MODE))
            await this.setDatapoint(PairingIds.AL_INFO_SWING_MODE, mode.toString());
    }

    protected async setMode(mode: number) {
        this.mode = mode;
        await this.sendStatus();
    }

    protected async sendStatus() {
        if(false === this.channel.outputPairingToPosition.has(PairingIds.AL_EXTENDED_STATUS))
            return;
        let status = this.mode;
        if (this.isOn) {
            status |= 1 << 5;
        }
        if (this.swingOn) {
            status |= 1 << 6;
        }
        if (this.windowOpen) {
            status |= 1 << 9;
        }

        await this.setDatapoint(PairingIds.AL_EXTENDED_STATUS, status.toString());

        let legacyStatus = 0;
        legacyStatus |= 1 << 0; // comfort mode active
        legacyStatus |= 1 << 6; // controller inactive
        if (this.windowOpen)
            legacyStatus |= 1 << 3;
        await this.setDatapoint(PairingIds.AL_STATE_INDICATION, legacyStatus.toString());
    }

    protected sendSupportedFeatures(supportedOperations: SplitUnitChannel.LegacySupportedOperations) {
        if (false === this.channel.outputPairingToPosition.has(PairingIds.AL_SUPPORTED_FEATURES))
            return;
        let value = 0
        if (supportedOperations?.auto)
            value |= SplitUnitChannel.LegacyOperations.auto as number;
        if (supportedOperations?.heat)
            value |= SplitUnitChannel.LegacyOperations.heat as number;
        if (supportedOperations?.cool)
            value |= SplitUnitChannel.LegacyOperations.cool as number;
        if (supportedOperations?.dry)
            value |= SplitUnitChannel.LegacyOperations.dry as number;
        if (supportedOperations?.wind)
            value |= SplitUnitChannel.LegacyOperations.wind as number;
        // The id is encoded in bits 16-31. 
        value |= 1 << 16; // set remote id to 1, just not set it to 0
        this.setDatapoint(PairingIds.AL_SUPPORTED_FEATURES, value.toString());
    }

    public async sendSetPointTemperature(value: number) {
        this.setPointTemperature = value;
        await this.setDatapoint(PairingIds.AL_SET_POINT_TEMPERATURE, value.toFixed());
        await this.setDatapoint(PairingIds.AL_RELATIVE_SET_POINT_TEMPERATURE, (value - 21).toFixed());
    }

    protected sceneTriggered(scene: Datapoint[]): void {
        for (const datapoint of scene) {
            const value = datapoint.value;
            switch (datapoint.pairingID) {
                case PairingIds.AL_SET_POINT_TEMPERATURE:
                    {
                        const floatValue = Number.parseFloat(value);
                        if (this.isAutoConfirm)
                            this.sendSetPointTemperature(floatValue);
                        this.emit("setPointTemperatureChanged", floatValue);
                    }
                    break;
                case PairingIds.AL_STATE_INDICATION:
                    break;
                case PairingIds.AL_CONTROLLER_ON_OFF:
                    if (this.isAutoConfirm)
                        this.setOn(value === "1");
                    this.emit("isOnChanged", value === "1");
                    break;
                    
            }
        }
        
        const infoOperationMode = scene.find((datapoint) => {
            return datapoint.pairingID === PairingIds.AL_INFO_OPERATION_MODE_32;
        })
        if (undefined !== infoOperationMode) {
            const enumValue = Number(infoOperationMode.value) as SplitUnitChannel.Operations;

            switch (enumValue) {
                case SplitUnitChannel.Operations.auto:
                    if (this.isAutoConfirm)
                        this.setModeAuto();
                    this.emit("setModeAuto");
                    break;
                case SplitUnitChannel.Operations.cool:
                    if (this.isAutoConfirm)
                        this.setModeCooling();
                    this.emit("setModeCooling");
                    break;
                case SplitUnitChannel.Operations.dry:
                    if (this.isAutoConfirm)
                        this.setModeDry();
                    this.emit("setModeDry");
                    break;
                case SplitUnitChannel.Operations.wind:
                    if (this.isAutoConfirm)
                        this.setModeWind();
                    this.emit("setModeWind")
                    break;
                case SplitUnitChannel.Operations.ai_comfort:
                    if (this.isAutoConfirm)
                        this.setModeAiComfort();
                    this.emit("setModeAiComfort")
                    break;
                case SplitUnitChannel.Operations.cool_clean:
                    if (this.isAutoConfirm)
                        this.setModeCoolClean();
                    this.emit("setModeCoolClean")
                    break;
                case SplitUnitChannel.Operations.dry_clean:
                    if (this.isAutoConfirm)
                        this.setModeDryClean();
                    this.emit("setModeDryClean")
                    break;
                case SplitUnitChannel.Operations.heat:
                    if (this.isAutoConfirm)
                        this.setModeHeating();
                    this.emit("setModeHeating");
                    break;
                default:
                    return;
            }
        }
        else {
            const extendedStatus = scene.find((datapoint) => {
                return datapoint.pairingID === PairingIds.AL_EXTENDED_STATUS;
            })
            if(undefined !== extendedStatus)
            {
                const intValue = Number.parseInt(extendedStatus.value) & 0xf;
                switch (intValue) {
                    case 1:
                        if (this.isAutoConfirm)
                            this.setModeAuto();
                        this.emit("setModeAuto");
                        break;
                    case 2:
                        if (this.isAutoConfirm)
                            this.setModeHeating();
                        this.emit("setModeHeating");
                        break;
                    case 3:
                        if (this.isAutoConfirm)
                            this.setModeCooling();
                        this.emit("setModeCooling");
                        break;
                        case 4:
                            if (this.isAutoConfirm)
                                this.setModeWind();
                            this.emit("setModeWind");
                            break;
                        case 5:
                            if (this.isAutoConfirm)
                                this.setModeDry();
                            this.emit("setModeDry");
                            break;
                }
            }
        }
    }
}

export namespace SplitUnitChannel {
    export interface LegacySupportedOperations {
        auto?: boolean;
        heat?: boolean;
        cool?: boolean;
        dry?: boolean,
        wind?: boolean,
    }

    export enum LegacyOperations {
        auto = 1 << 0,
        heat = 1 << 1,
        cool = 1 << 2,
        dry = 1 << 3,
        wind = 1 << 4,
    }

    export interface SupportedSwingModes {
        horizontal?: boolean;
        vertical?: boolean;
    }

    export interface SupportedOperations extends LegacySupportedOperations {
        auto?: boolean;
        cool?: boolean;
        dry?: boolean;
        wind?: boolean;
        ai_comfort?: boolean;
        cool_clean?: boolean;
        dry_clean?: boolean;
        heat?: boolean;
        swingModes?: SupportedSwingModes;
    }

    export enum Operations {
        auto = 1 << 0,
        cool = 1 << 1,
        dry = 1 << 2,
        wind = 1 << 3,
        ai_comfort = 1 << 4,
        cool_clean = 1 << 5,
        dry_clean = 1 << 6,
        heat = 1 << 7,
    }
}