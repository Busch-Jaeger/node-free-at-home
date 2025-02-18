import assert from 'node:assert';
import test from 'node:test';
import net from 'node:net';
import { setTimeout } from "node:timers/promises";

import * as API from "../fhapi";

import Crypto from 'crypto';

import { Settings } from "../fhapi/core/request";

function randomString(size = 21) {
    return Crypto
        .randomBytes(size)
        .toString('hex')
        .slice(0, size)
}


async function trackConnections(listenSocket: net.Server) {
    let streams: Set<net.Socket> = new Set;

    try {
        await new Promise<void>((resolve, reject) => {
            setTimeout(2000).then(reject);
            let concurrentConnections = 0;
            let connectionCounter = 0;
            listenSocket.on('connection', async (stream) => {
                streams.add(stream);
                concurrentConnections++;
                assert(concurrentConnections <= 4, concurrentConnections.toFixed());

                connectionCounter++;
                if (connectionCounter === 10)
                    resolve();
                stream.on('close', () => {
                    concurrentConnections--;
                })

                await setTimeout(100);
                streams.delete(stream);
                stream.write("HTTP/1.1 200 OK\r\n\r\n");
                stream.destroySoon();

            });
        });
        listenSocket.close();
    }
    catch (error) {
        listenSocket.close();
        for (const stream of streams)
            stream.destroy();
        assert(false);
    };
}

test('check connection limit of unix socket connections', async (t) => {
    Settings.useUnixSocket = true;
    Settings.unixSocketPrePath = "";
    const listenSocket = new net.Server();

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
    for (let i = 0; i < 10; i++)
        promises.push(apiClient.api.getconfiguration());

    await trackConnections(listenSocket);

    await assert.doesNotReject(Promise.all(promises));
    Settings.useUnixSocket = false;
});

test('check connection limit of tcp socket connections', async (t) => {

    const listenSocket = new net.Server();

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
    for (let i = 0; i < 10; i++)
        promises.push(apiClient.api.getconfiguration());

    await trackConnections(listenSocket);

    await assert.doesNotReject(Promise.all(promises));
});