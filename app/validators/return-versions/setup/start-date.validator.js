'use strict'

/**
 * Validates data submitted for the `/return-requirements/{sessionId}/start-date` page
 * @module StartDateValidator
 */

const Joi = require('joi').extend(require('@joi/date'))

const { leftPadZeroes } = require('../../../presenters/base.presenter.js')

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
 * @param {object} payload - The payload from the request to be validated
 * @param {string} licenceStartDate - the date the original version of the licence starts from
 * @param {string} licenceEndDate - the date the licence has or will end if one is set
 *
 * @returns {object} the result from calling Joi's schema.validate(). It will be an object with a `value:` property. If
 * any errors are found the `error:` property will also exist detailing what the issues were
 */
function go(payload, licenceStartDate, licenceEndDate) {
  const { 'start-date-options': selectedOption } = payload

  if (selectedOption === 'anotherStartDate') {
    payload.fullDate = _fullDate(payload)

    return _validateAnotherStartDate(payload, licenceStartDate, licenceEndDate)
  }

  return _validateLicenceVersionStartDate(payload)
}

function _fullDate(payload) {
  const { 'start-date-day': day, 'start-date-month': month, 'start-date-year': year } = payload

  const paddedMonth = month ? leftPadZeroes(month, 2) : ''
  const paddedDay = day ? leftPadZeroes(day, 2) : ''

  return `${year}-${paddedMonth}-${paddedDay}`
}

/**
 * When creating a return version you will create return logs which use the existing return cycles. We found an issue
 * with missing returns cycles and have now fixed that but it only goes back to the oldest licence we have in the system.
 *
 * We are 99.999% certain no one will add a new licence with a start date before 1959-04-01. But just in case, for that
 * 0.001% chance, we will extend the start date validation in the return version setup journey.
 *
 * This logice ensures that the start date entered equals or exceeds the licence’s start date. But should we
 * encounter a licence with a start date before 1959-04-01 we need to stop it from being created as no return logs
 * will be added.
 *
 * @param {Date} licenceStartDate - The licenec start date
 *
 * @returns {object} The date and messsage to use for earliest allowable date
 */
function _minimumDateDetails(licenceStartDate) {
  if (new Date(licenceStartDate) < new Date('1959-04-01')) {
    return { minDate: '1959-04-01', minMessage: 'Start date must be on or after 1 April 1959' }
  }

  return { minDate: licenceStartDate, minMessage: 'Start date must be on or after the original licence start date' }
}

function _validateAnotherStartDate(payload, licenceStartDate, licenceEndDate) {
  const { minDate, minMessage } = _minimumDateDetails(licenceStartDate)

  const schema = Joi.object({
    fullDate: Joi.date()
      .format(['YYYY-MM-DD'])
      .required()
      .min(minDate)
      .less(licenceEndDate || '9999-12-31')
      .messages({
        'date.base': 'Enter a real start date',
        'date.format': 'Enter a real start date',
        'date.min': minMessage,
        'date.less': 'Start date must be before the licence end date'
      }),
    otherwise: Joi.forbidden()
  })

  return schema.validate(payload, { abortEarly: false, allowUnknown: true })
}

function _validateLicenceVersionStartDate(payload) {
  const schema = Joi.object({
    'start-date-options': Joi.string().required().messages({
      'any.required': 'Select the start date for the requirements for returns',
      'string.empty': 'Select the start date for the requirements for returns'
    })
  })

  return schema.validate(payload, { abortEarly: false, allowUnknown: true })
}

module.exports = {
  go
}
