'use strict'

/**
 * Add an `onPreResponse` listener to return HTML error pages for Boom errors.
 *
 * The plugin is configured in the route's `plugins.errorPages` object. If `plainOutput` is set to `true` then the
 * output will not be put into an HTML template and will simply be returned as-is.
 *
 * The bulk of this is taken from https://github.com/DEFRA/hapi-web-boilerplate and tweaked to fit how we organise our
 * code. For now we have removed Google Analytics (which would have been added to the `context` option) as we can
 * integrate that at a later date.
 *
 * @module RequestNotifierPlugin
 */

const ErrorPagesPlugin = {
  plugin: {
    name: 'error-pages',
    register: (server, _options) => {
      server.ext('onPreResponse', (request, h) => {
        const { response } = request

        // By adding `plugins: { errorPages: { plainOutput: true }}` to a route's `options:` property you can control
        // whether we display our error handling pages or not. This is handy for API only pages where we would not want
        // an error page to be returned as the response
        const { errorPages: pluginSettings } = request.route.settings.plugins

        // Whether we purposely return a Boom error in our controllers or not, exceptions thrown by the controllers are
        // wrapped as Boom errors. So, in this context `isBoom` can be read as `isError`.
        if (response.isBoom && !pluginSettings?.plainOutput) {
          const { statusCode } = response.output

          if (statusCode === 404) {
            return h.view('404').code(statusCode)
          }

          request.app.notifier.omfg(response.message, {}, response)

          return h.view('500').code(statusCode)
        }

        return h.continue
      })
    }
  }
}

module.exports = ErrorPagesPlugin
