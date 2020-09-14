import {
    FreeAtHome,
    FreeAtHomeOnOffDelegateInterface,
    FreeAtHomeRawDelegateInterface
} from '.';
import { EventEmitter } from 'events';
import { PairingIds } from './pairingIds';
import { ParameterIds } from './parameterIds';

const freeAtHome = new FreeAtHome("http://192.168.0.132/fhapi/v1");

class SwitchActuator extends EventEmitter implements FreeAtHomeOnOffDelegateInterface {
    setOn(value: boolean): void {
        console.log((value) ? "on" : "off");
        this.emit('isOnChanged', value);
    }
}

const switchActuator = new SwitchActuator();

class MediaPlayer extends EventEmitter implements FreeAtHomeRawDelegateInterface {
    dataPointChanged(channel: number, id: PairingIds, value: string): void {
        // throw new Error("Method not implemented.");
    }
    parameterChanged(id: ParameterIds, value: string): void {
        // throw new Error("Method not implemented.");
    }

}

const mediaPlayer = new MediaPlayer();

setTimeout(() => {
    freeAtHome.createOnOffDevice("444555888", "test22", switchActuator, false);
    freeAtHome.createRawDevice("lkjasdhflkjasd", "Media Player", "MediaPlayer", mediaPlayer);
}, 500);
