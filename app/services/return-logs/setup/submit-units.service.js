/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/units` page
 * @module SubmitUnitsService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import { flashNotification } from '../../../lib/general.lib.js'
import UnitsPresenter from '../../../presenters/return-logs/setup/units.presenter.js'
import UnitsValidator from '../../../validators/return-logs/setup/units.validator.js'
import { formatValidationResult } from '../../../presenters/base.presenter.js'
import { returnUnits } from '../../../lib/static-lookups.lib.js'

/**
 * Orchestrates validating the data for `/return-logs/setup/{sessionId}/units` page
 *
 * It first retrieves the session instance for the return log setup session in progress.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} If no errors the page data for the units page else the validation error details
 */
export default async function submitUnitsService(sessionId, payload, yar) {
  const session = await FetchSessionDal(sessionId)

  const error = _validate(payload)

  if (!error) {
    await _save(session, payload)

    if (session.checkPageVisited) {
      flashNotification(yar, 'Updated', 'Reporting details changed')
    }

    return {
      checkPageVisited: session.checkPageVisited
    }
  }

  const pageData = UnitsPresenter(session)

  return {
    error,
    ...pageData
  }
}

function _getUnitSymbolByName(units) {
  return Object.keys(returnUnits).find((key) => {
    return returnUnits[key].name === units
  })
}

async function _save(session, payload) {
  session.units = payload.units
  session.unitSymbol = _getUnitSymbolByName(payload.units)

  return session.$update()
}

function _validate(payload) {
  const validationResult = UnitsValidator(payload)

  return formatValidationResult(validationResult)
}
