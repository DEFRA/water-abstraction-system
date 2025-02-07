'use strict'

/**
 * Orchestrates validating the data for the notifications setup remove licences page
 * @module SubmitRemoveLicencesService
 */

const RemoveLicencesPresenter = require('../../../presenters/notifications/setup/remove-licences.presenter.js')
const RemoveLicencesValidator = require('../../../validators/notifications/setup/remove-licences.validator.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for the notifications setup remove licences page
 *
 * @param {string} sessionId - The UUID for setup ad-hoc returns notification session record
 * @param {object} payload
 *
 * @returns {object} The view data for the remove licences page
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (validationResult) {
    const formattedData = RemoveLicencesPresenter.go(payload.removeLicences)

    return {
      activeNavBar: 'manage',
      error: validationResult,
      ...formattedData
    }
  }

  await _save(session, payload)

  return {
    redirect: `${sessionId}/review`
  }
}

async function _save(session, payload) {
  session.removeLicences = [payload.removeLicences]

  return session.$update()
}

function _validate(payload) {
  const validation = RemoveLicencesValidator.go(payload)

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
