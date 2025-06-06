import assert from 'node:assert';
import test from 'node:test';

import * as api from "../src/fhapi";
import { ApiChannel, ApiDevice, PairingIds } from '../src'

test('ouput datapoint processing', (t) => {
  const deviceMock = {
    serialnumber: "060074734343"
  }

  const apiChannel: api.Channel = {
    outputs: {
      odp2: {
        pairingID: 4711,
        value: "init"
      }
    }
  }

  const channel = new ApiChannel(deviceMock as unknown as ApiDevice, apiChannel, 0);
  assert.strictEqual(channel.outputDataPoints.get(4711 as PairingIds), "init");

  const callback = t.mock.fn((id: PairingIds, value: string) => {
    assert.strictEqual(id, 4711);
    assert.strictEqual(value, "test");
  });

  const subscribeCallback = t.mock.fn((value: string) => {
    assert.strictEqual(value, "test");
  });

  channel.on("outputDatapointChanged", callback);
  channel.subscribeOutputDatapoint(4711 as PairingIds, subscribeCallback);
  channel.onOutputDatapointChange({ index: 2, value: "test" });

  assert.strictEqual(channel.outputDataPoints.get(4711 as PairingIds), "test");
  assert.strictEqual(callback.mock.callCount(), 1);
  assert.strictEqual(subscribeCallback.mock.callCount(), 1);
});

test('input datapoint processing', (t) => {

  const deviceMock = {
    serialnumber: "060074734343",
    setInputDatapoint: t.mock.fn(undefined, async (channelNumber: number, index: number, value: string): Promise<void> => {
      assert.strictEqual(channelNumber, 0);
      assert.strictEqual(index, 2);
      assert.strictEqual(value, "test");
    }),
  }

  const apiChannel: api.Channel = {
    inputs: {
      idp2: {
        pairingID: 4711,
        value: "init"
      }
    }
  }

  const channel = new ApiChannel(deviceMock as unknown as ApiDevice, apiChannel, 0);

  channel.setInputDatapoint(4711 as PairingIds, "test");

  assert.strictEqual(deviceMock.setInputDatapoint.mock.callCount(), 1);
});
