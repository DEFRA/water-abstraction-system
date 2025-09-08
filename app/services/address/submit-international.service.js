'use strict'

/**
 * Orchestrates validating the data for `address/{sessionId}/international` page
 *
 * @module SubmitInternationalService
 */

const InternationalPresenter = require('../../presenters/address/international.presenter.js')
const InternationalValidator = require('../../validators/address/international.validator.js')
const SessionModel = require('../../models/session.model.js')
const { formatValidationResult } = require('../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for `address/{sessionId}/international` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  _applyPayload(session, payload)

  const error = _validate(payload)

  if (!error) {
    await _save(session)

    return {
      redirect: session.addressJourney.redirectUrl
    }
  }

  const pageData = InternationalPresenter.go(session)

  return {
    error,
    ...pageData
  }
}

/**
 * Applies the payload to the session object.
 *
 * We can apply the payload _before_ validating. This is because if it is valid, we can then simply update the session
 * object in `_save()`.
 * If it is not valid, we want to replay what they entered. The presenter will ensure we do that because it takes its
 * data from the session, which we've updated with the payload values!
 *
 * @private
 */
function _applyPayload(session, payload) {
  session.addressJourney.address.addressLine1 = payload.addressLine1
  session.addressJourney.address.addressLine2 = payload.addressLine2 ?? null
  session.addressJourney.address.addressLine3 = payload.addressLine3 ?? null
  session.addressJourney.address.addressLine4 = payload.addressLine4 ?? null
  session.addressJourney.address.country = payload.country
  session.addressJourney.address.postcode = payload.postcode
}

async function _save(session) {
  return session.$update()
}

function _validate(payload) {
  const validationResult = InternationalValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
