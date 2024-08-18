'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const ModLogHelper = require('../support/helpers/mod-log.helper.js')

// Thing under test
const ModLogModel = require('../../app/models/mod-log.model.js')

describe('Mod Log model', () => {
  let testLicence
  let testRecord

  before(async () => {
    testLicence = await LicenceHelper.add()

    testRecord = await ModLogHelper.add({
      licenceRef: testLicence.licenceRef,
      licenceId: testLicence.id
    })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ModLogModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ModLogModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await ModLogModel.query()
          .innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await ModLogModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licence')

        expect(result).to.be.instanceOf(ModLogModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })
  })
})
