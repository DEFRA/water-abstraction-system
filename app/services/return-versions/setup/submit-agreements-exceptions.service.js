'use strict'

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/agreements-exceptions` page
 * @module SubmitAgreementsExceptions
 */

const AgreementsExceptionsPresenter = require('../../../presenters/return-versions/setup/agreements-exceptions.presenter.js')
const AgreementsExceptionsValidator = require('../../../validators/return-versions/setup/agreements-exceptions.validator.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')
const GeneralLib = require('../../../lib/general.lib.js')
const SessionModel = require('../../../models/session.model.js')
const { handleOneOptionSelected } = require('../../../lib/submit-page.lib.js')

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/agreements-exceptions` page
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
 * the page data for the agreements exceptions page including the validation error details
 */
async function go(sessionId, requirementIndex, payload, yar) {
  const session = await SessionModel.query().findById(sessionId)

  handleOneOptionSelected(payload, 'agreementsExceptions')

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, requirementIndex, payload)

    if (session.checkPageVisited) {
      GeneralLib.flashNotification(yar, 'Updated', 'Requirements for returns updated')
    } else {
      GeneralLib.flashNotification(yar, 'Added', 'New requirement added')
    }

    return {
      checkPageVisited: session.checkPageVisited
    }
  }

  const formattedData = AgreementsExceptionsPresenter.go(session, requirementIndex, payload)

  return {
    error: validationResult,
    ...formattedData
  }
}

async function _save(session, requirementIndex, payload) {
  session.requirements[requirementIndex].agreementsExceptions = payload.agreementsExceptions

  return session.$update()
}

function _validate(payload) {
  const validation = AgreementsExceptionsValidator.go(payload)

  return formatValidationResult(validation)
}

module.exports = {
  go
}
