'use strict'

const SessionModel = require('../../models/session.model.js')
const SiteDescriptionPresenter = require('../../presenters/return-requirements/site-description.presenter.js')
const SiteDescriptionValidator = require('../../validators/return-requirements/site-description.validator.js')

async function go (sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  const formattedData = SiteDescriptionPresenter.go(session, payload)

  return {
    activeNavBar: 'search',
    error: validationResult,
    pageTitle: 'Enter a site description for the return requirement',
    ...formattedData
  }
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
