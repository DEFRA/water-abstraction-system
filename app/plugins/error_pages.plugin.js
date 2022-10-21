/**
 * Add an `onPreResponse` listener to return error pages
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

        if (response.isBoom) {
          const { statusCode } = response.output

          if (statusCode === 404) {
            return h.view('404').code(statusCode)
          }

          server.logger.error({
            statusCode,
            message: response.message,
            stack: response.data ? response.data.stack : response.stack
          })

          return h.view('500').code(statusCode)
        }

        return h.continue
      })
    }
  }
}

export default ErrorPagesPlugin
