import { ApiDevice } from './apiDevice';
import { ApiChannel } from './apiChannel';

export class ApiChannelIterator implements IterableIterator<ApiChannel> {
    private devicesIterator: Iterator<ApiDevice>;
    private channelsIterator: Iterator<ApiChannel> | undefined = undefined;

    constructor(devicesIterator: Iterator<ApiDevice>) {
        this.devicesIterator = devicesIterator;
    }

    [Symbol.iterator]() {
        return this;
    }

    public next(): IteratorResult<ApiChannel> {
        while (true) {
            if (undefined === this.channelsIterator) {
                const deviceIteratorResult = this.devicesIterator.next();
                if (true === deviceIteratorResult.done) {
                    return {
                        done: true,
                        value: null
                    };
                }
                this.channelsIterator = deviceIteratorResult.value.getChannels();
            }
            const channelIteratorResult = this.channelsIterator.next();
            if (true == channelIteratorResult.done) {
                this.channelsIterator = undefined;
                continue;
            }
            return channelIteratorResult;
        }
    }

}
