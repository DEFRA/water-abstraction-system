'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/purpose` page
 * @module SubmitPurposeService
 */

const FetchLicencePurposesService = require('./fetch-licence-purposes.service.js')
const GeneralLib = require('../../lib/general.lib.js')
const PurposePresenter = require('../../presenters/return-requirements/purpose.presenter.js')
const PurposeValidation = require('../../validators/return-requirements/purpose.validator.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/purpose` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * The user input is then validated and the result is then combined with the output of the presenter to generate the
 * page data needed by the view. If there was a validation error the controller will re-render the page so needs this
 * information. If all is well the controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} requirementIndex - The index of the requirement being added or changed
 * @param {Object} payload - The submitted form data
 * @param {Object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<Object>} If no errors a flag that determines whether the user is returned to the check page else
 * the page data for the purpose page including the validation error details
 */
async function go (sessionId, requirementIndex, payload, yar) {
  const session = await SessionModel.query().findById(sessionId)
  const purposesData = await FetchLicencePurposesService.go(session.licence.id)

  _handleOneOptionSelected(payload)

  const validationResult = await _validate(payload, purposesData)

  if (!validationResult) {
    await _save(session, requirementIndex, payload)

    if (session.checkPageVisited) {
      GeneralLib.flashNotification(yar)
    }

    return {
      checkPageVisited: session.checkPageVisited
    }
  }

  const formattedData = PurposePresenter.go(session, requirementIndex, purposesData)

  return {
    activeNavBar: 'search',
    error: validationResult,
    pageTitle: 'Select the purpose for the requirements for returns',
    ...formattedData
  }
}

/**
 * When a single purpose is checked by the user, it returns as a string. When multiple purposes are checked, the
 * 'purposes' is returned as an array. This function works to make those single selected string 'purposes' into an array
 * for uniformity.
 */
function _handleOneOptionSelected (payload) {
  if (!Array.isArray(payload.purposes)) {
    payload.purposes = [payload.purposes]
  }
}

async function _save (session, requirementIndex, payload) {
  session.requirements[requirementIndex].purposes = payload.purposes

  return session.$update()
}

async function _validate (payload, purposesData) {
  const purposeIds = purposesData.map((purpose) => {
    return purpose.id
  })

  const validation = PurposeValidation.go(payload, purposeIds)

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
