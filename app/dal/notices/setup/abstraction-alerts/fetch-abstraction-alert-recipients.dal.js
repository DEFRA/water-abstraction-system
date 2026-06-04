'use strict'

/**
 * Fetches the abstraction alert recipients data for the `/notices/setup/check` page
 * @module FetchAbstractionAlertRecipientsDal
 */

const GenerateAbstractionAlertRecipientsQueryDal = require('./generate-abstraction-alert-recipients-query.dal.js')
const { db } = require('../../../../../db/db.js')

/**
 * Fetches the abstraction alert recipients data for the `/notices/setup/check` page
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {Promise<object[]>} The contact data for all licence refs
 */
async function go(session) {
  const { bindings, query } = GenerateAbstractionAlertRecipientsQueryDal.go(session.licenceRefs)

  const { rows } = await db.raw(query, bindings)

  return rows
}

module.exports = {
  go
}
