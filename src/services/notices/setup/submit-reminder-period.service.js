/**
 * Orchestrates validating the data for `/notices/setup/reminder-period` page
 * @module SubmitReminderPeriodService
 */

import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'
import { flashNotification } from 'water-abstraction-engine/lib/general.lib.js'
import { formatValidationResult } from 'water-abstraction-engine/presenters/base.presenter.js'

import FetchReturnCycle from '../../../dal/notices/setup/fetch-return-cycle.dal.js'
import FetchReturnsReminderPeriods from '../../../dal/notices/setup/fetch-returns-reminder-periods.dal.js'
import ReminderPeriodPresenter from '../../../presenters/notices/setup/reminder-period.presenter.js'
import ReminderPeriodValidator from '../../../validators/notices/setup/reminder-period.validator.js'

/**
 * Formats data for the `/notices/setup/reminder-period` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} An object containing where to redirect to if there are no errors else the page data for the view
 * including the validation error details
 */
export default async function submitReminderPeriodService(sessionId, payload, yar) {
  const session = await FetchSessionDal(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    _notification(session, payload, yar)

    await _save(session, payload)

    return {
      redirectUrl: `/system/notices/setup/${session.id}/check-notice-type`
    }
  }

  const reminderPeriods = await FetchReturnsReminderPeriods()
  const formattedData = ReminderPeriodPresenter(session, reminderPeriods)

  return {
    activeNavBar: 'notices',
    error: validationResult,
    ...formattedData
  }
}

function _notification(session, payload, yar) {
  if (session.checkPageVisited && session.reminderPeriod !== payload.reminderPeriod) {
    flashNotification(yar, 'Updated', 'Returns period updated')
  }
}

async function _save(session, payload) {
  session.reminderPeriod = payload.reminderPeriod

  const { dueDate, endDate, startDate, summer } = await FetchReturnCycle(session.reminderPeriod)

  session.determinedReturnsPeriod = {
    dueDate,
    endDate,
    name: summer ? 'summer' : 'allYear',
    quarterly: false,
    startDate,
    summer: summer ? 'true' : 'false'
  }

  return session.$update()
}

function _validate(payload) {
  const validationResult = ReminderPeriodValidator(payload)

  return formatValidationResult(validationResult)
}
