'use strict'

/**
 * Orchestrates fetching and presenting external user data for `/users/external/{id}/verifications` page
 * @module ViewVerificationsService
 */

const FetchVerificationsDal = require('../../../dal/users/external/fetch-verifications.dal.js')
const FetchUserDal = require('../../../dal/users/fetch-user.dal.js')
const PaginatorPresenter = require('../../../presenters/paginator.presenter.js')
const VerificationsPresenter = require('../../../presenters/users/external/verifications.presenter.js')

/**
 * Orchestrates fetching and presenting external user data for `/users/external/{id}/verifications` page
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

  const { verifications, totalNumber } = await FetchVerificationsDal.go(user.licenceEntityId, page)

  const pageData = VerificationsPresenter.go(user, verifications, auth.credentials.scope, back)

  const pagination = PaginatorPresenter.go(
    totalNumber,
    page,
    `/system/users/external/${id}/verifications`,
    verifications.length,
    'verifications',
    { back }
  )

  return {
    activeSecondaryNav: 'verifications',
    pagination,
    ...pageData
  }
}

module.exports = {
  go
}
