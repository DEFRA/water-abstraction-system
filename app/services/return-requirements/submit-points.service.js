'use strict'

/**
 * Orchestrates validating the data for `/return-requirements/{sessionId}/points` page
 * @module SubmitPointsService
 */

const FetchPointsService = require('../../services/return-requirements/fetch-points.service.js')
const PointValidation = require('../../validators/return-requirements/point.validator.js')
const SelectPointsPresenter = require('../../presenters/return-requirements/points.presenter.js')
const SessionModel = require('../../models/session.model.js')

async function go (sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const pointsData = await FetchPointsService.go(session.data.licence.id)
  const validationResult = _validate(payload)
  const formattedData = SelectPointsPresenter.go(session, pointsData, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    pageTitle: 'Select the points for the requirements for returns',
    ...formattedData
  }
}

function _validate (payload) {
  const validation = PointValidation.go(payload)

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
