import EventSource from 'eventsource';
import { Metadata, Configuration, ApplicationState, Event, AddonClient, OpenAPIConfig } from './addon/';
import * as fs from 'fs';
import * as http from 'http';
import * as net from 'net';

import { EventEmitter } from 'events';
import { handleRequestError } from './utilities';

export {Configuration, ApplicationState};

const REST_PATH = "/api/scripting/v1";

export function readMetaData() {
    const data = fs.readFileSync('free-at-home-metadata.json', 'utf8');
    const metaData = JSON.parse(data);
    return metaData as Metadata
}

interface EventSourceOptions {
    withCredentials?: boolean | undefined;
    headers?: object | undefined;
    proxy?: string | undefined;
    https?: object | undefined;
    rejectUnauthorized?: boolean | undefined;
    createConnection: ((options: http.ClientRequestArgs, connectionListener?: (() => void) | undefined) => net.Socket) | undefined
}

export type ConnectionState = "init" | "connected" | "error";

interface Events<ConfigurationType, StateType, EventType> {
    configurationChanged(configuration: ConfigurationType): void,
    event(event: EventType): void,
    applicationStateChanged(state: StateType): void,
    configurationConnectionChanged(state: ConnectionState): void,
    eventConnectionChanged(state: ConnectionState): void,
    applicationStateConnectionChanged(state: ConnectionState): void,
}

export declare interface AddOn<
    ConfigurationType  extends Configuration = Configuration,
    StateType  extends ApplicationState = ApplicationState,
    EventType extends Event = Event> {
    on<U extends keyof Events<ConfigurationType, StateType, EventType>>(
        event: U, listener: Events<ConfigurationType, StateType, EventType>[U]
    ): this;

    emit<U extends keyof Events<ConfigurationType, StateType, EventType>>(
        event: U, ...args: Parameters<Events<ConfigurationType, StateType, EventType>[U]>
    ): boolean;
}

export class AddOn<
    ConfigurationType = Configuration,
    StateType = ApplicationState,
    EventType = Event> extends EventEmitter {
    private id: string;
    private eventSourceOptions: EventSourceOptions;
    private eventSourceBaseUrl: string = "";
    private connectionConfig: Partial<OpenAPIConfig>;
    private api: AddonClient;
    private configurationEventSource?: EventSource;
    private applicationStateEventSource?: EventSource;
    private eventEventSource?: EventSource;

    constructor(id: string, baseUrl_?: string, username_?: string, password_?: string) {
        super();
        this.id = id;
        const baseUrl = baseUrl_ ?? process.env.FREEATHOME_SCRIPTING_API_BASE_URL
            ?? ((process.env.FREEATHOME_BASE_URL) ? process.env.FREEATHOME_BASE_URL + REST_PATH : "http://localhost" + REST_PATH);
        const username = username_ ?? process.env.FREEATHOME_API_USERNAME ?? "installer";
        const password = password_ ?? process.env.FREEATHOME_API_PASSWORD ?? "12345";
        const useUnixSocket: boolean = process.env.FREEATHOME_USE_UNIX_SOCKET !== undefined;
        const authenticationHeader = {
            Authorization: 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
        };

        function connectToUnixSocket(options: http.ClientRequestArgs, connectionListener?: () => void) {
            return net.createConnection("/run" + REST_PATH, connectionListener);
        }

        this.connectionConfig = {
            BASE: (useUnixSocket) ? "http://localhost" + REST_PATH : baseUrl,
            USERNAME: username,
            PASSWORD: password
        }
        this.eventSourceBaseUrl = (useUnixSocket) ? "http://localhost" : baseUrl;

        this.api = new AddonClient(this.connectionConfig);

        this.eventSourceOptions = {
            headers: {
                "Range": "0",
                ...authenticationHeader
            },
            createConnection: (useUnixSocket) ? connectToUnixSocket : undefined
        }
    }

    connectToConfiguration() {
        if (undefined !== this.configurationEventSource)
            return;

        const url = this.eventSourceBaseUrl + "/rest/container/" + this.id + "/configuration";

        this.configurationEventSource = new EventSource(
            url, this.eventSourceOptions);
        this.configurationEventSource.onopen = (event: MessageEvent) => {
            console.log("open configuration");
            this.emit("configurationConnectionChanged", "connected");
        };
        this.configurationEventSource.onerror = (event: MessageEvent) => {
            console.log("error in event source");
            this.emit("configurationConnectionChanged", "error");
            console.log(event);
            console.log(url);
        };
        this.configurationEventSource.onmessage = (event: MessageEvent) => {
            try {
                const data = event.data ? JSON.parse(event.data) : "";
                this.emit('configurationChanged', data);
            }
            catch (error) {
                console.error(`error parsing configuration data: '${event.data}'`, error);
            }
        };
    }

    connectToApplicationState() {
        if (undefined !== this.applicationStateEventSource)
            return;

        const url = this.eventSourceBaseUrl + "/rest/container/" + this.id + "/applicationstate";

        this.applicationStateEventSource = new EventSource(
            url, this.eventSourceOptions);
        this.applicationStateEventSource.onopen = (event: MessageEvent) => {
            console.log("open application state");
            this.emit("applicationStateConnectionChanged", "connected");
        };
        this.applicationStateEventSource.onerror = (event: MessageEvent) => {
            console.log("error in event source");
            this.emit("applicationStateConnectionChanged", "error");
            console.log(event);
            console.log(url);
        };
        this.applicationStateEventSource.onmessage = (event: MessageEvent) => {
            try {
                const data = event.data ? JSON.parse(event.data) : "";
                this.emit('applicationStateChanged', data);
            }
            catch (error) {
                console.error(`error parsing application state: '${event.data}'`, error);
            }
        };
    }

    connectToEvents() {
        if (undefined !== this.eventEventSource)
            return;

        const url = this.eventSourceBaseUrl + "/rest/container/" + this.id + "/events";

        this.eventEventSource = new EventSource(
            url, this.eventSourceOptions);
            this.eventEventSource.onopen = (event: MessageEvent) => {
            console.log("open events");
            this.emit("eventConnectionChanged", "connected");
        };
        this.eventEventSource.onerror = (event: MessageEvent) => {
            console.log("error in  event source");
            this.emit("eventConnectionChanged", "error");
            console.log(event);
            console.log(url);
        };
        this.eventEventSource.onmessage = async (event: MessageEvent) => {
            try {
                const data = <EventType>JSON.parse(event.data);
                this.emit("event", data)
            }
            catch (error) {
                console.error(`error parsing event data: '${event.data}'`, error);
            }
        };
    }

    async setApplicationState(state: StateType) {
        try {
            return this.api.container.setContainerApplicationState(this.id, state);
        } catch (e) {
            handleRequestError(e);
        }
    }

    async setConfiguration(configuration: ConfigurationType) {
        try {
            return this.api.container.setContainerConfiguration(this.id, configuration);
        } catch (e) {
            handleRequestError(e);
        }
    }

    async triggerEvent(event: EventType) {
        try {
            return this.api.container.putContainerEvents(this.id, event);
        } catch (e) {
            handleRequestError(e);
        }
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
