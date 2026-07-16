// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import * as ReturnLogsFixture from '../../support/fixtures/return-logs.fixture.js'
import { formatDateObjectToISO } from '../../../app/lib/dates.lib.js'

// Things we need to stub
import * as FetchDownloadReturnLogService from '../../../app/services/return-logs/fetch-download-return-log.service.js'

// Thing under test
import DownloadReturnLogService from '../../../app/services/return-logs/download-return-log.service.js'

describe('Return Logs - Download Return Log Service', () => {
  let returnLog

  beforeEach(() => {
    returnLog = ReturnLogsFixture.returnLog('month')
    returnLog.returnSubmissions = [ReturnLogsFixture.returnSubmission(returnLog, 'estimated')]

    vi.spyOn(FetchDownloadReturnLogService, 'default').mockResolvedValue(returnLog)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('correctly returns the csv string, filename and type', async () => {
    const result = await DownloadReturnLogService(returnLog.id)

    const { endDate, returnReference, returnSubmissions, startDate } = returnLog

    const expectedData = returnSubmissions[0].returnSubmissionLines.reduce((acc, line) => {
      const { quantity, endDate } = line

      return `${acc}${formatDateObjectToISO(endDate)},,${quantity}\n`
    }, 'end date,reading,volume\n')

    const expectedFilename = `${returnReference}_${formatDateObjectToISO(startDate)}_${formatDateObjectToISO(endDate)}_v${returnSubmissions[0].version}.csv`

    expect(result).toEqual({
      data: expectedData,
      filename: expectedFilename,
      type: 'text/csv'
    })
  })
})
