'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Things we need to stub
const ProcessLicenceService = require('../../../../app/services/import/legacy/process-licence.service.js')

// Thing under test
const ProcessImportLicence = require('../../../../app/services/jobs/import/process-import-licence.service.js')

describe('Process Import Licence Service', () => {
  const batchSize = 10

  let licenceRefs
  let stubProcessLicenceService

  beforeEach(async () => {
    licenceRefs = _licenceRefs()

    stubProcessLicenceService = Sinon.stub(ProcessLicenceService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('returns complete', async () => {
    const result = await ProcessImportLicence.go(licenceRefs)

    expect(result).to.equal(true)
  })

  describe('when iterating the licence refs', () => {
    it('should call the process licence service with the first element in the array', async () => {
      await ProcessImportLicence.go(licenceRefs)

      const firstLicenceRef = licenceRefs[0]

      expect(stubProcessLicenceService.calledWith((firstLicenceRef))).to.be.true()
    })

    it('should call the process licence service with the last element in the array', async () => {
      await ProcessImportLicence.go(licenceRefs)

      const lastLicenceRef = licenceRefs[licenceRefs.length - 1]

      expect(stubProcessLicenceService.calledWith((lastLicenceRef))).to.be.true()
    })

    it('should call the process licence service as many times the length of the licence refs array', async () => {
      await ProcessImportLicence.go(licenceRefs)

      expect(stubProcessLicenceService.callCount).to.equal(100)
    })

    it('should process the expected number of batches', async () => {
      await ProcessImportLicence.go(licenceRefs)

      // Check the expected number of batches (100 items / 10 per batch = 10 batches)
      const expectedBatches = Math.ceil(licenceRefs.length / batchSize)

      expect(stubProcessLicenceService.callCount).to.equal(licenceRefs.length)
      expect(stubProcessLicenceService.getCalls().length / batchSize).to.equal(expectedBatches)
    })
  })
})

function _licenceRefs () {
  const licenceRefs = []

  for (let i = 0; i < 100; i++) {
    licenceRefs.push(generateLicenceRef())
  }

  return licenceRefs
}
