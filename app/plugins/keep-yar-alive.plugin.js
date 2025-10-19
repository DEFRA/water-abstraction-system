'use strict'

const KeepYarAlivePlugin = {
  name: 'keepYarAlive',
  register: (server, _options) => {
    server.ext('onPreHandler', (request, h) => {
      if (!request.yar || request.route.settings.app?.skipSessionTouch) {
        return h.continue
      }

      try {
        // Touch is a manual way of telling Yar there has been changes. For example, you've called get(), and the
        // modified the return object rather than calling set().
        // It essentially just updates Yar's 'last modified' but it also results in the Yar reissuing the session cookie
        // with a refreshed TTL.
        request.yar.touch()
      } catch (error) {
        global.GlobalNotifier.omfg('Failed to keep session alive', {}, error)
      }

      return h.continue
    })
  }
}

module.exports = KeepYarAlivePlugin
