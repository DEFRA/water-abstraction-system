/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/additional-submission-options` page
 * @module AdditionalSubmissionOptionsService
 */

import AdditionalSubmissionOptionsPresenter from '../../../presenters/return-versions/setup/additional-submission-options.presenter.js'
import AdditionalSubmissionOptionsValidator from '../../../validators/return-versions/setup/additional-submission-options.validator.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import { formatValidationResult } from '../../../presenters/base.presenter.js'
import { handleOneOptionSelected } from '../../../lib/submit-page.lib.js'

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/additional-submission-options` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The id of the current session
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} If no errors it returns an empty object else the page data for the note page including the
 * validation error details
 */
async function go(sessionId, payload, yar) {
  const session = await FetchSessionDal(sessionId)

  handleOneOptionSelected(payload, 'additionalSubmissionOptions')

  const error = _validate(payload, session)

  if (!error) {
    const notification = _notification(session, payload)

    await _save(session, payload)

    if (notification) {
      yar.flash('notification', notification)
    }

    return {}
  }

  const submittedSessionData = _submittedSessionData(session, payload)

  return {
    error,
    ...submittedSessionData
  }
}

function _notification(session, payload) {
  const { additionalSubmissionOptions } = session ?? {}

  if (additionalSubmissionOptions !== payload.additionalSubmissionOptions) {
    return {
      text: 'Additional submission options updated',
      title: 'Updated'
    }
  }

  return null
}

async function _save(session, payload) {
  session.multipleUpload = payload.additionalSubmissionOptions.includes('multiple-upload')

  session.quarterlyReturns = payload.additionalSubmissionOptions.includes('quarterly-returns')

  session.noAdditionalOptions = payload.additionalSubmissionOptions.includes('none')

  return session.$update()
}

function _submittedSessionData(session, payload) {
  session.additionalSubmissionOptions = payload.additionalSubmissionOptions ?? []

  return AdditionalSubmissionOptionsPresenter.go(session)
}

function _validate(payload, session) {
  const validation = AdditionalSubmissionOptionsValidator.go(payload, session)

  return formatValidationResult(validation)
}

export { go }
export default {
  go
}
