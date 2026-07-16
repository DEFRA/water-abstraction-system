// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import LicenceHelper from '../../../support/helpers/licence.helper.js'
import ReturnLogHelper from '../../../support/helpers/return-log.helper.js'
import ReturnLogModel from '../../../../app/models/return-log.model.js'
import ReturnSubmissionHelper from '../../../support/helpers/return-submission.helper.js'
import SessionModel from '../../../../app/models/session.model.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'
import UserHelper from '../../../support/helpers/user.helper.js'

// Things we need to stub
import * as CreateReturnLinesService from '../../../../app/services/return-logs/setup/create-return-lines.service.js'
import * as CreateReturnSubmissionService from '../../../../app/services/return-logs/setup/create-return-submission.service.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'
import * as GenerateReturnSubmissionMetadata from '../../../../app/services/return-logs/setup/generate-return-submission-metadata.service.js'

// Thing under test
import SubmitCheckService from '../../../../app/services/return-logs/setup/submit-check.service.js'

describe('Return Logs Setup - Submit Check service', () => {
  let licence
  let returnLog
  let session
  let sessionData
  let user
  const mockGeneratedMetadata = {
    generated: 'metadata',
    source: 'test-stub'
  }

  const mockNewReturnSubmissionId = 'new-submission-id-from-stub'

  beforeEach(async () => {
    user = await UserHelper.add()
    licence = await LicenceHelper.add()
    returnLog = await ReturnLogHelper.add({
      licenceRef: licence.licenceRef,
      status: 'due'
    })

    const initialReturnSubmission = await ReturnSubmissionHelper.add({
      returnLogId: returnLog.id
    })

    sessionData = {
      licenceId: licence.id,
      licenceRef: licence.licenceRef,
      purposes: ['test purpose'],
      reported: 'abstractionVolumes',
      returnId: returnLog.returnId,
      returnReference: returnLog.returnReference,
      returnLogId: returnLog.id,
      returnSubmissionId: initialReturnSubmission.id,
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      receivedDate: '2024-01-01',
      journey: 'enterReturn',
      lines: [
        {
          startDate: '2023-01-01T00:00:00.000Z',
          endDate: '2023-01-31T00:00:00.000Z',
          quantity: 100,
          reading: null
        },
        {
          startDate: '2023-02-01T00:00:00.000Z',
          endDate: '2023-02-28T00:00:00.000Z',
          quantity: 200,
          reading: null
        }
      ],
      returnsFrequency: 'month',
      units: 'cubicMetres',
      unitSymbol: 'm³',
      meterProvided: false
    }

    vi.spyOn(GenerateReturnSubmissionMetadata, 'default').mockReturnValue(mockGeneratedMetadata)

    vi.spyOn(CreateReturnSubmissionService, 'default').mockResolvedValue({
      id: mockNewReturnSubmissionId
    })

    vi.spyOn(CreateReturnLinesService, 'default').mockResolvedValue([])

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called with valid data', () => {
    it('updates the return log status to completed', async () => {
      await SubmitCheckService(session.id, user)

      const updatedReturnLog = await ReturnLogModel.query().findById(returnLog.id)
      expect(updatedReturnLog.status).toEqual('completed')
    })

    it('updates the return log received date', async () => {
      await SubmitCheckService(session.id, user)

      const updatedReturnLog = await ReturnLogModel.query().findById(returnLog.id)
      expect(updatedReturnLog.receivedDate).toEqual(new Date('2024-01-01'))
    })

    it('updates the return log updatedAt date', async () => {
      await SubmitCheckService(session.id, user)

      const updatedReturnLog = await ReturnLogModel.query().findById(returnLog.id)
      expect(updatedReturnLog.updatedAt).not.toEqual(returnLog.updatedAt)
    })

    it('deletes the session', async () => {
      await SubmitCheckService(session.id, user)

      const deletedSession = await SessionModel.query().findById(session.id)
      expect(deletedSession).toBeUndefined()
    })

    it('generates metadata for the return submission', async () => {
      await SubmitCheckService(session.id, user)

      const callArgs = GenerateReturnSubmissionMetadata.default.mock.calls[0]
      expect(callArgs[0]).toBeInstanceOf(SessionModel)
    })

    it('calls CreateReturnSubmissionService with correct parameters', async () => {
      await SubmitCheckService(session.id, user)

      const callArgs = CreateReturnSubmissionService.default.mock.calls[0]
      expect(callArgs[0]).toEqual(mockGeneratedMetadata)
      expect(callArgs[1]).toBeInstanceOf(SessionModel)
      expect(callArgs[3]).toEqual(user)
    })

    it('calls CreateReturnLinesService with correct parameters', async () => {
      await SubmitCheckService(session.id, user)

      const callArgs = CreateReturnLinesService.default.mock.calls[0]
      expect(callArgs[0]).toEqual(mockNewReturnSubmissionId)
      expect(callArgs[1]).toBeInstanceOf(SessionModel)
    })

    it('returns the original returnLogId', async () => {
      const result = await SubmitCheckService(session.id, user)

      expect(result).toEqual({ returnLogId: returnLog.id })
    })

    describe('and it is a nil return', () => {
      beforeEach(() => {
        sessionData.journey = 'nilReturn'
        sessionData.lines = [
          {
            startDate: '2023-01-01T00:00:00.000Z',
            endDate: '2023-01-31T00:00:00.000Z',
            quantity: null,
            reading: null
          },
          {
            startDate: '2023-02-01T00:00:00.000Z',
            endDate: '2023-02-28T00:00:00.000Z'
          }
        ]

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('returns the original returnLogId', async () => {
        const result = await SubmitCheckService(session.id, user)

        expect(result).toEqual({ returnLogId: returnLog.id })
      })
    })
  })

  describe('when called with invalid data as the lines are blank', () => {
    beforeEach(() => {
      sessionData.lines = [
        {
          startDate: '2023-01-01T00:00:00.000Z',
          endDate: '2023-01-31T00:00:00.000Z',
          quantity: null,
          reading: null
        },
        {
          startDate: '2023-02-01T00:00:00.000Z',
          endDate: '2023-02-28T00:00:00.000Z'
        }
      ]

      session = SessionModelStub(sessionData)

      vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
    })

    it('returns the page data including a validation error', async () => {
      const result = await SubmitCheckService(session.id, user)

      expect(result).toEqual({
        abstractionPeriod: null,
        displayReadings: false,
        displayUnits: false,
        enterMultipleLinkText: 'Enter multiple monthly volumes',
        error: {
          errorList: [
            {
              text: 'At least one return line must contain a value.'
            }
          ]
        },
        links: {
          cancel: `/system/return-logs/setup/${session.id}/cancel`,
          meterDetails: `/system/return-logs/setup/${session.id}/meter-provided`,
          multipleEntries: `/system/return-logs/setup/${session.id}/multiple-entries`,
          nilReturn: `/system/return-logs/setup/${session.id}/submission`,
          received: `/system/return-logs/setup/${session.id}/received`,
          reported: `/system/return-logs/setup/${session.id}/reported`,
          startReading: `/system/return-logs/setup/${session.id}/start-reading`,
          units: `/system/return-logs/setup/${session.id}/units`
        },
        meter10TimesDisplay: undefined,
        meterMake: undefined,
        meterProvided: false,
        meterSerialNumber: undefined,
        nilReturn: 'No',
        note: {
          actions: [{ text: 'Add a note', href: 'note' }],
          text: 'No notes added'
        },
        pageTitle: 'Check details and enter new volumes or readings',
        pageTitleCaption: `Return reference ${returnLog.returnReference}`,
        purposes: 'test purpose',
        reportingFigures: 'Volumes',
        returnPeriod: '1 January 2023 to 31 December 2023',
        returnReceivedDate: '1 January 2024',
        siteDescription: undefined,
        startReading: undefined,
        summaryTableData: {
          headers: [
            { text: 'Month' },
            { text: 'Cubic metres', format: 'numeric' },
            { text: 'Details', format: 'numeric' }
          ],
          rows: [
            {
              link: {
                href: `/system/return-logs/setup/${session.id}/volumes/2023-0`,
                text: 'Enter monthly volumes'
              },
              month: 'January 2023',
              monthlyTotal: null,
              unitTotal: null
            },
            {
              link: {
                href: `/system/return-logs/setup/${session.id}/volumes/2023-1`,
                text: 'Enter monthly volumes'
              },
              month: 'February 2023',
              monthlyTotal: null,
              unitTotal: null
            }
          ]
        },
        tableTitle: 'Summary of monthly volumes',
        tariff: 'Standard',
        totalCubicMetres: '0',
        totalQuantity: '0',
        units: 'Cubic metres'
      })
    })
  })
})
