/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { NodeHttpRequest } from './core/NodeHttpRequest';

import { ContainerService } from './services/ContainerService';
import { ExperimentalService } from './services/ExperimentalService';
import { RepositoryService } from './services/RepositoryService';

type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;

export class AddonClient {

    public readonly container: ContainerService;
    public readonly experimental: ExperimentalService;
    public readonly repository: RepositoryService;

    public readonly request: BaseHttpRequest;

    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = NodeHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? 'https://192.168.2.1/api/addon/v1',
            VERSION: config?.VERSION ?? '1',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });

        this.container = new ContainerService(this.request);
        this.experimental = new ExperimentalService(this.request);
        this.repository = new RepositoryService(this.request);
    }
}

