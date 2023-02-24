'use strict'

/**
 * General helper methods
 * @module LegacyDbSnakeCaseMappersLib
 */

const { camelCase, knexIdentifierMappers, snakeCase } = require('objection/lib/utils/identifierMapping')

function legacyDbSnakeCaseMappers (opt = {}) {
  return knexIdentifierMappers({
    parse: (str) => _legacyCamelCase(str, opt),
    format: (str) => _legacySnakeCase(str, opt)
  })
}

function _legacyCamelCase (str, { upperCase = false } = {}) {
  if (str === 'crm_v2') {
    return str
  }

  return camelCase(str, { upperCase })
}

function _legacySnakeCase (
  str,
  {
    upperCase = false,
    underscoreBeforeDigits = false,
    underscoreBetweenUppercaseLetters = false
  } = {}
) {
  if (str === 'crm_v2') {
    return str
  }

  return snakeCase(str, { upperCase, underscoreBeforeDigits, underscoreBetweenUppercaseLetters })
}

module.exports = {
  legacyDbSnakeCaseMappers
}
