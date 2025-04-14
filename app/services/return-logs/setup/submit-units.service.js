'use strict'

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/units` page
 * @module SubmitUnitsService
 */

const GeneralLib = require('../../../lib/general.lib.js')
const SessionModel = require('../../../models/session.model.js')
const UnitsPresenter = require('../../../presenters/return-logs/setup/units.presenter.js')
const UnitsValidator = require('../../../validators/return-logs/setup/units.validator.js')

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/units` page
 *
 * It first retrieves the session instance for the return log setup session in progress.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} If no errors the page data for the units page else the validation error details
 */
async function go(sessionId, payload, yar) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    if (session.checkPageVisited) {
      GeneralLib.flashNotification(yar, 'Updated', 'Reporting details changed')
    }

    return {
      checkPageVisited: session.checkPageVisited
    }
  }

  const formattedData = UnitsPresenter.go(session)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...formattedData
  }
}

async function _save(session, payload) {
  session.units = payload.units

  return session.$update()
}

function _validate(payload) {
  const validation = UnitsValidator.go(payload)

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
