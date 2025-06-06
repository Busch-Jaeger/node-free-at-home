import assert from 'node:assert';
import test from 'node:test';

import * as api from "../src/fhapi";

import { ApiVirtualChannel, FreeAtHomeApi } from '../src';

import * as API from "../src/fhapi";

import { EventEmitter } from 'node:stream';
import { AutoReconnectWebSocket } from '../src/autoReconnectWebSocket';
import { DeviceSerial, NativeSerial, SysapUuid, VirtualDevice } from '../src/fhapi';

const ACTUATOR_SERIAL_NUMBER = "6000D2CB27B2";
const PAIRED_DEVICE_SERIAL_NUMBER = "6000D2CB27DD";

const mockDevicesDescriptons = new Map<string, API.Device>(
  [
    [ACTUATOR_SERIAL_NUMBER,
      {
        "nativeId": "nativeActuator",
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
        "nativeId": "nativePairedDevice",
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

async function mock_getpairings1(): Promise<api.Pairings> {
  return [
    {
      "sensor": ACTUATOR_SERIAL_NUMBER + "/ch0000",
      "actuator": PAIRED_DEVICE_SERIAL_NUMBER + "/ch0000"
    },
  ];
};

async function mock_getpairings2(): Promise<api.Pairings> {
  return [
    {
      "sensor": ACTUATOR_SERIAL_NUMBER + "/ch0000",
      "actuator": PAIRED_DEVICE_SERIAL_NUMBER + "/ch0000"
    },
    {
      "sensor": ACTUATOR_SERIAL_NUMBER + "/ch0000",
      "actuator": PAIRED_DEVICE_SERIAL_NUMBER + "/ch0000"
    },
  ];
};

test('getPairedChannels', async (t) => {

  t.mock.timers.enable({ apis: ['Date'], now: 20_000 });

  const apiClient = new API.FahClient({
    BASE: "",
    HEADERS: {}
  });

  const websocketMock = new EventEmitter as AutoReconnectWebSocket;
  const createVirtualDeviceMock = t.mock.method(apiClient.api, "createVirtualDevice", mock_createVirtualDevice);
  const getDeviceMock = t.mock.method(apiClient.api, "getdevice", mock_getdevice);

  const createPairingseMock = t.mock.method(apiClient.api, "getpairings", mock_getpairings1);

  const api = new FreeAtHomeApi(apiClient, websocketMock);

  const device = await api.createDevice("BinarySensor", nativeIdFromMap(ACTUATOR_SERIAL_NUMBER));
  const channel = device.getChannels().next().value as ApiVirtualChannel;

  const pairedChannels = await channel.getPairedChannels();

  assert.strictEqual(pairedChannels.length, 1)

  t.mock.timers.tick(20_000);
  const createPairingseMock2 = t.mock.method(apiClient.api, "getpairings", mock_getpairings2);
  const pairedChannels2 = await channel.getPairedChannels();
  assert.strictEqual(pairedChannels2.length, 2)

  const createPairingseMock3 = t.mock.method(apiClient.api, "getpairings", mock_getpairings1);
  const pairedChannels3 = await channel.getPairedChannels(true);
  assert.strictEqual(pairedChannels3.length, 1)

  assert.strictEqual(createVirtualDeviceMock.mock.callCount(), 1);
  assert.strictEqual(getDeviceMock.mock.callCount(), 2);
  assert.strictEqual(createPairingseMock.mock.callCount(), 1);
  assert.strictEqual(createPairingseMock2.mock.callCount(), 1);
  assert.strictEqual(createPairingseMock3.mock.callCount(), 1);
});
