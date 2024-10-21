'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/setup/{sessionId}/agreements-exceptions` page
 * @module SubmitAgreementsExceptions
 */

const AgreementsExceptionsPresenter = require('../../../presenters/return-requirements/setup/agreements-exceptions.presenter.js')
const AgreementsExceptionsValidator = require('../../../validators/return-requirements/setup/agreements-exceptions.validator.js')
const GeneralLib = require('../../../lib/general.lib.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/return-requirements/setup/{sessionId}/agreements-exceptions` page
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
async function go (sessionId, requirementIndex, payload, yar) {
  const session = await SessionModel.query().findById(sessionId)

  _handleOneOptionSelected(payload)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, requirementIndex, payload)

    if (session.checkPageVisited) {
      GeneralLib.flashNotification(yar)
    } else {
      GeneralLib.flashNotification(yar, 'Added', 'New requirement added')
    }

    return {
      checkPageVisited: session.checkPageVisited
    }
  }

  const formattedData = AgreementsExceptionsPresenter.go(session, requirementIndex, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    pageTitle: 'Select agreements and exceptions for the requirements for returns',
    ...formattedData
  }
}

/**
 * When a single agreement and exception is checked by the user, it returns as a string. When multiple agreements and
 * exceptions are checked, the 'agreementsExceptions' is returned as an array. This function works to make those single
 * selected string 'agreementsExceptions' into an array for uniformity.
 *
 * @private
 */
function _handleOneOptionSelected (payload) {
  if (!Array.isArray(payload.agreementsExceptions)) {
    payload.agreementsExceptions = [payload.agreementsExceptions]
  }
}

async function _save (session, requirementIndex, payload) {
  session.requirements[requirementIndex].agreementsExceptions = payload.agreementsExceptions

  return session.$update()
}

function _validate (payload) {
  const validation = AgreementsExceptionsValidator.go(payload)

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
