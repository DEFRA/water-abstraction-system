'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/start-date` page
 * @module StartDateService
 */
 
const SessionModel = require('../../models/session.model.js') 
const StartDatePresenter = require('../../presenters/return-requirements/start-date.presenter.js')

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/start-date` page
 *
 * Supports generating the data needed for the save date page in the return requirements setup journey. It fetches the
 * current session record and combines it with the radio buttons, date fields and other information needed for the form.
 *
 * If a validation issue is found when the form is submitted, it will be called from the POST handler with the Joi
 * validation error passed in. This extra information will be used to ensure the right error message is included in the
 * data needed by the view.
 *
 * @param {string} sessionId - The id of the current session
 * @param {Error} [error] - A Joi validation error if an issue was found with the submitted form data
 * @param {object} [payload] - The submitted form data
 *
 * @returns {Promise<Object>} The view data for the start date page
*/
async function go (sessionId, error = null, payload = {}) {
  const session = await SessionModel.query().findById(sessionId)
  const formattedData = StartDatePresenter.go(session, error, payload)

  return {
    activeNavBar: 'search',
    pageTitle: 'Select the start date for the return requirement',
    ...formattedData
  }
}

module.exports = {
  go
}
