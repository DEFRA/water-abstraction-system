/**
 * Handles the user submission for the `/return-logs/setup/{sessionId}/submission` page
 * @module SubmitSubmissionService
 */

import DeleteSessionDal from '../../../dal/delete-session.dal.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import ReturnLogModel from '../../../models/return-log.model.js'
import SubmissionPresenter from '../../../presenters/return-logs/setup/submission.presenter.js'
import SubmissionValidator from '../../../validators/return-logs/setup/submission.validator.js'
import { formatValidationResult } from '../../../presenters/base.presenter.js'
import { timestampForPostgres } from '../../../lib/general.lib.js'

/**
 * Handles the user submission for the `/return-logs/setup/{sessionId}/submission` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} An object with a `journey:` property if there are no errors else the page data for
 * the abstraction return page including the validation error details
 */
export default async function go(sessionId, payload) {
  const session = await FetchSessionDal(sessionId)
  const error = _validate(payload)

  const { returnLogId } = session

  if (!error) {
    await _save(session, payload)

    const redirect = await _redirect(payload.journey, session)

    return {
      redirect,
      returnLogId
    }
  }

  const formattedData = SubmissionPresenter(session)

  return {
    error,
    ...formattedData
  }
}

async function _confirmReceipt(session) {
  await ReturnLogModel.query()
    .findById(session.returnLogId)
    .patch({ receivedDate: session.receivedDate, status: 'received', updatedAt: timestampForPostgres() })

  await DeleteSessionDal(session.id)
}

async function _redirect(journey, session) {
  if (journey === 'nilReturn') {
    return 'check'
  }

  if (journey === 'recordReceipt') {
    await _confirmReceipt(session)

    return 'confirm-received'
  }

  return 'reported'
}

async function _save(session, payload) {
  // We set `checkPageVisited` to false here as it is possible that the user recorded a nil return in error and then
  // selected "Change" from the "Check" page. This would have resulted in `checkPageVisited` being set to `true` which
  // would cause issues with the flow of the journey if details were subsequently entered.
  session.checkPageVisited = false
  session.journey = payload.journey

  return session.$update()
}

function _validate(payload) {
  const validationResult = SubmissionValidator.go(payload)

  return formatValidationResult(validationResult)
}
