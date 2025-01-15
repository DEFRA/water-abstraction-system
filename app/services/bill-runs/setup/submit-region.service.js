'use strict'

/**
 * Handles the user submission for the `/bill-runs/setup/{sessionId}/region` page
 * @module SubmitRegionService
 */

const FetchRegionsService = require('./fetch-regions.service.js')
const RegionPresenter = require('../../../presenters/bill-runs/setup/region.presenter.js')
const RegionValidator = require('../../../validators/bill-runs/setup/region.validator.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Handles the user submission for the `/bill-runs/setup/{sessionId}/region` page
 *
 * It first retrieves the session instance for the setup bill run journey in progress. It then validates the payload of
 * the submitted request.
 *
 * If there is no validation error it will save the selected value to the session then return an object with a
 * `setupComplete:` property. If the bill run type was not two-part tariff this will be true. Else it will be false.
 * The fact the property exists will tell the controller the submission was successful. Whether the property
 * `setupComplete:` is true or false will be used to determine which page to direct the user to next.
 *
 * If there is a validation error it is combined with the output of the presenter to generate the page data needed to
 * re-render the view with an error message.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} An object with a `setupComplete:` property if there are no errors else the page data for
 * the region page including the validation error details
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)
  const regions = await FetchRegionsService.go()

  const validationResult = _validate(payload, regions)

  if (!validationResult) {
    await _save(session, payload)

    // The journey is complete (we don't need any details) if the bill run type is not 2PT
    return { setupComplete: !session.type.startsWith('two_part') }
  }

  const formattedData = RegionPresenter.go(session, regions)

  return {
    activeNavBar: 'bill-runs',
    error: validationResult,
    ...formattedData
  }
}

async function _save(session, payload) {
  const currentData = session

  currentData.region = payload.region

  return session.$query().patch({ data: currentData })
}

function _validate(payload, regions) {
  const validation = RegionValidator.go(payload, regions)

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
