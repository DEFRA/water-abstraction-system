'use strict'

/**
 * Fetches the abstraction alert recipients data for the `/notices/setup/check` page
 * @module FetchAbstractionAlertRecipientsDal
 */

const GenerateAbstractionAlertAdditionalContactQueryDal = require('./generate-abstraction-alert-additional-contact.dal.js')
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
  const additionalContact = GenerateAbstractionAlertAdditionalContactQueryDal.go(session.licenceRefs)

  const { bindings, query } = GenerateAbstractionAlertRecipientsQueryDal.go(session.licenceRefs, additionalContact)

  const { rows } = await db.raw(query, bindings)

  return rows
}

module.exports = {
  go
}
