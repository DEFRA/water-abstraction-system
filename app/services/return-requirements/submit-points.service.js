'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/points` page
 * @module SubmitPointsService
 */

const FetchPointsService = require('../../services/return-requirements/fetch-points.service.js')
const FetchSessionService = require('./fetch-session.service.js')
const PointsValidator = require('../../validators/return-requirements/points.validator.js')
const PointsPresenter = require('../../presenters/return-requirements/points.presenter.js')

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/points` page
 *
 * It first retrieves the session instance for the returns requirements journey in progress.
 *
 * The user input is then validated and the result is then combined with the output of the presenter to generate the
 * page data needed by the view. If there was a validation error the controller will re-render the page so needs this
 * information. If all is well the controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {Object} payload - The submitted form data
 *
 * @returns {Promise<Object>} The page data for the start date page
 */
async function go (sessionId, payload) {
  const session = await FetchSessionService.go(sessionId)

  _handleOneOptionSelected(payload)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {
      checkYourAnswersVisited: session.checkYourAnswersVisited
    }
  }

  const pointsData = await FetchPointsService.go(session.licence.id)
  const formattedData = PointsPresenter.go(session, pointsData)

  return {
    activeNavBar: 'search',
    checkYourAnswersVisited: session.checkYourAnswersVisited,
    error: validationResult,
    pageTitle: 'Select the points for the requirements for returns',
    ...formattedData
  }
}

/**
 * When a single point is checked by the user, it returns as a string. When multiple points are checked, the
 * 'points' is returned as an array. This function works to make those single selected string 'points' into an array
 * for uniformity.
 */
function _handleOneOptionSelected (payload) {
  if (!Array.isArray(payload.points)) {
    payload.points = [payload.points]
  }
}

async function _save (session, payload) {
  session.points = payload.points

  return session.update()
}

function _validate (payload) {
  const validation = PointsValidator.go(payload)

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
