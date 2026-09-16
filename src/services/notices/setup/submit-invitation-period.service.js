/**
 * Orchestrates validating the data for `/notices/setup/invitation-period` page
 * @module SubmitInvitationPeriodService
 */

import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'
import { flashNotification } from 'water-abstraction-engine/lib/general.lib.js'
import { formatValidationResult } from 'water-abstraction-engine/presenters/base.presenter.js'

import FetchReturnCycle from '../../../dal/notices/setup/fetch-return-cycle.dal.js'
import FetchReturnsInvitationPeriods from '../../../dal/notices/setup/fetch-returns-invitation-periods.dal.js'
import InvitationPeriodPresenter from '../../../presenters/notices/setup/invitation-period.presenter.js'
import InvitationPeriodValidator from '../../../validators/notices/setup/invitation-period.validator.js'

/**
 * Formats data for the `/notices/setup/invitation-period` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} An object containing where to redirect to if there are no errors else the page data for the view
 * including the validation error details
 */
export default async function submitInvitationPeriodService(sessionId, payload, yar) {
  const session = await FetchSessionDal(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    _notification(session, payload, yar)

    await _save(session, payload)

    return {
      redirect: `/system/notices/setup/${session.id}/check-notice-type`
    }
  }

  const invitationPeriods = await FetchReturnsInvitationPeriods()
  const formattedData = InvitationPeriodPresenter(session, invitationPeriods)

  return {
    activeNavBar: 'notices',
    error: validationResult,
    ...formattedData
  }
}

function _notification(session, payload, yar) {
  if (session.checkPageVisited && session.invitationPeriod !== payload.invitationPeriod) {
    flashNotification(yar, 'Updated', 'Returns period updated')
  }
}

async function _save(session, payload) {
  session.invitationPeriod = payload.invitationPeriod

  const { dueDate, endDate, startDate, summer } = await FetchReturnCycle(session.invitationPeriod)

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
  const validationResult = InvitationPeriodValidator(payload)

  return formatValidationResult(validationResult)
}
