'use strict'

// Test framework dependencies
const { describe, it, beforeEach, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../../../support/database.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const ReturnSubmissionHelper = require('../../../support/helpers/return-submission.helper.js')
const ReturnSubmissionLineHelper = require('../../../support/helpers/return-submission-line.helper.js')

// Thing under test
const FetchReturnLogsForLicenceService = require('../../../../app/services/bill-runs/match/fetch-return-logs-for-licence.service.js')

describe('Fetch Return Logs for Licence service', () => {
  const billingPeriod = { startDate: new Date('2022-04-01'), endDate: new Date('2023-03-31') }

  let returnLogRecord

  after(async () => {
    await closeConnection()
  })

  describe('when there are valid return logs that should be considered', () => {
    beforeEach(async () => {
      returnLogRecord = await ReturnLogHelper.add({ metadata: _metadata(true) })
    })

    describe('which have return submission lines within the billing period', () => {
      beforeEach(async () => {
        const { id } = returnLogRecord
        const { id: returnSubmissionId } = await ReturnSubmissionHelper.add({ returnLogId: id })

        await ReturnSubmissionLineHelper.add({
          returnSubmissionId,
          startDate: new Date('2022-05-01'),
          endDate: new Date('2022-05-07'),
          quantity: 1234
        })
        await ReturnSubmissionLineHelper.add({
          returnSubmissionId,
          startDate: new Date('2022-05-08'),
          endDate: new Date('2022-05-14'),
          quantity: 5678
        })
      })

      it('returns the return log and return submission lines that are applicable', async () => {
        const { licenceRef } = returnLogRecord
        const result = await FetchReturnLogsForLicenceService.go(licenceRef, billingPeriod)

        expect(result).to.have.length(1)
        expect(result[0].id).to.equal(returnLogRecord.id)
        expect(result[0].description).to.equal('The Description')
        expect(result[0].startDate).to.equal(new Date('2022-04-01'))
        expect(result[0].endDate).to.equal(new Date('2023-03-31'))
        expect(result[0].periodStartDay).to.equal(1)
        expect(result[0].periodStartMonth).to.equal(4)
        expect(result[0].periodEndDay).to.equal(31)
        expect(result[0].periodEndMonth).to.equal(3)

        expect(result[0].purposes).to.have.length(1)
        expect(result[0].purposes[0].tertiary.code).to.equal('400')
        expect(result[0].purposes[0].tertiary.description).to.equal('Spray Irrigation - Direct')

        expect(result[0].returnSubmissions).to.have.length(1)
        expect(result[0].returnSubmissions[0].nilReturn).to.equal(false)

        expect(result[0].returnSubmissions[0].returnSubmissionLines).to.have.length(2)
        expect(result[0].returnSubmissions[0].returnSubmissionLines[0].startDate).to.equal(new Date('2022-05-01'))
        expect(result[0].returnSubmissions[0].returnSubmissionLines[0].endDate).to.equal(new Date('2022-05-07'))
        expect(result[0].returnSubmissions[0].returnSubmissionLines[0].quantity).to.equal(1234)
        expect(result[0].returnSubmissions[0].returnSubmissionLines[1].startDate).to.equal(new Date('2022-05-08'))
        expect(result[0].returnSubmissions[0].returnSubmissionLines[1].endDate).to.equal(new Date('2022-05-14'))
        expect(result[0].returnSubmissions[0].returnSubmissionLines[1].quantity).to.equal(5678)
      })
    })

    describe('which have NO return submission lines within the billing period', () => {
      beforeEach(async () => {
        const { id } = returnLogRecord
        const { id: returnSubmissionId } = await ReturnSubmissionHelper.add({ returnLogId: id })

        await ReturnSubmissionLineHelper.add({
          returnSubmissionId,
          startDate: new Date('2023-05-01'),
          endDate: new Date('2023-05-07'),
          quantity: 1234
        })
        await ReturnSubmissionLineHelper.add({
          returnSubmissionId,
          startDate: new Date('2023-05-08'),
          endDate: new Date('2023-05-14'),
          quantity: 5678
        })
      })

      it('returns the return log with no return submission lines', async () => {
        const { licenceRef } = returnLogRecord
        const result = await FetchReturnLogsForLicenceService.go(licenceRef, billingPeriod)

        expect(result).to.have.length(1)

        expect(result[0].returnSubmissions[0].returnSubmissionLines).to.have.length(0)
      })
    })

    describe('which is a nil return', () => {
      beforeEach(async () => {
        const { id } = returnLogRecord

        await ReturnSubmissionHelper.add({ returnLogId: id, nilReturn: true })
      })

      it('returns the return log with "nilreturn" set to "true" and no return submission lines', async () => {
        const { licenceRef } = returnLogRecord
        const result = await FetchReturnLogsForLicenceService.go(licenceRef, billingPeriod)

        expect(result).to.have.length(1)

        expect(result[0].returnSubmissions).to.have.length(1)
        expect(result[0].returnSubmissions[0].nilReturn).to.equal(true)

        expect(result[0].returnSubmissions[0].returnSubmissionLines).to.have.length(0)
      })
    })

    describe('where the return logs start date is outside the billing period but the end date is inside', () => {
      beforeEach(async () => {
        await ReturnLogHelper.add({
          startDate: new Date('2022-01-01'),
          endDate: new Date('2022-12-31')
        })
        const { id } = returnLogRecord

        await ReturnSubmissionHelper.add({ returnLogId: id })
      })

      it('returns the return log and return submission lines that are applicable', async () => {
        const { licenceRef } = returnLogRecord
        const result = await FetchReturnLogsForLicenceService.go(licenceRef, billingPeriod)

        expect(result).to.have.length(1)
        expect(result[0].id).to.equal(returnLogRecord.id)
        expect(result[0].description).to.equal('The Description')
      })
    })
  })

  describe('when there are NO valid return logs that should be considered', () => {
    describe('because the return log is fully outside the billing period', () => {
      beforeEach(async () => {
        returnLogRecord = await ReturnLogHelper.add({
          startDate: new Date('2023-04-01'),
          endDate: new Date('2024-03-31')
        })
        const { id } = returnLogRecord

        await ReturnSubmissionHelper.add({ returnLogId: id })
      })

      it('returns no records', async () => {
        const { licenceRef } = returnLogRecord
        const result = await FetchReturnLogsForLicenceService.go(licenceRef, billingPeriod)

        expect(result).to.have.length(0)
      })
    })

    describe('because the return logs start date is inside the billing period but end date is outside', () => {
      beforeEach(async () => {
        returnLogRecord = await ReturnLogHelper.add({
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31')
        })
        const { id } = returnLogRecord

        await ReturnSubmissionHelper.add({ returnLogId: id })
      })

      it('returns no records', async () => {
        const { licenceRef } = returnLogRecord
        const result = await FetchReturnLogsForLicenceService.go(licenceRef, billingPeriod)

        expect(result).to.have.length(0)
      })
    })

    describe('because the return log is not two-part-tariff', () => {
      beforeEach(async () => {
        returnLogRecord = await ReturnLogHelper.add({ metadata: _metadata(false) })
        const { id } = returnLogRecord

        await ReturnSubmissionHelper.add({ returnLogId: id })
      })

      it('returns no records', async () => {
        const { licenceRef } = returnLogRecord
        const result = await FetchReturnLogsForLicenceService.go(licenceRef, billingPeriod)

        expect(result).to.have.length(0)
      })
    })

    describe('because there are no return logs', () => {
      it('returns no records', async () => {
        const result = await FetchReturnLogsForLicenceService.go('LicenceRefWithNoReturnLogs', billingPeriod)

        expect(result).to.have.length(0)
      })
    })

    describe('because the return is void', () => {
      beforeEach(async () => {
        returnLogRecord = await ReturnLogHelper.add({ metadata: _metadata(true), status: 'void' })
        const { id } = returnLogRecord

        await ReturnSubmissionHelper.add({ returnLogId: id })
      })

      it('returns no records', async () => {
        const { licenceRef } = returnLogRecord
        const result = await FetchReturnLogsForLicenceService.go(licenceRef, billingPeriod)

        expect(result).to.have.length(0)
      })
    })
  })
})

function _metadata(isTwoPartTariff) {
  return {
    nald: {
      periodEndDay: '31',
      periodEndMonth: '3',
      periodStartDay: '1',
      periodStartMonth: '4'
    },
    purposes: [
      {
        tertiary: {
          code: '400',
          description: 'Spray Irrigation - Direct'
        }
      }
    ],
    description: 'The Description',
    isTwoPartTariff
  }
}
