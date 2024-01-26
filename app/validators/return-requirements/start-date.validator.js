'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/start-date` page
 * @module StartDateValidator
 */

const Joi = require('joi')

const { leftPadZeroes } = require('../../presenters/base.presenter.js')

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/start-date` page
 *
 * When setting up a requirement users must specify a start date for when the requirement will apply from. The page
 * allows them to select the start date of the current version for the licence or enter a custom date.
 *
 * The custom date uses a {@link https://design-system.service.gov.uk/components/date-input/ | GOV.UK date input}
 * which is 3 text fields for day, month and year. Users can enter what they like or omit a value completely which is
 * why date validation can become quite complex.
 *
 * Also, the date they enter cannot be before the original start of the licence or after it ends.
 *
 * Finally, we also need to validate that the user selected one of the options; licence version start date or a custom
 * date.
 *
 * @param {Object} payload - The payload from the request to be validated
 * @param {string} licenceStartDate - the date the original version of the licence starts from
 * @param {string} licenceEndDate - the date the licence has or will end if one is set
 *
 * @returns {Object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go (payload, licenceStartDate, licenceEndDate) {
  const { startDate } = payload

  if (startDate === 'anotherStartDate') {
    payload.fullDate = _fullDate(payload)
  }

  return _validate(payload, licenceStartDate, licenceEndDate)
}

function _validate (payload, licenceStartDate, licenceEndDate) {
  const schema = Joi.object({
    startDate: Joi.string().required().messages({
      'string.empty': 'Select the start date for the return requirement',
      'any.required': 'Select the start date for the return requirement'
    }),
    fullDate: Joi.when('startDate', {
      is: 'anotherStartDate',
      then: Joi.date().iso().required().greater(licenceStartDate).less(licenceEndDate || '9999-12-31').messages({
        'date.base': 'Enter a real start date',
        'date.format': 'Enter a real start date',
        'date.greater': 'Start date must be after the original licence start date',
        'date.less': 'Start date must be before the licence end date'
      }),
      otherwise: Joi.forbidden()
    })
  })

  return schema.validate(payload, { abortEarly: false, allowUnknown: true })
}

function _fullDate (payload) {
  const {
    'start-date-day': day,
    'start-date-month': month,
    'start-date-year': year
  } = payload

  const paddedMonth = month ? leftPadZeroes(month, 2) : ''
  const paddedDay = day ? leftPadZeroes(day, 2) : ''

  return `${year}-${paddedMonth}-${paddedDay}`
}

module.exports = {
  go
}
