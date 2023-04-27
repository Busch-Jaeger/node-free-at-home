import EventSource from 'eventsource';
import net from 'net';
import http from 'http';
import fs from 'fs';
import * as API from './scriptingApi';

import { EventEmitter } from 'events';

import fetch from 'cross-fetch';

export {Configuration, ApplicationState} from './scriptingApi';

export function readMetaData() {
    const data = fs.readFileSync('free-at-home-metadata.json', 'utf8');
    const metaData = JSON.parse(data);
    return metaData as API.Metadata;
}

interface ConnectionOptions {
    headers: {
        Authorization: string;
        Range: string;
    };
    baseUrl: string;
    fetch: any;
    createConnection: ((options: http.ClientRequestArgs, connectionListener?: (() => void) | undefined) => net.Socket) | undefined;
    agent: http.Agent;
}

export type ConnectionState = "init" | "connected" | "error";

interface Events<ConfigurationType, EventType> {
    configurationChanged(configuration: ConfigurationType): void,
    event(event: EventType): void,
    applicationStateChanged(configuration: ConfigurationType): void,
    configurationConnectionChanged(state: ConnectionState): void,
    eventConnectionChanged(state: ConnectionState): void,
    applicationStateConnectionChanged(state: ConnectionState): void,
}

export declare interface AddOn<
    ConfigurationType  extends API.Configuration = API.Configuration,
    StateType  extends API.ApplicationState = API.ApplicationState,
    EventType extends API.Event = API.Event> {
    on<U extends keyof Events<ConfigurationType, EventType>>(
        event: U, listener: Events<ConfigurationType, EventType>[U]
    ): this;

    emit<U extends keyof Events<ConfigurationType, EventType>>(
        event: U, ...args: Parameters<Events<ConfigurationType, EventType>[U]>
    ): boolean;
}

export class AddOn<
    ConfigurationType = API.Configuration,
    StateType = API.ApplicationState,
    EventType = API.Event> extends EventEmitter {
    private id: string;
    private connectionOptions: ConnectionOptions;
    private configurationEventSource?: EventSource;
    private applicationStateEventSource?: EventSource;
    private eventEventSource?: EventSource;

    constructor(id: string, baseUrl_?: string, username_?: string, password_?: string) {
        super();
        this.id = id;
        const baseUrl = baseUrl_ ?? process.env.FREEATHOME_SCRIPTING_API_BASE_URL
            ?? ((process.env.FREEATHOME_BASE_URL) ? process.env.FREEATHOME_BASE_URL + "/api/scripting/v1" : "http://localhost/api/scripting/v1");
        const username = username_ ?? process.env.FREEATHOME_API_USERNAME ?? "installer";
        const password = password_ ?? process.env.FREEATHOME_API_PASSWORD ?? "12345";
        const useUnixSocket: boolean = process.env.FREEATHOME_USE_UNIX_SOCKET !== undefined;
        const authenticationHeader = {
            Authorization: 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
        };

        function connectToUnixSocket(options: http.ClientRequestArgs, connectionListener?: () => void) {
            return net.createConnection("/run/api/scripting/v1", connectionListener);
        }

        const unixSocketAgent = new http.Agent(<object>{
            socketPath: "/run/api/scripting/v1",
        })

        this.connectionOptions = {
            headers: {
                "Range": "0",
                ...authenticationHeader
            },
            baseUrl:  (useUnixSocket) ? "http://localhost" : baseUrl,
            fetch: fetch,
            createConnection: (useUnixSocket) ? connectToUnixSocket : undefined, // used in EventSource
            agent: (useUnixSocket) ? unixSocketAgent : http.globalAgent          // used in fetch
        }
    }

    connectToConfiguration() {
        if (undefined !== this.configurationEventSource)
            return;

        const url = this.connectionOptions.baseUrl + "/rest/container/" + this.id + "/configuration";

        this.configurationEventSource = new EventSource(
            url, this.connectionOptions);
        this.configurationEventSource.onopen = (event: MessageEvent) => {
            console.log("open configuration");
            this.emit("configurationConnectionChanged", "connected");
        };
        this.configurationEventSource.onerror = (event: MessageEvent) => {
            console.log("error in  event source");
            this.emit("configurationConnectionChanged", "error");
            console.log(event);
        };
        this.configurationEventSource.onmessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                this.emit('configurationChanged', data);
            }
            catch (error) {
                console.log(event.data);
            }
        };
    }

    connectToApplicationState() {
        if (undefined !== this.applicationStateEventSource)
            return;

        const url = this.connectionOptions.baseUrl + "/rest/container/" + this.id + "/applicationstate";

        this.applicationStateEventSource = new EventSource(
            url, this.connectionOptions);
        this.applicationStateEventSource.onopen = (event: MessageEvent) => {
            console.log("open application state");
            this.emit("applicationStateConnectionChanged", "connected");
        };
        this.applicationStateEventSource.onerror = (event: MessageEvent) => {
            console.log("error in  event source");
            this.emit("applicationStateConnectionChanged", "error");
            console.log(event);
        };
        this.applicationStateEventSource.onmessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                this.emit('applicationStateChanged', data);
            }
            catch (error) {
                console.log(event.data);
            }
        };
    }

    connectToEvents() {
        if (undefined !== this.eventEventSource)
            return;

        const url = this.connectionOptions.baseUrl + "/rest/container/" + this.id + "/events";

        this.eventEventSource = new EventSource(
            url, this.connectionOptions);
            this.eventEventSource.onopen = (event: MessageEvent) => {
            console.log("open events");
            this.emit("eventConnectionChanged", "connected");
        };
        this.eventEventSource.onerror = (event: MessageEvent) => {
            console.log("error in  event source");
            this.emit("eventConnectionChanged", "error");
            console.log(event);
        };
        this.eventEventSource.onmessage = async (event: MessageEvent) => {
            try {
                const data = <EventType>JSON.parse(event.data);
                this.emit("event", data)
            }
            catch (error) {
                console.log(event.data);
            }
        };
    }

    async setApplicationState(state: StateType) {
        return API.setContainerApplicationState(this.id, state, this.connectionOptions);
    }

    async setConfiguration(configuration: ConfigurationType) {
        return API.setContainerConfiguration(this.id, configuration, this.connectionOptions);
    }

    async triggerEvent(event: EventType) {
        return API.putContainerEvents(this.id, event, this.connectionOptions);
    }

    dispose() {
        this.configurationEventSource?.close();
        this.applicationStateEventSource?.close();
        this.eventEventSource?.close();
    }

};

/**
 * @deprecated use AddOn instead
 */
export class ScriptingHost extends AddOn {};

export default AddOn;
