'use strict'

/**
 * TODO: Document
 * @module ReturnLogService
 */

const LegacyRequest = require('../../requests/legacy.request.js')
const ReturnLogPresenter = require('../../presenters/return-logs/view.presenter.js')

/**
 * TBC
 *
 * @param {object} request - TBC
 * @param {string} returnId - TBC
 *
 * @returns {object} TBC
 */
async function go(request, returnId) {
  const { id: userId } = request.auth.credentials.user

  const result = await LegacyRequest.get('water', 'returns?returnId=' + returnId, userId)

  const { body } = result.response

  const pageData = ReturnLogPresenter.go(body)

  // TODO: Check licence in CRM to ensure user has access

  return pageData
}

module.exports = {
  go
}
