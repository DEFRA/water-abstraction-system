'use strict'

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/points` page
 * @module SubmitPointsService
 */

const { formatValidationResult } = require('../../../presenters/base.presenter.js')

const FetchPointsService = require('./fetch-points.service.js')
const GeneralLib = require('../../../lib/general.lib.js')
const PointsPresenter = require('../../../presenters/return-versions/setup/points.presenter.js')
const PointsValidator = require('../../../validators/return-versions/setup/points.validator.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/return-versions/setup/{sessionId}/points` page
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
async function go(sessionId, requirementIndex, payload, yar) {
  const session = await SessionModel.query().findById(sessionId)

  _handleOneOptionSelected(payload)

  const validationResult = _validate(payload.points)

  if (!validationResult) {
    await _save(session, requirementIndex, payload)

    if (session.checkPageVisited) {
      GeneralLib.flashNotification(yar, 'Updated', 'Requirements for returns updated')
    }

    return {
      checkPageVisited: session.checkPageVisited
    }
  }

  const pointsData = await FetchPointsService.go(session.licenceVersion.id)
  const formattedData = PointsPresenter.go(session, requirementIndex, pointsData)

  return {
    activeNavBar: 'search',
    error: validationResult,
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
function _handleOneOptionSelected(payload) {
  if (!Array.isArray(payload.points)) {
    payload.points = [payload.points]
  }
}

async function _save(session, requirementIndex, payload) {
  session.requirements[requirementIndex].points = payload.points

  return session.$update()
}

function _validate(payload) {
  const validation = PointsValidator.go(payload)

  return formatValidationResult(validation)
}

module.exports = {
  go
}
