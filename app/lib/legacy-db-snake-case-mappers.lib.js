'use strict'

/**
 * General helper methods
 * @module LegacyDbSnakeCaseMappersLib
 */

const { camelCase, knexIdentifierMappers, snakeCase } = require('objection/lib/utils/identifierMapping.js')

/**
 * Return an object containing Knex postProcessResponse() and wrapIdentifier() hooks used in Db query and result parsing
 *
 * The standard problem with a JavaScript app talking to a DB is the convention for SQL is to use snake_case for field
 * names and in Javascript it's camelCase. When dealing with results or sending data to the DB, in code you want to use
 * camelCase. But the db needs to see snake_case.
 *
 * Both Objection.js and Knex have solutions for this; generally referred to as 'snake case mappers'.
 * `knexfile.application.js` has more details on this.
 *
 * But we have had to customise the out-of-the-box solution because of naming choices made by the previous delivery team
 * in the legacy DB. Specifically, using 'crm_v2' for a schema name. The out-of-the-box solution has an option,
 * `underscoreBeforeDigits`, for dealing with property names like `addressLine1`. Without it the DB would be sent
 * `address_line1`.
 *
 * So, we have to have this set. But that breaks the schema name parsing. `crmV2` becomes `crm_v_2`. We cannot think of
 * a way to express it in the code which will make the out-of-the-box solution work. SO, instead we have had to create
 * our own legacyDbSnakeCaseMappers().
 *
 * It simply looks for the value 'crm_v2' and when seen, returns it as is without any formatting. For everything else,
 * it passes control to the out-of-the-box solution.
 *
 * @param {object} opt - Object containing options used by
 * {@link https://vincit.github.io/objection.js/api/objection/#knexsnakecasemappers|knexsnakecasemappers()}
 *
 * @returns object containing Knex postProcessResponse() and wrapIdentifier() hooks
 */
function legacyDbSnakeCaseMappers(opt = {}) {
  return knexIdentifierMappers({
    parse: (str) => {
      return _legacyCamelCase(str, opt)
    },
    format: (str) => {
      return _legacySnakeCase(str, opt)
    }
  })
}

function _legacyCamelCase(str, { upperCase = false } = {}) {
  if (str === 'crm_v2') {
    return str
  }

  return camelCase(str, { upperCase })
}

function _legacySnakeCase(
  str,
  { upperCase = false, underscoreBeforeDigits = false, underscoreBetweenUppercaseLetters = false } = {}
) {
  if (str === 'crm_v2') {
    return str
  }

  return snakeCase(str, { upperCase, underscoreBeforeDigits, underscoreBetweenUppercaseLetters })
}

module.exports = {
  legacyDbSnakeCaseMappers
}
