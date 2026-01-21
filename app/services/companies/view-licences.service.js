'use strict'

/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/licences' page
 *
 * @module ViewLicencesService
 */

const FetchCompanyService = require('./fetch-company.service.js')
const FetchLicencesService = require('./fetch-licences.service.js')
const LicencesPresenter = require('../../presenters/companies/licences.presenter.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const { userRoles } = require('../../presenters/licences/base-licences.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the '/companies/{id}/licences' page
 *
 * @param {string} companyId - the UUID of the company
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {number} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(companyId, auth, page) {
  const company = await FetchCompanyService.go(companyId)

  const { licences, pagination } = await FetchLicencesService.go(companyId, page)

  const pageData = LicencesPresenter.go(company, licences)

  const paginationData = PaginatorPresenter.go(
    pagination.total,
    Number(page),
    `/system/companies/${companyId}/licences`,
    licences.length,
    'licences'
  )

  return {
    ...pageData,
    activeNavBar: 'search',
    activeSecondaryNav: 'licences',
    pagination: paginationData,
    roles: userRoles(auth)
  }
}

module.exports = {
  go
}
