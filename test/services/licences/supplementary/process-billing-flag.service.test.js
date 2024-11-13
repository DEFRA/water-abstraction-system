'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const DetermineBillFlagsService = require('../../../../app/services/licences/supplementary/determine-bill-flags.service.js')
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

  beforeEach(() => {
    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub

    Sinon.stub(PersistSupplementaryBillingFlagsService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when given a valid payload', () => {
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

        it('calls the "DetermineImportedLicenceFlagsService" to determine which flags the licence needs', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineImportedLicenceFlagsService.go.called).to.be.true()
        })

        it('calls the "DetermineExistingBillRunYearsService" to work out the two-part tariff years to persist', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineExistingBillRunYearsService.go.called).to.be.true()
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(PersistSupplementaryBillingFlagsService.go.called).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceIds).to.exist()
        })
      })

      describe('that should not be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineImportedLicenceFlagsService, 'go').resolves(_licenceData(false))
          Sinon.stub(DetermineExistingBillRunYearsService, 'go')
        })

        it('calls the "DetermineImportedLicenceFlagsService" to determine which flags the licence needs', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineImportedLicenceFlagsService.go.called).to.be.true()
        })

        it('does not call the "DetermineExistingBillRunYearsService"', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineExistingBillRunYearsService.go.called).to.be.false()
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(PersistSupplementaryBillingFlagsService.go.called).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceIds).to.exist()
        })
      })
    })

    describe('with a chargeVersionId', () => {
      before(() => {
        payload = {
          chargeVersionId: '77c7f37a-7587-4df5-a569-95e88276346e'
        }
      })

      describe('that should be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineChargeVersionFlagsService, 'go').resolves(_licenceData(true))
          Sinon.stub(DetermineExistingBillRunYearsService, 'go').resolves([2023])
        })

        it('calls the "DetermineChargeVersionFlagsService" to determine which flags the licence needs', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineChargeVersionFlagsService.go.called).to.be.true()
        })

        it('calls the "DetermineExistingBillRunYearsService" to work out the two-part tariff years to persist', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineExistingBillRunYearsService.go.called).to.be.true()
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(PersistSupplementaryBillingFlagsService.go.called).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceIds).to.exist()
        })
      })

      describe('that should not be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineChargeVersionFlagsService, 'go').resolves(_licenceData(false))
          Sinon.stub(DetermineExistingBillRunYearsService, 'go')
        })

        it('calls the "DetermineChargeVersionFlagsService" to determine which flags the licence needs', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineChargeVersionFlagsService.go.called).to.be.true()
        })

        it('does not call the "DetermineExistingBillRunYearsService"', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineExistingBillRunYearsService.go.called).to.be.false()
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(PersistSupplementaryBillingFlagsService.go.called).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceIds).to.exist()
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

        it('calls the "DetermineWorkflowFlagsService" to determine which flags the licence needs', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineWorkflowFlagsService.go.called).to.be.true()
        })

        it('calls the "DetermineExistingBillRunYearsService" to work out the two-part tariff years to persist', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineExistingBillRunYearsService.go.called).to.be.true()
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(PersistSupplementaryBillingFlagsService.go.called).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceIds).to.exist()
        })
      })

      describe('that should not be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineWorkflowFlagsService, 'go').resolves(_licenceData(false))
          Sinon.stub(DetermineExistingBillRunYearsService, 'go')
        })

        it('calls the "DetermineWorkflowFlagsService" to determine which flags the licence needs', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineWorkflowFlagsService.go.called).to.be.true()
        })

        it('does not call the "DetermineExistingBillRunYearsService"', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineExistingBillRunYearsService.go.called).to.be.false()
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(PersistSupplementaryBillingFlagsService.go.called).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceIds).to.exist()
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

        it('calls the "DetermineReturnLogFlagsService" to determine which flags the licence needs', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineReturnLogFlagsService.go.called).to.be.true()
        })

        it('calls the "DetermineExistingBillRunYearsService" to work out the two-part tariff years to persist', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineExistingBillRunYearsService.go.called).to.be.true()
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(PersistSupplementaryBillingFlagsService.go.called).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceIds).to.exist()
        })
      })

      describe('that should not be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineReturnLogFlagsService, 'go').resolves(_licenceData(false))
          Sinon.stub(DetermineExistingBillRunYearsService, 'go')
        })

        it('calls the "DetermineReturnLogFlagsService" to determine which flags the licence needs', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineReturnLogFlagsService.go.called).to.be.true()
        })

        it('does not call the "DetermineExistingBillRunYearsService"', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineExistingBillRunYearsService.go.called).to.be.false()
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(PersistSupplementaryBillingFlagsService.go.called).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceIds).to.exist()
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

        it('calls the "DetermineBillLicenceFlagsService" to determine which flags the licence needs', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineBillLicenceFlagsService.go.called).to.be.true()
        })

        it('calls the "DetermineExistingBillRunYearsService" to work out the two-part tariff years to persist', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineExistingBillRunYearsService.go.called).to.be.true()
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(PersistSupplementaryBillingFlagsService.go.called).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceIds).to.exist()
        })
      })

      describe('that should not be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBillLicenceFlagsService, 'go').resolves(_licenceData(false))
          Sinon.stub(DetermineExistingBillRunYearsService, 'go')
        })

        it('calls the "DetermineBillLicenceFlagsService" to determine which flags the licence needs', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineBillLicenceFlagsService.go.called).to.be.true()
        })

        it('does not call the "DetermineExistingBillRunYearsService"', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineExistingBillRunYearsService.go.called).to.be.false()
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(PersistSupplementaryBillingFlagsService.go.called).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceIds).to.exist()
        })
      })
    })

    describe('with a bill Id', () => {
      before(() => {
        payload = {
          billId: 'b5f81330-bec5-4c3e-95dd-267c10836fea'
        }
      })

      describe('that should be flagged for two-part tariff supplementary billing', () => {
        describe('for multiple licences', () => {
          beforeEach(() => {
            Sinon.stub(DetermineBillFlagsService, 'go').resolves(_multipleLicencesData(true))
            Sinon.stub(DetermineExistingBillRunYearsService, 'go').resolves([2023])
          })

          it('calls the "DetermineBillFlagsService to determine which flags the licence needs', async () => {
            await ProcessBillingFlagService.go(payload)

            expect(DetermineBillFlagsService.go.called).to.be.true()
          })

          it('calls the "DetermineExistingBillRunYearsService" to work out the two-part tariff years to persist', async () => {
            await ProcessBillingFlagService.go(payload)

            expect(DetermineExistingBillRunYearsService.go.calledTwice).to.be.true()
          })

          it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
            await ProcessBillingFlagService.go(payload)

            expect(PersistSupplementaryBillingFlagsService.go.calledTwice).to.be.true()
          })

          it('logs the time taken in milliseconds and seconds', async () => {
            await ProcessBillingFlagService.go(payload)

            const logDataArg = notifierStub.omg.firstCall.args[1]

            expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
            expect(logDataArg.timeTakenMs).to.exist()
            expect(logDataArg.timeTakenSs).to.exist()
            expect(logDataArg.licenceIds).to.exist()
          })
        })

        describe('for one licence', () => {
          beforeEach(() => {
            Sinon.stub(DetermineBillFlagsService, 'go').resolves(_licenceData(true))
            Sinon.stub(DetermineExistingBillRunYearsService, 'go').resolves([2023])
          })

          it('calls the "DetermineBillFlagsService to determine which flags the licence needs', async () => {
            await ProcessBillingFlagService.go(payload)

            expect(DetermineBillFlagsService.go.called).to.be.true()
          })

          it('calls the "DetermineExistingBillRunYearsService" to work out the two-part tariff years to persist', async () => {
            await ProcessBillingFlagService.go(payload)

            expect(DetermineExistingBillRunYearsService.go.calledOnce).to.be.true()
          })

          it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
            await ProcessBillingFlagService.go(payload)

            expect(PersistSupplementaryBillingFlagsService.go.calledOnce).to.be.true()
          })

          it('logs the time taken in milliseconds and seconds', async () => {
            await ProcessBillingFlagService.go(payload)

            const logDataArg = notifierStub.omg.firstCall.args[1]

            expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
            expect(logDataArg.timeTakenMs).to.exist()
            expect(logDataArg.timeTakenSs).to.exist()
            expect(logDataArg.licenceIds).to.exist()
          })
        })
      })

      describe('that should not be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineBillFlagsService, 'go').resolves(_licenceData(false))
          Sinon.stub(DetermineExistingBillRunYearsService, 'go')
        })

        it('calls the "DetermineBillFlagsService" to determine which flags the licence needs', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineBillFlagsService.go.called).to.be.true()
        })

        it('does not call the "DetermineExistingBillRunYearsService"', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineExistingBillRunYearsService.go.called).to.be.false()
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(PersistSupplementaryBillingFlagsService.go.called).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceIds).to.exist()
        })
      })
    })

    describe('with a licence Id', () => {
      before(() => {
        payload = {
          licenceId: 'b5f81330-bec5-4c3e-95dd-267c10836fea'
        }
      })

      describe('that should be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineLicenceFlagsService, 'go').resolves(_licenceData(true))
          Sinon.stub(DetermineExistingBillRunYearsService, 'go').resolves([2023])
        })

        it('calls the "DetermineLicenceFlagsService" to determine which flags the licence needs', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineLicenceFlagsService.go.called).to.be.true()
        })

        it('calls the "DetermineExistingBillRunYearsService" to work out the two-part tariff years to persist', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineExistingBillRunYearsService.go.called).to.be.true()
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(PersistSupplementaryBillingFlagsService.go.called).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceIds).to.exist()
        })
      })

      describe('that should not be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          Sinon.stub(DetermineLicenceFlagsService, 'go').resolves(_licenceData(false))
          Sinon.stub(DetermineExistingBillRunYearsService, 'go')
        })

        it('calls the "DetermineLicenceFlagsService" to determine which flags the licence needs', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineLicenceFlagsService.go.called).to.be.true()
        })

        it('does not call the "DetermineExistingBillRunYearsService"', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(DetermineExistingBillRunYearsService.go.called).to.be.false()
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService.go(payload)

          expect(PersistSupplementaryBillingFlagsService.go.called).to.be.true()
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService.go(payload)

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Supplementary Billing Flag complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.licenceIds).to.exist()
        })
      })
    })
  })

  describe('when given an invalid payload', () => {
    describe('with no ids', () => {
      before(() => {
        payload = {}
      })

      it('returns without throwing an error', async () => {
        await ProcessBillingFlagService.go(payload)

        expect(PersistSupplementaryBillingFlagsService.go.called).to.be.false()
      })
    })
  })

  describe('when there is an error', () => {
    beforeEach(() => {
      // To make the service fail, we have passed it a charge version that doesn't exist in the db
      payload = {
        chargeVersionId: '5db0060a-69ae-4312-a363-9cb580d19d92'
      }
    })

    it('handles the error', async () => {
      await ProcessBillingFlagService.go(payload)

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).to.equal('Supplementary Billing Flag failed')
      expect(args[1]).to.equal(payload)
      expect(args[2]).to.be.an.error()
    })
  })
})

function _licenceData (twoPartTariff) {
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

function _multipleLicencesData (twoPartTariff) {
  return [
    {
      licenceId: 'aad74a3d-59ea-4c18-8091-02b0f8b0a147',
      regionId: 'ff92e0b1-3934-430b-8b16-5b89a3ea258f',
      startDate: new Date('2022-04-01'),
      endDate: null,
      flagForPreSrocSupplementary: false,
      flagForSrocSupplementary: true,
      flagForTwoPartTariffSupplementary: twoPartTariff
    },
    {
      licenceId: '30e93215-ab59-4101-892d-823eaddc81a2',
      regionId: 'ff92e0b1-3934-430b-8b16-5b89a3ea258f',
      startDate: new Date('2022-04-01'),
      endDate: null,
      flagForPreSrocSupplementary: false,
      flagForSrocSupplementary: true,
      flagForTwoPartTariffSupplementary: twoPartTariff
    }
  ]
}
