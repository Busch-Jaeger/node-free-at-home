import http from 'http';
import fetch from 'cross-fetch';
import net from 'net';
import { RequestOpts } from "@busch-jaeger/oazapfts_runtime/lib/runtime";
// import * as Oazapfts from "oazapfts_runtime/lib/runtime";

export function getConnectionOptions(subApiPath: string, baseUrl_?: string, username_?: string, password_?: string): RequestOpts | object {
    const baseUrl = baseUrl_
        ?? ((process.env.FREEATHOME_BASE_URL) ? process.env.FREEATHOME_BASE_URL + subApiPath : "http://localhost" + subApiPath);
    const username = username_ ?? process.env.FREEATHOME_API_USERNAME ?? "installer";
    const password = password_ ?? process.env.FREEATHOME_API_PASSWORD ?? "12345";
    const useUnixSocket: boolean = process.env.FREEATHOME_USE_UNIX_SOCKET !== undefined;
    const authenticationHeader = {
        Authorization: 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
    };

    function connectToUnixSocket(options: http.ClientRequestArgs, connectionListener?: () => void) {
        return net.createConnection("/run" + subApiPath, connectionListener);
    }

    const unixSocketAgent = new http.Agent(<object>{
        socketPath: "/run" + subApiPath,
    })

    return {
        headers: {
            "Range": "0",
            ...authenticationHeader
        },
        baseUrl: (useUnixSocket) ? "http://localhost" : baseUrl,
        fetch: fetch,
        createConnection: (useUnixSocket) ? connectToUnixSocket : undefined, // used in EventSource
        agent: (useUnixSocket) ? unixSocketAgent : http.globalAgent          // used in fetch
    }
}