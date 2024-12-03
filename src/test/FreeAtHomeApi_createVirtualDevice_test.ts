import assert from 'node:assert';
import test from 'node:test';

import { FreeAtHomeApi } from '..';

import * as API from "../fhapi";

import { EventEmitter } from 'node:stream';
import { AutoReconnectWebSocket } from '../autoReconnectWebSocket';
import { DeviceSerial, NativeSerial, SysapUuid, VirtualDevice } from '../fhapi';


import {
  setImmediate
} from 'node:timers/promises';

const ACTUATOR_SERIAL_NUMBER = "6000D2CB27B2";
const PAIRED_DEVICE_SERIAL_NUMBER = "6000D2CB27DD";

const mockDevicesDescriptons = new Map<string, API.Device>(
  [
    [ACTUATOR_SERIAL_NUMBER,
      {
        "nativeId": "abcd12345",
        "interface": "vdev:installer@busch-jaeger.de",
        "deviceId": "0001",
        "displayName": "Virtual switch",
        "channels": {
          "ch0000": {
            "displayName": "Virtual switch",
            "functionID": "7",
            "inputs": {
              "idp0000": {
                "pairingID": 1,
                "value": "0"
              },
              "idp0003": {
                "pairingID": 4,
                "value": "0"
              }
            },
            "outputs": {
              "odp0000": {
                "pairingID": 256,
                "value": "0"
              }
            },
            "parameters": {
              "par0015": "60"
            }
          }
        },
        "parameters": {}
      }
    ],
    [PAIRED_DEVICE_SERIAL_NUMBER,
      {
        "nativeId": "abcd12345",
        "interface": "vdev:installer@busch-jaeger.de",
        "deviceId": "0001",
        "displayName": "Virtual switch",
        "channels": {
          "ch0000": {
            "displayName": "Virtual switch",
            "functionID": "7",
            "inputs": {
              "idp0000": {
                "pairingID": 1,
                "value": "0"
              },
              "idp0003": {
                "pairingID": 4,
                "value": "0"
              }
            },
            "outputs": {
              "odp0000": {
                "pairingID": 256,
                "value": "0"
              }
            },
            "parameters": {
              "par0015": "60"
            }
          }
        },
        "parameters": {}
      }
    ],
  ]
);

function serialNumberFromMap(nativeId: string): string {
  for (const item of mockDevicesDescriptons) {
    if (item[1].nativeId === nativeId)
      return item[0];
  }
  assert(false);
}

function nativeIdFromMap(deviceId: string): string {
  assert(mockDevicesDescriptons.has(deviceId));
  const description = mockDevicesDescriptons.get(deviceId);
  assert(description);
  assert(description?.nativeId);
  return description.nativeId;
}

async function mock_createVirtualDevice(
  sysap: SysapUuid,
  serial: NativeSerial,
  requestBody: VirtualDevice,
): Promise<API.VirtualDevicesSuccess> {
  const deviceId = serialNumberFromMap(serial);
  assert(mockDevicesDescriptons.has(deviceId));
  const description = mockDevicesDescriptons.get(deviceId);
  assert(description);
  assert(description?.nativeId);
  return {
    "00000000-0000-0000-0000-000000000000": {
      "devices": {
        [deviceId]: {
          "serial": description.nativeId
        }
      }
    }
  };
}

async function mock_reject_getdevice(
  sysap: SysapUuid,
  device: DeviceSerial,
): Promise<API.ApiRestDevice_sysap__device_Get200ApplicationJsonResponse> {
  return Promise.reject();
}

async function mock_getdevice(
  sysap: SysapUuid,
  deviceId: DeviceSerial,
): Promise<API.ApiRestDevice_sysap__device_Get200ApplicationJsonResponse> {
  assert(mockDevicesDescriptons.has(deviceId));
  const device = mockDevicesDescriptons.get(deviceId) ?? {};
  return Promise.resolve({
    "00000000-0000-0000-0000-000000000000": {
      "devices": {
        [deviceId]: device
      }
    }
  });
}

class WebsocketMock extends EventEmitter {
  emitNewMessageForDevice(serialNumber: string) {
    const description = mockDevicesDescriptons.get(serialNumber);
    assert(description);
    const message: API.WebsocketMessage = {
      "00000000-0000-0000-0000-000000000000": {
        datapoints: {},
        devices: {
          [serialNumber]: description
        },
        devicesAdded: [],
        devicesRemoved: [],
        scenesTriggered: {}
      }
    }
    this.emit('message', JSON.stringify(message));
  }

  castToMockedType() {
    return this as EventEmitter as AutoReconnectWebSocket
  }
}


test('createVirtualDevice delayed via websocket', async (t) => {

  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 20_000 });

  const apiClient = new API.FahClient({
    BASE: "",
    HEADERS: {}
  });

  const websocketMock = new WebsocketMock;

  const createVirtualDeviceMock = t.mock.method(apiClient.api, "createVirtualDevice", mock_createVirtualDevice);

  const getDeviceMock = t.mock.method(apiClient.api, "getdevice", mock_reject_getdevice);

  const api = new FreeAtHomeApi(apiClient, websocketMock.castToMockedType());
  const devicePromise = api.createDevice("BinarySensor", nativeIdFromMap(ACTUATOR_SERIAL_NUMBER));

  await setImmediate();

  const getDeviceMock2 = t.mock.method(apiClient.api, "getdevice", mock_getdevice);

  t.mock.timers.tick(1 * 60 * 1_000);

  websocketMock.emitNewMessageForDevice(ACTUATOR_SERIAL_NUMBER);

  await setImmediate();

  const device = await devicePromise;

  assert.strictEqual(createVirtualDeviceMock.mock.callCount(), 1);
  assert.strictEqual(getDeviceMock.mock.callCount(), 1);
  assert.strictEqual(getDeviceMock.mock.callCount(), 1);
});

test('createVirtualDevice direkt response', async (t) => {

  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 20_000 });

  const apiClient = new API.FahClient({
    BASE: "",
    HEADERS: {}
  });

  const websocketMock = new EventEmitter as AutoReconnectWebSocket;

  const createVirtualDeviceMock = t.mock.method(apiClient.api, "createVirtualDevice", mock_createVirtualDevice);

  const api = new FreeAtHomeApi(apiClient, websocketMock);
  const devicePromise = api.createDevice("BinarySensor", nativeIdFromMap(ACTUATOR_SERIAL_NUMBER));

  const getDeviceMock2 = t.mock.method(apiClient.api, "getdevice", mock_getdevice);

  const device = await devicePromise;

  assert.strictEqual(createVirtualDeviceMock.mock.callCount(), 1);
  assert.strictEqual(getDeviceMock2.mock.callCount(), 1);
});

test('createVirtualDevice timeout', async (t) => {

  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 20_000 });

  const apiClient = new API.FahClient({
    BASE: "",
    HEADERS: {}
  });

  const websocketMock = new EventEmitter as AutoReconnectWebSocket;

  const createVirtualDeviceMock = t.mock.method(apiClient.api, "createVirtualDevice", mock_createVirtualDevice);

  const getDeviceMock = t.mock.method(apiClient.api, "getdevice", mock_reject_getdevice);

  const api = new FreeAtHomeApi(apiClient, websocketMock);
  const devicePromise = api.createDevice("BinarySensor", nativeIdFromMap(ACTUATOR_SERIAL_NUMBER));

  await setImmediate();

  const getDeviceMock2 = t.mock.method(apiClient.api, "getdevice", mock_getdevice);

  t.mock.timers.tick(3 * 60 * 1_000);

  await assert.rejects(devicePromise);

  assert.strictEqual(createVirtualDeviceMock.mock.callCount(), 1);
  assert.strictEqual(getDeviceMock.mock.callCount(), 1);
  assert.strictEqual(getDeviceMock2.mock.callCount(), 0);
});
