'use strict'

/**
 * @module GlobalNotifierLib
 */

const BaseNotifierLib = require('./base-notifier.lib.js')

/**
 * A combined logging and Airbrake (Errbit) notification manager for actions that take place outside of a
 * {@link https://hapi.dev/api/?v=20.1.2#request|Hapi request}
 *
 * Created for use with the `app/plugins/global-notifier.plugin.js`.
 */
class GlobalNotifierLib extends BaseNotifierLib {
  constructor (airbrakeNotifier) {
    // We expect the plugin to provide the existing instance of Airbrake created at startup. But we lean into
    // BaseNotifierLib's logic for creating an instance of Pino when one isn't provided
    super(null, airbrakeNotifier)
  }

  _formatLogPacket (message, data) {
    return {
      message,
      ...data
    }
  }

  _formatNotifyPacket (message, data) {
    return {
      message,
      session: data
    }
  }
}

module.exports = GlobalNotifierLib
