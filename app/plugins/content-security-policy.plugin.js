'use strict'

/**
 * Plugin to set Content Security Policy headers on responses. This is a security measure to help prevent cross-site
 * scripting (XSS) and other code injection attacks.
 *
 * With the exception of the `fontSrc` and `generateNonces` options, the configuration for this plugin is based on the
 * default configuration provided by the `blankie` package. The default options have been explicitly declared to make it
 * clear what the defaults are. The `fontSrc` option is set to allow fonts to be loaded from the same origin as the
 * application.
 *
 * In this application, `generateNonces: 'script'` instructs blankie to generate a unique nonce for each request and
 * include it in the `Content-Security-Policy` header as part of the `script-src` directive. During request handling,
 * blankie exposes this value at `request.plugins.blankie.nonces.script`. The views plugin then maps that value to
 * `cspNonce`.
 *
 * The `cspNonce` view variable is consumed by `govuk/template.njk`, which uses it to add `nonce` attributes to the
 * template's inline script tags. Our `layout.njk` extends that template and also applies `cspNonce` to its inline
 * script that calls `window.GOVUKFrontend.initAll()`.
 *
 * This flow allows that specific inline script to run only when its nonce matches the value in the CSP header for the
 * current response. Any other inline script without the correct nonce is blocked by the browser.
 *
 * {@link https://github.com/nlf/blankie|blankie}
 *
 * @module ContentSecurityPolicyPlugin
 */

const Blankie = require('blankie')

const ContentSecurityPolicyPlugin = {
  plugin: Blankie,
  options: {
    baseUri: ['self'],
    connectSrc: ['self'],
    defaultSrc: ['none'],
    fontSrc: ['self'],
    generateNonces: 'script',
    imgSrc: ['self'],
    scriptSrc: ['self'],
    styleSrc: ['self'],
    workerSrc: ['self']
  }
}

module.exports = ContentSecurityPolicyPlugin
