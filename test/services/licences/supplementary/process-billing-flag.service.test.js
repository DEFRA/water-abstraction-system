// Test framework dependencies

// Things we need to stub
import DetermineBillLicenceFlagsService from '../../../../app/services/licences/supplementary/determine-bill-licence-flags.service.js'
import DetermineChargeVersionFlagsService from '../../../../app/services/licences/supplementary/determine-charge-version-flags.service.js'
import DetermineExistingBillRunYearsService from '../../../../app/services/licences/supplementary/determine-existing-bill-run-years.service.js'
import DetermineImportedLicenceFlagsService from '../../../../app/services/licences/supplementary/determine-imported-licence-flags.service.js'
import DetermineLicenceFlagsService from '../../../../app/services/licences/supplementary/determine-licence-flags.service.js'
import DetermineReturnLogFlagsService from '../../../../app/services/licences/supplementary/determine-return-log-flags.service.js'
import DetermineWorkflowFlagsService from '../../../../app/services/licences/supplementary/determine-workflow-flags.service.js'
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'
import PersistSupplementaryBillingFlagsService from '../../../../app/services/licences/supplementary/persist-supplementary-billing-flags.service.js'

// Thing under test
import ProcessBillingFlagService from '../../../../app/services/licences/supplementary/process-billing-flag.service.js'

describe('Licences - Supplementary - Process Billing Flag service', () => {
  let notifierStub
  let payload

  beforeEach(() => {
    vi.mock('../../../../app/services/licences/supplementary/persist-supplementary-billing-flags.service.js')
    PersistSupplementaryBillingFlagsService.mockResolvedValue()

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
  })

  describe('when given a valid payload', () => {
    describe('with a chargeVersionId & workflowId', () => {
      beforeAll(() => {
        payload = {
          chargeVersionId: '77c7f37a-7587-4df5-a569-95e88276346e',
          workflowId: 'd8777561-a9c4-4bc4-b649-2c1ce4626fbb'
        }
      })

      describe('that should be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          vi.mock('../../../../app/services/licences/supplementary/determine-charge-version-flags.service.js')
          DetermineChargeVersionFlagsService.mockResolvedValue(_licenceData(true))
          vi.mock('../../../../app/services/licences/supplementary/determine-existing-bill-run-years.service.js')
          DetermineExistingBillRunYearsService.mockResolvedValue([2023])
        })

        it('calls "PersistSupplementaryBillingFlagsService" with the correct flags to persist', async () => {
          await ProcessBillingFlagService(payload)

          expect(
            PersistSupplementaryBillingFlagsService.go.calledOnceWith(
              [2023],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).toBe(true)
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService(payload)

          const logDataArg = notifierStub.omg.mock.calls[0][1]

          expect(notifierStub.omg).toHaveBeenCalledWith('Supplementary Billing Flag complete')
          expect(logDataArg.timeTakenMs).toBeDefined()
          expect(logDataArg.timeTakenSs).toBeDefined()
          expect(logDataArg.licenceId).toBeDefined()
        })
      })

      describe('that should not be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          vi.mock('../../../../app/services/licences/supplementary/determine-charge-version-flags.service.js')
          DetermineChargeVersionFlagsService.mockResolvedValue(_licenceData(false))
          vi.mock('../../../../app/services/licences/supplementary/determine-workflow-flags.service.js')
          DetermineWorkflowFlagsService.mockResolvedValue(_licenceData(false))
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService(payload)

          expect(
            PersistSupplementaryBillingFlagsService.go.calledOnceWith(
              [],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).toBe(true)
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService(payload)

          const logDataArg = notifierStub.omg.mock.calls[0][1]

          expect(notifierStub.omg).toHaveBeenCalledWith('Supplementary Billing Flag complete')
          expect(logDataArg.timeTakenMs).toBeDefined()
          expect(logDataArg.timeTakenSs).toBeDefined()
          expect(logDataArg.licenceId).toBeDefined()
        })
      })
    })

    describe('with a workflowId', () => {
      beforeAll(() => {
        payload = {
          workflowId: 'f582f073-f5cb-4225-8e37-e7f05dc42a36'
        }
      })

      describe('that should be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          vi.mock('../../../../app/services/licences/supplementary/determine-workflow-flags.service.js')
          DetermineWorkflowFlagsService.mockResolvedValue(_licenceData(true))
          vi.mock('../../../../app/services/licences/supplementary/determine-existing-bill-run-years.service.js')
          DetermineExistingBillRunYearsService.mockResolvedValue([2023])
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService(payload)

          expect(
            PersistSupplementaryBillingFlagsService.go.calledOnceWith(
              [2023],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).toBe(true)
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService(payload)

          const logDataArg = notifierStub.omg.mock.calls[0][1]

          expect(notifierStub.omg).toHaveBeenCalledWith('Supplementary Billing Flag complete')
          expect(logDataArg.timeTakenMs).toBeDefined()
          expect(logDataArg.timeTakenSs).toBeDefined()
          expect(logDataArg.licenceId).toBeDefined()
        })
      })

      describe('that should not be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          vi.mock('../../../../app/services/licences/supplementary/determine-workflow-flags.service.js')
          DetermineWorkflowFlagsService.mockResolvedValue(_licenceData(false))
          vi.mock('../../../../app/services/licences/supplementary/determine-existing-bill-run-years.service.js')
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService(payload)

          expect(
            PersistSupplementaryBillingFlagsService.go.calledOnceWith(
              [],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).toBe(true)
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService(payload)

          const logDataArg = notifierStub.omg.mock.calls[0][1]

          expect(notifierStub.omg).toHaveBeenCalledWith('Supplementary Billing Flag complete')
          expect(logDataArg.timeTakenMs).toBeDefined()
          expect(logDataArg.timeTakenSs).toBeDefined()
          expect(logDataArg.licenceId).toBeDefined()
        })
      })
    })

    describe('with a returnLogId', () => {
      beforeAll(() => {
        payload = {
          returnLogId: 'v1:5:1/11/11/*11/1111:11142960:2022-11-01:2023-10-31'
        }
      })

      describe('that should be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          vi.mock('../../../../app/services/licences/supplementary/determine-return-log-flags.service.js')
          DetermineReturnLogFlagsService.mockResolvedValue(_licenceData(true))
          vi.mock('../../../../app/services/licences/supplementary/determine-existing-bill-run-years.service.js')
          DetermineExistingBillRunYearsService.mockResolvedValue([2023])
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService(payload)

          expect(
            PersistSupplementaryBillingFlagsService.go.calledOnceWith(
              [2023],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).toBe(true)
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService(payload)

          const logDataArg = notifierStub.omg.mock.calls[0][1]

          expect(notifierStub.omg).toHaveBeenCalledWith('Supplementary Billing Flag complete')
          expect(logDataArg.timeTakenMs).toBeDefined()
          expect(logDataArg.timeTakenSs).toBeDefined()
          expect(logDataArg.licenceId).toBeDefined()
        })
      })

      describe('that should not be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          vi.mock('../../../../app/services/licences/supplementary/determine-return-log-flags.service.js')
          DetermineReturnLogFlagsService.mockResolvedValue(_licenceData(false))
          vi.mock('../../../../app/services/licences/supplementary/determine-existing-bill-run-years.service.js')
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService(payload)

          expect(
            PersistSupplementaryBillingFlagsService.go.calledOnceWith(
              [],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).toBe(true)
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService(payload)

          const logDataArg = notifierStub.omg.mock.calls[0][1]

          expect(notifierStub.omg).toHaveBeenCalledWith('Supplementary Billing Flag complete')
          expect(logDataArg.timeTakenMs).toBeDefined()
          expect(logDataArg.timeTakenSs).toBeDefined()
          expect(logDataArg.licenceId).toBeDefined()
        })
      })
    })

    describe('with an importedLicence', () => {
      beforeAll(() => {
        payload = {
          licenceId: 'b5f81330-bec5-4c3e-95dd-267c10836fea',
          changedDateDetails: {
            changeDate: new Date('2024-07-01'),
            dateType: 'revoked',
            naldDate: new Date('2024-07-01'),
            wrlsDate: null
          }
        }
      })

      describe('that should be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          vi.mock('../../../../app/services/licences/supplementary/determine-imported-licence-flags.service.js')
          DetermineImportedLicenceFlagsService.mockResolvedValue(_licenceData(true))
          vi.mock('../../../../app/services/licences/supplementary/determine-existing-bill-run-years.service.js')
          DetermineExistingBillRunYearsService.mockResolvedValue([2023])
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService(payload)

          expect(
            PersistSupplementaryBillingFlagsService.go.calledOnceWith(
              [2023],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).toBe(true)
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService(payload)

          const logDataArg = notifierStub.omg.mock.calls[0][1]

          expect(notifierStub.omg).toHaveBeenCalledWith('Supplementary Billing Flag complete')
          expect(logDataArg.timeTakenMs).toBeDefined()
          expect(logDataArg.timeTakenSs).toBeDefined()
          expect(logDataArg.licenceId).toBeDefined()
        })
      })

      describe('that should not be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          vi.mock('../../../../app/services/licences/supplementary/determine-imported-licence-flags.service.js')
          DetermineImportedLicenceFlagsService.mockResolvedValue(_licenceData(false))
          vi.mock('../../../../app/services/licences/supplementary/determine-existing-bill-run-years.service.js')
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService(payload)

          expect(
            PersistSupplementaryBillingFlagsService.go.calledOnceWith(
              [],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).toBe(true)
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService(payload)

          const logDataArg = notifierStub.omg.mock.calls[0][1]

          expect(notifierStub.omg).toHaveBeenCalledWith('Supplementary Billing Flag complete')
          expect(logDataArg.timeTakenMs).toBeDefined()
          expect(logDataArg.timeTakenSs).toBeDefined()
          expect(logDataArg.licenceId).toBeDefined()
        })
      })
    })

    describe('with a licence Id', () => {
      beforeAll(() => {
        payload = {
          licenceId: 'b5f81330-bec5-4c3e-95dd-267c10836fea'
        }
      })

      describe('that should be flagged for sroc supplementary billing', () => {
        beforeEach(() => {
          vi.mock('../../../../app/services/licences/supplementary/determine-licence-flags.service.js')
          DetermineLicenceFlagsService.mockResolvedValue(_srocLicenceData(true))
          vi.mock('../../../../app/services/licences/supplementary/determine-existing-bill-run-years.service.js')
          DetermineExistingBillRunYearsService.mockResolvedValue([2023])
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService(payload)

          expect(
            PersistSupplementaryBillingFlagsService.go.calledOnceWith(
              [],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).toBe(true)
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService(payload)
          const logDataArg = notifierStub.omg.mock.calls[0][1]
          expect(notifierStub.omg).toHaveBeenCalledWith('Supplementary Billing Flag complete')
          expect(logDataArg.timeTakenMs).toBeDefined()
          expect(logDataArg.timeTakenSs).toBeDefined()
          expect(logDataArg.licenceId).toBeDefined()
        })
      })

      describe('that should not be flagged for sroc supplementary billing', () => {
        beforeEach(() => {
          vi.mock('../../../../app/services/licences/supplementary/determine-licence-flags.service.js')
          DetermineLicenceFlagsService.mockResolvedValue(_srocLicenceData(false))
          vi.mock('../../../../app/services/licences/supplementary/determine-existing-bill-run-years.service.js')
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService(payload)

          expect(
            PersistSupplementaryBillingFlagsService.go.calledOnceWith(
              [],
              false,
              false,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).toBe(true)
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService(payload)
          const logDataArg = notifierStub.omg.mock.calls[0][1]
          expect(notifierStub.omg).toHaveBeenCalledWith('Supplementary Billing Flag complete')
          expect(logDataArg.timeTakenMs).toBeDefined()
          expect(logDataArg.timeTakenSs).toBeDefined()
          expect(logDataArg.licenceId).toBeDefined()
        })
      })
    })

    describe('with a bill licence Id', () => {
      beforeAll(() => {
        payload = {
          billLicenceId: 'b5f81330-bec5-4c3e-95dd-267c10836fea'
        }
      })

      describe('that should be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          vi.mock('../../../../app/services/licences/supplementary/determine-bill-licence-flags.service.js')
          DetermineBillLicenceFlagsService.mockResolvedValue(_licenceData(true))
          vi.mock('../../../../app/services/licences/supplementary/determine-existing-bill-run-years.service.js')
          DetermineExistingBillRunYearsService.mockResolvedValue([2023])
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService(payload)

          expect(
            PersistSupplementaryBillingFlagsService.go.calledOnceWith(
              [2023],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).toBe(true)
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService(payload)

          const logDataArg = notifierStub.omg.mock.calls[0][1]

          expect(notifierStub.omg).toHaveBeenCalledWith('Supplementary Billing Flag complete')
          expect(logDataArg.timeTakenMs).toBeDefined()
          expect(logDataArg.timeTakenSs).toBeDefined()
          expect(logDataArg.licenceId).toBeDefined()
        })
      })

      describe('that should not be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          vi.mock('../../../../app/services/licences/supplementary/determine-bill-licence-flags.service.js')
          DetermineBillLicenceFlagsService.mockResolvedValue(_licenceData(false))
          vi.mock('../../../../app/services/licences/supplementary/determine-existing-bill-run-years.service.js')
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService(payload)

          expect(
            PersistSupplementaryBillingFlagsService.go.calledOnceWith(
              [],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
          ).toBe(true)
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService(payload)

          const logDataArg = notifierStub.omg.mock.calls[0][1]

          expect(notifierStub.omg).toHaveBeenCalledWith('Supplementary Billing Flag complete')
          expect(logDataArg.timeTakenMs).toBeDefined()
          expect(logDataArg.timeTakenSs).toBeDefined()
          expect(logDataArg.licenceId).toBeDefined()
        })
      })
    })
  })

  describe('when given an invalid payload', () => {
    describe('with no ids', () => {
      beforeAll(() => {
        payload = {}
      })

      it('throws an error', async () => {
        await ProcessBillingFlagService(payload)

        const args = notifierStub.omfg.firstCall.args

        expect(args[0]).toEqual('Supplementary Billing Flag failed')
        expect(args[1]).toEqual(payload)
        expect(args[2]).toBeInstanceOf(Error)
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
