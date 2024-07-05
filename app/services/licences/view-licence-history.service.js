'use strict'

const FetchLicenceHistoryService = require('./fetch-licence-history.service.js')
const ViewLicenceHistoryPresenter = require('../../presenters/licences/view-licence-history.presenter.js')
const ViewLicenceService = require('./view-licence.service.js')

async function go (licenceId, auth) {
  const commonData = await ViewLicenceService.go(licenceId, auth)

  const history = await FetchLicenceHistoryService.go(licenceId)
  const pageData = ViewLicenceHistoryPresenter.go(history)

  return {
    activeTab: 'bills',
    ...commonData,
    ...pageData
  }
}

module.exports = {
  go
}
