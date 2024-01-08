'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper.js')
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const LicenceDocumentHeaderHelper = require('../support/helpers/licence-document-header.helper.js')

// Thing under test
const LicenceDocumentHeaderModel = require('../../app/models/licence-document-header.model.js')

describe('Licence Document Header model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await LicenceDocumentHeaderHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await LicenceDocumentHeaderModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceDocumentHeaderModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      let testLicence

      beforeEach(async () => {
        testLicence = await LicenceHelper.add()

        const { licenceRef } = testLicence
        testRecord = await LicenceDocumentHeaderHelper.add({ licenceRef })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceDocumentHeaderModel.query()
          .innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await LicenceDocumentHeaderModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licence')

        expect(result).to.be.instanceOf(LicenceDocumentHeaderModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })
  })
})
