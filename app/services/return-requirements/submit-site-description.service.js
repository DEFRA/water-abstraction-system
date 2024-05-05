'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/site-description` page
 * @module SubmitSiteDescriptionService
 */

const FetchSessionService = require('./fetch-session.service.js')
const SiteDescriptionPresenter = require('../../presenters/return-requirements/site-description.presenter.js')
const SiteDescriptionValidator = require('../../validators/return-requirements/site-description.validator.js')

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/site-description` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * The user input is then validated and the site description in the payload is saved in the session. If there is a
 * validation error the controller will re-render the page. If all is well the controller will redirect to the next page
 * in the journey.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {Object} payload - The submitted form data
 *
 * @returns {Promise<Object>} The page data for the start date page
 */
async function go (sessionId, payload) {
  const session = await FetchSessionService.go(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {
      checkYourAnswersVisited: session.checkYourAnswersVisited
    }
  }

  const submittedSessionData = _submittedSessionData(session, payload)

  return {
    activeNavBar: 'search',
    checkYourAnswersVisited: session.checkYourAnswersVisited,
    error: validationResult,
    pageTitle: 'Enter a site description for the requirements for returns',
    ...submittedSessionData
  }
}

async function _save (session, payload) {
  session.siteDescription = payload.siteDescription

  return session.update()
}

/**
 * Combines the existing session data with the submitted payload formatted by the presenter. If nothing is submitted by
 * the user, payload will be an empty object.
 */
function _submittedSessionData (session, payload) {
  session.siteDescription = payload.siteDescription ? payload.siteDescription : null

  return SiteDescriptionPresenter.go(session)
}

function _validate (payload) {
  const validation = SiteDescriptionValidator.go(payload)

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
