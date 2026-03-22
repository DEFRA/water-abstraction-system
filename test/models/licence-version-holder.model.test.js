'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AddressHelper = require('../support/helpers/address.helper.js')
const AddressModel = require('../../app/models/address.model.js')
const CompanyHelper = require('../support/helpers/company.helper.js')
const CompanyModel = require('../../app/models/company.model.js')
const LicenceVersionHolderHelper = require('../support/helpers/licence-version-holder.helper.js')
const LicenceVersionHelper = require('../support/helpers/licence-version.helper.js')
const LicenceVersionModel = require('../../app/models/licence-version.model.js')

// Thing under test
const LicenceVersionHolderModel = require('../../app/models/licence-version-holder.model.js')

describe('Licence Version Holder model', () => {
  let testAddress
  let testCompany
  let testRecord
  let testLicenceVersion

  before(async () => {
    testAddress = await AddressHelper.add()
    testCompany = await CompanyHelper.add()
    testLicenceVersion = await LicenceVersionHelper.add()
    testAddress = await AddressHelper.add()

    testRecord = await LicenceVersionHolderHelper.add({
      addressId: testAddress.id,
      addressLine1: '12 GRIMMAULD PLACE',
      addressLine2: 'ISLINGTON',
      addressLine3: null,
      addressLine4: null,
      companyId: testCompany.id,
      country: 'UNITED KINGDOM',
      county: 'GREATER LONDON',
      derivedName: 'ORDER OF THE PHOENIX',
      forename: null,
      holderType: 'organisation',
      initials: null,
      licenceVersionId: testLicenceVersion.id,
      postcode: 'N1 9LX',
      name: 'ORDER OF THE PHOENIX',
      salutation: null,
      town: 'LONDON'
    })
  })

  after(async () => {
    await testAddress.$query().delete()
    await testCompany.$query().delete()
    await testLicenceVersion.$query().delete()
    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceVersionHolderModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceVersionHolderModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to address', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionHolderModel.query().innerJoinRelated('address')

        expect(query).to.exist()
      })

      it('can eager load the address', async () => {
        const result = await LicenceVersionHolderModel.query().findById(testRecord.id).withGraphFetched('address')

        expect(result).to.be.instanceOf(LicenceVersionHolderModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.address).to.be.an.instanceOf(AddressModel)
        expect(result.address).to.equal(testAddress)
      })
    })

    describe('when linking to company', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionHolderModel.query().innerJoinRelated('company')

        expect(query).to.exist()
      })

      it('can eager load the company', async () => {
        const result = await LicenceVersionHolderModel.query().findById(testRecord.id).withGraphFetched('company')

        expect(result).to.be.instanceOf(LicenceVersionHolderModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.company).to.be.an.instanceOf(CompanyModel)
        expect(result.company).to.equal(testCompany)
      })
    })

    describe('when linking to licence version', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionHolderModel.query().innerJoinRelated('licenceVersion')

        expect(query).to.exist()
      })

      it('can eager load the licence version', async () => {
        const result = await LicenceVersionHolderModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersion')

        expect(result).to.be.instanceOf(LicenceVersionHolderModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceVersion).to.be.an.instanceOf(LicenceVersionModel)
        expect(result.licenceVersion).to.equal(testLicenceVersion)
      })
    })
  })

  describe('$address', () => {
    it('returns the address as an array, and does not include the "contactName"', () => {
      const result = testRecord.$address()

      expect(result).to.equal(['12 GRIMMAULD PLACE', 'ISLINGTON', 'LONDON', 'GREATER LONDON', 'N1 9LX'])
    })
  })
})
