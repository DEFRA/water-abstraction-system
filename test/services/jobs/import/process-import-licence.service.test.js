'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const ProcessLicenceService = require('../../../../app/services/import/legacy/process-licence.service.js')

// Thing under test
const ProcessImportLicence = require('../../../../app/services/jobs/import/process-import-licence.service.js')

describe('Process Import Licence Service', () => {
  let licenceRefs
  let stubProcessLicenceService

  beforeEach(async () => {
    licenceRefs = ['12/34/56']

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
    it('should call the process licence service', async () => {
      await ProcessImportLicence.go(licenceRefs)

      expect(stubProcessLicenceService.calledWith((licenceRefs[0]))).to.be.true()
    })

    it('should call the process licence service as many times the length of the licence refs array', async () => {
      await ProcessImportLicence.go(licenceRefs)

      expect(stubProcessLicenceService.callCount).to.equal(1)
    })
  })
})
