/**
 * Plugin to log errors using Airbrake API
 * @module AirbrakePlugin
 */

/**
 * We use Airbrake to capture errors thrown within the service and send them to an instance of Errbit we maintain in
 * Defra.
 *
 * {@link https://hapi.dev/api/?v=20.0.0#-request-event}
 *
 * Airbrake doesn't provide a specific Hapi plugin. We've avoided others as they are very out of date. So instead we
 * roll our own plugin using the following as references.
 *
 * {@link https://github.com/DEFRA/node-hapi-airbrake/blob/master/lib/index.js}
 * {@link https://github.com/DEFRA/charging-module-api/blob/master/app/plugins/airbrake.js}
 */

import { Notifier } from '@airbrake/node'

import airbrakeConfig from '../../config/airbrake.config.js'
import { gotWrapper } from '../lib/got-wrapper.lib.js'
import serverConfig from '../../config/server.config.js'

// The `Notifier` constructor unconditionally hooks `process.on('uncaughtException' | 'unhandledRejection' |
// 'beforeExit', ...)` and never removes these listeners. In production this plugin is only ever registered once, so
// it's a non-issue there, but our tests spin up many real Hapi servers (one per test file), and each would otherwise
// create its own `Notifier`, permanently leaking 3 process-level listeners per server. We keep a single instance
// here and reuse it across every registration to avoid that leak.
let _notifier

const AirbrakePlugin = {
  name: 'airbrake',
  register: async (server, _options) => {
    // We add an instance of the Airbrake Notifier so we can send notifications via Airbrake to Errbit manually if
    // needed. It's main use is when passed in as a param to RequestNotifierLib in the RequestNotifierPlugin
    if (!_notifier) {
      _notifier = new Notifier(await _notifierArgs())
    }

    server.app.airbrake = _notifier

    // When Hapi emits a request event with an error we capture the details and use Airbrake to send a request to our
    // Errbit instance
    server.events.on({ name: 'request', channels: 'error' }, (request, event, _tags) => {
      server.app.airbrake
        .notify({
          error: event.error,
          session: {
            route: request.route.path,
            method: request.method,
            url: request.url.href
          }
        })
        .then((notice) => {
          if (!notice.id) {
            server.logger.error({ message: `Airbrake notification failed: ${notice.error}`, error: notice.error })
          }
        })
        .catch((error) => {
          server.logger.error({ message: `Airbrake notification errored: ${error}`, error })
        })
    })
  }
}

async function _notifierArgs() {
  const args = {
    host: airbrakeConfig.host,
    projectId: airbrakeConfig.projectId,
    projectKey: airbrakeConfig.projectKey,
    environment: airbrakeConfig.environment,
    errorNotifications: true,
    performanceStats: false,
    remoteConfig: false
  }

  if (serverConfig.httpProxy) {
    args.request = await gotWrapper({ proxy: serverConfig.httpProxy })
  }

  return args
}

export default AirbrakePlugin
