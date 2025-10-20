'use strict'

/**
 * Orchestrates validating the data for the notice setup remove licences page
 * @module SubmitRemoveLicencesService
 */

const FetchReturnsDueService = require('./fetch-returns-due.service.js')
const RemoveLicencesPresenter = require('../../../presenters/notices/setup/remove-licences.presenter.js')
const RemoveLicencesValidator = require('../../../validators/notices/setup/remove-licences.validator.js')
const SessionModel = require('../../../models/session.model.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')
const { transformStringOfLicencesToArray } = require('../../../lib/general.lib.js')

/**
 * Orchestrates validating the data for the notice setup remove licences page
 *
 * @param {string} sessionId - The UUID for setup notice session record
 * @param {object} payload - The submitted form data
 *
 * @returns {object} An object containing where to redirect to if there are no errors else the page data for the view
 * including the validation error details
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validLicences = await _fetchValidLicences(session, payload)

  const validationResult = _validate(payload, validLicences)

  if (validationResult) {
    const formattedData = RemoveLicencesPresenter.go(payload.removeLicences, session)

    return {
      activeNavBar: 'notices',
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
  const validationResult = RemoveLicencesValidator.go(payload, validLicences)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
