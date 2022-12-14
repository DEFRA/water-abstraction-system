'use strict'

require('dotenv').config()

const Hapi = require('@hapi/hapi')

const AirbrakePlugin = require('./plugins/airbrake.plugin.js')
const BlippPlugin = require('./plugins/blipp.plugin.js')
const ErrorPagesPlugin = require('./plugins/error-pages.plugin.js')
const HapiPinoPlugin = require('./plugins/hapi-pino.plugin.js')
const RequestNotifierPlugin = require('./plugins/request-notifier.plugin.js')
const RouterPlugin = require('./plugins/router.plugin.js')
const StopPlugin = require('./plugins/stop.plugin.js')
const ViewsPlugin = require('./plugins/views.plugin.js')

const ServerConfig = require('../config/server.config.js')

const registerPlugins = async (server) => {
  // Register the remaining plugins
  await server.register(StopPlugin)
  await server.register(require('@hapi/inert'))
  await server.register(RouterPlugin)
  await server.register(HapiPinoPlugin())
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

module.exports = { init, start }
