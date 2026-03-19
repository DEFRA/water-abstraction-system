'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/history' page
 *
 * @module ViewHistoryService
 */

const FetchCompanyService = require('./fetch-company.service.js')
const FetchHistoryService = require('./fetch-history.service.js')
const HistoryPresenter = require('../../presenters/companies/history.presenter.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const { userRoles } = require('../../presenters/licences/base-licences.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/history' page
 *
 * @param {string} companyId - the UUID of the company
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(companyId, auth, page) {
  const company = await FetchCompanyService.go(companyId)

  const { licences, totalNumber } = await FetchHistoryService.go(companyId, page)

  const pageData = HistoryPresenter.go(company, licences)

  const pagination = PaginatorPresenter.go(
    totalNumber,
    page,
    `/system/companies/${companyId}/history`,
    licences.length,
    'licences'
  )

  return {
    ...pageData,
    activeSecondaryNav: 'history',
    pagination,
    roles: userRoles(auth)
  }
}

module.exports = {
  go
}
