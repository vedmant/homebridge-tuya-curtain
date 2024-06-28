import { PlatformAccessory, Service } from 'homebridge'
import { ExampleHomebridgePlatform } from './platform.js'
import TuyaApi from './TuyaApi.js'

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class CurtainSwitchAccessory {
  private service: Service
  private api: any

  constructor(
    private readonly platform: ExampleHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    this.api = new TuyaApi(platform, 'eb2b765f623196b2b9gse1')

    // set accessory information
    accessory.getService(platform.Service.AccessoryInformation)!
      .setCharacteristic(platform.Characteristic.Manufacturer, 'Default-Manufacturer123')
      .setCharacteristic(platform.Characteristic.Model, 'Default-Model123')
      .setCharacteristic(platform.Characteristic.SerialNumber, 'Default-Serial123')

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service = accessory.getService(platform.Service.Outlet) || accessory.addService(platform.Service.Outlet)

    // const service2 = this.accessory.getService('Curtain switch2') ||
    //   this.accessory.addService(this.platform.Service.StatefulProgrammableSwitch, 'Curtain switch2', 'YourUniqueIdentifier-1');

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(platform.Characteristic.Name, 'Curtain switch')

    this.service.getCharacteristic(platform.Characteristic.BatteryLevel)
      .onGet(this.getBatteryLevel.bind(this))

    this.service.getCharacteristic(platform.Characteristic.On)
      .onGet(this.handleOnGet.bind(this))
      .onSet(this.handleOnSet.bind(this))

    //
    // this.service.getCharacteristic(platform.Characteristic.ProgrammableSwitchEvent)
    //   .onGet(this.handleProgrammableSwitchEventGet.bind(this))
    //
    // this.service.getCharacteristic(platform.Characteristic.ProgrammableSwitchOutputState)
    //   .onGet(this.handleProgrammableSwitchOutputStateGet.bind(this))
    //   .onSet(this.handleProgrammableSwitchOutputStateSet.bind(this))
  }

  async getBatteryLevel() {
    const value = await this.api.getProperty('battery_percentage')

    this.platform.log.debug('Triggered getBatteryLevel:' + value)

    return value
  }

  async handleProgrammableSwitchEventGet() {
    const value = this.platform.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS

    this.platform.log.debug('Triggered handleProgrammableSwitchEventGet:' + value)

    return value
  }

  async handleOnGet() {
    const value = await this.api.getProperty('percent_state')

    this.platform.log.debug('Triggered handleOnGet:' + (value > 50))

    return value > 50
  }

  async handleOnSet(value: any) {
    this.platform.log.debug('Triggered handleOnSet:' + value)

    await this.api.setProperty('control', value ? 'open' : 'close')

    setTimeout(() => {
      this.service.updateCharacteristic(this.platform.Characteristic.On, value)
    }, 10000)
  }
}
