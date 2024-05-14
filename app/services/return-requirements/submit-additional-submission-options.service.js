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
 * @param {Object} payload - The submitted form data
 * @param {string} requirementIndex - The index of the requirement being added or changed
 * @param {Object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<Object>} If no errors it returns an empty object else the page data for the note page including the
 * validation error details
 */
async function go (sessionId, requirementIndex, payload, yar) {
  const session = await SessionModel.query().findById(sessionId)

  _handleOneOptionSelected(payload)

  const validationResult = _validate(payload)

  if (!validationResult) {
    const notification = _notification(session, requirementIndex, payload['additional-submission-options'])
    await _save(session, requirementIndex, payload)

    if (notification) {
      yar.flash('notification', notification)
    }

    return {}
  }

  const submittedSessionData = _submittedSessionData(session, requirementIndex, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    pageTitle: 'Select any additional submission options for the return requirements',
    ...submittedSessionData
  }
}

/**
 * When a single point is checked by the user, it returns as a string. When multiple points are checked, the
 * 'points' is returned as an array. This function works to make those single selected string 'points' into an array
 * for uniformity.
 */
function _handleOneOptionSelected (payload) {
  if (!Array.isArray(payload['additional-submission-options'])) {
    payload['additional-submission-options'] = [payload['additional-submission-options']]
  }
}

function _notification (session, requirementIndex, newOptions) {
  const additionalSubmissionOptions = session.requirements[requirementIndex]?.additionalSubmissionOptions

  if (additionalSubmissionOptions && additionalSubmissionOptions !== newOptions) {
    return {
      text: 'Changes updates',
      title: 'Updated'
    }
  }

  return null
}

async function _save (session, requirementIndex, payload) {
  session.requirements[requirementIndex].additionalSubmissionOptions = payload['additional-submission-options']

  return session.$update()
}

function _submittedSessionData (session, requirementIndex, payload) {
  session.requirements[requirementIndex].additionalSubmissionOptions = payload['additional-submission-options'] || null

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
