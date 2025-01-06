'use strict'

/**
 * Handles the user submission for the `/return-log-edit/{sessionId}/how-to-edit` page
 * @module SubmitEditReturnLogService
 */

const SessionModel = require('../../../models/session.model.js')
const EditReturnLogPresenter = require('../../../presenters/return-logs/setup/edit-return-log.presenter.js')

/**
 * Handles the user submission for the `/return-log-edit/{sessionId}/how-to-edit` page
 *
 * @param {string} sessionId - The UUID for setup bill run session record
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} An object with a `howToEdit:` property if there are no errors else the page data for
 * the abstraction return page including the validation error details
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)
  const { howToEdit } = payload
  const validationResult = _validate(howToEdit)

  if (!validationResult) {
    await _save(session, howToEdit)

    return { howToEdit }
  }

  const formattedData = EditReturnLogPresenter.go(session)

  return {
    error: validationResult,
    ...formattedData
  }
}

async function _save(session, howToEdit) {
  const currentData = session

  currentData.howToEdit = howToEdit

  return session.$query().patch({ data: currentData })
}

function _validate(howToEdit) {
  if (!howToEdit) {
    return { text: 'Select how would you like to edit this return' }
  }

  return null
}

module.exports = {
  go
}
