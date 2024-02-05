'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/reason` page
 * @module ReasonValidator
 */

const Joi = require('joi')

const VALID_VALUES = [
  'change_to_special_agreement',
  'name_or_address_change',
  'transfer_and_now_chargeable',
  'extension_of_licence_validity',
  'major_change',
  'minor_change',
  'new_licence_in_part_succession_or_licence_apportionment',
  'new_licence',
  'new_special_agreement',
  'succession_or_transfer_of_licence',
  'succession_to_remainder_licence_or_licence_apportionment'
]

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/reason` page
 *
 * @param {Object} payload - The payload from the request to be validated
 *
 * @returns {Object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go (data) {
  const schema = Joi.object({
    reason: Joi.string()
      .required()
      .valid(...VALID_VALUES)
      .messages({
        'any.required': 'Select the reason for the return requirement',
        'any.only': 'Select the reason for the return requirement',
        'string.empty': 'Select the reason for the return requirement'
      })
  })

  return schema.validate(data, { abortEarly: false })
}

module.exports = {
  go
}
