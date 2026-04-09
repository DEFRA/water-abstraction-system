'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')
const ReturnSubmissionHelper = require('../../support/helpers/return-submission.helper.js')
const ReturnSubmissionModel = require('../../../app/models/return-submission.model.js')
const ReturnSubmissionLineHelper = require('../../support/helpers/return-submission-line.helper.js')

// Thing under test
const FetchReturnLogDetailsService = require('../../../app/services/return-logs/fetch-return-log-details.service.js')

describe('Return Logs - Fetch Return Log Details service', () => {
  let licence
  let returnLog
  let returnSubmissions = []
  let version

  before(async () => {
    licence = await LicenceHelper.add()
    returnLog = await ReturnLogHelper.add({ licenceRef: licence.licenceRef })
  })

  beforeEach(async () => {
    // We stub on the model prototype so that any created instances have $applyReadings stubbed. We don't set any return
    // value as we don't need it to actually do anything; we just want to be able to assert that it was called.
    Sinon.stub(ReturnSubmissionModel.prototype, '$applyReadings')
  })

  afterEach(() => {
    Sinon.restore()
  })

  after(async () => {
    for (const returnSubmission of returnSubmissions) {
      for (const returnSubmissionLine of returnSubmission.returnSubmissionLines) {
        await returnSubmissionLine.$query().delete()
      }

      await returnSubmission.$query().delete()
    }

    await returnLog.$query().delete()
    await licence.$query().delete()
  })

  describe('when called', () => {
    describe('and the return log has no submissions', () => {
      it('fetches the matching return log with the linked licence and no submissions', async () => {
        const result = await FetchReturnLogDetailsService.go(returnLog.id)

        expect(result).to.equal({
          dueDate: returnLog.dueDate,
          endDate: returnLog.endDate,
          id: returnLog.id,
          receivedDate: returnLog.receivedDate,
          returnId: returnLog.returnId,
          returnsFrequency: returnLog.returnsFrequency,
          returnReference: returnLog.returnReference,
          startDate: returnLog.startDate,
          status: returnLog.status,
          underQuery: returnLog.underQuery,
          siteDescription: returnLog.metadata.description,
          periodStartDay: returnLog.metadata.nald.periodStartDay,
          periodStartMonth: returnLog.metadata.nald.periodStartMonth,
          periodEndDay: returnLog.metadata.nald.periodEndDay,
          periodEndMonth: returnLog.metadata.nald.periodEndMonth,
          purposes: returnLog.metadata.purposes,
          current: returnLog.metadata.isCurrent,
          twoPartTariff: returnLog.metadata.isTwoPartTariff,
          licence: {
            id: licence.id,
            licenceRef: licence.licenceRef
          },
          versions: []
        })
      })
    })

    describe('and the return log has submissions', () => {
      before(async () => {
        returnSubmissions = await Promise.all([
          ReturnSubmissionHelper.add({ returnLogId: returnLog.id, version: 1, notes: 'NOTES_V1' }),
          ReturnSubmissionHelper.add({ returnLogId: returnLog.id, version: 2, notes: 'NOTES_V2' }),
          ReturnSubmissionHelper.add({ returnLogId: returnLog.id, version: 3, notes: 'NOTES_V3' })
        ])

        returnSubmissions[0].returnSubmissionLines = [
          await ReturnSubmissionLineHelper.add({
            returnSubmissionId: returnSubmissions[0].id,
            startDate: '2023-03-01',
            quantity: 0
          })
        ]
        returnSubmissions[1].returnSubmissionLines = [
          await ReturnSubmissionLineHelper.add({
            returnSubmissionId: returnSubmissions[1].id,
            startDate: '2023-03-01',
            quantity: 1
          })
        ]

        returnSubmissions[2].returnSubmissionLines = [
          await ReturnSubmissionLineHelper.add({
            returnSubmissionId: returnSubmissions[2].id,
            startDate: '2023-03-01',
            quantity: 10
          }),
          await ReturnSubmissionLineHelper.add({
            returnSubmissionId: returnSubmissions[2].id,
            startDate: '2023-01-01',
            quantity: 5
          })
        ]
      })

      it('fetches the matching return log with the linked licence and all submission versions', async () => {
        const result = await FetchReturnLogDetailsService.go(returnLog.id)

        expect(result).to.equal(
          {
            dueDate: returnLog.dueDate,
            endDate: returnLog.endDate,
            id: returnLog.id,
            receivedDate: returnLog.receivedDate,
            returnId: returnLog.returnId,
            returnsFrequency: returnLog.returnsFrequency,
            returnReference: returnLog.returnReference,
            startDate: returnLog.startDate,
            status: returnLog.status,
            underQuery: returnLog.underQuery,
            siteDescription: returnLog.metadata.description,
            periodStartDay: returnLog.metadata.nald.periodStartDay,
            periodStartMonth: returnLog.metadata.nald.periodStartMonth,
            periodEndDay: returnLog.metadata.nald.periodEndDay,
            periodEndMonth: returnLog.metadata.nald.periodEndMonth,
            purposes: returnLog.metadata.purposes,
            current: returnLog.metadata.isCurrent,
            twoPartTariff: returnLog.metadata.isTwoPartTariff,
            licence: {
              id: licence.id,
              licenceRef: licence.licenceRef
            },
            versions: [
              {
                createdAt: returnSubmissions[2].createdAt,
                id: returnSubmissions[2].id,
                notes: returnSubmissions[2].notes,
                userId: returnSubmissions[2].userId,
                version: returnSubmissions[2].version
              },
              {
                createdAt: returnSubmissions[1].createdAt,
                id: returnSubmissions[1].id,
                notes: returnSubmissions[1].notes,
                userId: returnSubmissions[1].userId,
                version: returnSubmissions[1].version
              },
              {
                createdAt: returnSubmissions[0].createdAt,
                id: returnSubmissions[0].id,
                notes: returnSubmissions[0].notes,
                userId: returnSubmissions[0].userId,
                version: returnSubmissions[0].version
              }
            ]
          },
          {
            skip: ['returnSubmissions']
          }
        )
      })

      describe('and when no version is specified', () => {
        it('selects the latest submission', async () => {
          const result = await FetchReturnLogDetailsService.go(returnLog.id)

          expect(result.returnSubmissions).to.equal([
            {
              createdAt: returnSubmissions[2].createdAt,
              id: returnSubmissions[2].id,
              metadata: returnSubmissions[2].metadata,
              nilReturn: returnSubmissions[2].nilReturn,
              returnSubmissionLines: [
                {
                  endDate: returnSubmissions[2].returnSubmissionLines[1].endDate,
                  id: returnSubmissions[2].returnSubmissionLines[1].id,
                  quantity: returnSubmissions[2].returnSubmissionLines[1].quantity,
                  startDate: returnSubmissions[2].returnSubmissionLines[1].startDate,
                  userUnit: returnSubmissions[2].returnSubmissionLines[1].userUnit
                },
                {
                  endDate: returnSubmissions[2].returnSubmissionLines[0].endDate,
                  id: returnSubmissions[2].returnSubmissionLines[0].id,
                  quantity: returnSubmissions[2].returnSubmissionLines[0].quantity,
                  startDate: returnSubmissions[2].returnSubmissionLines[0].startDate,
                  userUnit: returnSubmissions[2].returnSubmissionLines[0].userUnit
                }
              ],
              userId: returnSubmissions[2].userId,
              userType: returnSubmissions[2].userType,
              version: returnSubmissions[2].version
            }
          ])
        })

        it('automatically applies readings to the submission', async () => {
          await FetchReturnLogDetailsService.go(returnLog.id)

          expect(returnSubmissions[2].$applyReadings.calledOnce).to.be.true()
        })
      })

      describe('and when a version is specified', () => {
        beforeEach(() => {
          version = 2
        })

        it('selects the matching submission', async () => {
          const result = await FetchReturnLogDetailsService.go(returnLog.id, version)

          expect(result.returnSubmissions).to.equal([
            {
              createdAt: returnSubmissions[1].createdAt,
              id: returnSubmissions[1].id,
              metadata: returnSubmissions[1].metadata,
              nilReturn: returnSubmissions[1].nilReturn,
              returnSubmissionLines: [
                {
                  endDate: returnSubmissions[1].returnSubmissionLines[0].endDate,
                  id: returnSubmissions[1].returnSubmissionLines[0].id,
                  quantity: returnSubmissions[1].returnSubmissionLines[0].quantity,
                  startDate: returnSubmissions[1].returnSubmissionLines[0].startDate,
                  userUnit: returnSubmissions[1].returnSubmissionLines[0].userUnit
                }
              ],
              userId: returnSubmissions[1].userId,
              userType: returnSubmissions[1].userType,
              version: returnSubmissions[1].version
            }
          ])
        })

        it('automatically applies readings to the submission', async () => {
          await FetchReturnLogDetailsService.go(returnLog.id, version)

          expect(returnSubmissions[1].$applyReadings.calledOnce).to.be.true()
        })
      })
    })
  })
})
