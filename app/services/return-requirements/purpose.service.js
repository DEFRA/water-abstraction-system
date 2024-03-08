'use strict'

/**
 * @module PurposeService
 */

const FetchPurposesService = require('../../services/return-requirements/fetch-purposes.service.js')
const SessionModel = require('../../models/session.model.js')
const SelectPurposePresenter = require('../../presenters/return-requirements/purpose.presenter.js')

async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)
  const purposesData = await FetchPurposesService.go(session)
  const formattedData = SelectPurposePresenter.go(session, purposesData)

  return {
    activeNavBar: 'search',
    pageTitle: 'Select the purpose for the requirements for returns',
    ...formattedData
  }
}

module.exports = {
  go
}
