'use strict'

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/abstraction-period` page
 * @module SubmitAbstractionPeriodService
 */

const { formatValidationResult } = require('../../../presenters/base.presenter.js')

const AbstractionPeriodPresenter = require('../../../presenters/return-versions/setup/abstraction-period.presenter.js')
const AbstractionPeriodValidator = require('../../../validators/abstraction-period.validator.js')
const GeneralLib = require('../../../lib/general.lib.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/abstraction-period` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * The user input is then validated and the result is then combined with the output of the presenter to generate the
 * page data needed by the view. If there was a validation error the controller will re-render the page so needs this
 * information. If all is well the controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} requirementIndex - The index of the requirement being added or changed
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} If no errors a flag that determines whether the user is returned to the check page else
 * the page data for the abstraction period page including the validation error details
 */
async function go(sessionId, requirementIndex, payload, yar) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, requirementIndex, payload)

    if (session.checkPageVisited) {
      GeneralLib.flashNotification(yar, 'Updated', 'Requirements for returns updated')
    }

    return {
      checkPageVisited: session.checkPageVisited
    }
  }

  const submittedSessionData = _submittedSessionData(session, requirementIndex, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...submittedSessionData
  }
}

async function _save(session, requirementIndex, payload) {
  session.requirements[requirementIndex].abstractionPeriod = payload

  return session.$update()
}

/**
 * Combines the existing session data with the submitted payload formatted by the presenter. If nothing is submitted by
 * the user, payload will be an empty object.
 *
 * @private
 */
function _submittedSessionData(session, requirementIndex, payload) {
  session.requirements[requirementIndex].abstractionPeriod = Object.keys(payload).length > 0 ? payload : null

  return AbstractionPeriodPresenter.go(session, requirementIndex)
}

function _validate(payload) {
  const validation = AbstractionPeriodValidator.go(payload)

  return formatValidationResult(validation)
}

module.exports = {
  go
}
