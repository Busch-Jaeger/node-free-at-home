import { PairingIds, ParameterIds } from '../freeAtHomeApi';
import { ApiVirtualChannel } from "../api/apiVirtualChannel";
import { Channel } from '../channel';
import { Mixin } from 'ts-mixer';

import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

interface ChannelEvents {
    datapointChanged(id: PairingIds, value: string): void;
    parameterChanged(id: ParameterIds, value: string): void;
    switchCharging(value: boolean): void;
    ecoCharging(value: boolean): void;
    isChargingEnabledChanged(value: boolean): void;
    currentExcessPower(value: number): void;
    chargerLimit(value: number): void;
    minimumChargerLimit(value: number): void;
    freeVending(value: boolean): void;
    usedPhases(value: number): void;
    unlock(): void;
    togglePause(): void;
}

enum STATE {
    // first 16 bits are error states from StatusNotification
    NO_ERROR = 0,
    CONNECTOR_LOCK = 1,
    EVCOMMUNICATION_ERROR = 2,
    GROUND_FAILURE = 3,
    TEMPERATURE_ALERT = 4,
    INTERNAL_ERROR = 5,
    LOCAL_LIST_CONFLICT = 6,
    OTHER_ERROR = 7,
    OVER_CURRENT = 8,
    OVER_VOLTAGE = 9,
    POWERMETER_FAILURE = 10,
    POWERSWITCH_FAILURE = 11,
    READER_FAILURE = 12,
    RESET_FAILURE = 13,
    UNDER_VOLTAGE = 14,
    WEAK_SIGNAL = 15,
    // States from StatusNotification
    AVAILABLE = 16,
    PREPARING = 17,
    CHARGING = 18,
    SUSPENDED_EVSE = 19,
    SUSPENDED_EV = 20,
    FINISHING = 21,
    RESERVED = 22,
    UNAVAILABLE = 23,
    FAULTED = 24,
    // other states start here
    AUTHORIZE_REMOTE_TX_REQUESTS = 28,
    CAR_PLUGGED_IN = 29,
    AUTHORIZATION_GRANTED = 30,
    BATTERY_FULL = 31
}

const errorMapping = new Map([
    ["ConnectorLockFailure", STATE.CONNECTOR_LOCK],
    ["EVCommunicationError", STATE.EVCOMMUNICATION_ERROR],
    ["GroundFailure", STATE.GROUND_FAILURE],
    ["HighTemperature", STATE.TEMPERATURE_ALERT],
    ["InternalError", STATE.INTERNAL_ERROR],
    ["LocalListConflict", STATE.LOCAL_LIST_CONFLICT],
    ["NoError", STATE.NO_ERROR],
    ["OtherError", STATE.OTHER_ERROR],
    ["OverCurrentFailure", STATE.OVER_CURRENT],
    ["OverVoltage", STATE.OVER_VOLTAGE],
    ["PowerMeterFailure", STATE.POWERMETER_FAILURE],
    ["PowerSwitchFailure", STATE.POWERSWITCH_FAILURE],
    ["ReaderFailure", STATE.READER_FAILURE],
    ["ResetFailure", STATE.RESET_FAILURE],
    ["UnderVoltage", STATE.UNDER_VOLTAGE],
    ["WeakSignal", STATE.WEAK_SIGNAL]
])
const statusMapping = new Map([
    ["Available", STATE.AVAILABLE],
    ["Preparing", STATE.PREPARING],
    ["Charging", STATE.CHARGING],
    ["SuspendedEVSE", STATE.SUSPENDED_EVSE],
    ["SuspendedEV", STATE.SUSPENDED_EV],
    ["Finishing", STATE.FINISHING],
    ["Reserved", STATE.RESERVED],
    ["Unavailable", STATE.UNAVAILABLE],
    ["Faulted", STATE.FAULTED]
])

type ChannelEmitter = StrictEventEmitter<EventEmitter, ChannelEvents>;

export class EvChargerChannel extends Mixin(Channel, (EventEmitter as { new(): ChannelEmitter })) {
    // states encoded in AL_INFO_WALLBOX_STATUS
    protected carPluggedIn = false
    protected authorizationGranted = false
    protected batteryFull = false
    protected blackoutPrevention = false
    protected groundFault = false
    // OCPP StatusNotification.errorCode
    protected errorState: string = ""
    // OCPP StatusNotification.status
    protected _status: string = ""
    protected paused = false
    protected authorizeRemoteTxRequests = false

    // capabilities
    protected _supportsEco: boolean = false;
    protected _supportsPhases: boolean = false;
    protected _supportsFreeVending: boolean = false;
    protected _supportsSwitchOff: boolean = false;
    protected _supportsDisableCharging: boolean = false;
    protected _supportsCurrentLimit: boolean = false;
    protected _supportsEnergyTotal: boolean = false;
    protected _supportsEnergyToday: boolean = false;

    constructor(channel: ApiVirtualChannel){
        super(channel);
        channel.on("inputDatapointChanged", this.dataPointChanged.bind(this));
        channel.on("parameterChanged", this.parameterChanged.bind(this));

        // check capabilities

        // CAP_ECO_CHARGING = 0x0015, supports eco charging
        this._supportsEco = channel.inputPairingToPosition.has(PairingIds.AL_SWITCH_ECO_CHARGING_ON_OFF);        

        // CAP_PHASES = 0x0016, supports different numbers of phases
        this._supportsPhases = channel.inputPairingToPosition.has(PairingIds.AL_USED_PHASES);

        // CAP_FREE_VENDING = 0x0017, supports free vending
        this._supportsFreeVending = channel.inputPairingToPosition.has(PairingIds.AL_FREE_VENDING);

        // CAP_DISABLE_CHARGING = 0x0018, supports disable charging
        this._supportsDisableCharging = channel.inputPairingToPosition.has(PairingIds.AL_STOP_ENABLE_CHARGING_REQUEST);

        // CAP_SWITCH_ON_OFF = 0x0020, supports switching on/off
        this._supportsSwitchOff = channel.inputPairingToPosition.has(PairingIds.AL_SWITCH_CHARGING);

        // CAP_CURRENT_LIMIT = 0x001E, supports limitation of current
        this._supportsCurrentLimit = channel.inputPairingToPosition.has(PairingIds.AL_LIMIT_FOR_CHARGER);

        // CAP_CURRENT_LIMIT = 0x001E, supports limitation of current
        this._supportsCurrentLimit = channel.inputPairingToPosition.has(PairingIds.AL_LIMIT_FOR_CHARGER);

        // CAP_ENERGY_TOTAL = 0x0012, supports total energy counter
        this._supportsEnergyTotal = channel.outputPairingToPosition.has(PairingIds.AL_MEASURED_TOTAL_ENERGY_EXPORTED);

        // CAP_ENERGY_TODAY = 0x0011, supports total energy counter
        this._supportsEnergyToday = channel.outputPairingToPosition.has(PairingIds.AL_MEASURED_EXPORTED_ENERGY_TODAY);
    }
    

    get supportsEco() {
        return this._supportsEco
    }

    get supportsPhases() {
        return this._supportsPhases
    }

    get supportsFreeVending() {
        return this._supportsFreeVending
    }

    get supportsSwitchOnOff() {
        return this._supportsSwitchOff
    }

    get supportsDisableCharging() {
        return this._supportsDisableCharging
    }

    /**
     * handle changes in incoming datapoints. Those events trigger a channel event.
     * @param id 
     * @param value 
     */
    protected dataPointChanged(id: PairingIds, value: string): void {
        switch (<PairingIds>id) {           
            case PairingIds.AL_SWITCH_CHARGING:
                this.emit("switchCharging", value === "1")
                break

            case PairingIds.AL_STOP_ENABLE_CHARGING_REQUEST:
                this.emit("isChargingEnabledChanged", value === "1")
                break

            case PairingIds.AL_SWITCH_ECO_CHARGING_ON_OFF:
                this.emit("ecoCharging", value === "1")
                break

            case PairingIds.AL_MEASURED_CURRENT_EXCESS_POWER:
                this.emit("currentExcessPower", parseInt(value))
                break

            case PairingIds.AL_LIMIT_FOR_CHARGER:
                this.emit("chargerLimit", parseFloat(value))
                break

            case PairingIds.AL_MIN_CHARGING_CURRENT_ECO:
                this.emit("minimumChargerLimit", parseFloat(value))
                break     
            
            case PairingIds.AL_FREE_VENDING:
                this.emit("freeVending", value === "1")
                break          
            
            case PairingIds.AL_USED_PHASES:
                this.emit("usedPhases", parseFloat(value))
                break               

            case PairingIds.AL_UNLOCK:
                this.emit("unlock")
                break

            case PairingIds.AL_PAUSE_CHARGING:
                this.emit("togglePause");
        }
    }

    protected parameterChanged(id: ParameterIds, value: string): void {
    }

    private _toggleBit(value: number, set: boolean, position: STATE) {
        const mask = 1 << position;
        if (set) {
            value |= mask
        } else {
            value &= ~mask
        }
        return value >>> 0;
    }
    
    /**
     * Calculates the current value of the AL_INFO_WALLBOX_STATUS datapoint
     */
    private encodeStatus() : string {
        let value = 0
        value = this._toggleBit(value, this.carPluggedIn, STATE.CAR_PLUGGED_IN)
        value = this._toggleBit(value, this.authorizationGranted, STATE.AUTHORIZATION_GRANTED)
        value = this._toggleBit(value, this.batteryFull, STATE.BATTERY_FULL) 
        value = this._toggleBit(value, this.authorizeRemoteTxRequests, STATE.AUTHORIZE_REMOTE_TX_REQUESTS) 
        
        if (errorMapping.has(this.errorState)) {
            const errorMask = 1 << (errorMapping.get(this.errorState)!)
            value |= errorMask
        } else if (this.errorState) {
            console.log("unhandled error state", this.errorState)
        }
        if (statusMapping.has(this._status)) {
            const statusMask = 1 << (statusMapping.get(this._status)!)
            value |= statusMask
        } else if (this._status) {
            console.log("unhandled status", this._status)
        }
        return value.toString(10)
    }

    // START setting output dpt values

    public sendStatus() {
        return this.setDatapoint(PairingIds.AL_INFO_WALLBOX_STATUS, this.encodeStatus());
    }

    public setCharging(value: boolean): Promise<void>  {
        return this.setDatapoint(PairingIds.AL_INFO_CHARGING, value ? "1" : "0");
    }

    public setChargingEnabled(value: boolean): Promise<void>  {
        if (this._supportsDisableCharging) {
            return this.setDatapoint(PairingIds.AL_INFO_CHARGING_ENABLED, value ? "1" : "0");
        }
        return Promise.resolve();
    }

    public setEcoCharging(value: boolean): Promise<void>  {
        if (this._supportsEco) {
            return this.setDatapoint(PairingIds.AL_INFO_ECO_CHARGING_ON_OFF, value ? "1" : "0");
        }
        return Promise.resolve();
    }

    public setFreeVending(value: boolean): Promise<void> {
        if (this._supportsFreeVending) {
            return this.setDatapoint(PairingIds.AL_INFO_FREE_VENDING, value ? "1" : "0");
        }
        return Promise.resolve();
    }

    public setCarPluggedIn(value: boolean): Promise<void>  {
        if (this.carPluggedIn !== value) {
            this.carPluggedIn = value
            return this.sendStatus();
        }
        return Promise.resolve(undefined)
    }

    public setAuthorizationGranted(value: boolean): Promise<void>  {
        if (this.authorizationGranted !== value) {
            this.authorizationGranted = value
            return this.sendStatus();
        }
        return Promise.resolve(undefined)
    }

    public setBatteryFull(value: boolean): Promise<void>  {
        if (this.batteryFull !== value) {
            this.batteryFull = value
            return this.sendStatus();
        }
        return Promise.resolve(undefined)
    }

    public setAuthorizeRemoteTxRequests(value: boolean): Promise<void>  {
        if (this.authorizeRemoteTxRequests !== value) {
            this.authorizeRemoteTxRequests = value
            return this.sendStatus();
        }
        return Promise.resolve(undefined)
    }

    public setErrorState(err: string) {
        if (errorMapping.has(err)) {
            if (this.errorState !== err) {
                this.errorState = err
                return this.sendStatus();
            }
        } else {
            console.warn("unknown errorCode:", err)
        }
        return Promise.resolve(undefined)
    }

    public setStatus(status: string) {
        if (statusMapping.has(status)) {
            if (this._status !== status) {
                this._status = status
                return this.sendStatus();
            }
        } else {
            console.warn("unknown status:", status)
        }
        return Promise.resolve(undefined)
    }

    public status() {
        return this._status
    }

    public setInstalledPower(value: number) {
        return this.setDatapoint(PairingIds.AL_INFO_INSTALLED_POWER, value.toString());
    }

    public setEnergyTotal(value: number) {
        if (this._supportsEnergyTotal) {
            return this.setDatapoint(PairingIds.AL_MEASURED_TOTAL_ENERGY_EXPORTED, value.toString());
        }
    }

    public setEnergyToday(value: number) {
        if (this._supportsEnergyToday) {
            return this.setDatapoint(PairingIds.AL_MEASURED_EXPORTED_ENERGY_TODAY, value.toString());
        }
    }

    public setLimitForCharger(value: number) {
        if (this._supportsCurrentLimit) {
            return this.setDatapoint(PairingIds.AL_INFO_LIMIT_FOR_CHARGER, value.toString());
        }
    }

    public setMinimumChargerLimit(value: number) {
        return this.setDatapoint(PairingIds.AL_INFO_MIN_CHARGING_CURRENT_ECO, value.toString());
    }

    public setMaximumChargerLimit(value: number) {
        return this.setDatapoint(PairingIds.AL_INFO_MAXIMUM_CHARGING_CURRENT_LIMIT, value.toString());
    }

    public setUsedPhases(value: number) {
        if (this._supportsPhases) {
            if (value >= 0 && value <= 3) {
                return this.setDatapoint(PairingIds.AL_INFO_USED_PHASES, value.toString());
            }
        }
        return Promise.resolve()
    }

    public setEnergyTransmitted(value: number) {
        return this.setDatapoint(PairingIds.AL_INFO_ENERGY_TRANSMITTED, value.toString());
    }

    public setStartOfChargingSession(value: Date) {
        return this.setDatapoint(PairingIds.AL_INFO_START_OF_CHARGING_SESSION, value.toISOString());
    }

    // END setting output dpt values    
}