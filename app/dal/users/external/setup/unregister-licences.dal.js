'use strict'

/**
 * Unregisters licences, making them available to be re-registered
 * @module UnregisterLicencesDal
 */

const LicenceDocumentHeaderModel = require('../../../../models/licence-document-header.model.js')
const LicenceUnregistrationModel = require('../../../../models/licence-unregistration.model.js')
const { timestampForPostgres } = require('../../../../lib/general.lib.js')

/**
 * Unregisters licences, making them available to be re-registered
 *
 * When an external user adds an account, the legacy service creates both a `UserModel` record and a `LicenceEntity`
 * record, and the two are linked by the `LicenceEntity` record's Id.
 *
 * When a licence is registered to a user for the first time, the licence holder name is copied as a `LicenceEntity`
 * record in the CRM schema.
 *
 * It will also create a `LicenceEntityRole` record that links the user's `LicenceEntity` record to the company
 * `LicenceEntity` record. The role will be set as 'primary_user'.
 *
 * This is how we get from a licence to its primary user, and vice versa.
 *
 * When the legacy service 'unlink' a licence, it was removing the licence from the user. Instead, it was setting to
 * NULL the `companyEntityId` field of the `LicenceDocumentHeader` record.
 *
 * So, the `LicenceEntityRole` record, and the `LicenceEntity` records remain, but they are no longer linked to the
 * licence.
 *
 * When you understand this, what the legacy service was doing was _unregistering_ the licence, i.e. making it available
 * to be re-registered, rather than deleting the link between the user and the licence.
 *
 * It also created an `Event` record to record who unregistered the licence, and when. The recording of this event has
 * now been superseded by the creation of a record in the new `licenceUnregistration` table.
 *
 * For now, this service replicates what the legacy service was doing with the exception of the recording of the Event.
 *
 * @param {module:SessionModel} session - The session instance
 * @param {module:UserModel} user - The user that is deregistering the licences
 */
async function go(session, user) {
  const { username } = user

  const timestamp = timestampForPostgres()
  const licences = _licencesToUnlink(session)

  await LicenceDocumentHeaderModel.transaction(async (trx) => {
    for (const licence of licences) {
      const { id: licenceId, licenceDocumentHeaderId } = licence

      await _unregisterLicence(licenceDocumentHeaderId, timestamp, trx)
      await _createLicenceUnregistrationRecord(licenceId, username, timestamp, trx)
    }
  })
}

async function _createLicenceUnregistrationRecord(licenceId, username, timestamp, trx) {
  await LicenceUnregistrationModel.query(trx).insert({
    createdAt: timestamp,
    createdBy: username,
    licenceId
  })
}

function _licencesToUnlink(session) {
  const { allLicences, licences, selectedLicences } = session

  if (allLicences) {
    return licences
  }

  return licences.filter((licence) => {
    return selectedLicences.includes(licence.id)
  })
}

async function _unregisterLicence(licenceDocumentHeaderId, timestamp, trx) {
  await LicenceDocumentHeaderModel.query(trx)
    .findById(licenceDocumentHeaderId)
    .patch({ companyEntityId: null, updatedAt: timestamp })
}

module.exports = {
  go
}
