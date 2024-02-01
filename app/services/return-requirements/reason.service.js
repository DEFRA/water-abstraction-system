'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/reason` page
 * @module SelectReasonService
 */
const SelectReasonPresenter = require('../../presenters/return-requirements/reason.presenter.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/reason` page
 *
 * Supports generating the data needed for the select reason page in the return requirements setup journey (2 of 7). It
 * fetches the current session record and combines it with the radio buttons and other information needed for the form.
 *
 * If a validation issue is found when the form is submitted, it will be called from the POST handler with the Joi
 * validation error passed in. This extra information will be used to ensure the right error message is included in the
 * data needed by the view.
 *
 * @param {string} id - The UUID for return requirement setup session record
 * @param {Object} [error] - A Joi validation error if an issue was found with the submitted form data
 *
 * @returns {Object} page data needed by the view template
 */
async function go (sessionId, error = null) {
  const session = await SessionModel.query().findById(sessionId)
  const formattedData = SelectReasonPresenter.go(session, error)

  return {
    activeNavBar: 'search',
    pageTitle: 'Select the reason for the return requirement',
    ...formattedData
  }
}

module.exports = {
  go
}
