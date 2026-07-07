/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/licences' page
 *
 * @module SubmitLicencesService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import LicencesPresenter from '../../../presenters/company-contacts/setup/licences.presenter.js'
import LicencesValidator from '../../../validators/company-contacts/setup/licences.validator.js'
import { checkUrl } from '../../../lib/check-page.lib.js'
import { formatValidationResult } from '../../../presenters/base.presenter.js'
import { handleOneOptionSelected } from '../../../lib/submit-page.lib.js'

/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/licences' page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await FetchSessionDal.go(sessionId)

  handleOneOptionSelected(payload, 'licences')

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {
      redirectUrl: checkUrl(session, `/system/company-contacts/setup/${sessionId}/check`)
    }
  }

  const pageData = LicencesPresenter.go(session)

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
  const validationResult = LicencesValidator.go(payload)

  return formatValidationResult(validationResult)
}

export default {
  go
}
