'use strict'

/**
 * Orchestrates validating the data for `/notifications/setup/returns-period` page
 * @module SubmitReturnsPeriodService
 */

const NotificationsPresenter = require('../../../presenters/notifications/setup/returns-period.presenter.js')
const ReturnsPeriodValidator = require('../../../validators/notifications/setup/returns-periods.validator.js')

/**
 * Formats data for the `/notifications/setup/returns-period` page
 *
 * @param {object} payload
 * @returns {object} The view data for the returns period page, inc error/redirect when applicable
 */
async function go(payload) {
  const validationResult = _validate(payload)

  if (!validationResult) {
    return {
      redirect: 'send-notice'
    }
  }

  const formattedData = NotificationsPresenter.go()

  return {
    activeNavBar: 'manage',
    error: validationResult,
    pageTitle: 'Select the returns periods for the invitations',
    ...formattedData
  }
}

function _validate(payload) {
  const validation = ReturnsPeriodValidator.go(payload)

  if (!validation.error) {
    return null
  }

  const { message } = validation.error.details[0]

  return {
    text: message
  }
}

module.exports = {
  go
}
