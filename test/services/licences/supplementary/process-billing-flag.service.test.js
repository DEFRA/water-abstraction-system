// Test framework dependencies

// Things we need to stub
import * as DetermineBillLicenceFlagsService from '../../../../app/services/licences/supplementary/determine-bill-licence-flags.service.js'
import * as DetermineChargeVersionFlagsService from '../../../../app/services/licences/supplementary/determine-charge-version-flags.service.js'
import * as DetermineExistingBillRunYearsService from '../../../../app/services/licences/supplementary/determine-existing-bill-run-years.service.js'
import * as DetermineImportedLicenceFlagsService from '../../../../app/services/licences/supplementary/determine-imported-licence-flags.service.js'
import * as DetermineLicenceFlagsService from '../../../../app/services/licences/supplementary/determine-licence-flags.service.js'
import * as DetermineReturnLogFlagsService from '../../../../app/services/licences/supplementary/determine-return-log-flags.service.js'
import * as DetermineWorkflowFlagsService from '../../../../app/services/licences/supplementary/determine-workflow-flags.service.js'
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'
import * as PersistSupplementaryBillingFlagsService from '../../../../app/services/licences/supplementary/persist-supplementary-billing-flags.service.js'

// Thing under test
import ProcessBillingFlagService from '../../../../app/services/licences/supplementary/process-billing-flag.service.js'

describe('Licences - Supplementary - Process Billing Flag service', () => {
  let notifierStub
  let payload

  beforeEach(() => {
    vi.spyOn(PersistSupplementaryBillingFlagsService, 'default').mockResolvedValue()

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
          vi.spyOn(DetermineChargeVersionFlagsService, 'default').mockResolvedValue(_licenceData(true))
          vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([2023])
        })

        it('calls "PersistSupplementaryBillingFlagsService" with the correct flags to persist', async () => {
          await ProcessBillingFlagService(payload)

          expect(PersistSupplementaryBillingFlagsService.default).toHaveBeenCalledExactlyOnceWith(
              [2023],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService(payload)

          const logDataArg = notifierStub.omg.mock.calls[0][1]

          expect(notifierStub.omg).toHaveBeenCalledWith('Supplementary Billing Flag complete', expect.any(Object))
          expect(logDataArg.timeTakenMs).toBeDefined()
          expect(logDataArg.timeTakenSs).toBeDefined()
          expect(logDataArg.licenceId).toBeDefined()
        })
      })

      describe('that should not be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          vi.spyOn(DetermineChargeVersionFlagsService, 'default').mockResolvedValue(_licenceData(false))
          vi.spyOn(DetermineWorkflowFlagsService, 'default').mockResolvedValue(_licenceData(false))
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService(payload)

          expect(PersistSupplementaryBillingFlagsService.default).toHaveBeenCalledExactlyOnceWith(
              [],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService(payload)

          const logDataArg = notifierStub.omg.mock.calls[0][1]

          expect(notifierStub.omg).toHaveBeenCalledWith('Supplementary Billing Flag complete', expect.any(Object))
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
          vi.spyOn(DetermineWorkflowFlagsService, 'default').mockResolvedValue(_licenceData(true))
          vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([2023])
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService(payload)

          expect(PersistSupplementaryBillingFlagsService.default).toHaveBeenCalledExactlyOnceWith(
              [2023],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService(payload)

          const logDataArg = notifierStub.omg.mock.calls[0][1]

          expect(notifierStub.omg).toHaveBeenCalledWith('Supplementary Billing Flag complete', expect.any(Object))
          expect(logDataArg.timeTakenMs).toBeDefined()
          expect(logDataArg.timeTakenSs).toBeDefined()
          expect(logDataArg.licenceId).toBeDefined()
        })
      })

      describe('that should not be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          vi.spyOn(DetermineWorkflowFlagsService, 'default').mockResolvedValue(_licenceData(false))
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService(payload)

          expect(PersistSupplementaryBillingFlagsService.default).toHaveBeenCalledExactlyOnceWith(
              [],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService(payload)

          const logDataArg = notifierStub.omg.mock.calls[0][1]

          expect(notifierStub.omg).toHaveBeenCalledWith('Supplementary Billing Flag complete', expect.any(Object))
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
          vi.spyOn(DetermineReturnLogFlagsService, 'default').mockResolvedValue(_licenceData(true))
          vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([2023])
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService(payload)

          expect(PersistSupplementaryBillingFlagsService.default).toHaveBeenCalledExactlyOnceWith(
              [2023],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService(payload)

          const logDataArg = notifierStub.omg.mock.calls[0][1]

          expect(notifierStub.omg).toHaveBeenCalledWith('Supplementary Billing Flag complete', expect.any(Object))
          expect(logDataArg.timeTakenMs).toBeDefined()
          expect(logDataArg.timeTakenSs).toBeDefined()
          expect(logDataArg.licenceId).toBeDefined()
        })
      })

      describe('that should not be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          vi.spyOn(DetermineReturnLogFlagsService, 'default').mockResolvedValue(_licenceData(false))
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService(payload)

          expect(PersistSupplementaryBillingFlagsService.default).toHaveBeenCalledExactlyOnceWith(
              [],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService(payload)

          const logDataArg = notifierStub.omg.mock.calls[0][1]

          expect(notifierStub.omg).toHaveBeenCalledWith('Supplementary Billing Flag complete', expect.any(Object))
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
          vi.spyOn(DetermineImportedLicenceFlagsService, 'default').mockResolvedValue(_licenceData(true))
          vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([2023])
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService(payload)

          expect(PersistSupplementaryBillingFlagsService.default).toHaveBeenCalledExactlyOnceWith(
              [2023],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService(payload)

          const logDataArg = notifierStub.omg.mock.calls[0][1]

          expect(notifierStub.omg).toHaveBeenCalledWith('Supplementary Billing Flag complete', expect.any(Object))
          expect(logDataArg.timeTakenMs).toBeDefined()
          expect(logDataArg.timeTakenSs).toBeDefined()
          expect(logDataArg.licenceId).toBeDefined()
        })
      })

      describe('that should not be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          vi.spyOn(DetermineImportedLicenceFlagsService, 'default').mockResolvedValue(_licenceData(false))
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService(payload)

          expect(PersistSupplementaryBillingFlagsService.default).toHaveBeenCalledExactlyOnceWith(
              [],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService(payload)

          const logDataArg = notifierStub.omg.mock.calls[0][1]

          expect(notifierStub.omg).toHaveBeenCalledWith('Supplementary Billing Flag complete', expect.any(Object))
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
          vi.spyOn(DetermineLicenceFlagsService, 'default').mockResolvedValue(_srocLicenceData(true))
          vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([2023])
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService(payload)

          expect(PersistSupplementaryBillingFlagsService.default).toHaveBeenCalledExactlyOnceWith(
              [],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService(payload)
          const logDataArg = notifierStub.omg.mock.calls[0][1]
          expect(notifierStub.omg).toHaveBeenCalledWith('Supplementary Billing Flag complete', expect.any(Object))
          expect(logDataArg.timeTakenMs).toBeDefined()
          expect(logDataArg.timeTakenSs).toBeDefined()
          expect(logDataArg.licenceId).toBeDefined()
        })
      })

      describe('that should not be flagged for sroc supplementary billing', () => {
        beforeEach(() => {
          vi.spyOn(DetermineLicenceFlagsService, 'default').mockResolvedValue(_srocLicenceData(false))
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService(payload)

          expect(PersistSupplementaryBillingFlagsService.default).toHaveBeenCalledExactlyOnceWith(
              [],
              false,
              false,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService(payload)
          const logDataArg = notifierStub.omg.mock.calls[0][1]
          expect(notifierStub.omg).toHaveBeenCalledWith('Supplementary Billing Flag complete', expect.any(Object))
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
          vi.spyOn(DetermineBillLicenceFlagsService, 'default').mockResolvedValue(_licenceData(true))
          vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([2023])
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService(payload)

          expect(PersistSupplementaryBillingFlagsService.default).toHaveBeenCalledExactlyOnceWith(
              [2023],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService(payload)

          const logDataArg = notifierStub.omg.mock.calls[0][1]

          expect(notifierStub.omg).toHaveBeenCalledWith('Supplementary Billing Flag complete', expect.any(Object))
          expect(logDataArg.timeTakenMs).toBeDefined()
          expect(logDataArg.timeTakenSs).toBeDefined()
          expect(logDataArg.licenceId).toBeDefined()
        })
      })

      describe('that should not be flagged for two-part tariff supplementary billing', () => {
        beforeEach(() => {
          vi.spyOn(DetermineBillLicenceFlagsService, 'default').mockResolvedValue(_licenceData(false))
        })

        it('calls "PersistSupplementaryBillingFlagsService" to persist the flags', async () => {
          await ProcessBillingFlagService(payload)

          expect(PersistSupplementaryBillingFlagsService.default).toHaveBeenCalledExactlyOnceWith(
              [],
              false,
              true,
              'aad74a3d-59ea-4c18-8091-02b0f8b0a147'
            )
        })

        it('logs the time taken in milliseconds and seconds', async () => {
          await ProcessBillingFlagService(payload)

          const logDataArg = notifierStub.omg.mock.calls[0][1]

          expect(notifierStub.omg).toHaveBeenCalledWith('Supplementary Billing Flag complete', expect.any(Object))
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

        const args = notifierStub.omfg.mock.calls[0]

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
