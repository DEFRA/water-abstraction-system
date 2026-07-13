/**
 * Orchestrates validating the data for the `/notices/setup/{sessionId}/paper-return` page
 *
 * @module SubmitPaperReturnService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import { flashNotification } from '../../../lib/general.lib.js'
import PaperReturnPresenter from '../../../presenters/notices/setup/paper-return.presenter.js'
import PaperReturnValidator from '../../../validators/notices/setup/paper-return.validator.js'
import { formatValidationResult } from '../../../presenters/base.presenter.js'
import { handleOneOptionSelected } from '../../../lib/submit-page.lib.js'

/**
 * Orchestrates validating the data for the `/notices/setup/{sessionId}/paper-return` page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
export default async function submitPaperReturnService(sessionId, payload, yar) {
  const session = await FetchSessionDal(sessionId)

  handleOneOptionSelected(payload, 'returns')

  const error = _validate(payload)

  if (!error) {
    if (session.checkPageVisited && _arraysDiffer(payload.returns, session.selectedReturns)) {
      flashNotification(yar, 'Updated', 'Returns updated')
    }

    await _save(session, payload)

    return {}
  }

  session.selectedReturns = []

  const pageData = PaperReturnPresenter(session)

  return {
    activeNavBar: 'notices',
    error,
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

async function _save(session, payload) {
  session.selectedReturns = payload.returns

  return session.$update()
}

function _validate(payload) {
  const validationResult = PaperReturnValidator(payload)

  return formatValidationResult(validationResult)
}
