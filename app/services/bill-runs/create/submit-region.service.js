'use strict'

/**
 * Orchestrates validating the data for `/bill-runs/create/{sessionId}/region` page
 * @module SubmitRegionService
 */

const RegionModel = require('../../../models/region.model.js')
const RegionPresenter = require('../../../presenters/bill-runs/create/region.presenter.js')
const RegionValidator = require('../../../validators/bill-runs/create/region.validator.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/bill-runs/create/{sessionId}/region` page
 *
 * It first retrieves the session instance for the create bill run journey in progress.
 *
 * The validation result is then combined with the output of the presenter to generate the page data needed by the view.
 * If there was a validation error the controller will re-render the page so needs this information. If all is well the
 * controller will redirect to the next page in the journey.
 *
 * @param {string} sessionId - The id of the current session
 * @param {Object} payload - The submitted form data
 *
 * @returns {Promise<Object>} The page data for the region page
 */
async function go (sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)
  const regions = await _fetchRegions()

  const validationResult = _validate(payload, regions)

  if (!validationResult) {
    await _save(session, payload)

    return { journeyComplete: !session.data.type.startsWith('two_part') }
  }

  const formattedData = RegionPresenter.go(session, regions)

  return {
    error: validationResult,
    ...formattedData
  }
}

async function _fetchRegions () {
  return RegionModel.query()
    .select([
      'id',
      'displayName'
    ])
    .orderBy([
      { column: 'displayName', order: 'asc' }
    ])
}

async function _save (session, payload) {
  const currentData = session.data

  currentData.region = payload.region

  return session.$query().patch({ data: currentData })
}

function _validate (payload, regions) {
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
