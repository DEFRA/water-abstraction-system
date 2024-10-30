'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const DetermineSupplementaryBillingFlagsService = require('../../../../app/services/import/determine-supplementary-billing-flags.service.js')
const ProcessLicenceReturnLogsService = require('../../../../app/services/jobs/return-logs/process-licence-return-logs.service.js')

// Thing under test
const ProcessImportLicence = require('../../../../app/services/jobs/import/process-import-licence.service.js')

describe('Process Import Licence Service', () => {
  const batchSize = 10

  let licences
  let notifierStub
  let stubDetermineSupplementaryBillingFlagsService
  let stubProcessLicenceReturnLogsService

  beforeEach(async () => {
    licences = _licences()

    stubDetermineSupplementaryBillingFlagsService = Sinon.stub(DetermineSupplementaryBillingFlagsService, 'go').resolves()
    stubProcessLicenceReturnLogsService = Sinon.stub(ProcessLicenceReturnLogsService, 'go').resolves()

    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when iterating the licences', () => {
    it('should call the process licence service with the first element in the array', async () => {
      await ProcessImportLicence.go(licences)

      const firstLicence = licences[0]

      const licenceFormattedForSupplementary = {
        expiredDate: firstLicence.expired_date,
        lapsedDate: firstLicence.lapsed_date,
        revokedDate: firstLicence.revoked_date
      }

      expect(stubProcessLicenceReturnLogsService.getCall(0).calledWithExactly(firstLicence.id)).to.be.true()
      expect(stubDetermineSupplementaryBillingFlagsService
        .getCall(0)
        .calledWithExactly(licenceFormattedForSupplementary, firstLicence.id))
        .to.be.true()
    })

    it('should call the process licence service with the last element in the array', async () => {
      await ProcessImportLicence.go(licences)

      const lastLicence = licences[licences.length - 1]

      const licenceFormattedForSupplementary = {
        expiredDate: lastLicence.expired_date,
        lapsedDate: lastLicence.lapsed_date,
        revokedDate: lastLicence.revoked_date
      }

      expect(stubProcessLicenceReturnLogsService
        .getCall(licences.length - 1)
        .calledWithExactly(lastLicence.id))
        .to.be.true()

      expect(stubDetermineSupplementaryBillingFlagsService
        .getCall(licences.length - 1)
        .calledWithExactly(licenceFormattedForSupplementary, lastLicence.id))
        .to.be.true()
    })

    it('should format the licence for the Determine Supplementary Billing Flags Service', async () => {
      await ProcessImportLicence.go(licences)

      const firstLicence = licences[0]

      expect(stubDetermineSupplementaryBillingFlagsService
        .getCall(0)
        .calledWithExactly({
          expiredDate: firstLicence.expired_date,
          lapsedDate: firstLicence.lapsed_date,
          revokedDate: firstLicence.revoked_date
        }, firstLicence.id))
        .to.be.true()
    })

    it('should process all the licence refs', async () => {
      await ProcessImportLicence.go(licences)

      expect(stubProcessLicenceReturnLogsService.callCount).to.equal(licences.length)
      expect(stubDetermineSupplementaryBillingFlagsService.callCount).to.equal(licences.length)
    })

    it('should process the expected number of batches', async () => {
      await ProcessImportLicence.go(licences)

      // Check the expected number of batches (100 items / 10 per batch = 10 batches)
      const expectedBatches = Math.ceil(licences.length / batchSize)

      expect(stubProcessLicenceReturnLogsService.getCalls().length / batchSize).to.equal(expectedBatches)
      expect(stubDetermineSupplementaryBillingFlagsService.getCalls().length / batchSize).to.equal(expectedBatches)
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
