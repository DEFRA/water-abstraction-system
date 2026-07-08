// Test framework dependencies

// Test helpers
import * as ReturnLogHelper from '../../../support/helpers/return-log.helper.js'
import * as ReturnSubmissionHelper from '../../../support/helpers/return-submission.helper.js'
import * as ReturnSubmissionLineHelper from '../../../support/helpers/return-submission-line.helper.js'

// Things we need to stub
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'

// Thing under test
import FetchReturnLogsForLicenceService from '../../../../app/services/bill-runs/match/fetch-return-logs-for-licence.service.js'

describe('Fetch Return Logs for Licence service', () => {
  const billingPeriod = { startDate: new Date('2022-04-01'), endDate: new Date('2023-03-31') }

  let notifierStub
  let returnLogRecord

  beforeEach(() => {
    // This depends on the GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
  })

  describe('when there are valid return logs that should be considered', () => {
    beforeEach(async () => {
      returnLogRecord = await ReturnLogHelper.add({ metadata: _metadata(true) })
    })

    describe('which have return submission lines within the billing period', () => {
      beforeEach(async () => {
        const { id: returnSubmissionId } = await ReturnSubmissionHelper.add({ returnLogId: returnLogRecord.id })

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
        const result = await FetchReturnLogsForLicenceService(licenceRef, billingPeriod)

        expect(result).toHaveLength(1)
        expect(result[0].id).toEqual(returnLogRecord.id)
        expect(result[0].returnId).toEqual(returnLogRecord.returnId)
        expect(result[0].description).toEqual('The Description')
        expect(result[0].startDate).toEqual(new Date('2022-04-01'))
        expect(result[0].endDate).toEqual(new Date('2023-03-31'))
        expect(result[0].periodStartDay).toEqual(1)
        expect(result[0].periodStartMonth).toEqual(4)
        expect(result[0].periodEndDay).toEqual(31)
        expect(result[0].periodEndMonth).toEqual(3)

        expect(result[0].purposes).toHaveLength(1)
        expect(result[0].purposes[0].tertiary.code).toEqual('400')
        expect(result[0].purposes[0].tertiary.description).toEqual('Spray Irrigation - Direct')

        expect(result[0].returnSubmissions).toHaveLength(1)
        expect(result[0].returnSubmissions[0].nilReturn).toEqual(false)

        expect(result[0].returnSubmissions[0].returnSubmissionLines).toHaveLength(2)
        expect(result[0].returnSubmissions[0].returnSubmissionLines[0].startDate).toEqual(new Date('2022-05-01'))
        expect(result[0].returnSubmissions[0].returnSubmissionLines[0].endDate).toEqual(new Date('2022-05-07'))
        expect(result[0].returnSubmissions[0].returnSubmissionLines[0].quantity).toEqual(1234)
        expect(result[0].returnSubmissions[0].returnSubmissionLines[1].startDate).toEqual(new Date('2022-05-08'))
        expect(result[0].returnSubmissions[0].returnSubmissionLines[1].endDate).toEqual(new Date('2022-05-14'))
        expect(result[0].returnSubmissions[0].returnSubmissionLines[1].quantity).toEqual(5678)
      })
    })

    describe('which have NO return submission lines within the billing period', () => {
      beforeEach(async () => {
        const { id: returnSubmissionId } = await ReturnSubmissionHelper.add({ returnLogId: returnLogRecord.id })

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
        const result = await FetchReturnLogsForLicenceService(licenceRef, billingPeriod)

        expect(result).toHaveLength(1)

        expect(result[0].returnSubmissions[0].returnSubmissionLines).toHaveLength(0)
      })
    })

    describe('which is a nil return', () => {
      beforeEach(async () => {
        await ReturnSubmissionHelper.add({ returnLogId: returnLogRecord.id, nilReturn: true })
      })

      it('returns the return log with "nilreturn" set to "true" and no return submission lines', async () => {
        const { licenceRef } = returnLogRecord
        const result = await FetchReturnLogsForLicenceService(licenceRef, billingPeriod)

        expect(result).toHaveLength(1)

        expect(result[0].returnSubmissions).toHaveLength(1)
        expect(result[0].returnSubmissions[0].nilReturn).toEqual(true)

        expect(result[0].returnSubmissions[0].returnSubmissionLines).toHaveLength(0)
      })
    })

    describe('where the return logs start date is outside the billing period but the end date is inside', () => {
      beforeEach(async () => {
        await ReturnLogHelper.add({
          startDate: new Date('2022-01-01'),
          endDate: new Date('2022-12-31')
        })
        await ReturnSubmissionHelper.add({ returnLogId: returnLogRecord.id })
      })

      it('returns the return log and return submission lines that are applicable', async () => {
        const { licenceRef } = returnLogRecord
        const result = await FetchReturnLogsForLicenceService(licenceRef, billingPeriod)

        expect(result).toHaveLength(1)
        expect(result[0].id).toEqual(returnLogRecord.id)
        expect(result[0].description).toEqual('The Description')
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
        await ReturnSubmissionHelper.add({ returnLogId: returnLogRecord.id })
      })

      it('returns no records', async () => {
        const { licenceRef } = returnLogRecord
        const result = await FetchReturnLogsForLicenceService(licenceRef, billingPeriod)

        expect(result).toHaveLength(0)
      })
    })

    describe('because the return logs start date is inside the billing period but end date is outside', () => {
      beforeEach(async () => {
        returnLogRecord = await ReturnLogHelper.add({
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31')
        })
        await ReturnSubmissionHelper.add({ returnLogId: returnLogRecord.id })
      })

      it('returns no records', async () => {
        const { licenceRef } = returnLogRecord
        const result = await FetchReturnLogsForLicenceService(licenceRef, billingPeriod)

        expect(result).toHaveLength(0)
      })
    })

    describe('because the return log is not two-part-tariff', () => {
      beforeEach(async () => {
        returnLogRecord = await ReturnLogHelper.add({ metadata: _metadata(false) })

        await ReturnSubmissionHelper.add({ returnLogId: returnLogRecord.id })
      })

      it('returns no records', async () => {
        const { licenceRef } = returnLogRecord
        const result = await FetchReturnLogsForLicenceService(licenceRef, billingPeriod)

        expect(result).toHaveLength(0)
      })
    })

    describe('because there are no return logs', () => {
      it('returns no records', async () => {
        const result = await FetchReturnLogsForLicenceService('LicenceRefWithNoReturnLogs', billingPeriod)

        expect(result).toHaveLength(0)
      })
    })

    describe('because the return is void', () => {
      beforeEach(async () => {
        returnLogRecord = await ReturnLogHelper.add({ metadata: _metadata(true), status: 'void' })

        await ReturnSubmissionHelper.add({ returnLogId: returnLogRecord.id })
      })

      it('returns no records', async () => {
        const { licenceRef } = returnLogRecord
        const result = await FetchReturnLogsForLicenceService(licenceRef, billingPeriod)

        expect(result).toHaveLength(0)
      })
    })
  })

  // NOTE: Added after we had a bill run error because a licence was linked to a return log where the abstraction period
  // data was all set to "null". It was set like this because the period had not been set against the return requirement
  // the return log was generated from.
  describe('when fetch errors because the return log is missing abstraction data', () => {
    beforeEach(async () => {
      const metadata = _metadata(true)
      metadata.nald.periodEndDay = 'null'
      metadata.nald.periodEndMonth = 'null'
      metadata.nald.periodStartDay = 'null'
      metadata.nald.periodStartMonth = 'null'

      returnLogRecord = await ReturnLogHelper.add({ metadata })
    })

    it('logs and records the error then rethrows it', async () => {
      const { licenceRef } = returnLogRecord

      await expect(FetchReturnLogsForLicenceService(licenceRef, billingPeriod)).rejects.toThrow()

      const logDataArg = notifierStub.omfg.mock.calls[0][1]

      expect(notifierStub.omfg).toHaveBeenCalledWith('Bill run process fetch return logs for licence failed', expect.any(Object))
      expect(logDataArg).toEqual({ licenceRef, billingPeriod })
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
