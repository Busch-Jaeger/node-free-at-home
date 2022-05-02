/**
 * free@home add-on API
 * v1
 * DO NOT MODIFY - This file has been generated using oazapfts.
 * See https://www.npmjs.com/package/oazapfts
 */
import * as Oazapfts from "oazapfts_runtime/lib/runtime";
import * as QS from "oazapfts_runtime/lib/runtime/query";
export const defaults: Oazapfts.RequestOpts = {
    baseUrl: "https://192.168.2.1/api/addon/v1",
};
const oazapfts = Oazapfts.runtime(defaults);
export const servers = {
    server1: ({ hostname = "192.168.2.1" }: {
        hostname: string | number | boolean;
    }) => `https://${hostname}/api/addon/v1`
};
export type Sha256 = string;
export type References = {
    [key: string]: Sha256;
};
export type Reference = string;
export type TranslatedString = string | {
    en: string;
    es?: string;
    fr?: string;
    it?: string;
    nl?: string;
    de?: string;
    zh?: string;
    da?: string;
    fi?: string;
    nb?: string;
    pl?: string;
    pt?: string;
    ru?: string;
    sv?: string;
    el?: string;
    cs?: string;
    tr?: string;
};
export type Uri = string;
export type TranslatedUri = Uri | {
    en: Uri;
    es?: Uri;
    fr?: Uri;
    it?: Uri;
    nl?: Uri;
    de?: Uri;
    zh?: Uri;
    da?: Uri;
    fi?: Uri;
    nb?: Uri;
    pl?: Uri;
    pt?: Uri;
    ru?: Uri;
    sv?: Uri;
    el?: Uri;
    cs?: Uri;
    tr?: Uri;
};
export type BasicParameter = {
    name: string;
    "type": "string" | "password" | "number" | "boolean" | "date" | "time" | "duration" | "weekdays" | "ipv4" | "floor" | "room" | "channel" | "select" | "button" | "text";
    required?: boolean;
};
export type StringParameter = BasicParameter & {
    min?: number;
    max?: number;
    regex?: string;
};
export type NumberParameter = BasicParameter & {
    min?: number;
    max?: number;
    unit?: string;
};
export type ChannelParameter = BasicParameter & {
    multiSelect?: boolean;
};
export type Parameter = ({
    "type": "string";
} & StringParameter) | ({
    "type": "number";
} & NumberParameter) | ({
    "type": "boolean";
} & BasicParameter) | ({
    "type": "date";
} & BasicParameter) | ({
    "type": "time";
} & BasicParameter) | ({
    "type": "ipv4";
} & BasicParameter) | ({
    "type": "channel";
} & ChannelParameter) | ({
    "type": "room";
} & BasicParameter) | ({
    "type": "button";
} & BasicParameter) | ({
    "type": "text";
} & BasicParameter);
export type ParameterGroup = {
    name: string;
    multiple?: boolean;
    items: {
        [key: string]: Parameter;
    };
};
export type Parameters = {
    [key: string]: ParameterGroup;
};
export type Metadata = {
    version: string;
    id: string;
    name: TranslatedString;
    description: TranslatedString;
    license: string;
    author: string;
    url: TranslatedUri;
    minSysapVersion?: string;
    accessControl?: {
        allowedAPIs?: string[];
        networkAccess?: boolean;
        networkPorts?: number[];
    };
    entryPoint: string;
    "type": "app" | "runtime" | "standalone";
    parameters?: Parameters;
    minAuxFileUploadIntervalMinutes?: number;
    organizationId?: string;
    rpc?: string[];
};
export type ConfigurationEntry = {
    items?: {
        [key: string]: any;
    };
};
export type Configuration = {
    [key: string]: ConfigurationEntry;
};
export type Event = {
    eventType: "buttonPressed";
    parameter: string;
    group: string;
    index?: string;
};
/**
 * queue an add-on url for download
 */
export function queueDownload(body?: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchText("/rest/downloadqueue", {
        ...opts,
        method: "POST",
        body
    });
}
/**
 * Upload an add-on inside of a tar file
 */
export function upload(body?: {
    data: Blob;
}, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchText("/rest/ref", oazapfts.multipart({
        ...opts,
        method: "POST",
        body
    }));
}
/**
 * Get all add-on references
 */
export function getAddOn(opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: References;
    } | {
        status: 401;
    } | {
        status: 502;
    }>("/rest/ref", {
        ...opts
    });
}
/**
 * Get Metadata by references
 */
export function getMetadata(reference: Reference, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: Metadata;
    } | {
        status: 401;
    } | {
        status: 404;
        data: string;
    } | {
        status: 502;
    }>(`/rest/ref/${reference}`, {
        ...opts
    });
}
/**
 * Delete an add-on by references
 */
export function deleteScript(reference: Reference, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchText(`/rest/ref/${reference}`, {
        ...opts,
        method: "DELETE"
    });
}
/**
 * Create a container instance from a previous uploaded add-on
 */
export function postContainer(body?: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: Metadata;
    } | {
        status: 401;
    } | {
        status: 502;
    }>("/rest/container", {
        ...opts,
        method: "POST",
        body
    });
}
/**
 * List all created container instances
 */
export function getContainers(opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: Metadata;
    } | {
        status: 401;
    } | {
        status: 502;
    }>("/rest/container", {
        ...opts
    });
}
/**
 * Get the run time state of a container instance
 */
export function getContainerById(reference: Reference, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: Metadata;
    } | {
        status: 401;
    } | {
        status: 502;
    }>(`/rest/container/${reference}`, {
        ...opts
    });
}
/**
 * Delete a container instance by references
 */
export function deleteContainer(reference: Reference, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchText(`/rest/container/${reference}`, {
        ...opts,
        method: "DELETE"
    });
}
/**
 * Get the configuration of a container
 */
export function getContainerConfiguration(reference: Reference, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: Configuration;
    } | {
        status: 401;
    } | {
        status: 502;
    }>(`/rest/container/${reference}/configuration`, {
        ...opts
    });
}
/**
 * Set the configuration of a container
 */
export function setContainerConfiguration(reference: Reference, configuration?: Configuration, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchText(`/rest/container/${reference}/configuration`, oazapfts.json({
        ...opts,
        method: "PUT",
        body: configuration
    }));
}
/**
 * Get the application state of a container
 */
export function getContainerApplicationState(reference: Reference, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: Configuration;
    } | {
        status: 401;
    } | {
        status: 502;
    }>(`/rest/container/${reference}/applicationstate`, {
        ...opts
    });
}
/**
 * Set the application state of a container
 */
export function setContainerApplicationState(reference: Reference, configuration?: Configuration, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchText(`/rest/container/${reference}/applicationstate`, oazapfts.json({
        ...opts,
        method: "PUT",
        body: configuration
    }));
}
/**
 * Get the events of a container
 */
export function getContainerEvents(reference: Reference, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchText(`/rest/container/${reference}/events`, {
        ...opts
    });
}
/**
 * Set the events of a container
 */
export function putContainerEvents(reference: Reference, event?: Event, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchText(`/rest/container/${reference}/events`, oazapfts.json({
        ...opts,
        method: "PUT",
        body: event
    }));
}
/**
 * Start a container
 */
export function startContainer(reference: Reference, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: Metadata;
    } | {
        status: 401;
    } | {
        status: 502;
    }>(`/rest/container/${reference}/start`, {
        ...opts,
        method: "POST"
    });
}
/**
 * Stop a running container
 */
export function stopContainer(reference: Reference, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: Metadata;
    } | {
        status: 401;
    } | {
        status: 502;
    }>(`/rest/container/${reference}/stop`, {
        ...opts,
        method: "POST"
    });
}
