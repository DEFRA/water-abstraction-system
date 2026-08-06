/**
 * Fetches the abstraction alert recipients data for the `/notices/setup/check` page
 * @module FetchAbstractionAlertRecipientsDal
 */

import { db } from 'water-abstraction-engine/db/db.js'

import { abstractionAlertRecipientsQuery } from './abstraction-alert-recipients-query.dal.js'

/**
 * Fetches the abstraction alert recipients data for the `/notices/setup/check` page
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {Promise<object[]>} The contact data for all licence refs
 */
export default async function fetchAbstractionAlertRecipientsDal(session) {
  const { licenceRefs } = session

  const { rows } = await db.raw(abstractionAlertRecipientsQuery, [licenceRefs, licenceRefs, licenceRefs])

  return rows
}
