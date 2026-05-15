'use strict'

/**
 * Fetches licences linked to a user for for the external unlink licence journey
 * @module UnregisterLicencesDal
 */

const EventModel = require('../../../../models/event.model.js')
const LicenceDocumentHeader = require('../../../../models/licence-document-header.model.js')

async function go(licences) {
  await EventModel.transaction(async (trx) => {
    await EventModel.query(trx).insert({
      metadata: {
        licences
      },
      type: 'unlink-licence'
    })
  })
}

module.exports = {
  go
}
