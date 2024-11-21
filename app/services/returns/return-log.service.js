'use strict'

/**
 * TODO: Document
 * @module ReturnLogservice
 */

const LegacyRequest = require('../../requests/legacy.request.js')

/**
 *
 * @param request
 * @param returnId
 */
async function go (request, returnId) {
  const { id: userId } = request.auth.credentials.user

  const result = await LegacyRequest.get('water', 'returns?returnId=' + returnId, userId)

  const { body } = result.response

  return body
}

module.exports = {
  go
}
