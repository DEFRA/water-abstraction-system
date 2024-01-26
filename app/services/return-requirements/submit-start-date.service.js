'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/start-date` page
 * @module StartDateService
 */

const SessionModel = require('../../models/session.model.js')
const StartDatePresenter = require('../../presenters/return-requirements/start-date.presenter.js')
const StartDateValidator = require('../../validators/return-requirements/start-date.validator.js')

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/start-date` page
 *
 * @param {string} sessionId - The id of the current session
 * @param {Object} payload - The submitted form data
 *
 * @returns {Promise<Object>} The page data for the start date page
 */
async function go (sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)
  let formattedData = StartDatePresenter.go(session, null, payload)

  const validationData = {
    ...payload,
    licenceStartDate: formattedData.licenceStartDateValue,
    licenceEndDate: formattedData.licenceEndDateValue
  }
  const validation = StartDateValidator.go(validationData)

  if (validation.error) {
    formattedData = StartDatePresenter.go(session, validation.error, payload)
  }

  return {
    activeNavBar: 'search',
    pageTitle: 'Select the start date for the return requirement',
    ...formattedData
  }
}

module.exports = {
  go
}
