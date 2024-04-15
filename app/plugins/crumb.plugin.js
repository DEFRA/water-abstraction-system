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
 * Every view in the service that has a form, has a hidden input field.
 *
 * ```html
 * <input type="hidden" name="wrlsCrumb" value="{{wrlsCrumb}}"/>
 * ```
 */
const CrumbPlugin = {
  plugin: Crumb,
  options: {
    key: 'wrlsCrumb'
  }
}

module.exports = CrumbPlugin
