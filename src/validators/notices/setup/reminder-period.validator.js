/**
 * Validates data submitted for the `/notices/setup/reminder-period` page
 * @module ReminderPeriodValidator
 */

import Joi from 'water-abstraction-engine/wrappers/joi.wrapper.js'

/**
 * Validates data submitted for the `/notices/setup/reminder-period` page
 *
 * @param {object} payload - The payload from the request to be validated
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
export default function reminderPeriodValidator(payload) {
  const errorMessage = 'Select the returns period for the reminders'

  const schema = Joi.object({
    reminderPeriod: Joi.string().uuid().required().messages({ 'any.required': errorMessage })
  })

  return schema.validate(payload, { abortEarly: false })
}
