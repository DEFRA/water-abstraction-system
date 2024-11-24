'use strict'

/**
 * TODO: Document
 * @module ReturnLogservice
 */

const LegacyRequest = require('../../requests/legacy.request.js')

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

  return body
}

module.exports = {
  go
}
