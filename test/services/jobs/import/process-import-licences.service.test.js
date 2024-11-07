'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const ProcessImportLicence = require('../../../../app/services/jobs/import/process-import-licence.service.js')

// Thing under test
const ProcessImportLicences = require('../../../../app/services/jobs/import/process-import-licences.service.js')

describe('Process Import Licences Service', () => {
  const batchSize = 10

  let licences
  let notifierStub
  let stubProcessImportLicence

  beforeEach(async () => {
    licences = _licences()

    stubProcessImportLicence = Sinon.stub(ProcessImportLicence, 'go').resolves()

    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when iterating the licences', () => {
    it('should call the process licence service with the first element in the array', async () => {
      await ProcessImportLicences.go(licences)

      const firstLicence = licences[0]

      expect(stubProcessImportLicence.getCall(0).calledWithExactly(firstLicence)).to.be.true()
    })

    it('should call the process licence service with the last element in the array', async () => {
      await ProcessImportLicences.go(licences)

      const lastLicence = licences[licences.length - 1]

      expect(stubProcessImportLicence.getCall(licences.length - 1).calledWithExactly(lastLicence)).to.be.true()
    })

    it('should process all the licence refs', async () => {
      await ProcessImportLicences.go(licences)

      expect(stubProcessImportLicence.callCount).to.equal(licences.length)
    })

    it('should process the expected number of batches', async () => {
      await ProcessImportLicences.go(licences)

      // Check the expected number of batches (100 items / 10 per batch = 10 batches)
      const expectedBatches = Math.ceil(licences.length / batchSize)

      expect(stubProcessImportLicence.getCalls().length / batchSize).to.equal(expectedBatches)
    })
  })
})

function _licences () {
  const licences = []

  for (let i = 0; i < 100; i++) {
    licences.push({ id: generateUUID(), expired_date: null, lapsed_date: null, revoked_date: null })
  }

  return licences
}
