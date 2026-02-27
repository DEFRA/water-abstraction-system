'use strict'

/**
 * Handles validation of the requested filters, saving them to the session else re-rendering the page if invalid
 * @module SubmitIndexUsersService
 */

const { formatValidationResult } = require('../../presenters/base.presenter.js')
const FetchUsersService = require('./fetch-users.service.js')
const IndexUsersPresenter = require('../../presenters/users/index-users.presenter.js')
const IndexValidator = require('../../validators/users/index.validator.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const { clearFilters } = require('../../lib/submit-page.lib.js')

/**
 * Handles validation of the requested filters, saving them to the session else re-rendering the page if invalid
 *
 * Users can also opt to clear any filters applied.
 *
 * @param {object} payload - The `request.payload` containing the filter data.
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 * @param {string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} If no errors an empty object signifying the request can be redirected to the index page
 * else the data needed to re-render the page
 */
async function go(payload, yar, auth, page) {
  const filterCleared = clearFilters(payload, yar, 'usersFilter')

  if (filterCleared) {
    return {}
  }

  const error = _validate(payload)

  if (!error) {
    _save(payload, yar)

    return {}
  }

  const savedFilters = _savedFilters(yar)

  return _replayView(payload, error, page, savedFilters, auth)
}

async function _replayView(payload, error, page, savedFilters, auth) {
  const { results: users, total: totalNumber } = await FetchUsersService.go(savedFilters, page)

  const pagination = PaginatorPresenter.go(totalNumber, page, `/system/users`, users.length, 'users')

  const pageData = IndexUsersPresenter.go(users, auth)

  return {
    error,
    filters: { ...savedFilters, ...payload },
    ...pageData,
    pagination
  }
}

function _save(payload, yar) {
  yar.set('usersFilter', {
    email: payload.email ?? null,
    permissions: payload.permissions ?? null,
    status: payload.status ?? null,
    type: payload.type ?? null
  })
}

function _savedFilters(payload) {
  const { clear, get, set, ...usersFilter } = payload

  return {
    email: null,
    openFilter: true,
    permissions: null,
    status: null,
    type: null,
    ...usersFilter
  }
}

function _validate(payload) {
  const validationResult = IndexValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
