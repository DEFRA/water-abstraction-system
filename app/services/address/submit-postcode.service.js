'use strict'

/**
 * Orchestrates validating the data for `address/{sessionId}/postcode` page
 *
 * @module SubmitPostcodeService
 */

const PostcodePresenter = require('../../presenters/address/postcode.presenter.js')
const PostcodeValidator = require('../../validators/address/postcode.validator.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates validating the data for `address/{sessionId}/postcode` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  _applyPayload(session, payload)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session)

    return {}
  }

  const pageData = PostcodePresenter.go(session)

  return {
    activeNavBar: 'manage',
    error: validationResult,
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
  session.addressJourney.address.postcode = payload.postcode
}

async function _save(session) {
  return session.$update()
}

function _validate(payload) {
  const validation = PostcodeValidator.go(payload)

  if (!validation.error) {
    return null
  }

  const result = {
    errorList: []
  }

  validation.error.details.forEach((detail) => {
    result.errorList.push({
      href: `#${detail.context.key}`,
      text: detail.message
    })

    result[detail.context.key] = detail.message
  })

  return result
}

module.exports = {
  go
}
