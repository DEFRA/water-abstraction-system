/**
 * Formats data for the `/notices/setup/reminder-period` page
 * @module ReminderPeriodPresenter
 */

import { formatLongDate } from 'water-abstraction-engine/presenters/base.presenter.js'

/**
 * Formats data for the `/notices/setup/reminder-period` page
 *
 * @param {module:SessionModel} session - The session instance
 * @param {module:ReturnCycleModel[]} returnCycles - The upcoming return cycles with returns awaiting a reminder
 *
 * @returns {object} - The data formatted for the view template
 */
export default function reminderPeriodPresenter(session, returnCycles) {
  const { checkPageVisited, id: sessionId } = session

  const savedReminderPeriod = session.reminderPeriod ?? null

  return {
    backLink: _backLink(sessionId, checkPageVisited),
    reminderPeriods: _reminderPeriods(returnCycles, savedReminderPeriod),
    pageTitle: `Select the returns period for the reminders`
  }
}

function _backLink(sessionId, checkPageVisited) {
  if (checkPageVisited) {
    return {
      href: `/system/notices/setup/${sessionId}/check-notice-type`,
      text: 'Back'
    }
  }

  return {
    href: `/system/notices/setup/${sessionId}/notice-type`,
    text: 'Back'
  }
}

function _reminderPeriods(returnCycles, savedReminderPeriod) {
  return returnCycles.map((returnCycle) => {
    const { endDate, startDate, summer } = returnCycle
    const name = summer ? 'Summer' : 'Winter'

    return {
      checked: returnCycle.id === savedReminderPeriod,
      text: `${name} ${formatLongDate(startDate)} to ${formatLongDate(endDate)}`,
      value: returnCycle.id
    }
  })
}
