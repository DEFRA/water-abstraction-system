'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const DetermineLicenceEndDateChangedService = require('../../../../app/services/jobs/import/determine-licence-end-date-changed.service.js')
const ProcessBillingFlagService = require('../../../../app/services/licences/supplementary/process-billing-flag.service.js')
const GenerateReturnLogsService = require('../../../../app/services/jobs/import/generate-return-logs.service.js')

// Thing under test
const ProcessImportLicence = require('../../../../app/services/jobs/import/process-import-licence.service.js')

describe('Process Import Licence Service', () => {
  let licence
  let notifierStub
  let stubDetermineLicenceEndDateChangedService
  let stubProcessBillingFlagService
  let stubGenerateReturnLogsService

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
    describe('and the licence end date has changed', () => {
      beforeEach(() => {
        stubDetermineLicenceEndDateChangedService = Sinon.stub(DetermineLicenceEndDateChangedService, 'go').resolves(
          true
        )
        stubProcessBillingFlagService = Sinon.stub(ProcessBillingFlagService, 'go').resolves()
        stubGenerateReturnLogsService = Sinon.stub(GenerateReturnLogsService, 'go').resolves()
      })

      it('should call the "DetermineLicenceEndDateChangedService" service ', async () => {
        await ProcessImportLicence.go(licence)

        const expectedPayload = {
          expiredDate: licence.expired_date,
          lapsedDate: licence.lapsed_date,
          revokedDate: licence.revoked_date,
          licenceId: licence.id
        }

        expect(stubDetermineLicenceEndDateChangedService.calledWithExactly(expectedPayload, licence.id)).to.be.true()
      })

      it('should call the "ProcessBillingFlagService" service ', async () => {
        await ProcessImportLicence.go(licence)

        const expectedPayload = {
          expiredDate: licence.expired_date,
          lapsedDate: licence.lapsed_date,
          revokedDate: licence.revoked_date,
          licenceId: licence.id
        }

        expect(stubProcessBillingFlagService.calledWithExactly(expectedPayload)).to.be.true()
      })
    })
    describe('and the licence end date has not changed', () => {
      beforeEach(() => {
        stubDetermineLicenceEndDateChangedService = Sinon.stub(DetermineLicenceEndDateChangedService, 'go').resolves(
          false
        )
        stubProcessBillingFlagService = Sinon.stub(ProcessBillingFlagService, 'go').resolves()
        stubGenerateReturnLogsService = Sinon.stub(GenerateReturnLogsService, 'go').resolves()
      })

      it('should call the "DetermineLicenceEndDateChangedService" service ', async () => {
        await ProcessImportLicence.go(licence)

        const expectedPayload = {
          expiredDate: licence.expired_date,
          lapsedDate: licence.lapsed_date,
          revokedDate: licence.revoked_date,
          licenceId: licence.id
        }

        expect(stubDetermineLicenceEndDateChangedService.calledWithExactly(expectedPayload, licence.id)).to.be.true()
      })

      it('should not call the "ProcessBillingFlagService" service ', async () => {
        await ProcessImportLicence.go(licence)

        expect(stubProcessBillingFlagService.called).to.be.false()
      })

      it('should not call the "stubDetermineLicenceEndDateChangedService" service ', async () => {
        await ProcessImportLicence.go(licence)

        expect(stubGenerateReturnLogsService.called).to.be.false()
      })
    })
  })

  describe('when processing a licence fails', () => {
    beforeEach(() => {
      stubDetermineLicenceEndDateChangedService = Sinon.stub(DetermineLicenceEndDateChangedService, 'go').rejects(
        new Error('Test error')
      )
      stubProcessBillingFlagService = Sinon.stub(ProcessBillingFlagService, 'go').resolves()
      stubGenerateReturnLogsService = Sinon.stub(GenerateReturnLogsService, 'go').resolves()
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
