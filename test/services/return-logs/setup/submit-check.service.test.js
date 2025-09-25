'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../../../app/models/return-log.model.js')
const ReturnSubmissionHelper = require('../../../support/helpers/return-submission.helper.js')
const SessionModel = require('../../../../app/models/session.model.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')
const UserHelper = require('../../../support/helpers/user.helper.js')

// Things we need to stub
const CreateReturnLinesService = require('../../../../app/services/return-logs/setup/create-return-lines.service.js')
const CreateReturnSubmissionService = require('../../../../app/services/return-logs/setup/create-return-submission.service.js')
const GenerateReturnSubmissionMetadata = require('../../../../app/services/return-logs/setup/generate-return-submission-metadata.service.js')

// Thing under test
const SubmitCheckService = require('../../../../app/services/return-logs/setup/submit-check.service.js')

describe('Return Logs Setup - Submit Check service', () => {
  let licence
  let returnLog
  let session
  let sessionData
  let user

  let generateReturnSubmissionMetadataStub
  let createReturnSubmissionServiceStub
  let createReturnLinesServiceStub

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
      data: {
        licenceId: licence.id,
        licenceRef: licence.licenceRef,
        purposes: ['test purpose'],
        reported: 'abstraction-volumes',
        returnReference: returnLog.returnReference,
        returnLogId: returnLog.id,
        returnSubmissionId: initialReturnSubmission.id,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        receivedDate: '2024-01-01',
        journey: 'enter-return',
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
        units: 'cubic-metres',
        meterProvided: false
      }
    }

    generateReturnSubmissionMetadataStub = Sinon.stub(GenerateReturnSubmissionMetadata, 'go').returns(
      mockGeneratedMetadata
    )

    createReturnSubmissionServiceStub = Sinon.stub(CreateReturnSubmissionService, 'go').resolves({
      id: mockNewReturnSubmissionId
    })

    createReturnLinesServiceStub = Sinon.stub(CreateReturnLinesService, 'go').resolves([])
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with valid data', () => {
    beforeEach(async () => {
      session = await SessionHelper.add(sessionData)
    })

    it('updates the return log status to completed', async () => {
      await SubmitCheckService.go(session.id, user)

      const updatedReturnLog = await ReturnLogModel.query().findById(returnLog.id)
      expect(updatedReturnLog.status).to.equal('completed')
    })

    it('updates the return log received date', async () => {
      await SubmitCheckService.go(session.id, user)

      const updatedReturnLog = await ReturnLogModel.query().findById(returnLog.id)
      expect(updatedReturnLog.receivedDate).to.equal(new Date('2024-01-01'))
    })

    it('updates the return log updatedAt date', async () => {
      await SubmitCheckService.go(session.id, user)

      const updatedReturnLog = await ReturnLogModel.query().findById(returnLog.id)
      expect(updatedReturnLog.updatedAt).to.not.equal(returnLog.updatedAt)
    })

    it('calls CreateReturnSubmissionService with correct parameters', async () => {
      it('deletes the session', async () => {
        await SubmitCheckService.go(session.id, user)

        const deletedSession = await SessionModel.query().findById(session.id)
        expect(deletedSession).to.not.exist()
      })

      it('generates metadata for the return submission', async () => {
        await SubmitCheckService.go(session.id, user)

        const callArgs = generateReturnSubmissionMetadataStub.firstCall.args
        expect(callArgs[0]).to.be.an.instanceOf(SessionModel)
      })

      it('calls CreateReturnSubmissionService with correct parameters', async () => {
        await SubmitCheckService.go(session.id, user)

        const callArgs = createReturnSubmissionServiceStub.firstCall.args
        expect(callArgs[0]).to.equal(returnLog.id)
        expect(callArgs[1]).to.equal(user.username)
        expect(callArgs[2]).to.equal(mockGeneratedMetadata)
        expect(callArgs[3]).to.equal(sessionData.data.journey === 'nil-return')
      })

      it('calls CreateReturnLinesService with correct parameters', async () => {
        await SubmitCheckService.go(session.id, user)

        const callArgs = createReturnLinesServiceStub.firstCall.args
        expect(callArgs[0]).to.equal(sessionData.data.lines)
        expect(callArgs[1]).to.equal(mockNewReturnSubmissionId)
        expect(callArgs[2]).to.equal(sessionData.data.returnsFrequency)
        expect(callArgs[3]).to.equal(sessionData.data.units)
        expect(callArgs[4]).to.equal(sessionData.data.meterProvided)
      })

      it('returns the original returnLogId', async () => {
        const result = await SubmitCheckService.go(session.id, user)

        expect(result).to.equal(returnLog.id)
      })
    })
  })

  describe('when called with invalid data as the total quantity is 0', () => {
    beforeEach(async () => {
      sessionData.data.lines = [
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

      session = await SessionHelper.add(sessionData)
    })

    it('returns the page data including a validation error', async () => {
      const result = await SubmitCheckService.go(session.id, user)

      expect(result).to.equal({
        abstractionPeriod: null,
        activeNavBar: 'search',
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
