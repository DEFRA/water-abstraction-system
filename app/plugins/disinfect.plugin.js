'use strict'

/**
 * Plugin that handles 'cleaning' payloads of empty or null properties, extraneous whitespace and any malicious content
 * @module AirbrakePlugin
 */

const Disinfect = require('disinfect')

const DisinfectPlugin = {
  plugin: Disinfect,
  options: {
    deleteEmpty: true,
    deleteWhitespace: true,
    disinfectPayload: true
  }
}

module.exports = DisinfectPlugin
