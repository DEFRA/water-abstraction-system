// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from '../../../../support/stubs/session.stub.js'

// Things we need to stub
import * as CreateReturnVersionService from '../../../../../app/services/return-versions/setup/check/create-return-version.service.js'
import * as DeleteSessionDal from '../../../../../app/dal/delete-session.dal.js'
import * as FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'
import * as GenerateReturnVersionService from '../../../../../app/services/return-versions/setup/check/generate-return-version.service.js'
import * as ProcessExistingReturnVersionsService from '../../../../../app/services/return-versions/setup/check/process-existing-return-versions.service.js'
import * as ProcessLicenceReturnLogsService from '../../../../../app/services/return-logs/process-licence-return-logs.service.js'
import * as UpdateSucceededReturnLogsDal from '../../../../../app/dal/return-versions/update-succeeded-return-logs.dal.js'
import * as VoidReturnLogsService from '../../../../../app/services/return-logs/void-return-logs.service.js'
import GlobalNotifierStub from '../../../../support/stubs/global-notifier.stub.js'

// Thing under test
import SubmitCheckService from '../../../../../app/services/return-versions/setup/check/submit-check.service.js'

describe('Return Versions - Setup - Submit Check service', () => {
  let generatedReturnVersionData
  let notifierStub
  let session
  let sessionData
  let userId
  beforeEach(() => {
    userId = 12345

    sessionData = {
      checkPageVisited: true,
      journey: 'returns-required',
      licence: {
        id: '7cf4a46b-1375-42c8-bfe7-24c1bfff765c',
        endDate: null,
        startDate: '1967-12-08T00:00:00.000Z',
        licenceRef: '99/99/9999',
        licenceHolder: 'A licence holder',
        returnVersions: [
          {
            id: '1b67ad84-1511-4944-834d-00814899564f',
            reason: null,
            startDate: '2023-02-13T00:00:00.000Z'
          },
          {
            id: '745886bd-b73a-41e8-819c-dfd89d44ca91',
            reason: null,
            startDate: '2008-04-01T00:00:00.000Z'
          }
        ],
        currentVersionStartDate: '2023-02-13T00:00:00.000Z'
      },
      method: 'use-existing-requirements',
      multipleUpload: false,
      quarterlyReturns: false,
      reason: 'minor-change',
      requirements: [
        {
          points: ['796f83bb-d50d-446f-bc47-28daff6bcb78'],
          purposes: [
            {
              id: 'ff7cecd5-96ef-4625-b232-54ef7e50ab8e',
              alias: ''
            }
          ],
          returnsCycle: 'winter-and-all-year',
          siteDescription: 'Site Number One',
          abstractionPeriod: {
            abstractionPeriodEndDay: '31',
            abstractionPeriodEndMonth: '3',
            abstractionPeriodStartDay: '1',
            abstractionPeriodStartMonth: '4'
          },
          frequencyReported: 'month',
          frequencyCollected: 'week',
          agreementsExceptions: ['none']
        }
      ],
      returnVersionStartDate: '2023-02-13',
      startDateOptions: 'licenceStartDate'
    }

    generatedReturnVersionData = {
      returnRequirements: [
        {
          abstractionPeriodStartDay: '1',
          abstractionPeriodStartMonth: '4',
          abstractionPeriodEndDay: '31',
          abstractionPeriodEndMonth: '3',
          collectionFrequency: 'week',
          fiftySixException: false,
          gravityFill: false,
          points: ['796f83bb-d50d-446f-bc47-28daff6bcb78'],
          reabstraction: false,
          reportingFrequency: 'month',
          returnsFrequency: 'year',
          returnRequirementPurposes: [
            {
              alias: null,
              primaryPurposeId: 'c6fd4b2a-82b5-42b0-a98a-087ba52f9a4f',
              purposeId: 'ff7cecd5-96ef-4625-b232-54ef7e50ab8e',
              secondaryPurposeId: '0a80d135-9bd4-40ec-90ff-f4a365ccac3f'
            }
          ],
          siteDescription: 'Site Number One',
          summer: false,
          twoPartTariff: false
        }
      ],
      returnVersion: {
        createdBy: userId,
        endDate: null,
        licenceId: sessionData.licence.id,
        multipleUpload: sessionData.multipleUpload,
        notes: undefined,
        quarterlyReturns: sessionData.quarterlyReturns,
        reason: sessionData.reason,
        startDate: new Date(sessionData.returnVersionStartDate),
        status: 'current',
        version: 1
      }
    }

    vi.spyOn(ProcessExistingReturnVersionsService, 'default').mockResolvedValue()
    vi.spyOn(VoidReturnLogsService, 'default').mockResolvedValue()
    vi.spyOn(UpdateSucceededReturnLogsDal, 'default').mockResolvedValue()

    vi.spyOn(DeleteSessionDal, 'default').mockResolvedValue()

    // BaseRequest depends on the GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
  })

  describe('when called to create a new return version', () => {
    beforeEach(() => {
      session = SessionModelStub(sessionData)
      vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

      vi.spyOn(GenerateReturnVersionService, 'default').mockResolvedValue(generatedReturnVersionData)

      vi.spyOn(CreateReturnVersionService, 'default').mockResolvedValue({
        ...generatedReturnVersionData.returnVersion,
        id: '3c87ff18-5930-480d-9a64-07a7c7b1fcae'
      })

      vi.spyOn(ProcessLicenceReturnLogsService, 'default').mockResolvedValue()
    })

    it('creates the new return version and associated data', async () => {
      await SubmitCheckService(session.id, userId)

      expect(CreateReturnVersionService.default).toHaveBeenCalled()
      expect(CreateReturnVersionService.default.mock.calls[0][0]).toEqual(generatedReturnVersionData)
    })

    it('processes existing return logs for the licence', async () => {
      await SubmitCheckService(session.id, userId)

      expect(ProcessLicenceReturnLogsService.default).toHaveBeenCalled()
      expect(ProcessLicenceReturnLogsService.default.mock.calls[0][0]).toEqual(
        generatedReturnVersionData.returnVersion.licenceId
      )

      // The change date is the new return version start date minus one day
      const expectedChangeDate = new Date(generatedReturnVersionData.returnVersion.startDate)

      expectedChangeDate.setDate(expectedChangeDate.getDate() - 1)

      expect(ProcessLicenceReturnLogsService.default.mock.calls[0][1]).toEqual(expectedChangeDate)
    })

    describe('and the setup journey', () => {
      describe('was "standard"', () => {
        it('does NOT attempt to void all return logs in the period it covers', async () => {
          await SubmitCheckService(session.id, userId)

          expect(VoidReturnLogsService.default).not.toHaveBeenCalled()
        })
      })

      describe('was "no-returns-required"', () => {
        beforeEach(() => {
          sessionData.journey = 'no-returns-required'
          sessionData.reason = 'returns-exception'
          sessionData.requirements = []
          session = SessionModelStub(sessionData)
          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('does attempt to void all return logs in the period it covers', async () => {
          await SubmitCheckService(session.id, userId)

          expect(VoidReturnLogsService.default).toHaveBeenCalled()
          expect(VoidReturnLogsService.default.mock.calls[0][0]).toEqual(sessionData.licence.licenceRef)
          expect(VoidReturnLogsService.default.mock.calls[0][1]).toEqual(
            generatedReturnVersionData.returnVersion.startDate
          )
          expect(VoidReturnLogsService.default.mock.calls[0][2]).toEqual(
            generatedReturnVersionData.returnVersion.endDate
          )
        })
      })
    })

    describe('and it is the first return version for the licence', () => {
      it('skips processing existing return versions', async () => {
        await SubmitCheckService(session.id, userId)

        expect(ProcessExistingReturnVersionsService.default).not.toHaveBeenCalled()
      })
    })

    describe('and it is NOT the first return version for the licence', () => {
      beforeEach(() => {
        generatedReturnVersionData.returnVersion.version = 2
        vi.spyOn(GenerateReturnVersionService, 'default').mockResolvedValue(generatedReturnVersionData)

        vi.spyOn(CreateReturnVersionService, 'default').mockResolvedValue({
          ...generatedReturnVersionData.returnVersion,
          id: '3c87ff18-5930-480d-9a64-07a7c7b1fcae'
        })
      })

      it('processes existing return versions impacted by the new return version', async () => {
        await SubmitCheckService(session.id, userId)

        expect(ProcessExistingReturnVersionsService.default).toHaveBeenCalled()
        expect(ProcessExistingReturnVersionsService.default.mock.calls[0][0]).toEqual(
          generatedReturnVersionData.returnVersion.licenceId
        )
        expect(ProcessExistingReturnVersionsService.default.mock.calls[0][1]).toEqual(
          generatedReturnVersionData.returnVersion.startDate
        )
      })
    })

    describe("and the new return version's reason", () => {
      describe('is NOT "succession-or-transfer-of-licence"', () => {
        it('does NOT update the existing return logs as succeeded', async () => {
          await SubmitCheckService(session.id, userId)

          expect(UpdateSucceededReturnLogsDal.default).not.toHaveBeenCalled()
        })
      })

      describe('is "succession-or-transfer-of-licence"', () => {
        beforeEach(() => {
          sessionData.reason = 'succession-or-transfer-of-licence'
          session = SessionModelStub(sessionData)
          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

          generatedReturnVersionData.returnVersion.reason = 'succession-or-transfer-of-licence'
          vi.spyOn(GenerateReturnVersionService, 'default').mockResolvedValue(generatedReturnVersionData)

          vi.spyOn(CreateReturnVersionService, 'default').mockResolvedValue({
            ...generatedReturnVersionData.returnVersion,
            id: '3c87ff18-5930-480d-9a64-07a7c7b1fcae'
          })
        })

        it('updates the existing return logs as succeeded', async () => {
          await SubmitCheckService(session.id, userId)

          expect(UpdateSucceededReturnLogsDal.default).toHaveBeenCalled()
          expect(UpdateSucceededReturnLogsDal.default.mock.calls[0][0]).toEqual(sessionData.licence.licenceRef)
        })
      })
    })

    describe('but the service errors', () => {
      beforeEach(() => {
        vi.spyOn(ProcessLicenceReturnLogsService, 'default').mockRejectedValue(new Error())
      })

      it('logs the error and rethrows it', async () => {
        await expect(SubmitCheckService(session.id, userId)).rejects.toThrow()

        const args = notifierStub.omfg.mock.calls[0]

        expect(args[0]).toEqual('Failed to create return version')
        expect(args[1]).toEqual(session)
        expect(args[2]).toBeInstanceOf(Error)
      })
    })
  })
})
