'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Things to stub
const FetchLicenceDocumentService = require('../../../../app/services/import/legacy/fetch-licence-document.service.js')

// Thing under test
const TransformLicenceDocumentService =
  require('../../../../app/services/import/legacy/transform-licence-document.service.js')

describe('Import Legacy Transform Licence Document service', () => {
  // NOTE: Clearly this is an incomplete representation of the licence returned from TransformedLicenceService. But for
  // the purposes of this service it is all that is needed
  const transformedLicence = { licenceVersions: [] }

  const naldLicenceId = '2113'
  const regionCode = '6'

  let legacyLicenceDocument
  let licenceRef

  beforeEach(() => {
    licenceRef = generateLicenceRef()

    legacyLicenceDocument = _legacyLicenceDocument(licenceRef)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a matching valid legacy licence is found', () => {
    beforeEach(() => {
      Sinon.stub(FetchLicenceDocumentService, 'go').resolves(legacyLicenceDocument)
    })

    it('attaches the record transformed and validated for WRLS to the transformed licence', async () => {
      await TransformLicenceDocumentService.go(regionCode, naldLicenceId, transformedLicence)

      expect(transformedLicence.licenceDocument).to.equal({
        licenceRef,
        endDate: null,
        startDate: new Date('1999-01-01')
      })
    })
  })

  describe('when no matching legacy licence is found', () => {
    beforeEach(() => {
      Sinon.stub(FetchLicenceDocumentService, 'go').resolves(null)
    })

    it('throws an error', async () => {
      await expect(TransformLicenceDocumentService.go(regionCode, naldLicenceId, transformedLicence)).to.reject()
    })
  })
})

function _legacyLicenceDocument (licenceRef) {
  return {
    end_date: null,
    start_date: new Date('1999-01-01'),
    licence_ref: licenceRef
  }
}
