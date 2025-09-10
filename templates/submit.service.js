'use strict'

/**
 * Orchestrates validating the data for `` page
 *
 * @module __MODULE_NAME__
 */

const __PRESENTER_NAME__ = require('__PRESENTER_PATH__')
const __VALIDATOR_NAME__ = require('__VALIDATOR_PATH__')
const SessionModel = require('__SESSION_MODEL_PATH__')
const { formatValidationResult } = require('__FORMAT_VALIDATOR_PATH__')

/**
 * Orchestrates validating the data for `` page
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

  const pageData = __PRESENTER_NAME__.go(session)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  return session.$update()
}

function _validate(payload) {
  const validationResult = __VALIDATOR_NAME__.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
