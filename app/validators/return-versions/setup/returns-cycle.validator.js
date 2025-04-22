'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/returns-cycle` page
 * @module ReturnsCycleValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/returns-cycle` page
 *
 * When setting up a requirement users must specify a returns cycle for the return requirement. Users must select one
 * period for the returns cycle. If this requirement is not met the validation will return an error.
 *
 * @param {object} payload - The payload from the request to be validated
 * @param {object} session - The session instance
 *
 * @returns {object} The result from calling Joi's schema.validate(). The result from calling Joi's schema.validate().
 * If any errors are found the `error:` property will also exist detailing what the issue is.
 */
function go(payload, session) {
  console.log('🚀🚀🚀 ~ session:', session)
  const returnsCycle = payload.returnsCycle

  const VALID_VALUES = ['summer', 'winter-and-all-year']

  const errorMessage = 'Select the returns cycle for the requirements for returns'

  const schema = Joi.object({
    returnsCycle: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.required': errorMessage,
        'any.only': errorMessage,
        'string.empty': errorMessage
      })
  })
    .custom((value, helpers) => {
      return _noSummerCycleWithQuarterlyReturns(value, helpers, session)
    }, 'No summer cycle if quarterly returns is selected')
    .messages({
      'any.invalid': "Quarterly returns submissions can't be set for returns in the summer cycle"
    })

  return schema.validate({ returnsCycle }, { abortEarly: false })
}

function _noSummerCycleWithQuarterlyReturns(value, helpers, session) {
  const { returnsCycle } = value

  const isSummer = returnsCycle === 'summer'
  const hasQuarterlyReturns = session.quarterlyReturns === true
  const checkPageVisited = session.checkPageVisited === true

  if (checkPageVisited && hasQuarterlyReturns && isSummer) {
    return helpers.error('any.invalid')
  }

  return value
}

module.exports = {
  go
}
