'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const DetermineBillLicenceFlagsService = require('../../../../app/services/licences/supplementary/determine-bill-licence-flags.service.js')
const DetermineChargeVersionFlagsService = require('../../../../app/services/licences/supplementary/determine-charge-version-flags.service.js')
const DetermineExistingBillRunYearsService = require('../../../../app/services/licences/supplementary/determine-existing-bill-run-years.service.js')
const DetermineImportedLicenceFlagsService = require('../../../../app/services/licences/supplementary/determine-imported-licence-flags.service.js')
const DetermineLicenceFlagsService = require('../../../../app/services/licences/supplementary/determine-licence-flags.service.js')
const DetermineReturnLogFlagsService = require('../../../../app/services/licences/supplementary/determine-return-log-flags.service.js')
const DetermineWorkflowFlagsService = require('../../../../app/services/licences/supplementary/determine-workflow-flags.service.js')
const PersistSupplementaryBillingFlagsService = require('../../../../app/services/licences/supplementary/persist-supplementary-billing-flags.service.js')

// Thing under test
const ProcessBillingFlagService = require('../../../../app/services/licences/supplementary/process-billing-flag.service.js')

describe('Process Billing Flag Service', () => {
  let notifierStub
  let payload
  let persistSupplementaryBillingFlagsServiceStub

  beforeEach(() => {
    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub

    persistSupplementaryBillingFlagsServiceStub = Sinon.stub(PersistSupplementaryBillingFlagsService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })
  describe('when given a valid payload', () => {
    describe('with a chargeVersionId & workflowId', () => {
      before(() => {
        payload = {
          chargeVersionId: '77c7f37a-7587-4df5-a569-95e88276346e',
          workflowId: 'd8777561-a9c4-4bc4-b649-2c1ce4626fbb'
        }
      })

      describe('that should be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineChargeVersionFlagsService, 'go').resolves(_licenceData(true))
          Sinon.stub(DetermineWorkflowFlagsService, 'go').resolves(_licenceData(true))

          const determineExistingBillRuYearsServiceStub = Sinon.stub(DetermineExistingBillRunYearsService, 'go')
          determineExistingBillRuYearsServiceStub.onCall(0).resolves([2023])
          determineExistingBillRuYearsServiceStub.onCall(1).resolves([2024])
        })

        it('calls "PersistSupplementaryBillingFlagsService" with the correct flags to persist', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(persistSupplementaryBillingFlagsServiceStub.calledTwice).to.be.true()

          expect(
            persistSupplementaryBillingFlagsServiceStub.firstCall.calledWith(
              [2023],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).to.be.true()
          expect(
            persistSupplementaryBillingFlagsServiceStub.secondCall.calledWith(
              [2024],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceId).to.exist()
        })
      })

      describe('that should not be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineChargeVersionFlagsService, 'go').resolves(_licenceData(false))
          Sinon.stub(DetermineWorkflowFlagsService, 'go').resolves(_licenceData(false))
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(persistSupplementaryBillingFlagsServiceStub.calledTwice).to.be.true()

          expect(
            persistSupplementaryBillingFlagsServiceStub.firstCall.calledWith(
              [],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).to.be.true()
          expect(
            persistSupplementaryBillingFlagsServiceStub.secondCall.calledWith(
              [],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceId).to.exist()
        })
      })
    })

    describe('with a workflowId', () => {
      before(() => {
        payload = {
          workflowId: 'f582f073-f5cb-4225-8e37-e7f05dc42a36'
        }
      })

      describe('that should be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineWorkflowFlagsService, 'go').resolves(_licenceData(true))
          Sinon.stub(DetermineExistingBillRunYearsService, 'go').resolves([2023])
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(
            PersistSupplementaryBillingFlagsService.go.calledOnceWith(
              [2023],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceId).to.exist()
        })
      })

      describe('that should not be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineWorkflowFlagsService, 'go').resolves(_licenceData(false))
          Sinon.stub(DetermineExistingBillRunYearsService, 'go')
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(
            PersistSupplementaryBillingFlagsService.go.calledOnceWith(
              [],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceId).to.exist()
        })
      })
    })

    describe('with a returnId', () => {
      before(() => {
        payload = {
          returnId: 'd92ab68d-25e3-4cb0-8528-5968bba1b85e'
        }
      })

      describe('that should be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineReturnLogFlagsService, 'go').resolves(_licenceData(true))
          Sinon.stub(DetermineExistingBillRunYearsService, 'go').resolves([2023])
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(
            PersistSupplementaryBillingFlagsService.go.calledOnceWith(
              [2023],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceId).to.exist()
        })
      })

      describe('that should not be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineReturnLogFlagsService, 'go').resolves(_licenceData(false))
          Sinon.stub(DetermineExistingBillRunYearsService, 'go')
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(
            PersistSupplementaryBillingFlagsService.go.calledOnceWith(
              [],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceId).to.exist()
        })
      })
    })

    describe('with an importedLicence', () => {
      before(() => {
        payload = {
          importedLicence: {
            licenceData: true
          }
        }
      })

      describe('that should be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineImportedLicenceFlagsService, 'go').resolves(_licenceData(true))
          Sinon.stub(DetermineExistingBillRunYearsService, 'go').resolves([2023])
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(
            PersistSupplementaryBillingFlagsService.go.calledOnceWith(
              [2023],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceId).to.exist()
        })
      })

      describe('that should not be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineImportedLicenceFlagsService, 'go').resolves(_licenceData(false))
          Sinon.stub(DetermineExistingBillRunYearsService, 'go')
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(
            PersistSupplementaryBillingFlagsService.go.calledOnceWith(
              [],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceId).to.exist()
        })
      })
    })

    describe('with a licence Id', () => {
      before(() => {
        payload = {
          licenceId: 'b5f81330-bec5-4c3e-95dd-267c10836fea'
        }
      })

      describe('that should be flagged for sroc supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineLicenceFlagsService, 'go').resolves(_srocLicenceData(true))
          Sinon.stub(DetermineExistingBillRunYearsService, 'go').resolves([2023])
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(
            PersistSupplementaryBillingFlagsService.go.calledOnceWith(
              [],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)
          const logDataArg = notifierStub.omg.firstCall.args[1]
          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceId).to.exist()
        })
      })

      describe('that should not be flagged for sroc supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineLicenceFlagsService, 'go').resolves(_srocLicenceData(false))
          Sinon.stub(DetermineExistingBillRunYearsService, 'go')
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(
            PersistSupplementaryBillingFlagsService.go.calledOnceWith(
              [],
              false,
              false,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)
          const logDataArg = notifierStub.omg.firstCall.args[1]
          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceId).to.exist()
        })
      })
    })

    describe('with a bill licence Id', () => {
      before(() => {
        payload = {
          billLicenceId: 'b5f81330-bec5-4c3e-95dd-267c10836fea'
        }
      })

      describe('that should be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBillLicenceFlagsService, 'go').resolves(_licenceData(true))
          Sinon.stub(DetermineExistingBillRunYearsService, 'go').resolves([2023])
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(
            PersistSupplementaryBillingFlagsService.go.calledOnceWith(
              [2023],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceId).to.exist()
        })
      })

      describe('that should not be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBillLicenceFlagsService, 'go').resolves(_licenceData(false))
          Sinon.stub(DetermineExistingBillRunYearsService, 'go')
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(
            PersistSupplementaryBillingFlagsService.go.calledOnceWith(
              [],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceId).to.exist()
        })
      })
    })
  })

  describe('when given an invalid payload', () => {
    describe('with no ids', () => {
      before(() => {
        payload = {}
      })

      it('throws an error', async () => {
        await ProcessBillingFlagService.go(payload)

        const args = notifierStub.omfg.firstCall.args

        expect(args[0]).to.equal('Supplementary Billing Flag failed')
        expect(args[1]).to.equal(payload)
        expect(args[2]).to.be.an.error()
      })
    })
  })
})

function _licenceData(twoPartTariff) {
  return {
    licenceId: 'aad74a3d-59ea-4c18-8091-02b0f8b0a147',
    regionId: 'ff92e0b1-3934-430b-8b16-5b89a3ea258f',
    startDate: new Date('2022-04-01'),
    endDate: null,
    flagForPreSrocSupplementary: false,
    flagForSrocSupplementary: true,
    flagForTwoPartTariffSupplementary: twoPartTariff
  }
}

function _srocLicenceData(sroc) {
  return {
    licenceId: 'aad74a3d-59ea-4c18-8091-02b0f8b0a147',
    regionId: 'ff92e0b1-3934-430b-8b16-5b89a3ea258f',
    flagForPreSrocSupplementary: false,
    flagForSrocSupplementary: sroc,
    flagForTwoPartTariffSupplementary: false
  }
}
