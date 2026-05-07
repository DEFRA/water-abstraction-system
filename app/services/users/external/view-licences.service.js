'use strict'

/**
 * Orchestrates fetching and presenting external user data for `/users/external/{id}/licences` page
 * @module ViewLicencesService
 */

const FetchLicencesDal = require('../../../dal/users/external/fetch-licences.dal.js')
const FetchUserDal = require('../../../dal/users/fetch-user.dal.js')
const LicencesPresenter = require('../../../presenters/users/external/licences.presenter.js')
const PaginatorPresenter = require('../../../presenters/paginator.presenter.js')

/**
 * Orchestrates fetching and presenting external user data for `/users/external/{id}/licences` page
 *
 * @param {number} id - The user's ID
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} page - The current page for the pagination service
 * @param {string} back - The 'back' query parameter, used to indicate what back link should be shown on the page
 *
 * @returns {Promise<object>} The view data for the external user page
 */
async function go(id, auth, page, back = 'users') {
  const user = await FetchUserDal.go(id)

  const { licences, totalNumber } = await FetchLicencesDal.go(user.licenceEntityId, page)

  const pageData = LicencesPresenter.go(user, licences, auth.credentials.scope, back)

  const pagination = PaginatorPresenter.go(
    totalNumber,
    page,
    `/system/users/external/${id}/licences`,
    licences.length,
    'licences',
    { back }
  )

  return {
    activeSecondaryNav: 'licences',
    pagination,
    ...pageData
  }
}

module.exports = {
  go
}
