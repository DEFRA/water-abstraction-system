'use strict'

/**
 * Creates a new session.
 * @module CreateSessionDal
 */

const SessionModel = require('../models/session.model.js')

/**
 * Creates a new session.
 *
 * NOTE: `data` defaults to `{}` when a new record is created because Objection.js throws a 'The query is empty' error
 * if we pass nothing into `insert()`.
 *
 * @param {object} [data={}] - The data for the new session.
 *
 * @returns {Promise<object>} The ID of the newly created session.
 */
async function go(data = {}) {
  return SessionModel.query().insert({ data }).returning('id')
}

module.exports = {
  go
}
