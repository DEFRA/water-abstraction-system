'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const LicenceEndDateChangeHelper = require('../support/helpers/licence-end-date-change.helper.js')

// Thing under test
const LicenceEndDateChangeModel = require('../../app/models/licence-end-date-change.model.js')

describe('Licence End Date Change model', () => {
  let testLicence
  let testRecord

  before(async () => {
    // Link licence
    testLicence = await LicenceHelper.add()

    // Test record
    testRecord = await LicenceEndDateChangeHelper.add({ licenceId: testLicence.id })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceEndDateChangeModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceEndDateChangeModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceEndDateChangeModel.query().innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await LicenceEndDateChangeModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).to.be.instanceOf(LicenceEndDateChangeModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })
  })
})
