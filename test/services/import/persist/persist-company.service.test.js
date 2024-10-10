'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, afterEach, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const AddressHelper = require('../../../support/helpers/address.helper.js')
const AddressModel = require('../../../../app/models/address.model.js')
const CompanyAddressHelper = require('../../../support/helpers/company-address.helper.js')
const CompanyContactHelper = require('../../../support/helpers/company-contact.helper.js')
const CompanyHelper = require('../../../support/helpers/company.helper.js')
const CompanyModel = require('../../../../app/models/company.model.js')
const ContactHelper = require('../../../support/helpers/contact.helper.js')
const ContactModel = require('../../../../app/models/contact.model.js')
const LicenceModel = require('../../../../app/models/licence.model.js')
const LicenceRoleHelper = require('../../../support/helpers/licence-role.helper.js')
const { timestampForPostgres } = require('../../../../app/lib/general.lib.js')
const { transaction } = require('objection')

// Thing under test
const PersistCompanyService = require('../../../../app/services/import/persist/persist-company.service.js')

describe('Persist company service', () => {
  const companyContactStartDate = new Date('1999-01-01')

  let addressExternalId
  let licenceHolderRoleId
  let transformedCompany
  let trx
  let updatedAt

  beforeEach(async () => {
    addressExternalId = AddressHelper.generateExternalId()
    licenceHolderRoleId = LicenceRoleHelper.select().id

    transformedCompany = _transformedCompany(licenceHolderRoleId, addressExternalId)

    updatedAt = timestampForPostgres()

    trx = await transaction.start(LicenceModel.knex())
  })

  afterEach(async () => {
    if (!trx.isCompleted()) {
      await trx.rollback()
    }
  })

  describe('when given a valid transformed licence', () => {
    describe('and that licence does not already exist', () => {
      let transformedCompanies

      beforeEach(() => {
        transformedCompanies = [{ ...transformedCompany }]
      })

      it('creates a new licence record plus child records in WRLS and returns the licence ID', async () => {
        await PersistCompanyService.go(trx, updatedAt, transformedCompanies)

        // Commit the transaction so the data is saved to the database
        await trx.commit()

        // Get the persisted data
        const company = await _fetchPersistedCompany(transformedCompany.externalId)
        const contact = await _fetchPersistedContact(transformedCompany.externalId)
        const address = await _fetchPersistedAddress(transformedCompany.addresses[0].externalId)

        //   Address
        expect(address.address1).to.equal('4 Privet Drive')
        expect(address.address2).to.be.null()
        expect(address.address5).to.equal('Little Whinging')
        expect(address.address6).to.equal('Surrey')
        expect(address.country).to.equal('United Kingdom')
        expect(address.dataSource).to.equal('nald')
        expect(address.externalId).to.equal(addressExternalId)
        expect(address.postcode).to.equal('HP11')
        expect(address.uprn).to.be.null()

        // Contact
        expect(contact.salutation).to.equal('Mr')
        expect(contact.initials).to.equal('H')
        expect(contact.firstName).to.equal('James')
        expect(contact.lastName).to.equal('Bond')
        expect(contact.dataSource).to.equal('nald')

        // Company
        expect(company.name).to.equal('ACME')
        expect(company.type).to.equal('person')
        expect(company.externalId).to.equal(transformedCompany.externalId)

        // Company Contact
        const companyContact = contact.companyContacts[0]

        expect(companyContact.companyId).to.equal(company.id)
        expect(companyContact.contactId).to.equal(contact.id)
        expect(companyContact.licenceRoleId).to.equal(licenceHolderRoleId)
        expect(companyContact.startDate).to.equal(transformedCompany.companyContact.startDate)
        expect(companyContact.default).to.be.true()

        // Company Addresses
        const companyAddress = address.companyAddresses[0]

        expect(companyAddress.addressId).to.equal(address.id)
        expect(companyAddress.companyId).to.equal(company.id)
        expect(companyAddress.licenceRoleId).to.equal(licenceHolderRoleId)
        expect(companyAddress.default).to.be.true()
        expect(companyAddress.startDate).to.equal(new Date('2020-01-01'))
        expect(companyAddress.endDate).to.equal(new Date('2022-02-02'))
      })
    })

    describe('and that licence already exists', () => {
      let exisitngContact
      let existingCompany
      let transformedCompanies

      beforeEach(async () => {
        const existing = await _createExistingRecords(transformedCompany, licenceHolderRoleId, companyContactStartDate)

        existingCompany = existing.company
        exisitngContact = existing.contact

        transformedCompanies = [{
          ...existingCompany,
          contact: exisitngContact,
          companyContact: {
            externalId: existingCompany.externalId,
            startDate: companyContactStartDate,
            licenceRoleId: licenceHolderRoleId
          },
          addresses: [{
            address1: 'ENVIRONMENT AGENCY',
            externalId: addressExternalId,
            dataSource: 'nald'
          }],
          companyAddresses: [
            {
              addressId: addressExternalId,
              companyId: existingCompany.externalId,
              startDate: new Date('2020-03-03'),
              endDate: new Date('2022-02-02'),
              licenceRoleId: licenceHolderRoleId
            }
          ]
        }]
      })

      it('should return the updated company', async () => {
        // Call the thing under test
        await PersistCompanyService.go(trx, updatedAt, transformedCompanies)

        // Commit the transaction so the data is saved to the database
        await trx.commit()

        // Get the persisted data
        const company = await _fetchPersistedCompany(existingCompany.externalId)
        const contact = await _fetchPersistedContact(exisitngContact.externalId)
        const address = await _fetchPersistedAddress(transformedCompany.addresses[0].externalId)

        // Address
        expect(address.address1).to.equal('ENVIRONMENT AGENCY')
        expect(address.dataSource).to.equal('nald')
        expect(address.externalId).to.equal(addressExternalId)

        // Company
        expect(company.name).to.equal('Example Trading Ltd')
        expect(company.type).to.equal('organisation')
        expect(company.externalId).to.equal(existingCompany.externalId)

        // Company Contacts
        const companyContact = contact.companyContacts[0]

        expect(companyContact.companyId).to.equal(existingCompany.id)
        expect(companyContact.contactId).to.equal(exisitngContact.id)
        expect(companyContact.licenceRoleId).to.equal(licenceHolderRoleId)
        expect(companyContact.startDate).to.equal(new Date('1999-01-01'))
        expect(companyContact.default).to.be.true()

        // Company Address
        const companyAddress = address.companyAddresses[0]

        expect(companyAddress.addressId).to.equal(address.id)
        expect(companyAddress.companyId).to.equal(company.id)
        expect(companyAddress.licenceRoleId).to.equal(licenceHolderRoleId)
        expect(companyAddress.endDate).to.equal(new Date('2022-02-02'))

        // Contact
        expect(contact.salutation).to.be.null()
        expect(contact.initials).to.be.null()
        expect(contact.firstName).to.equal('Amara')
        expect(contact.lastName).to.equal('Gupta')
        expect(contact.dataSource).to.equal('wrls')
      })
    })
  })
})

async function _fetchPersistedAddress (externalId) {
  return AddressModel.query().where('externalId', externalId).limit(1).first().withGraphFetched('companyAddresses')
}

async function _fetchPersistedCompany (externalId) {
  return CompanyModel
    .query()
    .where('externalId', externalId)
    .withGraphFetched('companyContacts')
    .limit(1)
    .first()
}

async function _fetchPersistedContact (externalId) {
  return ContactModel
    .query()
    .where('externalId', externalId)
    .withGraphFetched('companyContacts')
    .limit(1)
    .first()
}

function _transformedCompany (licenceHolderRoleId, addressExternalId) {
  const externalId = CompanyHelper.generateExternalId()

  return {
    externalId,
    name: 'ACME',
    type: 'person',
    contact: {
      salutation: 'Mr',
      initials: 'H',
      firstName: 'James',
      lastName: 'Bond',
      externalId,
      dataSource: 'nald'
    },
    companyContact: {
      externalId,
      startDate: new Date('1999-01-01'),
      licenceRoleId: licenceHolderRoleId
    },
    addresses: [
      {
        address1: '4 Privet Drive',
        address2: null,
        address3: null,
        address4: null,
        address5: 'Little Whinging',
        address6: 'Surrey',
        country: 'United Kingdom',
        externalId: addressExternalId,
        postcode: 'HP11',
        dataSource: 'nald'
      }
    ],
    companyAddresses: [
      {
        addressId: addressExternalId,
        companyId: externalId,
        startDate: new Date('2020-01-01'),
        endDate: new Date('2022-02-02'),
        licenceRoleId: licenceHolderRoleId
      }
    ]
  }
}

async function _createExistingRecords (transformedCompany, licenceHolderRoleId, companyContactStartDate) {
  const address = await AddressHelper.add({
    ...transformedCompany.addresses[0]
  })

  const contact = await ContactHelper.add({
    externalId: transformedCompany.externalId
  })

  const company = await CompanyHelper.add({
    externalId: transformedCompany.externalId
  })

  await CompanyContactHelper.add({
    companyId: company.id,
    contactId: contact.id,
    licenceRoleId: licenceHolderRoleId,
    startDate: companyContactStartDate
  })

  await CompanyAddressHelper.add({
    addressId: address.id,
    companyId: company.id,
    licenceRoleId: licenceHolderRoleId,
    endDate: new Date('1999-01-01')
  })

  return {
    contact,
    company
  }
}
