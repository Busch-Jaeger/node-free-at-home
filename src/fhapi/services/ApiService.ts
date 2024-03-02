/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiRestAuxiliarydata } from '../models/ApiRestAuxiliarydata';
import type { ApiRestDatapoint_sysap__serial_Get200ApplicationJsonResponse } from '../models/ApiRestDatapoint_sysap__serial_Get200ApplicationJsonResponse';
import type { ApiRestDatapoint_sysap__serial_Put200TextPlainResponse } from '../models/ApiRestDatapoint_sysap__serial_Put200TextPlainResponse';
import type { ApiRestDatapoint_sysap__serial_PutRequest } from '../models/ApiRestDatapoint_sysap__serial_PutRequest';
import type { ApiRestDevice_sysap__device_Get200ApplicationJsonResponse } from '../models/ApiRestDevice_sysap__device_Get200ApplicationJsonResponse';
import type { ApiRestDevice_sysap__serial_PatchRequest } from '../models/ApiRestDevice_sysap__serial_PatchRequest';
import type { AuxilaryDataId } from '../models/AuxilaryDataId';
import type { ChannelSerial } from '../models/ChannelSerial';
import type { Configuration } from '../models/Configuration';
import type { DatapointSerial } from '../models/DatapointSerial';
import type { Devicelist } from '../models/Devicelist';
import type { DeviceSerial } from '../models/DeviceSerial';
import type { NativeSerial } from '../models/NativeSerial';
import type { Notification } from '../models/Notification';
import type { Pairings } from '../models/Pairings';
import type { SysapSection } from '../models/SysapSection';
import type { SysapUuid } from '../models/SysapUuid';
import type { VirtualDevice } from '../models/VirtualDevice';
import type { VirtualDevicesSuccess } from '../models/VirtualDevicesSuccess';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class ApiService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Get configuration
     * Get configuration for all user registered System Access Points, this includes the schema for all devices, channels and data points, the floorplan and current user information.
     *
     * The response body is a JSON object that uses the SysAP UUID of each SysAP of the requesting user account as key. The configuration of that SysAP is the corresponding value and is again a JSON object.
     *
     * You can find further description and an example of the returned data model in the [documentation](https://developer.eu.mybuildings.abb.com/fah_cloud/concepts/#data-model) and an example of this request in the [samples](https://developer.eu.mybuildings.abb.com/fah_cloud/samples/#query-the-configuration).
     * @returns Configuration Configuration
     * @throws ApiError
     */
    public getconfiguration(): CancelablePromise<Configuration> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/rest/configuration',
            errors: {
                401: `Authentication information is missing or invalid`,
                502: `free@home error`,
            },
        });
    }

    /**
     * Get devicelist
     * Get list of devices for all System Access Points.
     *
     * This endpoint is similar to the /api/rest/configuration endpoint, but only provides access to the list of Device IDs that are known by each SysAP, not their corresponding configuration.
     * @returns Devicelist Devicelist
     * @throws ApiError
     */
    public getdevicelist(): CancelablePromise<Devicelist> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/rest/devicelist',
            errors: {
                401: `Authentication information is missing or invalid`,
                502: `free@home error`,
            },
        });
    }

    /**
     * Get device
     * Get configuration information for given device.
     *
     * This endpoint is similar to the /api/rest/configuration endpoint, but except for returning the full configuration of all SysAPs, it returns the configuration of a single device in a single SysAP only and therefore is much faster and requires less bandwidth.
     *
     * The response body is a JSON object that maps the (single) SysAP UUID to an object that contains "devices" object (only) which in turn holds the specified device object (only).
     *
     * See also the [documentation](https://developer.eu.mybuildings.abb.com/fah_cloud/concepts/#data-model) for the meaning of the contents of the device object.
     * @param sysap SysAP UUID
     * @param device Device Serial
     * @returns ApiRestDevice_sysap__device_Get200ApplicationJsonResponse Success
     * @throws ApiError
     */
    public getdevice(
        sysap: SysapUuid,
        device: DeviceSerial,
    ): CancelablePromise<ApiRestDevice_sysap__device_Get200ApplicationJsonResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/rest/device/{sysap}/{device}',
            path: {
                'sysap': sysap,
                'device': device,
            },
            errors: {
                401: `Authentication information is missing or invalid`,
                404: `Resource not found`,
                502: `Could not connect to internal service. Is the local API enabled?`,
            },
        });
    }

    /**
     * Modify device properties
     * Modify device properties
     * @param sysap SysAP UUID
     * @param device Device Serial
     * @param requestBody New value
     * @returns ApiRestDevice_sysap__device_Get200ApplicationJsonResponse Success
     * @throws ApiError
     */
    public patchDevice(
        sysap: SysapUuid,
        device: DeviceSerial,
        requestBody: ApiRestDevice_sysap__serial_PatchRequest,
    ): CancelablePromise<ApiRestDevice_sysap__device_Get200ApplicationJsonResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/rest/device/{sysap}/{device}',
            path: {
                'sysap': sysap,
                'device': device,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Authentication information is missing or invalid`,
                502: `Could not connect to internal service. Is the local API enabled?`,
            },
        });
    }

    /**
     * Get datapoint value
     * Get the current value of a given datapoint. See the [documentation on datapoints](https://developer.eu.mybuildings.abb.com/fah_cloud/concepts/#input-and-output-datapoints) for further information and the [samples](https://developer.eu.mybuildings.abb.com/fah_cloud/samples/#query-a-datapoint) for an example.
     * @param sysap SysAP UUID
     * @param device Datapoint Serial. as obtained from e.g. a /api/rest/configuration call.
     * @param channel Channel of a device. Selects a channel in a device, as obtained from e.g. a /api/rest/configuration call.
     * @param datapoint Datapoint Serial. Selects a datapoint in a channel of a device.
     * @returns ApiRestDatapoint_sysap__serial_Get200ApplicationJsonResponse Success
     * @throws ApiError
     */
    public getdatapoint(
        sysap: SysapUuid,
        device: DeviceSerial,
        channel: ChannelSerial,
        datapoint: DatapointSerial,
    ): CancelablePromise<ApiRestDatapoint_sysap__serial_Get200ApplicationJsonResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/rest/datapoint/{sysap}/{device}.{channel}.{datapoint}',
            path: {
                'sysap': sysap,
                'device': device,
                'channel': channel,
                'datapoint': datapoint,
            },
            errors: {
                401: `Authentication information is missing or invalid`,
            },
        });
    }

    /**
     * Set datapoint value
     * Set a new value for a given datapoint. See the [documentation on datapoints](https://developer.eu.mybuildings.abb.com/fah_cloud/concepts/#input-and-output-datapoints) for further information and the [samples](https://developer.eu.mybuildings.abb.com/fah_cloud/samples/#set-a-datapoint) for an example.
     * @param sysap SysAP UUID
     * @param device Datapoint Serial. as obtained from e.g. a /api/rest/configuration call.
     * @param channel Channel of a device. Selects a channel in a device, as obtained from e.g. a /api/rest/configuration call.
     * @param datapoint Datapoint Serial. Selects a datapoint in a channel of a device.
     * @param requestBody New value
     * @returns ApiRestDatapoint_sysap__serial_Put200TextPlainResponse Success
     * @throws ApiError
     */
    public putdatapoint(
        sysap: SysapUuid,
        device: DeviceSerial,
        channel: ChannelSerial,
        datapoint: DatapointSerial,
        requestBody?: ApiRestDatapoint_sysap__serial_PutRequest,
    ): CancelablePromise<ApiRestDatapoint_sysap__serial_Put200TextPlainResponse> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/rest/datapoint/{sysap}/{device}.{channel}.{datapoint}',
            path: {
                'sysap': sysap,
                'device': device,
                'channel': channel,
                'datapoint': datapoint,
            },
            body: requestBody,
            mediaType: 'text/plain',
            errors: {
                401: `Authentication information is missing or invalid`,
                502: `Could not connect to internal service. Is the local API enabled?`,
            },
        });
    }

    /**
     * Set auxiliary data for a channel
     * Set auxiliary data for a channel.
     * @param sysap SysAP UUID
     * @param device Datapoint Serial. as obtained from e.g. a /api/rest/configuration call.
     * @param channel Channel of a device. Selects a channel in a device, as obtained from e.g. a /api/rest/configuration call.
     * @param index Index of the auxilary data. Selects auxilary data in a channel of a device.
     * @param requestBody New value
     * @returns any Success
     * @throws ApiError
     */
    public putAuxiliaryData(
        sysap: SysapUuid,
        device: DeviceSerial,
        channel: ChannelSerial,
        index: AuxilaryDataId,
        requestBody: ApiRestAuxiliarydata,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/rest/auxiliarydata/{sysap}/{device}/{channel}/{index}',
            path: {
                'sysap': sysap,
                'device': device,
                'channel': channel,
                'index': index,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Authentication information is missing or invalid`,
                502: `Could not connect to internal service. Is the local API enabled?`,
            },
        });
    }

    /**
     * Create virtual device
     * Create a virtual device inside free@home. You can choose a serialnumber freely. The following devices can be created: <ul> <li>BinarySensor</li> <li>SwitchingActuator </li> <li>CeilingFanActuator </li> <li>RTC </li> <li>DimActuator </li> <li>WindowSensor </li> <li>ShutterActuator </li> <li>WeatherStation </li> <li>Weather-TemperatureSensor </li> <li>Weather-WindSensor </li> <li>Weather-BrightnessSensor </li> <li>Weather-RainSensor </li> <li>CODetector </li> <li>FireDetector</li> <li>KNX-SwitchSensor</li> <li>MediaPlayer</li> <li>EnergyBattery</li> <li>EnergyInverter</li> <li>EnergyMeter</li> <li>EnergyInverterBattery</li> <li>EnergyInverterMeter</li> <li>EnergyInverterMeterBattery</li> <li>EnergyMeterBattery</li> <li>AirQualityCO2</li> <li>AirQualityCO</li> <li>AirQualityFull</li> <li>AirQualityHumidity</li> <li>AirQualityNO2</li> <li>AirQualityO3</li> <li>AirQualityPM10</li> <li>AirQualityPM25</li> <li>AirQualityPressure</li> <li>AirQualityTemperature</li> <li>AirQualityVOC</li> </ul>
     *
     * As response you should recieve a success message with internal serialnumber granted by the SysAP for that virtual device. Now you can continue working with that virtual device as with any other native free@home component via free@home API.
     *
     * This endpoint is also used to update the TTL regularly per device. When the application does not call this endpoint every TTL seconds (defaults to 180), the SysAP will mark the virtual device as unresponsive until a newlife sign is send. Changes to the datapoints can be sent via the /api/rest/datapoint/ endpoint.
     *
     * Please find further description in the [virtual device documentation](https://developer.eu.mybuildings.abb.com/fah_cloud/concepts/#virtual-devices) and an example in the [samples](https://developer.eu.mybuildings.abb.com/fah_cloud/samples/#how-to-register-a-virtual-device).
     * @param sysap SysAP UUID
     * @param serial serialnumber for virtual device (choose freely)
     * @param requestBody Optional description in *JSON*
     * @returns VirtualDevicesSuccess successful
     * @throws ApiError
     */
    public createVirtualDevice(
        sysap: SysapUuid,
        serial: NativeSerial,
        requestBody: VirtualDevice,
    ): CancelablePromise<VirtualDevicesSuccess> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/rest/virtualdevice/{sysap}/{serial}',
            path: {
                'sysap': sysap,
                'serial': serial,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request from Client`,
                401: `Authentication information is missing or invalid`,
                502: `Could not connect to internal service. Is the local API enabled?`,
            },
        });
    }

    /**
     * Post a notification
     * Post a notification
     * @param requestBody New value
     * @returns any Notification
     * @throws ApiError
     */
    public postnotification(
        requestBody: Notification,
    ): CancelablePromise<Record<string, any>> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/rest/notification',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Authentication information is missing or invalid`,
                502: `free@home error`,
            },
        });
    }

    /**
     * Get sysap related information
     * Get sysap related information
     * @returns SysapSection Sysap
     * @throws ApiError
     */
    public getsysap(): CancelablePromise<SysapSection> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/rest/sysap',
            errors: {
                401: `Authentication information is missing or invalid`,
                502: `free@home error`,
            },
        });
    }

    /**
     * Get pairings between sensor and actuator
     * Get pairings between sensor and actuator
     * @returns Pairings Sysap
     * @throws ApiError
     */
    public getpairings(): CancelablePromise<Pairings> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/rest/pairings',
            errors: {
                401: `Authentication information is missing or invalid`,
                502: `free@home error`,
            },
        });
    }

}
