'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view licence bills tab
 * @module ViewLicenceBillsService
 */

const FetchLicenceBillsService = require('./fetch-licence-bills.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const ViewLicenceBillsPresenter = require('../../presenters/licences/view-licence-bills.presenter.js')

/**
 * Orchestrates fetching and presenting the data needed for the view licence bills tab
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {number|string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} an object representing the `pageData` needed by the licence bills template.
 */
async function go(licenceId, auth, page) {
  const { bills, licence, pagination } = await FetchLicenceBillsService.go(licenceId, page)

  const pageData = ViewLicenceBillsPresenter.go(licence, bills, auth)

  const paginationData = PaginatorPresenter.go(pagination.total, Number(page), `/system/licences/${licenceId}/bills`)

  return {
    ...pageData,
    activeTab: 'bills',
    pagination: paginationData
  }
}
module.exports = {
  go
}
