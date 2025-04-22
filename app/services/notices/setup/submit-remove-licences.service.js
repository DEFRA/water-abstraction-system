'use strict'

/**
 * Orchestrates validating the data for the notifications setup remove licences page
 * @module SubmitRemoveLicencesService
 */

const FetchReturnsDueService = require('./fetch-returns-due.service.js')
const RemoveLicencesPresenter = require('../../../presenters/notices/setup/remove-licences.presenter.js')
const RemoveLicencesValidator = require('../../../validators/notices/setup/remove-licences.validator.js')
const SessionModel = require('../../../models/session.model.js')
const { transformStringOfLicencesToArray } = require('../../../lib/general.lib.js')

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

  const validLicences = await _fetchValidLicences(session, payload)

  const validationResult = _validate(payload, validLicences)

  if (validationResult) {
    const formattedData = RemoveLicencesPresenter.go(payload.removeLicences, session.referenceCode)

    return {
      activeNavBar: 'manage',
      error: validationResult,
      ...formattedData
    }
  }

  await _save(session, payload)

  return {
    redirect: `${sessionId}/check`
  }
}

async function _fetchValidLicences(session, payload) {
  const {
    determinedReturnsPeriod: { dueDate, summer }
  } = session

  const removeLicences = transformStringOfLicencesToArray(payload.removeLicences)

  return FetchReturnsDueService.go(removeLicences, dueDate, summer)
}

async function _save(session, payload) {
  session.removeLicences = payload.removeLicences

  return session.$update()
}

function _validate(payload, validLicences) {
  const validation = RemoveLicencesValidator.go(payload, validLicences)

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
