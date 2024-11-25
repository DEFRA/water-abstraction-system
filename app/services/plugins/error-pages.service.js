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
 * @param {object} request - An instance of a {@link https://hapi.dev/api/?v=21.3.2#request | Hapi request}
 *
 * @returns {object} Contains the properties `stopResponse:` and `statusCode:` which are used by the plugin to
 * decide how to direct the response
 */
function go(request) {
  const stopResponse = _stopResponse(request)

  let statusCode = _extractStatusCode(request)

  _logError(statusCode, request)

  // If we're stopping the response i.e. redirecting to an error page we need to return a 'safe' status code.
  if (stopResponse) {
    statusCode = _determineSafeStatusCode(statusCode)
  }

  return {
    statusCode,
    stopResponse
  }
}

/**
 * Extract the status code from the request
 *
 * If the request object reflects a 2xx or 3xx response then the status code will be a property of the request. But if
 * it's because an error is thrown, `request` is actually a Boom error instance which means the status code is
 * somewhere else. So, we need this bit of logic to figure out what status code we're dealing with!
 *
 * @private
 */
function _extractStatusCode(request) {
  const { response } = request

  if (response.isBoom) {
    return response.output.statusCode
  }

  return response.statusCode
}

function _logError(statusCode, request) {
  const { response } = request

  if (statusCode === 404) {
    global.GlobalNotifier.omg('Page not found', { path: request.path })
  } else if (statusCode === 403) {
    global.GlobalNotifier.omg('Not authorised', { path: request.path })
  } else if (response.isBoom) {
    global.GlobalNotifier.omfg(response.message, {}, response)
  }
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
 * @param {object} request - The instance of {@link https://hapi.dev/api/?v=21.3.2#request | Hapi request}
 *
 * @returns {boolean} true if the response should be stopped and redirected to an error page else false
 *
 * @private
 */
function _stopResponse(request) {
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

/**
 * Determine the safe error code to use
 *
 * This will only be called when _stopResponse() has determined we need to redirect to an error page. In this case
 * we need to ensure the code we return is secure and will not get the response blocked by the WAF we have in our AWS
 * environments.
 *
 * @private
 */
function _determineSafeStatusCode(statusCode) {
  // The status code will be a 2xx or 3xx so safe to return as is
  if (statusCode < 400) {
    return statusCode
  }

  // If it was an unauthorised (403) request we pretend the page doesn't exist for security reasons. Returning anything
  // other than 404 could be seen as confirmation the page exists and used in an enumeration attack.
  // Returning 404 is the accepted response when you want to keep the targetted resource hidden
  // https://www.rfc-editor.org/rfc/rfc9110.html#name-403-forbidden
  if ([404, 403].includes(statusCode)) {
    return 404
  }

  // If it's any other status code it will reflect an error has occurred. Our F5 Silverline Managed Web Application
  // Firewall (WAF) will block the response and serve its own error page. We don't want this so we have to return a
  // 'safe' 200.
  return 200
}

module.exports = {
  go
}
