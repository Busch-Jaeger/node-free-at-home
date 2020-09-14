export enum ParameterIds {
    dummy = 0x01,

    dimmingActuatorMinBrightness = 0x0004,
    dimmingActuatorMaxBrightnessDay = 0x0005,
    dimmingActuatorMaxBrightnessNight = 0x0012,
    autonomousSwitchOffTimeDuration = 0x0015,
    dimmerSwitchOnMode = 0x0029,

    biContactType = 0x0010,
    sensorType = 0x0043,

    brightnessAlertActivationLevel = 0x002B,
    /** Hysteresis brightness alert **/
    hysteresis = 0x002C,
    /** Frost Alarm activation level **/
    frostAlarmActivationLevel = 0x002D,
    windForce = 0x002E,

    alertActivationDelay = 0x0047,
    /** Alert deactivation delay **/
    dealertActivationDelay = 0x0048,
}