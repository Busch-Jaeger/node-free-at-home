export enum Capabilities {
    CAP_LED_BRIGHTNESS = 0x0001, // can be LED brighness be configured
    CAP_EXTERNAL_TEMPERATURE_SENSOR = 0x0002, // does the device support an external temperature sensor
    CAP_STANDARD_RTC_UI = 0x0003, // does the device support the standard Room Temperature Controller user inteface
    CAP_CALDION_UI = 0x0004, // does the device support the Caldion user inteface
    CAP_ENERGY_CURRENT_POWER = 0x0010, // supports energy measurement with current power
    CAP_ENERGY_TODAY = 0x0011, // supports energy measurement and serves today value
    CAP_ENERGY_TOTAL = 0x0012, // supports energy measurement and serves total value
    CAP_STATE_OF_CHARGE = 0x0013, // supports state of charge
    CAP_ENERGY_CURRENT_EXCESS_POWER = 0x0014, // supports energy measurement current excess power
    CAP_ECO_CHARGING = 0x0015, // supports eco charging
    CAP_PHASES = 0x0016, // supports different numbers of phases
    CAP_FREE_VENDING = 0x0017, // supports free vending
    CAP_DISABLE_CHARGING = 0x0018, // supports disable charging    
    CAP_SWITCH_ON_OFF = 0x0020, // supports switching on/off
    CAP_REMOTE_START = 0x0030, // supports remote start
    CAP_SWING_MODES = 0x0040, // supports swing modes
}
