'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const LicenceDocumentHeaderHelper = require('../support/helpers/licence-document-header.helper.js')

// Thing under test
const LicenceDocumentHeaderModel = require('../../app/models/licence-document-header.model.js')

describe('Licence Document Header model', () => {
  let testLicence
  let testRecord

  before(async () => {
    testLicence = await LicenceHelper.add()

    testRecord = await LicenceDocumentHeaderHelper.add({
      licenceRef: testLicence.licenceRef
    })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceDocumentHeaderModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceDocumentHeaderModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
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
