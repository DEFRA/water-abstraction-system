'use strict'

/**
 * Fetches the abstraction alert recipients data for the `/notices/setup/check` page
 * @module FetchAbstractionAlertRecipientsDal
 */

const { abstractionAlertRecipientsQuery } = require('./abstraction-alert-recipients-query.dal.js')
const { db } = require('../../../../../db/db.js')

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

module.exports = {
  go
}
