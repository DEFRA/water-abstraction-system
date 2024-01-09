'use strict'

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/no-returns-required` page
 * @module NoReturnsRequiredService
 */
const NoReturnsRequiredPresenter = require('../../presenters/return-requirements/no-returns-required.presenter.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates fetching and presenting the data for `/return-requirements/{sessionId}/no-returns-required` page
 *
 * Supports generating the data needed for the no returns required page in the return requirements setup journey. It
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
  const pageData = NoReturnsRequiredPresenter.go(session, error)

  return pageData
}

module.exports = {
  go
}
