import {Channel} from "../channel";
import {PairingIds} from "../pairingIds";

export class DelayedAlertSystem {
    private delayedAlert : NodeJS.Timeout | null = null;
    private delayedDeAlert: NodeJS.Timeout | null = null;

    private activationDelay : number | undefined;
    private deactivationDelay : number | undefined;



    public alertDelayed(channel :Channel, alarm :PairingIds){
        if(this.delayedDeAlert){
            clearTimeout(this.delayedDeAlert);
            this.delayedDeAlert = null;
        }
        if(!this.delayedAlert){
            setTimeout(() => this.alert(channel,alarm),this.activationDelay ?? 0);
        }
    }
    public dealertDelayed(channel :Channel, alarm :PairingIds){
        if(this.delayedAlert){
            clearTimeout(this.delayedAlert);
            this.delayedAlert = null;
        }
        if(!this.delayedDeAlert){
            setTimeout(() => this.dealert(channel,alarm),this.deactivationDelay ?? 0);
        }
    }

    public setActivationDelay(delayInMinutes:number){
        this.activationDelay = delayInMinutes * 60_000; // Minutes to Milliseconds
    }

    public setDeactivatoinDelay(delayInMinutes:number){
        this.deactivationDelay = delayInMinutes * 60_000;
    }

    private alert( channel :Channel, alarm :PairingIds){
        channel.setDatapoint(alarm,"1");
    }
    private dealert( channel :Channel, alarm :PairingIds){
        channel.setDatapoint(alarm,"0");
    }
}