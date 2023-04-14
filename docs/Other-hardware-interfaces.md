## Supporting other Hardware Interfaces with ABB free@home Addons

------------------------------------------------------------------------

A straight-forward way of adding support for external devices to the System Access Point using
ABB free@home Addons is using a REST interface of an external device. The Addon JavaScript that is
running on the System Access Point can then simply make REST calls to the external device on the one
hand and to the Local API of the System Access Point on the other hand.

However in many cases, an external device is not connected to the local ethernet network and
therefore does not provide a REST interface, but rather a different protocol over a different
hardware interface. A common example would be a device using the Modbus protocol over a serial
interface. Such devices can be attached to the System Access Point using a USB connection.

An ABB free@home Addon can be used to add support for these types of devices as well.

Devices that appear to the System Access Point as a serial device over USB can be integrated using
the JavaScript library in the ABB free@home Addon Development Kit like this:

```javascript
import { Serial } from 'free-at-home';
Serial.EnableSerialMock();

import { SerialPort } from "serialport";

function run() {
    const serialport = new SerialPort({ path: 'USB0', baudRate: 9600, parity: 'none', });
    serialport.open(() => {
        console.log("connected");
    }
}

run(); // main function
```

(do not omit the `Serial.EnableSerialMock()` call, it is important)

From this point on, the communication with the device can be implemented: `serialport.write(...);`
will write to the device, a snippet like this can be used to receive data:

```javascript
const { ReadlineParser } = require('@serialport/parser-readline')

const parser = serialport.pipe(new ReadlineParser({
    delimiter: '\r\n',
    includeDelimiter: true
}));

parser.on("data", (chunk: any) => {
    // ... (handle chunk)
})
```
