import { PlatformAccessory, Service } from 'homebridge'
import { ExampleHomebridgePlatform } from './platform.js'
import TuyaApi from './TuyaApi.js'

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class ExamplePlatformAccessory {
  private service: Service
  private api: any
  private updating: boolean = false

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private exampleStates = {
    target_position: 0,
  }

  constructor(
    private readonly platform: ExampleHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    this.api = new TuyaApi(platform, 'eb2b765f623196b2b9gse1')

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
      .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial')

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.WindowCovering) || this.accessory.addService(this.platform.Service.WindowCovering)

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName)

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.CurrentPosition)
      .onGet(this.handleCurrentPositionGet.bind(this))

    // this.service.getCharacteristic(this.platform.Characteristic.PositionState)
    //   .onGet(this.handlePositionStateGet.bind(this))

    this.service.getCharacteristic(this.platform.Characteristic.BatteryLevel)
      .onGet(this.getBatteryLevel.bind(this))

    this.service.getCharacteristic(this.platform.Characteristic.TargetPosition)
      .onGet(this.handleTargetPositionGet.bind(this))
      .onSet(this.handleTargetPositionSet.bind(this))

    this.service.getCharacteristic(this.platform.Characteristic.HoldPosition)
      .onGet(this.handleHoldPositionGet.bind(this))
      .onSet(this.handleHoldPositionSet.bind(this))

    // Load and set initial position
    ;(async () => {
      this.exampleStates.target_position = await this.api.getProperty('percent_state')
    })()

    // setInterval(async () => {
    //   this.service.updateCharacteristic(this.platform.Characteristic.TargetPosition, this.exampleStates.target_position)
    // }, 10000)
  }

  startUpdate () {
    if (this.updating) return
    this.updating = true
    this.platform.log.debug('startUpdate')

    let num = 0
    const interval = setInterval(async () => {
      if (num > 10) {
        clearInterval(interval)
        this.platform.log.debug('stopUpdate')
        this.updating = false
        return
      }

      let pos = await this.api.getProperty('percent_state', false)
      // const state = this.getStateByPosition(pos)
      this.service.updateCharacteristic(this.platform.Characteristic.CurrentPosition, pos)
      // this.service.updateCharacteristic(this.platform.Characteristic.PositionState, state)

      this.platform.log.debug('Updated current position:', pos)
      this.platform.log.debug('Updated position state:', pos)
      num ++
    }, 4000)
  }

  async handleCurrentPositionGet() {
    let value = await this.api.getProperty('percent_state')
    this.platform.log.debug('Triggered GET CurrentPosition: ' + value)

    return value
  }

  getStateByPosition (pos: number) {
    if (pos === this.exampleStates.target_position || pos < 20 || pos > 80) {
      return this.platform.Characteristic.PositionState.STOPPED
    }

    return pos > this.exampleStates.target_position
      ? this.platform.Characteristic.PositionState.INCREASING
      : this.platform.Characteristic.PositionState.DECREASING
  }

  async handlePositionStateGet() {
    let pos = await this.api.getProperty('percent_state')

    const state = this.getStateByPosition(pos)

    this.platform.log.debug('Triggered GET PositionState: ' + pos + ', exampleStates.target_position: ' + this.exampleStates.target_position + ', state: ' + state)

    return state
  }

  handleTargetPositionGet() {
    this.platform.log.debug('Triggered GET TargetPosition:' + this.exampleStates.target_position)

    return this.exampleStates.target_position
  }

  async handleTargetPositionSet(value: any) {
    value = 100 - value
    await this.api.setProperty('percent_control', value)

    this.exampleStates.target_position = value

    this.platform.log.debug('Triggered SET TargetPosition: ' + value)
    this.startUpdate()
  }

  async getBatteryLevel() {
    const value = await this.api.getProperty('battery_percentage')

    this.platform.log.debug('Triggered GET getBatteryLevel:' + value)

    return value
  }

  handleHoldPositionGet() {
    this.platform.log.debug('Triggered GET HoldPositionGet:' + this.exampleStates.target_position)

    return 'stop'
  }

  async handleHoldPositionSet(value: any) {
    this.platform.log.debug('Triggered SET HoldPositionSet: ' + value)

    // await this.api.request({
    //   path: `/v2.0/cloud/thing/eb2b765f623196b2b9gse1/shadow/properties/issue`,
    //   method: 'POST',
    //   body: { properties: JSON.stringify({ control: value }) },
    // })
  }
}
