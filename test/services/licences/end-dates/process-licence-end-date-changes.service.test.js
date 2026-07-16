// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import LicenceEndDateChangeHelper from '../../../support/helpers/licence-end-date-change.helper.js'

// Things we need to stub
import * as ProcessBillingFlagService from '../../../../app/services/licences/supplementary/process-billing-flag.service.js'
import * as ProcessLicenceReturnLogsService from '../../../../app/services/return-logs/process-licence-return-logs.service.js'
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'
import LicenceEndDateChangeModel from '../../../../app/models/licence-end-date-change.model.js'

// Thing under test
import ProcessLicenceEndDateChangesService from '../../../../app/services/licences/end-dates/process-licence-end-date-changes.service.js'

describe('Licences - End Dates - Process Licence End Date Changes service', () => {
  let licenceEndDateChange
  let notifierStub
  beforeEach(async () => {
    licenceEndDateChange = await LicenceEndDateChangeHelper.add()

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

  describe('when processing the licence end date changes', () => {
    beforeEach(() => {
      vi.spyOn(ProcessBillingFlagService, 'default').mockResolvedValue()
      vi.spyOn(ProcessLicenceReturnLogsService, 'default').mockResolvedValue()
    })

    it('processes the changed licence for supplementary billing flags', async () => {
      await ProcessLicenceEndDateChangesService()

      expect(ProcessBillingFlagService.default).toHaveBeenCalled()
    })

    describe('and the app is managing "requirements for returns"', () => {
      it('processes the changed licence for reissuing return logs', async () => {
        await ProcessLicenceEndDateChangesService()

        expect(ProcessLicenceReturnLogsService.default).toHaveBeenCalled()
      })
    })

    describe('and when the processing is complete', () => {
      it('deletes the licence end date change record', async () => {
        await ProcessLicenceEndDateChangesService()

        const result = await LicenceEndDateChangeModel.query().findById(licenceEndDateChange.id)

        expect(result).toBeUndefined()
      })

      it('logs the completed licence change', async () => {
        await ProcessLicenceEndDateChangesService()

        const logDataArg = notifierStub.omg.mock.calls[0][1]

        expect(notifierStub.omg).toHaveBeenCalledWith('Process licence end date change complete', expect.any(Object))
        expect(logDataArg).toEqual({
          id: licenceEndDateChange.id,
          licenceId: licenceEndDateChange.licenceId,
          dateType: licenceEndDateChange.dateType,
          changeDate: licenceEndDateChange.changeDate,
          naldDate: licenceEndDateChange.naldDate,
          wrlsDate: licenceEndDateChange.wrlsDate
        })
      })

      it('logs the time taken in milliseconds and seconds', async () => {
        await ProcessLicenceEndDateChangesService()

        const logDataArg = notifierStub.omg.mock.calls[1][1]

        expect(notifierStub.omg).toHaveBeenCalledWith('Process licence end date changes complete', expect.any(Object))
        expect(logDataArg.timeTakenMs).toBeDefined()
        expect(logDataArg.timeTakenSs).toBeDefined()
        expect(logDataArg.count).toBeDefined()
      })
    })
  })

  describe('when there is an error', () => {
    describe('during the processing of a licence', () => {
      beforeEach(() => {
        vi.spyOn(ProcessBillingFlagService, 'default').mockRejectedValue(new Error())
      })

      it('handles the error', async () => {
        await ProcessLicenceEndDateChangesService()

        const errorLogArgs = notifierStub.omfg.mock.calls[0]

        expect(notifierStub.omfg).toHaveBeenCalledWith(
          'Process licence end date change failed',
          expect.any(Object),
          expect.any(Error)
        )
        expect(errorLogArgs[1]).toEqual({
          id: licenceEndDateChange.id,
          licenceId: licenceEndDateChange.licenceId,
          dateType: licenceEndDateChange.dateType,
          changeDate: licenceEndDateChange.changeDate,
          naldDate: licenceEndDateChange.naldDate,
          wrlsDate: licenceEndDateChange.wrlsDate
        })
        expect(errorLogArgs[2]).toBeInstanceOf(Error)
      })
    })

    describe('trying to fetch the licence end date changes', () => {
      beforeEach(() => {
        vi.spyOn(LicenceEndDateChangeModel, 'query').mockReturnValue({
          select: vi.fn().mockRejectedValue(new Error())
        })
      })

      it('handles the error', async () => {
        await ProcessLicenceEndDateChangesService()

        const errorLogArgs = notifierStub.omfg.mock.calls[0]

        expect(notifierStub.omfg).toHaveBeenCalledWith(
          'Process licence end date changes failed',
          expect.any(Object),
          expect.any(Error)
        )
        expect(errorLogArgs[1]).toBeNull()
        expect(errorLogArgs[2]).toBeInstanceOf(Error)
      })
    })
  })
})
