'use strict'

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/site-description` page
 * @module SubmitSiteDescriptionService
 */

const { formatValidationResult } = require('../../../presenters/base.presenter.js')

const GeneralLib = require('../../../lib/general.lib.js')
const SessionModel = require('../../../models/session.model.js')
const SiteDescriptionPresenter = require('../../../presenters/return-versions/setup/site-description.presenter.js')
const SiteDescriptionValidator = require('../../../validators/return-versions/setup/site-description.validator.js')

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/site-description` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * The user input is then validated and the site description in the payload is saved in the session. If there is a
 * validation error the controller will re-render the page. If all is well the controller will redirect to the next page
 * in the journey.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {string} requirementIndex - The index of the requirement being added or changed
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} If no errors a flag that determines whether the user is returned to the check page else
 * the page data for the site description page including the validation error details
 */
async function go(sessionId, requirementIndex, payload, yar) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, requirementIndex, payload)

    if (session.checkPageVisited) {
      GeneralLib.flashNotification(yar, 'Updated', 'Requirements for returns updated')
    }

    return {
      checkPageVisited: session.checkPageVisited
    }
  }

  const submittedSessionData = _submittedSessionData(session, requirementIndex, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...submittedSessionData
  }
}

async function _save(session, requirementIndex, payload) {
  session.requirements[requirementIndex].siteDescription = payload.siteDescription

  return session.$update()
}

/**
 * Combines the existing session data with the submitted payload formatted by the presenter. If nothing is submitted by
 * the user, payload will be an empty object.
 *
 * @private
 */
function _submittedSessionData(session, requirementIndex, payload) {
  session.requirements[requirementIndex].siteDescription = payload.siteDescription ? payload.siteDescription : null

  return SiteDescriptionPresenter.go(session, requirementIndex)
}

function _validate(payload) {
  const validation = SiteDescriptionValidator.go(payload)

  return formatValidationResult(validation)
}

module.exports = {
  go
}
