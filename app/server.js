'use strict'

const Hapi = require('@hapi/hapi')

const AirbrakePlugin = require('./plugins/airbrake.plugin.js')
const AuthPlugin = require('./plugins/auth.plugin.js')
const BearerPlugin = require('./plugins/bearer.plugin.js')
const ChargingModuleTokenCachePlugin = require('./plugins/charging-module-token-cache.plugin.js')
const ContentSecurityPolicyPlugin = require('./plugins/content-security-policy.plugin.js')
const CrumbPlugin = require('./plugins/crumb.plugin.js')
const ErrorPagesPlugin = require('./plugins/error-pages.plugin.js')
const GlobalHapiServerMethodsPlugin = require('./plugins/global-hapi-server-methods.plugin.js')
const GlobalNotifierPlugin = require('./plugins/global-notifier.plugin.js')
const HapiPinoPlugin = require('./plugins/hapi-pino.plugin.js')
const KeepYarAlivePlugin = require('./plugins/keep-yar-alive.plugin.js')
const NotifyTokenCachePlugin = require('./plugins/notify-token-cache.plugin.js')
const PayloadCleanerPlugin = require('./plugins/payload-cleaner.plugin.js')
const RequestNotifierPlugin = require('./plugins/request-notifier.plugin.js')
const RespTokenCachePlugin = require('./plugins/resp-token-cache.plugin.js')
const RouterPlugin = require('./plugins/router.plugin.js')
const StopPlugin = require('./plugins/stop.plugin.js')
const ViewsPlugin = require('./plugins/views.plugin.js')
const YarPlugin = require('./plugins/yar.plugin.js')

const ServerConfig = require('../config/server.config.js')

const registerPlugins = async (server) => {
  // NOTE: This order matters to some plugins we register. Inserting into the order should be fine. But if you reorder
  // any existing plugin registration double-check you haven't broken anything!
  await server.register(StopPlugin)
  await server.register(require('@hapi/inert'))
  await server.register(require('@hapi/cookie'))
  await server.register(require('@hapi/scooter'))
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

process.on('unhandledRejection', (err) => {
  console.error(err)
  process.exit(1)
})

if (process.env.TRACE_PG_DEPRECATION_WARNING === 'true') {
  console.log('🚀 ~ pg concurrent query deprecation warning tracing is enabled')
  process.on('warning', (warning) => {
    const isPgConcurrentQueryWarning =
      warning.name === 'DeprecationWarning' &&
      warning.message.includes('Calling client.query() when the client is already executing a query')

    if (!isPgConcurrentQueryWarning) {
      return
    }

    console.error('\n[TRACE_PG_DEPRECATION_WARNING] Captured pg concurrent query deprecation warning')
    console.error(warning.stack)

    if (typeof process.__tracePgDumpActiveQueries === 'function') {
      process.__tracePgDumpActiveQueries()
    }
  })
}

module.exports = { init, start }
