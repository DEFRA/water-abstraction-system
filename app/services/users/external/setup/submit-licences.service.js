/**
 * Orchestrates validating the data for the '/users/external/setup/{sessionId}/licences' page
 *
 * @module SubmitLicencesService
 */

import FetchSessionDal from '../../../../dal/fetch-session.dal.js'
import LicencesPresenter from '../../../../presenters/users/external/setup/licences.presenter.js'
import LicencesValidator from '../../../../validators/users/external/setup/licences.validator.js'
import { checkUrl } from '../../../../lib/check-page.lib.js'
import { flashNotification } from '../../../../lib/general.lib.js'
import { formatValidationResult } from '../../../../presenters/base.presenter.js'
import { handleOneOptionSelected } from '../../../../lib/submit-page.lib.js'

/**
 * Orchestrates validating the data for the '/users/external/setup/{sessionId}/licences' page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId, payload, yar) {
  const session = await FetchSessionDal.go(sessionId)

  handleOneOptionSelected(payload, 'licences')

  const payloadSelection = _payloadSelection(payload)

  const error = _validate(payload)

  if (!error) {
    _notification(session, payloadSelection, yar)

    await _save(session, payloadSelection)

    return {
      redirectUrl: checkUrl(session, `/system/users/external/setup/${sessionId}/check`)
    }
  }

  session.allLicences = payloadSelection.allLicences
  session.selectedLicences = payloadSelection.selectedLicences

  const pageData = LicencesPresenter.go(session)

  return {
    error,
    ...pageData
  }
}

function _notification(session, payloadSelection, yar) {
  const selectionDiffers = _payloadDiffers(payloadSelection, session)

  if (session.checkPageVisited && selectionDiffers) {
    flashNotification(yar, 'Updated', 'Licences to unregister updated')
  }
}

function _payloadSelection(payload) {
  const { licences } = payload

  const allLicences = licences.includes('all')
  const selectedLicences = licences.filter((licence) => {
    return licence !== 'all'
  })

  return { allLicences, selectedLicences }
}

async function _save(session, payloadSelection) {
  session.allLicences = payloadSelection.allLicences
  session.selectedLicences = payloadSelection.selectedLicences

  return session.$update()
}

function _payloadDiffers(payloadSelection, session) {
  // Has the user changed whether "All licences" was selected?
  const allLicencesMatch = session.allLicences === payloadSelection.allLicences

  if (!allLicencesMatch) {
    return true
  }

  // Has the user changed the number of licences selected?
  let selectedLicencesMatch = session.selectedLicences.length === payloadSelection.selectedLicences.length

  if (!selectedLicencesMatch) {
    return true
  }

  // Has the user changed the specific licences selected?
  selectedLicencesMatch = session.selectedLicences.every((licence) => {
    return payloadSelection.selectedLicences.includes(licence)
  })

  return !selectedLicencesMatch
}

function _validate(payload) {
  const validationResult = LicencesValidator.go(payload)

  return formatValidationResult(validationResult)
}

export default {
  go
}
