import generator, { OAuth, detector } from 'megalodon'
import prompt from 'prompt'
import fs from 'fs'

let clientId: string
let clientSecret: string

prompt.start()
prompt.get(['serverUrl'], async function (err, result) {
  if (err) { return console.error(err) }
  
  let serverUrl = result.serverUrl as string
  if (!serverUrl.startsWith('https://')) {
    serverUrl = 'https://' + serverUrl
  }
  
  const instanceType = await detector(serverUrl)
  const client = generator(instanceType, serverUrl)

  const appData = await client.registerApp('Feed Reader', { scopes: ['read'] })
  clientId = appData.client_id
  clientSecret = appData.client_secret
  console.log('Authorization URL is generated.')
  console.log(appData.url)

  prompt.get(['authorizationCode'], async function (err, result) {
    if (err) { return console.error(err) }
    const authorizationCode = result.authorizationCode as string
    const tokenData = await client.fetchAccessToken(clientId, clientSecret, authorizationCode)
    const extendedData = { ...tokenData, serverUrl }
    fs.writeFile('tokenData.json', JSON.stringify(extendedData, null, 2), (err) => {
      if (err) throw err;
      console.log('Token data has been saved!');
    })
  })
})