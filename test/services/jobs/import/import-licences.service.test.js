'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchLicences = require('../../../../app/services/jobs/import/fetch-licences.service.js')
const ProcessImportLicence = require('../../../../app/services/jobs/import/process-import-licence.service.js')
const config = require('../../../../config/jobs.config.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const ImportLicenceService = require('../../../../app/services/jobs/import/import-licences.service.js')

describe('Import Licence Service', () => {
  const batchSize = 10

  let stubFetchLicences
  let stubProcessImportLicence
  let notifierStub
  let licences

  beforeEach(async () => {
    config.importLicence.batchSize = batchSize

    licences = _licences()

    stubFetchLicences = Sinon.stub(FetchLicences, 'go').resolves(licences)

    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when processing the import licences', () => {
    beforeEach(() => {
      stubProcessImportLicence = Sinon.stub(ProcessImportLicence, 'go').resolves()
    })

    it('fetches the nald licence data', async () => {
      await ImportLicenceService.go()

      expect(stubFetchLicences.calledOnce).to.be.true()
    })

    it('logs to highlight the amount of licences being imported', async () => {
      await ImportLicenceService.go()

      const args = notifierStub.omg.firstCall.args

      expect(args[0]).to.equal('Importing 100 licences from NALD')
      expect(args[1].timeTakenMs).to.exist()
    })

    describe('when batching the licences to process', () => {
      it('should call the process licence service with the first licence', async () => {
        await ImportLicenceService.go()

        const firstLicence = licences[0]

        expect(stubProcessImportLicence.getCall(0).calledWithExactly(firstLicence)).to.be.true()
      })

      it('should call the process licence service with the last licence', async () => {
        await ImportLicenceService.go()

        const lastLicence = licences[licences.length - 1]

        expect(stubProcessImportLicence.getCall(licences.length - 1).calledWithExactly(lastLicence)).to.be.true()
      })

      it('should process all the fetched licences', async () => {
        await ImportLicenceService.go()

        expect(stubProcessImportLicence.callCount).to.equal(licences.length)
      })

      it('should process the expected number of batches', async () => {
        await ImportLicenceService.go()

        // Check the expected number of batches (100 items / 10 per batch = 10 batches)
        const expectedBatches = Math.ceil(licences.length / batchSize)

        expect(stubProcessImportLicence.getCalls().length / batchSize).to.equal(expectedBatches)
      })
    })
  })

  describe('when handling the batch size', { timeout: 15000 }, () => {
    const delayInSeconds = 1

    beforeEach(() => {
      stubProcessImportLicence = Sinon.stub(ProcessImportLicence, 'go').callsFake(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve()
          }, delayInSeconds * 1000)
        })
      })
    })

    it('should handle the batch as efficiently as possible', async () => {
      await ImportLicenceService.go()

      const args = notifierStub.omg.firstCall.args

      expect(args[1].timeTakenSs).to.equal(10n)
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
