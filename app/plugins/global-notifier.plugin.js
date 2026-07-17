/**
 * Plugin to add a globally available notifier for logging and sending exceptions to Errbit
 * @module GlobalNotifierPlugin
 */

import GlobalNotifierLib from '../lib/global-notifier.lib.js'

export default {
  name: 'global-notifier',
  register: (server, _options) => {
    globalThis.GlobalNotifier = new GlobalNotifierLib(server.logger, server.app.airbrake)
  }
}
