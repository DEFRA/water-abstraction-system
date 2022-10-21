import Hapi from '@hapi/hapi'
import Inert from '@hapi/inert'

import ServerConfig from '../config/server.config.js'
import TestConfig from '../config/test.config.js'

import AirbrakePlugin from './plugins/airbrake.plugin.js'
import BlippPlugin from './plugins/blipp.plugin.js'
import ErrorPagesPlugin from './plugins/error_pages.plugin.js'
import HapiPinoPlugin from './plugins/hapi_pino.plugin.js'
import RequestNotifierPlugin from './plugins/request_notifier.plugin.js'
import RouterPlugin from './plugins/router.plugin.js'
import StopPlugin from './plugins/stop.plugin.js'
import ViewsPlugin from './plugins/views.plugin.js'

const registerPlugins = async (server) => {
  // Register the remaining plugins
  await server.register(StopPlugin)
  await server.register(Inert)
  await server.register(RouterPlugin)
  await server.register(HapiPinoPlugin(TestConfig.logInTest))
  await server.register(AirbrakePlugin)
  await server.register(ErrorPagesPlugin)
  await server.register(RequestNotifierPlugin)
  await server.register(ViewsPlugin)

  // Register non-production plugins
  if (ServerConfig.environment === 'development') {
    await server.register(BlippPlugin)
  }
}

const init = async () => {
  // Create the hapi server
  const server = Hapi.server(ServerConfig.hapi)

  await registerPlugins(server)
  await server.initialize()

  return server
}

const start = async () => {
  const server = await init()
  await server.start()

  return server
}

process.on('unhandledRejection', err => {
  console.log(err)
  process.exit(1)
})

export { init, start }
