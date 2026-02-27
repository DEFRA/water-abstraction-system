'use strict'

/**
 * Orchestrates presenting the data for `/users` page
 * @module IndexUsersService
 */

const FetchUsersService = require('./fetch-users.service.js')
const IndexUsersPresenter = require('../../presenters/users/index-users.presenter.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const { processSavedFilters } = require('../../lib/submit-page.lib.js')

const featureFlagsConfig = require('../../../config/feature-flags.config.js')

/**
 * Orchestrates presenting the data for `/users` page
 *
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} The view data for the users page
 */
async function go(yar, auth, page) {
  const filters = _filters(yar)

  const { results: users, total: totalNumber } = await FetchUsersService.go(filters, page)

  const pagination = PaginatorPresenter.go(totalNumber, page, `/system/users`, users.length, 'users')

  const pageData = IndexUsersPresenter.go(users, auth)

  return {
    activeNavBar: featureFlagsConfig.enableUsersView ? 'users' : 'search',
    filters,
    ...pageData,
    pagination
  }
}

function _filters(yar) {
  const savedFilters = processSavedFilters(yar, 'usersFilter')

  return {
    email: null,
    permissions: null,
    status: null,
    type: null,
    ...savedFilters
  }
}

module.exports = {
  go
}
