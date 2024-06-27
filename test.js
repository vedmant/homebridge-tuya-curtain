const { TuyaContext } = require('@tuya/tuya-connector-nodejs')

const context = new TuyaContext({
  baseUrl: 'https://openapi.tuyaus.com',
  accessKey: 'jvmdqw83uqt8pgrkyhqm',
  secretKey: '1a65d3a11197471ebe4ca90ff1adc398',
})

async function test () {
  // console.log(await context.request({
  //   path: `/v2.0/cloud/thing/device?page_size=10`,
  //   method: 'GET',
  // }))

  // console.log(JSON.stringify(await context.request({
  //   path: `/v2.0/cloud/thing/eb2b765f623196b2b9gse1/shadow/properties`,
  //   method: 'GET',
  // }), null, 2))

  // console.log(JSON.stringify(await context.request({
  //   path: `/v2.0/cloud/thing/eb2b765f623196b2b9gse1/model`,
  //   method: 'GET',
  // }), null, 2))

  // console.log(await context.request({
  //   path: `/v2.0/cloud/thing/eb2b765f623196b2b9gse1/shadow/actions`,
  //   method: 'POST',
  //   body: { code: 'percent_control', input_params: JSON.stringify({percent_control: 90})},
  // }))

  console.log(await context.request({
    path: `/v2.0/cloud/thing/eb2b765f623196b2b9gse1/shadow/properties/issue`,
    method: 'POST',
    body: { properties: JSON.stringify({percent_control: 90})},
  }))

}

test()
