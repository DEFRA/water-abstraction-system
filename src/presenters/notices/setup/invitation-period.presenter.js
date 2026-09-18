/**
 * Formats data for the `/notices/setup/invitation-period` page
 * @module InvitationPeriodsPresenter
 */

import { formatLongDate } from 'water-abstraction-engine/presenters/base.presenter.js'

/**
 * Formats data for the `/notices/setup/invitation-period` page
 *
 * @param {module:SessionModel} session - The session instance
 * @param {module:ReturnCycleModel[]} returnCycles - The upcoming return cycles with returns awaiting an invite
 *
 * @returns {object} - The data formatted for the view template
 */
export default function invitationPeriodPresenter(session, returnCycles) {
  const { checkPageVisited, id: sessionId } = session

  const savedInvitationPeriod = session.invitationPeriod ?? null

  return {
    backLink: _backLink(sessionId, checkPageVisited),
    invitationPeriods: _invitationPeriods(returnCycles, savedInvitationPeriod),
    pageTitle: `Select the returns period for the invitations`
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

function _invitationPeriods(returnCycles, savedInvitationPeriod) {
  return returnCycles.map((returnCycle) => {
    const { endDate, startDate, summer } = returnCycle
    const name = summer ? 'Summer' : 'Winter'

    return {
      checked: returnCycle.id === savedInvitationPeriod,
      text: `${name} ${formatLongDate(startDate)} to ${formatLongDate(endDate)}`,
      value: returnCycle.id
    }
  })
}
