import assert from 'node:assert';
import test from 'node:test';

import { ApiVirtualChannel, PairingIds, FreeAtHomeSplitUnitChannel as SplitUnitChannel } from "../../src"
import EventEmitter from 'node:events';

class ApiVirtualChannelMock extends EventEmitter {
    outputPairingToPosition: Map<PairingIds, number> = new Map();

    public async setOutputDatapoint(id: PairingIds, value: string): Promise<void> { };
}

test('splitUnitChannel', async (t) => {
    const apiVirtualChannelMock = new ApiVirtualChannelMock();
    apiVirtualChannelMock.outputPairingToPosition.set(PairingIds.AL_SET_POINT_TEMPERATURE, 0);
    apiVirtualChannelMock.outputPairingToPosition.set(PairingIds.AL_RELATIVE_SET_POINT_TEMPERATURE, 1);

    const channel = new SplitUnitChannel(apiVirtualChannelMock as unknown as ApiVirtualChannel);

    const mockedSetOutputDatapoint = t.mock.method(apiVirtualChannelMock, 'setOutputDatapoint');

    await channel.sendSetPointTemperature(23.5);
    assert.strictEqual(mockedSetOutputDatapoint.mock.callCount(), 2);
    assert.strictEqual(mockedSetOutputDatapoint.mock.calls.find((value) => {
        return value.arguments[0] === PairingIds.AL_SET_POINT_TEMPERATURE;
    })?.arguments[1], "24");
    assert.strictEqual(mockedSetOutputDatapoint.mock.calls.find((value) => {
        return value.arguments[0] === PairingIds.AL_RELATIVE_SET_POINT_TEMPERATURE;
    })?.arguments[1], "3");
});
