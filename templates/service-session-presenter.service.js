'use strict'

/**
 * @module __MODULE_NAME__
 */

const __PRESENTER_NAME__ = require('__PRESENTER_PATH__')
const SessionModel = require('__SESSION_MODEL_PATH__')

/**
 * @param {string} sessionId
 *
 * @returns {object} - The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const pageData = __PRESENTER_NAME__.go(session)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
