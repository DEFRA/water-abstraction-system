'use strict'

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/purpose` page
 * @module SubmitPurposeService
 */

const { formatValidationResult } = require('../../../presenters/base.presenter.js')
const FetchPurposesService = require('./fetch-purposes.service.js')
const GeneralLib = require('../../../lib/general.lib.js')
const PurposePresenter = require('../../../presenters/return-versions/setup/purpose.presenter.js')
const PurposeValidation = require('../../../validators/return-versions/setup/purpose.validator.js')
const SessionModel = require('../../../models/session.model.js')
const { handleOneOptionSelected } = require('../../../lib/submit-page.lib.js')

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/purpose` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * The user input is then validated and the result is then combined with the output of the presenter to generate the
 * page data needed by the view. If there was a validation error the controller will re-render the page so needs this
 * information. If all is well the controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} requirementIndex - The index of the requirement being added or changed
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} If no errors a flag that determines whether the user is returned to the check page else
 * the page data for the purpose page including the validation error details
 */
async function go(sessionId, requirementIndex, payload, yar) {
  const session = await SessionModel.query().findById(sessionId)
  const licencePurposes = await FetchPurposesService.go(session.licenceVersion.id)

  handleOneOptionSelected(payload, 'purposes')

  const purposes = _combinePurposeDetails(payload, licencePurposes)

  const error = await _validate(purposes, licencePurposes)

  if (!error) {
    await _save(session, requirementIndex, purposes)

    if (session.checkPageVisited) {
      GeneralLib.flashNotification(yar, 'Updated', 'Requirements for returns updated')
    }

    return {
      checkPageVisited: session.checkPageVisited
    }
  }

  const submittedSessionData = _submittedSessionData(session, requirementIndex, purposes, licencePurposes)

  return {
    error,
    ...submittedSessionData
  }
}

function _combinePurposeDetails(payload, licencePurposes) {
  const combinedValues = []

  for (const purpose of payload.purposes) {
    const alias = payload[`alias-${purpose}`]
    const matchedLicencePurpose = licencePurposes.find((licencePurpose) => {
      return licencePurpose.id === purpose
    })

    combinedValues.push({
      id: purpose,
      alias: alias || '',
      description: matchedLicencePurpose.description
    })
  }

  return combinedValues
}

async function _save(session, requirementIndex, purposes) {
  session.requirements[requirementIndex].purposes = purposes

  return session.$update()
}

/**
 * Combines the existing session data with the submitted payload formatted by the presenter
 *
 * @private
 */
function _submittedSessionData(session, requirementIndex, purposes, licencePurposes) {
  session.requirements[requirementIndex].purposes = purposes

  return PurposePresenter.go(session, requirementIndex, licencePurposes)
}

async function _validate(payload, purposesData) {
  const purposeIds = purposesData.map((purpose) => {
    return purpose.id
  })

  const validation = PurposeValidation.go(payload, purposeIds)

  return formatValidationResult(validation)
}

module.exports = {
  go
}
