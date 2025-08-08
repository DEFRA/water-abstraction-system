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
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  const _submittedData = {
    ...session
  }
  _submittedData.address.postcode = payload.postcode

  const pageData = PostcodePresenter.go(_submittedData)

  return {
    activeNavBar: 'manage',
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  session.address.postcode = payload.postcode

  return session.$update()
}

function _validate(payload) {
  const validation = PostcodeValidator.go(payload)

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
