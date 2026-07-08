import Hapi from '@hapi/hapi'

import AirbrakePlugin from './plugins/airbrake.plugin.js'
import AuthPlugin from './plugins/auth.plugin.js'
import BearerPlugin from './plugins/bearer.plugin.js'
import ChargingModuleTokenCachePlugin from './plugins/charging-module-token-cache.plugin.js'
import ContentSecurityPolicyPlugin from './plugins/content-security-policy.plugin.js'
import CrumbPlugin from './plugins/crumb.plugin.js'
import ErrorPagesPlugin from './plugins/error-pages.plugin.js'
import GlobalHapiServerMethodsPlugin from './plugins/global-hapi-server-methods.plugin.js'
import GlobalNotifierPlugin from './plugins/global-notifier.plugin.js'
import HapiPinoPlugin from './plugins/hapi-pino.plugin.js'
import KeepYarAlivePlugin from './plugins/keep-yar-alive.plugin.js'
import NotifyTokenCachePlugin from './plugins/notify-token-cache.plugin.js'
import PayloadCleanerPlugin from './plugins/payload-cleaner.plugin.js'
import RequestNotifierPlugin from './plugins/request-notifier.plugin.js'
import RespTokenCachePlugin from './plugins/resp-token-cache.plugin.js'
import RouterPlugin from './plugins/router.plugin.js'
import StopPlugin from './plugins/stop.plugin.js'
import ViewsPlugin from './plugins/views.plugin.js'
import YarPlugin from './plugins/yar.plugin.js'

import Cookie from '@hapi/cookie'
import Inert from '@hapi/inert'
import Scooter from '@hapi/scooter'

import ServerConfig from '../config/server.config.js'

async function registerPlugins(server) {
  // NOTE: This order matters to some plugins we register. Inserting into the order should be fine. But if you reorder
  // any existing plugin registration double-check you haven't broken anything!
  await server.register(StopPlugin)
  await server.register(Inert)
  await server.register(Cookie)
  await server.register(Scooter)
  await server.register(YarPlugin)
  await server.register(BearerPlugin)
  await server.register(AuthPlugin)
  await server.register(RouterPlugin)
  await server.register(HapiPinoPlugin)
  await server.register(AirbrakePlugin)
  await server.register(GlobalNotifierPlugin)
  await server.register(ChargingModuleTokenCachePlugin)
  await server.register(NotifyTokenCachePlugin)
  await server.register(CrumbPlugin)
  await server.register(ErrorPagesPlugin)
  await server.register(RequestNotifierPlugin)
  await server.register(RespTokenCachePlugin)
  await server.register(PayloadCleanerPlugin)
  await server.register(ViewsPlugin)
  await server.register(ContentSecurityPolicyPlugin)
  await server.register(GlobalHapiServerMethodsPlugin)
  await server.register(KeepYarAlivePlugin)
}

async function init() {
  // Create the hapi server
  const server = Hapi.server(ServerConfig.hapi)

  await registerPlugins(server)
  await server.initialize()

  return server
}

async function start() {
  const server = await init()

  await server.start()

  return server
}

process.on('unhandledRejection', (err) => {
  console.error(err)
  process.exit(1)
})

export { init, start }
export default { init, start }
