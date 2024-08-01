'use strict'

/**
 * Plugin to add CSRF token to all our forms
 * @module CrumbPlugin
 */

const Crumb = require('@hapi/crumb')

/**
 * {@link https://hapi.dev/module/crumb/api/?v=9.0.1 | Crumb} is a Hapi plugin. Crumb is used to diminish CSRF attacks
 * using a random unique token that is validated on the server side.
 *
 * Every view in the service that has a form that uses `method="POST"`, needs to have a hidden input field.
 *
 * ```html
 * <input type="hidden" name="wrlsCrumb" value="{{wrlsCrumb}}"/>
 * ```
 *
 * When the page is requested the Crumb plugin will generate a token in the `onPreResponse` event that it will save to a
 * cookie called 'wrlsCrumb'. It also makes it available in the view context hence our views can reference
 * `{{wrlsCrumb}}`.
 *
 * When the user submits the form the Crumb plugin jumps in again, this time on the `onPostAuth` event. It compares both
 * values and if they match it 'authorises' the request.
 *
 * If the the payload is missing `{{wrlsCrumb}}`, or the value doesn't match that saved in the cookie (which is secure
 * so unreadable to the client) than it rejects the request. In our service the user will see a 404 as that is the
 * default for an 'unauthorised' request.
 *
 * We have Crumb enabled by default for all endpoints to avoid us forgetting to protect a html form. However, this means
 * it performs the check for _all_ POST requests. Our service exposes API-only POST endpoints which do not expect a
 * payload. For this, the route config must include the following to disable Crumb.
 *
 * ```javascript
 *   options: {
 *     plugins: {
 *       crumb: false
 *     }
 *   }
 * ```
 */
const CrumbPlugin = {
  plugin: Crumb,
  options: {
    key: 'wrlsCrumb'
  }
}

module.exports = CrumbPlugin
