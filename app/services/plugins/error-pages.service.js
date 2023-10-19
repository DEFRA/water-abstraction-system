'use strict'

/**
 * Used by the `ErrorPagesPlugin` to process unhandled exceptions in the service
 * @module ErrorPagesService
 */

/**
 * Determines if a response is an error and and whether an error page should be returned
 *
 * Because this is fired during the `onPreResponse` stage of the Hapi lifecycle all responses will come through it. So,
 * it first decides if the event needs logging.
 *
 * It then determines whether the plugin should tell the
 * {@link https://hapi.dev/api/?v=21.3.2#response-toolkit | response toolkit} to continue with the response or not. If
 * not the `ErrorPagesPlugin` will use the `statusCode` returned to determine which error page to show.
 *
 * @param {Object} request An instance of a {@link https://hapi.dev/api/?v=21.3.2#request | Hapi request}
 *
 * @returns {Object} Contains the properties `stopResponse:` and `statusCode:` which are used by the plugin to
 * decide how to direct the response
 */
function go (request) {
  const result = {
    stopResponse: _stopResponse(request),
    statusCode: _statusCode(request)
  }

  _logError(result.statusCode, request)

  return result
}

function _logError (statusCode, request) {
  const { response } = request

  if (statusCode === 404) {
    global.GlobalNotifier.omg('Page not found', { path: request.path })
  } else if (statusCode === 403) {
    global.GlobalNotifier.omg('Not authorised', { path: request.path })
  } else if (response.isBoom) {
    global.GlobalNotifier.omfg(response.message, {}, response)
  }
}

function _statusCode (request) {
  const { response } = request

  if (response.isBoom) {
    const { statusCode } = response.output

    if ([404, 403].includes(statusCode)) {
      return 404
    }

    return response.output.statusCode
  }

  return response.statusCode
}

/**
 * Determine if the response should be stopped and redirected to an error page
 *
 * If the response is actually a Boom error, for example, a 404 or a 500 we normally want to redirect the
 * {@link https://hapi.dev/api/?v=21.3.2#response-toolkit | response toolkit} to return a custom error page.
 *
 * But we have routes that are not intended to be used in the browser. If these error we want them to behave like an
 * API so the **response toolkit** should be told to continue as normal. We can do this by adding
 * `app: { plainOutput: true }` to a route's `options:` property.
 *
 * Finally, this service is called for _all_ responses so we need to handle standard responses, for example, 200 on a
 * request for an asset.
 *
 * @param {Object} request The instance of {@link https://hapi.dev/api/?v=21.3.2#request | Hapi request}
 *
 * @returns {boolean} true if the response should be stopped and redirected to an error page else false
 */
function _stopResponse (request) {
  // `isBoom` is only present when dealing with requests that have resulted in an error being thrown.
  // `plainOutput` is only present when the route's `options:` property has `app: { plainOutput: true }` applied.
  // !! typecasts undefined values into booleans which means we can be explicit in what we are dealing with.
  const isBoom = !!request.response.isBoom
  const plainOutput = !!request.route.settings?.app?.plainOutput

  // We appreciate this would have been clearer if we did `isBoom && showErrorPage`. But this would force us to set
  // `app: { showErrorPage: true }` on all routes. There are only a small number where we don't want an error page
  // shown. So, it makes more sense to apply the config only where needed, for example, POST /bill-runs.
  // Doing this means we are saying with this statement "stop the response and redirect to an error page if the
  // response is an error AND the route is NOT configured to return plain responses".
  return isBoom && !plainOutput
}

module.exports = {
  go
}
