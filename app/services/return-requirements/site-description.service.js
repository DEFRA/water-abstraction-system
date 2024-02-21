'use strict'

const SessionModel = require('../../models/session.model.js')
const SiteDescriptionPresenter = require('../../presenters/return-requirements/site-description.presenter.js')

async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)
  const formattedData = SiteDescriptionPresenter.go(session)

  return {
    activeNavBar: 'search',
    pageTitle: 'Enter a site description for the return requirement',
    ...formattedData
  }
}

module.exports = {
  go
}
