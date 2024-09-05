'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/additional-submission-options` page
 * @module AdditionalSubmissionOptionsService
 */

const AdditionalSubmissionOptionsPresenter = require('../../presenters/return-requirements/additional-submission-options.presenter.js')
const AdditionalSubmissionOptionsValidator = require('../../validators/return-requirements/additional-submission-options.validator.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/additional-submission-options` page
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
async function go (sessionId, payload, yar) {
  const session = await SessionModel.query().findById(sessionId)

  _handleOneOptionSelected(payload)

  const validationResult = _validate(payload)

  if (!validationResult) {
    const notification = _notification(session, payload)

    await _save(session, payload)

    if (notification) {
      yar.flash('notification', notification)
    }

    return {}
  }

  const submittedSessionData = _submittedSessionData(session, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    pageTitle: 'Select any additional submission options for the return requirements',
    ...submittedSessionData
  }
}

/**
* When a single additional submission option is checked by the user, it returns as a string. When multiple options are
 * checked, the 'additionalSubmissionOptions' is returned as an array.
 * This function works to make those single selected string 'additionalSubmissionOptions' into an array for uniformity.
 *
 * @private
 */
function _handleOneOptionSelected (payload) {
  if (!Array.isArray(payload.additionalSubmissionOptions)) {
    payload.additionalSubmissionOptions = [payload.additionalSubmissionOptions]
  }
}

function _notification (session, payload) {
  const { additionalSubmissionOptions } = session ?? {}

  if (additionalSubmissionOptions !== payload.additionalSubmissionOptions) {
    return {
      text: 'Changes updated',
      title: 'Updated'
    }
  }

  return null
}

async function _save (session, payload) {
  session.additionalSubmissionOptions = payload.additionalSubmissionOptions

  return session.$update()
}

function _submittedSessionData (session, payload) {
  session.additionalSubmissionOptions = payload.additionalSubmissionOptions ?? []

  return AdditionalSubmissionOptionsPresenter.go(session)
}

function _validate (payload) {
  const validation = AdditionalSubmissionOptionsValidator.go(payload)

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
