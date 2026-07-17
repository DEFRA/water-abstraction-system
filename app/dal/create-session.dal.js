/**
 * Creates a new session
 * @module CreateSessionDal
 */

import SessionModel from '../models/session.model.js'

/**
 * Creates a new session
 *
 * We default `data` to `{}` when a new record is created because Objection.js throws a 'The query is empty' error if
 * we pass nothing into `insert()`.
 *
 * @param {object} [data={}] - The data for the new session.
 *
 * @returns {Promise<module:SessionModel>} The newly created session.
 */
export default async function createSessionDal(data = {}) {
  return SessionModel.query().insert({ data }).returning('id')
}
