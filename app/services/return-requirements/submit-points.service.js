'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/points` page
 * @module SubmitPointsService
 */

const FetchPointsService = require('../../services/return-requirements/fetch-points.service.js')
const GeneralLib = require('../../lib/general.lib.js')
const PointsPresenter = require('../../presenters/return-requirements/points.presenter.js')
const PointsValidator = require('../../validators/return-requirements/points.validator.js')
const SessionModel = require('../../models/session.model.js')

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
 * @param {string} requirementIndex - The index of the requirement being added or changed
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} If no errors a flag that determines whether the user is returned to the check page else
 * the page data for the points page including the validation error details
 */
async function go (sessionId, requirementIndex, payload, yar) {
  const session = await SessionModel.query().findById(sessionId)

  _handleOneOptionSelected(payload)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, requirementIndex, payload)

    if (session.checkPageVisited) {
      GeneralLib.flashNotification(yar)
    }

    return {
      checkPageVisited: session.checkPageVisited
    }
  }

  const pointsData = await FetchPointsService.go(session.licence.id)
  const formattedData = PointsPresenter.go(session, requirementIndex, pointsData)

  return {
    activeNavBar: 'search',
    error: validationResult,
    pageTitle: 'Select the points for the requirements for returns',
    ...formattedData
  }
}

/**
 * When a single point is checked by the user, it returns as a string. When multiple points are checked, the
 * 'points' is returned as an array. This function works to make those single selected string 'points' into an array
 * for uniformity.
 *
 * @private
 */
function _handleOneOptionSelected (payload) {
  if (!Array.isArray(payload.points)) {
    payload.points = [payload.points]
  }
}

async function _save (session, requirementIndex, payload) {
  session.requirements[requirementIndex].points = payload.points

  return session.$update()
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
