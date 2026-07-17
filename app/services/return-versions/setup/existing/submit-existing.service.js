/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/existing` page
 * @module SubmitExistingService
 */

import ExistingPresenter from '../../../../presenters/return-versions/setup/existing.presenter.js'
import ExistingValidator from '../../../../validators/return-versions/setup/existing.validator.js'
import FetchSessionDal from '../../../../dal/fetch-session.dal.js'
import GenerateFromExistingRequirementsService from './generate-from-existing-requirements.service.js'
import { formatValidationResult } from '../../../../presenters/base.presenter.js'

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/existing` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey after the existing return requirements have been saved to
 * the session.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} If no errors an empty object else the page data for the existing page including the
 * validation error details
 */
export default async function submitExistingService(sessionId, payload) {
  const session = await FetchSessionDal(sessionId)

  const validationResult = _validate(payload, session)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  const formattedData = ExistingPresenter(session)

  return {
    error: validationResult,
    ...formattedData
  }
}

async function _save(session, payload) {
  const { requirements, multipleUpload, quarterlyReturns } = await GenerateFromExistingRequirementsService(
    payload.existing
  )

  session.multipleUpload = multipleUpload
  session.quarterlyReturns = quarterlyReturns
  session.requirements = requirements

  return session.$update()
}

function _validate(payload, session) {
  const {
    licence: { returnVersions }
  } = session

  const validation = ExistingValidator(payload, returnVersions)

  return formatValidationResult(validation)
}
