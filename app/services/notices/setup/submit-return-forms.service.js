'use strict'

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/return-forms` page
 *
 * @module SubmitReturnFormsService
 */

const GeneralLib = require('../../../lib/general.lib.js')
const ReturnFormsPresenter = require('../../../presenters/notices/setup/return-forms.presenter.js')
const ReturnFormsValidator = require('../../../validators/notices/setup/return-forms.validator.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/return-forms` page
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

  session.selectedReturns = []

  const pageData = ReturnFormsPresenter.go(session)

  return {
    activeNavBar: 'manage',
    error: validationResult,
    ...pageData
  }
}

/**
 * Checks whether two arrays of primitive values differ.
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
function _arraysDiffer(arrayA, arrayB) {
  if (arrayA.length !== arrayB.length) {
    return true
  }

  let result = false

  for (const valueA of arrayA) {
    const match = arrayB.find((valueB) => {
      return valueA === valueB
    })

    if (!match) {
      result = true
      break
    }
  }

  return result
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
  const validation = ReturnFormsValidator.go(payload)

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
