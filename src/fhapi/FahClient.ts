/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { NodeHttpRequest } from './core/NodeHttpRequest';

import { ApiService } from './services/ApiService';
import { DefaultService } from './services/DefaultService';
import { ExperimentalApiService } from './services/ExperimentalApiService';

type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;

export class FahClient {

    public readonly api: ApiService;
    public readonly default: DefaultService;
    public readonly experimentalApi: ExperimentalApiService;

    public readonly request: BaseHttpRequest;

    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = NodeHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? 'https://192.168.2.1/fhapi/v1',
            VERSION: config?.VERSION ?? '1',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });

        this.api = new ApiService(this.request);
        this.default = new DefaultService(this.request);
        this.experimentalApi = new ExperimentalApiService(this.request);
    }
}

