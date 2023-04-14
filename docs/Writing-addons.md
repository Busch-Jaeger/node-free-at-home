## ABB free@home Addons

The free@home smart house automation system can be extended with the use of addons, if desired.
An ABB free@home Addon can be installed to the free@home System Access Point and can provide additional
functionality, such as integrating new devices from external vendors into the free@home system, so
that they can be controlled just like normal free@home devices using the free@home apps, used in in
timers or scenes, and so on.

From a technical point of view, ABB free@home Addons are Node.js archives that are deployed to the
System Access Point of the end-user and run there in a container. The addon as access to the
[local-api](https://developer.eu.mybuildings.abb.com/fah_local/) on the System Access Point and can
therefore create and control (virtual) devices, communicate with external devices (e.g. using a
REST API provided by that device) and so on.

### Target audience

This documentation describes how to develop new addons for the free@home system. As such, this documentation is aimed primarily at developers - device vendors or simply enthusiasts with basic development experience.
No detailed knowledge of the free@home system is required, other than being able to use it. Some basic knowledge of TypeScript and Node.js are expected though, see the [prerequisites](prerequisites) for details.

### Overview

To get started immediately, please refer to the [walkthrough](Getting-started).

The remainder of this documentation gives further details on ABB free@home Addons.
