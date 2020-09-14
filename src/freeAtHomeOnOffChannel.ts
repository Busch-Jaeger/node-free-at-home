import { FreeAtHomeApi, PairingIds, ParameterIds } from './freeAtHomeApi';
import { NodeState, FreeAtHomeChannelInterface, FreeAtHomeOnOffDelegateInterface } from './freeAtHomeDeviceInterface';
import { VirtualDeviceType } from '.';

export class FreeAtHomeOnOffChannel implements FreeAtHomeChannelInterface {
    deviceType: VirtualDeviceType = "SwitchingActuator";
    serialNumber: string;
    name: string;
    channelNumber: number;
    freeAtHome: FreeAtHomeApi;
    delegate: FreeAtHomeOnOffDelegateInterface;


    isAutoConfirm: boolean;

    constructor(freeAtHome: FreeAtHomeApi, channelNumber: number, serialNumber: string, name: string, delegate: FreeAtHomeOnOffDelegateInterface, isAutoConfirm: boolean = false) {
        this.freeAtHome = freeAtHome;
        this.channelNumber = channelNumber;
        this.serialNumber = serialNumber;
        this.name = name;

        this.delegate = delegate;

        this.isAutoConfirm = isAutoConfirm;

        delegate.on("isOnChanged", this.delegateIsOnChanged.bind(this));
    }

    setDatapoint(freeAtHome: FreeAtHomeApi, datapointId: PairingIds, value: string) {
        const { channelNumber, serialNumber } = this;
        freeAtHome.setDatapoint(serialNumber, channelNumber, datapointId, value);
    }

    dataPointChanged(channel: number, id: PairingIds, value: string): void {
        const { delegate, freeAtHome } = this;

        switch (<PairingIds>id) {
            case PairingIds.switchOnOff: {
                switch (value) {
                    case "1": {
                        delegate.setOn(true);
                        if (this.isAutoConfirm)
                            this.setDatapoint(freeAtHome, PairingIds.infoOnOff, value);
                        break;
                    }
                    case "0": {
                        delegate.setOn(false);
                        if (this.isAutoConfirm)
                            this.setDatapoint(freeAtHome, PairingIds.infoOnOff, value);
                        break;
                    }
                }
                break;
            }
        }
    }

    parameterChanged(id: ParameterIds, value: string): void {
    }

    delegateIsOnChanged(isOn: boolean): void {
        this.setDatapoint(this.freeAtHome, PairingIds.infoOnOff, (isOn) ? "1" : "0");
    }
}