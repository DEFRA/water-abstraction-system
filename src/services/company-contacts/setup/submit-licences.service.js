/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/licences' page
 *
 * @module SubmitLicencesService
 */

import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'
import { checkUrl } from 'water-abstraction-engine/lib/check-page.lib.js'
import { formatValidationResult } from 'water-abstraction-engine/presenters/base.presenter.js'
import { handleOneOptionSelected } from 'water-abstraction-engine/lib/submit-page.lib.js'

import LicencesPresenter from '../../../presenters/company-contacts/setup/licences.presenter.js'
import LicencesValidator from '../../../validators/company-contacts/setup/licences.validator.js'

/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/licences' page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
export default async function submitLicencesService(sessionId, payload) {
  const session = await FetchSessionDal(sessionId)

  handleOneOptionSelected(payload, 'licences')

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {
      redirectUrl: checkUrl(session, `/system/company-contacts/setup/${sessionId}/check`)
    }
  }

  const pageData = LicencesPresenter(session)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  session.abstractionAlertLicences = payload.licences

  return session.$update()
}

function _validate(payload) {
  const validationResult = LicencesValidator(payload)

  return formatValidationResult(validationResult)
}
