'use strict'

/**
 * Plugin to set Content Security Policy headers on responses. This is a security measure to help prevent cross-site
 * scripting (XSS) and other code injection attacks.
 *
 * {@link https://github.com/nlf/blankie|blankie}
 *
 * @module ContentSecurityPolicyPlugin
 */

const Blankie = require('blankie')

const ContentSecurityPolicyPlugin = () => {
  return {
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
}

module.exports = ContentSecurityPolicyPlugin
