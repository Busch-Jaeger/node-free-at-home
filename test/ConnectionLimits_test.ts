import assert from 'node:assert';
import test from 'node:test';
import net from 'node:net';
import { setTimeout } from "node:timers/promises";

import * as API from "../src/fhapi";

import Crypto from 'crypto';

import { Settings } from "../src/fhapi/core/request";

function randomString(size = 21) {
    return Crypto
        .randomBytes(size)
        .toString('hex')
        .slice(0, size)
}

const NumberOfConnectionToTest = 50;

async function trackConnections(listenSocket: net.Server, connectionsToServe: number = 10) {
    return new Promise<number>((resolve, reject) => {
        setTimeout(20 * connectionsToServe).then(reject);
        let concurrentConnections = 0;
        let connectionCounter = 0;
        let maxSimultanConnections = 0;
        listenSocket.on('connection', async (stream) => {
            try {
                concurrentConnections++;
                maxSimultanConnections = Math.max(maxSimultanConnections, concurrentConnections);

                connectionCounter++;
                if (connectionCounter === connectionsToServe)
                    resolve(maxSimultanConnections);
                stream.on('close', () => {
                    concurrentConnections--;
                })

                await setTimeout(10);
                stream.write("HTTP/1.1 200 OK\r\nConnection: close\r\ncontent-type: application/json\r\n\r\n{\"test\": \"json\"}");
                stream.destroySoon();
            } catch (error) {
                stream.destroy();
            }
        });
    });
}

test('check connection limit of unix socket connections', async (t) => {
    t.after(() => {
        Settings.useUnixSocket = false;
    });
    Settings.useUnixSocket = true;
    Settings.unixSocketPrePath = "";

    const listenSocket = new net.Server();
    t.after(() => {
        listenSocket.close();
    })

    const path = "/tmp/" + randomString();

    const listenPath = await new Promise<string>((resolve, reject) => {
        listenSocket.listen(path, () => {
            const address = listenSocket.address();
            assert(address !== null)
            assert(typeof address !== 'object')
            resolve(address);
        })
    });

    const apiClient = new API.FahClient({
        BASE: "http://localhost" + path,
        HEADERS: {}
    });

    const promises: Array<API.CancelablePromise<API.Configuration>> = new Array;
    for (let i = 0; i < NumberOfConnectionToTest; i++)
        promises.push(apiClient.api.getconfiguration());

    assert.strictEqual(await trackConnections(listenSocket, NumberOfConnectionToTest), 16);

    await assert.doesNotReject(Promise.all(promises));
});

test('check connection limit of tcp socket connections', async (t) => {
    const listenSocket = new net.Server();
    t.after(() => {
        listenSocket.close();
    })

    const listenPort = await new Promise<number>((resolve, reject) => {
        listenSocket.listen(0, () => {
            const address = listenSocket.address();
            assert(address !== null)
            assert(typeof address !== 'string')
            resolve(address?.port);
        })
    });

    const apiClient = new API.FahClient({
        BASE: "http://localhost:" + listenPort.toFixed() + "/test",
        HEADERS: {}
    });

    const promises: Array<API.CancelablePromise<API.Configuration>> = new Array;
    for (let i = 0; i < NumberOfConnectionToTest; i++)
        promises.push(apiClient.api.getconfiguration());

    assert.strictEqual(await trackConnections(listenSocket, NumberOfConnectionToTest), 4);

    await assert.doesNotReject(Promise.all(promises));
});