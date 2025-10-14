'use strict'

/**
 * Orchestrates validating the data for `/notices/setup/returns-period` page
 * @module SubmitReturnsPeriodService
 */

const DetermineReturnsPeriodService = require('../determine-returns-period.service.js')
const GeneralLib = require('../../../../lib/general.lib.js')
const ReturnsPeriodPresenter = require('../../../../presenters/notices/setup/returns-period/returns-period.presenter.js')
const ReturnsPeriodValidator = require('../../../../validators/notices/setup/returns-periods.validator.js')
const SessionModel = require('../../../../models/session.model.js')
const { formatValidationResult } = require('../../../../presenters/base.presenter.js')

/**
 * Formats data for the `/notices/setup/returns-period` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {object} An object containing where to redirect to if there are no errors else the page data for the view
 * including the validation error details
 */
async function go(sessionId, payload, yar) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload, session.noticeType)

  if (!validationResult) {
    if (session.checkPageVisited) {
      GeneralLib.flashNotification(yar, 'Updated', 'Returns period updated')

      session.checkPageVisited = false
    }

    await _save(session, payload)

    return {
      redirect: `${sessionId}/check-notice-type`
    }
  }

  const formattedData = ReturnsPeriodPresenter.go(session)

  return {
    activeNavBar: 'manage',
    error: validationResult,
    ...formattedData
  }
}

async function _save(session, payload) {
  session.returnsPeriod = payload.returnsPeriod

  const { returnsPeriod, summer } = DetermineReturnsPeriodService.go(session.returnsPeriod)

  session.determinedReturnsPeriod = {
    ...returnsPeriod,
    summer
  }

  return session.$update()
}

function _validate(payload, noticeType) {
  const validationResult = ReturnsPeriodValidator.go(payload, noticeType)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
