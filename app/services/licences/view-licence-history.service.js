'use strict'

const FetchLicenceHistoryService = require('./fetch-licence-history.service.js')
const ViewLicenceHistoryPresenter = require('../../presenters/licences/view-licence-history.presenter.js')

async function go (licenceId) {
  const history = await FetchLicenceHistoryService.go(licenceId)

  const pageData = ViewLicenceHistoryPresenter.go(history)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
