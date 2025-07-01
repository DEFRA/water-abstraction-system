'use strict'

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/returns-for-paper-forms` page
 *
 * @module SubmitReturnsForPaperFormsService
 */

const GeneralLib = require('../../../lib/general.lib.js')
const ReturnsForPaperFormsPresenter = require('../../../presenters/notices/setup/returns-for-paper-forms.presenter.js')
const ReturnsForPaperFormsValidator = require('../../../validators/notices/setup/returns-for-paper-forms.validator.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/returns-for-paper-forms` page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, payload, yar) {
  const session = await SessionModel.query().findById(sessionId)

  _handleOneOptionSelected(payload)

  const validationResult = _validate(payload)

  if (!validationResult) {
    if (session.checkPageVisited && _arraysDiffer(payload.returns, session.selectedReturns)) {
      GeneralLib.flashNotification(yar, 'Updated', 'Returns updated')
    }

    await _save(session, payload)

    return {}
  }

  const pageData = ReturnsForPaperFormsPresenter.go(session)

  return {
    error: validationResult,
    ...pageData
  }
}

/**
 * Checks whether two arrays of primitive values differ.
 *
 * Sorts the two arrays to assure elements match
 *
 * Returns `true` if arrays have different lengths or different elements
 * Returns `false` if arrays contain the same elements
 *
 * Example:
 *   arraysDiffer([1, 2], [2, 1]) // false
 *   arraysDiffer([1, 2], [1, 3]) // true
 *
 * @private
 */
function _arraysDiffer(a, b) {
  if (a.length !== b.length) {
    return true
  }

  const sortedA = [...a].sort()
  const sortedB = [...b].sort()

  for (let i = 0; i < sortedA.length; i++) {
    if (sortedA[i] !== sortedB[i]) {
      return true
    }
  }

  return false
}

function _handleOneOptionSelected(payload) {
  if (payload.returns && !Array.isArray(payload?.returns)) {
    payload.returns = [payload?.returns]
  }
}

async function _save(session, payload) {
  session.selectedReturns = payload.returns

  return session.$update()
}

function _validate(payload) {
  const validation = ReturnsForPaperFormsValidator.go(payload)

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
