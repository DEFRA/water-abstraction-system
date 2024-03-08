'use strict'

const FetchPurposesService = require('../../services/return-requirements/fetch-purposes.service.js')
const PurposePresenter = require('../../presenters/return-requirements/purpose.presenter.js')
const PurposeValidation = require('../../validators/return-requirements/purpose.validator.js')
const SessionModel = require('../../models/session.model.js')

async function go (sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const purposesData = await FetchPurposesService.go(session)
  const validationResult = _validate(payload)
  const formattedData = PurposePresenter.go(session, purposesData, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    pageTitle: 'Select the purpose for the requirements for returns',
    ...formattedData
  }
}

function _validate (payload) {
  const validation = PurposeValidation.go(payload)

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
