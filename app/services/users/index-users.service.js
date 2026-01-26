'use strict'

/**
 * Orchestrates presenting the data for `/users` page
 * @module IndexUsersService
 */

const FetchUsersService = require('./fetch-users.service.js')
const IndexUsersPresenter = require('../../presenters/users/index-users.presenter.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')

/**
 * Orchestrates presenting the data for `/users` page
 *
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {number|string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The view data for the users page
 */
async function go(yar, auth, page = 1) {
  const filters = _filters(yar)

  const selectedPageNumber = Number(page)

  const { results: users, total: totalNumber } = await FetchUsersService.go(filters, selectedPageNumber)

  const pagination = PaginatorPresenter.go(totalNumber, selectedPageNumber, `/system/users`, users.length, 'users')

  const pageData = IndexUsersPresenter.go(users, auth)

  return {
    activeNavBar: 'search',
    filters,
    ...pageData,
    pagination
  }
}

function _filters(yar) {
  let openFilter = false

  const savedFilters = yar.get('usersFilter')

  if (savedFilters) {
    for (const key of Object.keys(savedFilters)) {
      openFilter = !!savedFilters[key]

      if (openFilter) {
        break
      }
    }
  }

  return {
    email: null,
    permissions: null,
    status: null,
    type: null,
    ...savedFilters,
    openFilter
  }
}

module.exports = {
  go
}
