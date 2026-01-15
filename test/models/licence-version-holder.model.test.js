'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceVersionHolderHelper = require('../support/helpers/licence-version-holder.helper.js')
const LicenceVersionHelper = require('../support/helpers/licence-version.helper.js')
const LicenceVersionModel = require('../../app/models/licence-version.model.js')

// Thing under test
const LicenceVersionHolderModel = require('../../app/models/licence-version-holder.model.js')

describe('Licence Version Holder model', () => {
  let testRecord
  let testLicenceVersion

  beforeEach(async () => {
    testLicenceVersion = await LicenceVersionHelper.add()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await LicenceVersionHolderHelper.add({ licenceVersionId: testLicenceVersion.id })
    })

    it('can successfully run a basic query', async () => {
      const result = await LicenceVersionHolderModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceVersionHolderModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    beforeEach(async () => {
      testRecord = await LicenceVersionHolderHelper.add({ licenceVersionId: testLicenceVersion.id })
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
    beforeEach(async () => {
      testRecord = await LicenceVersionHolderHelper.add({
        licenceVersionId: testLicenceVersion.id,
        holderType: 'organisation',
        salutation: null,
        initials: null,
        forename: null,
        name: 'ORDER OF THE PHOENIX',
        addressLine1: '12 GRIMMAULD PLACE',
        addressLine2: 'ISLINGTON',
        addressLine3: null,
        addressLine4: null,
        town: 'LONDON',
        county: 'GREATER LONDON',
        country: 'UNITED KINGDOM',
        postcode: 'N1 9LX'
      })
    })

    it('returns the address as an array, and does not include the "contactName"', () => {
      const result = testRecord.$address()

      expect(result).to.equal(['12 GRIMMAULD PLACE', 'ISLINGTON', 'LONDON', 'GREATER LONDON', 'N1 9LX'])
    })
  })

  describe('$name', () => {
    beforeEach(async () => {
      testRecord = await LicenceVersionHolderHelper.add({
        licenceVersionId: testLicenceVersion.id,
        holderType: 'organisation',
        salutation: null,
        initials: null,
        forename: null,
        name: 'ORDER OF THE PHOENIX',
        addressLine1: '12 GRIMMAULD PLACE',
        addressLine2: 'ISLINGTON',
        addressLine3: null,
        addressLine4: null,
        town: 'LONDON',
        county: 'GREATER LONDON',
        country: 'UNITED KINGDOM',
        postcode: 'N1 9LX'
      })
    })

    it('returns the licence version holders name', () => {
      const result = testRecord.$name()

      expect(result).to.equal('ORDER OF THE PHOENIX')
    })
  })
})
