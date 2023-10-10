'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')
const LicenceModel = require('../../../app/models/water/licence.model.js')
const LicenceVersionHelper = require('../../support/helpers/water/licence-version.helper.js')

// Thing under test
const LicenceVersionModel = require('../../../app/models/water/licence-version.model.js')

describe('Licence Version model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await LicenceVersionHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceVersionModel.query().findById(testRecord.licenceVersionId)

      expect(result).to.be.an.instanceOf(LicenceVersionModel)
      expect(result.licenceVersionId).to.equal(testRecord.licenceVersionId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      let testLicence

      beforeEach(async () => {
        testLicence = await LicenceHelper.add()

        const { licenceId } = testLicence
        testRecord = await LicenceVersionHelper.add({ licenceId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceVersionModel.query()
          .innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await LicenceVersionModel.query()
          .findById(testRecord.licenceVersionId)
          .withGraphFetched('licence')

        expect(result).to.be.instanceOf(LicenceVersionModel)
        expect(result.licenceVersionId).to.equal(testRecord.licenceVersionId)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })
  })
})
