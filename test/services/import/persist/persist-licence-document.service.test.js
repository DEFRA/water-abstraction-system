'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, afterEach, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const AddressHelper = require('../../../support/helpers/address.helper.js')
const CompanyHelper = require('../../../support/helpers/company.helper.js')
const ContactHelper = require('../../../support/helpers/contact.helper.js')
const LicenceDocumentHelper = require('../../../support/helpers/licence-document.helper.js')
const LicenceDocumentRoleHelper = require('../../../support/helpers/licence-document-role.helper.js')
const LicenceDocumentModel = require('../../../../app/models/licence-document.model.js')
const LicenceRoleHelper = require('../../../support/helpers/licence-role.helper.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')
const { timestampForPostgres } = require('../../../../app/lib/general.lib.js')
const { transaction } = require('objection')

// Thing under test
const PersistLicenceDocumentService = require('../../../../app/services/import/persist/persist-licence-document.service.js')

describe.only('Persist licence document service', () => {
  const transformedLicence = {}

  let address
  let company
  let contact
  let licenceDocument
  let licenceDocumentRole
  let licenceRef
  let licenceRoleId
  let trx
  let updatedAt

  beforeEach(async () => {
    // A company and address is/will be the same external id
    const externalId = CompanyHelper.generateExternalId()

    company = await CompanyHelper.add({
      externalId
    })

    contact = await ContactHelper.add({
      externalId: CompanyHelper.generateExternalId()
    })

    address = await AddressHelper.add({
      externalId
    })

    licenceRoleId = LicenceRoleHelper.select('returnsTo').id

    updatedAt = timestampForPostgres()

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
        licenceRef = generateLicenceRef()

        licenceDocumentRole = _transformedLicenceDocumentRole(
          licenceRef, licenceRoleId, company.externalId, address.externalId, contact.externalId)

        licenceDocument = _transformedLicenceDocument(licenceRef)

        transformedLicence.licenceDocument = { ...licenceDocument, licenceDocumentRoles: [licenceDocumentRole] }
      })

      it('creates a new licence document record', async () => {
        await PersistLicenceDocumentService.go(trx, updatedAt, transformedLicence)

        // Commit the transaction so the data is saved to the database
        await trx.commit()

        const newLicenceDocument = await _fetchPersistedLicenceDocument(licenceDocument.licenceRef)

        // Licence Document
        expect(licenceDocument.licenceRef).to.equal(newLicenceDocument.licenceRef)
        expect(licenceDocument.startDate).to.equal(newLicenceDocument.startDate)
        expect(licenceDocument.endDate).to.equal(newLicenceDocument.endDate)

        // Licence Document Role
        const [newLicenceDocumentRole] = newLicenceDocument.licenceDocumentRoles

        expect(licenceDocumentRole.startDate).to.equal(newLicenceDocumentRole.startDate)
        expect(licenceDocumentRole.endDate).to.equal(newLicenceDocumentRole.endDate)
        expect(licenceRoleId).to.equal(newLicenceDocumentRole.licenceRoleId)
      })
    })

    describe('and that licence document already exists', () => {
      beforeEach(async () => {
        licenceRef = generateLicenceRef()

        licenceDocumentRole = _transformedLicenceDocumentRole(
          licenceRef, licenceRoleId, company.externalId, address.externalId, contact.externalId)

        await _createExistingRecords(
          licenceRef, licenceRoleId, company, address, contact)

        transformedLicence.licenceDocument = {
          ..._transformedLicenceDocument(licenceRef),
          endDate: null,
          licenceDocumentRoles: [{ ...licenceDocumentRole, endDate: new Date('2010-01-01') }]
        }
      })

      it('should update the existing licence document record', async () => {
        // Call the thing under test
        await PersistLicenceDocumentService.go(trx, updatedAt, transformedLicence)

        // Commit the transaction so the data is saved to the database
        await trx.commit()

        // Get the persisted data
        const updatedLicenceDocument = await
        _fetchPersistedLicenceDocument(transformedLicence.licenceDocument.licenceRef)

        // Check the updated licence
        expect(updatedLicenceDocument.licenceRef).to.equal(transformedLicence.licenceDocument.licenceRef)
        expect(updatedLicenceDocument.endDate).to.be.null()

        // Licence Document Role
        const [updatedLicenceDocumentRole] = updatedLicenceDocument.licenceDocumentRoles

        console.log('Licence ref = ', licenceRef)

        console.log('transformedLicence = ', transformedLicence)
        console.log('licenceDocument = ', transformedLicence.licenceDocument)
        console.log('licenceDocumentRoles = ', transformedLicence.licenceDocument.licenceDocumentRoles)

        console.log('updatedLicenceDocumentRole = ', updatedLicenceDocumentRole)

        expect(updatedLicenceDocumentRole.endDate).to.equal(new Date('2010-01-01'))
        expect(updatedLicenceDocumentRole.licenceRoleId).to.equal(licenceRoleId)
      })
    })
  })
})

async function _fetchPersistedLicenceDocument (licenceRef) {
  return LicenceDocumentModel
    .query()
    .where('licenceRef', licenceRef)
    .withGraphFetched('licenceDocumentRoles')
    .select('*')
    .limit(1)
    .first()
}

function _transformedLicenceDocument (licenceRef) {
  return {
    licenceRef,
    startDate: new Date('1992-08-19'),
    endDate: new Date('2001-01-01')
  }
}

function _transformedLicenceDocumentRole (licenceRef, licenceRoleId, companyId, addressId, contactId) {
  return {
    addressId,
    companyId,
    contactId,
    documentId: licenceRef,
    endDate: null,
    licenceRoleId,
    startDate: new Date('1999-01-01')
  }
}

async function _createExistingRecords (licenceRef, licenceRoleId, company, address, contact) {
  const licenceDocument = await LicenceDocumentHelper.add({
    licenceRef,
    endDate: new Date('2001-01-01')
  })

  const licenceDocumentRole = await LicenceDocumentRoleHelper.add({
    licenceDocumentId: licenceDocument.id,
    licenceRoleId,
    companyId: company.id,
    addressId: address.id,
    contactId: contact.id,
    endDate: new Date('1999-01-01')
  })

  return {
    licenceDocument,
    licenceDocumentRole
  }
}
