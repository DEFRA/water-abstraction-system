'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, afterEach, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceDocumentHelper = require('../../../support/helpers/licence-document.helper.js')
const LicenceDocumentModel = require('../../../../app/models/licence-document.model.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')
const { timestampForPostgres } = require('../../../../app/lib/general.lib.js')
const { transaction } = require('objection')

// Thing under test
const PersistLicenceDocumentService = require('../../../../app/services/import/persist/persist-licence-document.service.js')

describe('Persist licence document service', () => {
  const transformedLicence = {}

  let licenceDocument
  let licenceRef
  let trx
  let updatedAt

  beforeEach(async () => {
    updatedAt = timestampForPostgres()

    licenceRef = generateLicenceRef()

    trx = await transaction.start(LicenceDocumentModel.knex())
  })

  afterEach(async () => {
    if (!trx.isCompleted()) {
      await trx.rollback()
    }
  })

  describe('when given a valid transformed licence document', () => {
    describe('and that licence does not already exist', () => {
      beforeEach(() => {
        licenceDocument = _transformedLicenceDocument(licenceRef)

        transformedLicence.licenceDocument = licenceDocument
      })

      it('creates a new licence record plus child records in WRLS and returns the licence ID', async () => {
        await PersistLicenceDocumentService.go(trx, updatedAt, transformedLicence)

        // Commit the transaction so the data is saved to the database
        await trx.commit()

        const newLicenceDocument = await _fetchPersistedLicenceDocument(licenceDocument.licenceRef)

        expect(licenceDocument.licenceRef).to.equal(newLicenceDocument.licenceRef)
        expect(licenceDocument.startDate).to.equal(newLicenceDocument.startDate)
        expect(licenceDocument.endDate).to.equal(newLicenceDocument.endDate)
      })
    })

    describe('and that licence document already exists', () => {
      const existingLicence = {}

      beforeEach(async () => {
        const existing = await _createExistingRecords(licenceRef)

        existingLicence.licenceDocument = existing.licenceDocument

        transformedLicence.licenceDocument = _transformedLicenceDocument(licenceRef)
      })

      it('should return the updated licence', async () => {
        // Call the thing under test
        await PersistLicenceDocumentService.go(trx, updatedAt, transformedLicence)

        // Commit the transaction so the data is saved to the database
        await trx.commit()

        // Get the persisted data
        const updatedLicenceDocument = await _fetchPersistedLicenceDocument(licenceDocument.licenceRef)

        // Check the updated licence
        expect(updatedLicenceDocument.licenceRef).to.equal(licenceDocument.licenceRef)
        expect(updatedLicenceDocument.deletedAt).to.be.null()
      })
    })
  })
})

async function _fetchPersistedLicenceDocument (licenceRef) {
  return LicenceDocumentModel
    .query()
    .where('licenceRef', licenceRef)
    .select('*')
    .limit(1)
    .first()
}

function _transformedLicenceDocument (licenceRef) {
  return {
    deletedAt: null,
    licenceRef,
    startDate: new Date('1992-08-19'),
    endDate: new Date('2001-01-01')
  }
}

async function _createExistingRecords (licenceRef) {
  const licenceDocument = await LicenceDocumentHelper.add({
    licenceRef,
    deletedAt: new Date('2001-01-01')
  })

  return {
    licenceDocument
  }
}
