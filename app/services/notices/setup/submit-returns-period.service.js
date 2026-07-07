/**
 * Orchestrates validating the data for `/notices/setup/returns-period` page
 * @module SubmitReturnsPeriodService
 */

import DetermineReturnsPeriodService from './determine-returns-period.service.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import ReturnsPeriodPresenter from '../../../presenters/notices/setup/returns-period.presenter.js'
import ReturnsPeriodValidator from '../../../validators/notices/setup/returns-periods.validator.js'
import { flashNotification } from '../../../lib/general.lib.js'
import { formatValidationResult } from '../../../presenters/base.presenter.js'

/**
 * Formats data for the `/notices/setup/returns-period` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} An object containing where to redirect to if there are no errors else the page data for the view
 * including the validation error details
 */
async function go(sessionId, payload, yar) {
  const session = await FetchSessionDal.go(sessionId)

  const validationResult = _validate(payload, session.noticeType)

  if (!validationResult) {
    if (session.checkPageVisited) {
      flashNotification(yar, 'Updated', 'Returns period updated')

      session.checkPageVisited = false
    }

    await _save(session, payload)

    return {
      redirect: `${sessionId}/check-notice-type`
    }
  }

  const formattedData = ReturnsPeriodPresenter.go(session)

  return {
    activeNavBar: 'notices',
    error: validationResult,
    ...formattedData
  }
}

async function _save(session, payload) {
  session.returnsPeriod = payload.returnsPeriod

  const { returnsPeriod, summer } = DetermineReturnsPeriodService.go(session.returnsPeriod)

  session.determinedReturnsPeriod = {
    ...returnsPeriod,
    summer
  }

  return session.$update()
}

function _validate(payload, noticeType) {
  const validationResult = ReturnsPeriodValidator.go(payload, noticeType)

  return formatValidationResult(validationResult)
}

export { go }
export default {
  go
}
