'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const DetermineSupplementaryBillingFlagsService = require('../../../../app/services/import/determine-supplementary-billing-flags.service.js')
const ProcessLicenceReturnLogsService = require('../../../../app/services/jobs/return-logs/process-licence-return-logs.service.js')

// Thing under test
const ProcessImportLicence = require('../../../../app/services/jobs/import/process-import-licence.service.js')

describe('Process Import Licence Service', () => {
  let licence
  let notifierStub
  let stubDetermineSupplementaryBillingFlagsService
  let stubProcessLicenceReturnLogsService

  beforeEach(async () => {
    licence = _licence()

    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when a licence has been process successfully', () => {
    beforeEach(() => {
      stubDetermineSupplementaryBillingFlagsService = Sinon.stub(
        DetermineSupplementaryBillingFlagsService,
        'go'
      ).resolves()
      stubProcessLicenceReturnLogsService = Sinon.stub(ProcessLicenceReturnLogsService, 'go').resolves()
    })

    it('should call the "ProcessLicenceReturnLogsService" service ', async () => {
      await ProcessImportLicence.go(licence)

      expect(stubProcessLicenceReturnLogsService.calledWithExactly(licence.id)).to.be.true()
    })

    it('should call the "DetermineSupplementaryBillingFlagsService" service ', async () => {
      await ProcessImportLicence.go(licence)

      const licenceFormattedForSupplementary = {
        expiredDate: licence.expired_date,
        lapsedDate: licence.lapsed_date,
        revokedDate: licence.revoked_date
      }

      expect(
        stubDetermineSupplementaryBillingFlagsService.calledWithExactly(licenceFormattedForSupplementary, licence.id)
      ).to.be.true()
    })

    it('should format the licence for the Determine Supplementary Billing Flags Service', async () => {
      await ProcessImportLicence.go(licence)

      expect(
        stubDetermineSupplementaryBillingFlagsService
          .getCall(0)
          .calledWithExactly(
            { expiredDate: licence.expired_date, lapsedDate: licence.lapsed_date, revokedDate: licence.revoked_date },
            licence.id
          )
      ).to.be.true()
    })
  })

  describe('when processing a licence fails', () => {
    beforeEach(() => {
      stubDetermineSupplementaryBillingFlagsService = Sinon.stub(
        DetermineSupplementaryBillingFlagsService,
        'go'
      ).rejects(new Error('Test error'))
      stubProcessLicenceReturnLogsService = Sinon.stub(ProcessLicenceReturnLogsService, 'go').resolves()
    })

    it('should catch the error', async () => {
      await ProcessImportLicence.go(licence)

      expect(notifierStub.omfg.firstCall.args).to.equal([
        `Importing licence ${licence.id}`,
        null,
        new Error('Test error')
      ])
    })
  })
})

function _licence() {
  return { id: generateUUID(), expired_date: null, lapsed_date: null, revoked_date: null }
}
