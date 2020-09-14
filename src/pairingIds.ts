export enum PairingIds {
    switchOnOff = 0x0001,
    timedStartStop = 0x0002,
    forced = 0x0003,
    timedMovement = 0x0006,

    relativeSetValue = 0x0010,
    absoluteSetValue = 0x0011,
    night = 0x0012,

    moveUpDown = 0x20,
    adjustUpDown = 0x21,
    setAbsolutePositionBlinds = 0x23,
    setAbsolutePositionSlats = 0x24,
    forcePositionBlind = 0x28,
    windAlarm = 0x25,
    rainAlarm = 0x27,
    frostAlarm = 0x26,
    sceneControl = 0x4,
    windowDoorPosition = 0x0029,
    windowDoor = 0x0035,


    infoOnOff = 0x0100,

    infoActualDimmingValue = 0x0110,
    infoMoveUpDown = 0x120,
    currentAbsolutePositionBlindsPercentage = 0x121,
    currentAbsolutePositionSlatsPercentage = 0x122,
    infoError = 0x111,
    forcePositionInfo = 0x101,

    outdoorTemperature = 0x0400,
    windForce = 0x0401,
    brightnessAlarm = 0x0402,
    brightnessLevel = 0x0403,
    windSpeed = 0x0404,
    rainSensorActivation_Percentage = 0x0405,
    rainSensorFrequency = 0x0406,

}