/**
 * Fetches the abstraction alert recipients data for the `/notices/setup/check` page
 * @module FetchAbstractionAlertRecipientsDal
 */

import { abstractionAlertRecipientsQuery } from './abstraction-alert-recipients-query.dal.js'
import { db } from '../../../../../db/db.js'

/**
 * Fetches the abstraction alert recipients data for the `/notices/setup/check` page
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {Promise<object[]>} The contact data for all licence refs
 */
async function go(session) {
  const { licenceRefs } = session

  const { rows } = await db.raw(abstractionAlertRecipientsQuery, [licenceRefs, licenceRefs, licenceRefs])

  return rows
}

export {
  go
}
export default {
  go
}
