'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/additional-submission-options` page
 * @module AdditionalSubmissionOptionsValidator
 */

const Joi = require('joi')

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/additional-submission-options` page
 *
 * When setting up a requirement users must specify additional-submission-options for the return requirement.
 * Users must select one or more points linked to the licence.
 * If these requirements are not met the validation will return an error.
 *
 * @param {object} payload - The payload taken from the request to be validated
 * @param {object} session - The session instance
 *
 * @returns {object} The result from calling Joi's schema.validate(). If any errors are found the `error:` property will
 * also exist detailing what the issue is.
 */
function go(payload, session) {
  const errorMessage = 'Select additional submission options for the requirements for returns'

  const schema = Joi.object({
    additionalSubmissionOptions: Joi.array().items(Joi.string()).required()
  })
    .custom((value, helpers) => {
      return _noQuarterlyReturnsForSummerCycle(value, helpers, session)
    }, 'No quarterly returns for summer cycle')
    .messages({
      'any.required': errorMessage,
      'array.sparse': errorMessage,
      'any.invalid': 'Quarterly returns submissions cannot be set for returns requirements in the summer cycle'
    })

  return schema.validate(payload, { abortEarly: false })
}

function _noQuarterlyReturnsForSummerCycle(value, helpers, session) {
  const { additionalSubmissionOptions } = value

  const hasSummerCycle = session.data.requirements?.some((requirement) => {
    return requirement.returnsCycle === 'summer'
  })

  const checkPageVisited = session.data.checkPageVisited === true
  const includesQuarterly = additionalSubmissionOptions?.includes('quarterly-returns')

  if (checkPageVisited && hasSummerCycle && includesQuarterly) {
    return helpers.error('any.invalid')
  }

  return value
}

module.exports = {
  go
}
