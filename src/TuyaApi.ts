import { TuyaContext } from '@tuya/tuya-connector-nodejs'
import { debounce } from 'lodash-es'
import { ExampleHomebridgePlatform } from './platform'

export default class TuyaApi {
  public api: any
  private getPropsDebounce: Function

  constructor(
    private readonly platform: ExampleHomebridgePlatform,
    private readonly deviceId: string,
  ) {
    this.api = new TuyaContext({
      baseUrl: 'https://openapi.tuyaus.com',
      accessKey: 'jvmdqw83uqt8pgrkyhqm',
      secretKey: '1a65d3a11197471ebe4ca90ff1adc398',
    })

    this.getPropsDebounce = debounce(this.getProps, 1000, { leading: true, trailing: false })
  }

  async getProps() {
    const data = await this.api.request({
      path: `/v2.0/cloud/thing/${this.deviceId}/shadow/properties`,
      method: 'GET',
    })

    this.platform.log('getProps: ' + JSON.stringify(data.result.properties.reduce((acc: any, p: any) => ((acc[p.code] = p.value), acc), {})))

    return data.result.properties
  }

  async getProperty(code: string, debounce = true) {
    const props = debounce ? await this.getPropsDebounce() : await this.getProps()

    const property = props.find((p: any) => p.code === code)

    if (code === 'percent_state') {
      property.value = 100 - property.value
      property.value = property.value < 20 ? 0 : (property.value > 80 ? 100 : property.value)
    }

    this.platform.log('getProperty: ' + code + ': ' + JSON.stringify(property?.value))

    return property?.value
  }

  async setProperty(code: string, value: any) {
    await this.api.request({
      path: `/v2.0/cloud/thing/${this.deviceId}/shadow/properties/issue`,
      method: 'POST',
      body: { properties: JSON.stringify({ [code]: value }) },
    })
  }
}
