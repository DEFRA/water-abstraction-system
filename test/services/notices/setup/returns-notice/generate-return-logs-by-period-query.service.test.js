'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogHelper = require('../../../../support/helpers/return-log.helper.js')
const { db } = require('../../../../../db/db.js')
const { NoticeType } = require('../../../../../app/lib/static-lookups.lib.js')

// Things we need to stub
const FeatureFlagsConfig = require('../../../../../config/feature-flags.config.js')

// Thing under test
const GenerateReturnLogsByPeriodQueryService = require('../../../../../app/services/notices/setup/returns-notice/generate-return-logs-by-period-query.service.js')

describe('Notices - Setup - Returns Notice - Generate Return Logs By Period Query Service', () => {
  let licencesToExclude
  let noticeType
  let returnLogs
  let returnsPeriod

  beforeEach(() => {
    Sinon.stub(FeatureFlagsConfig, 'enableNullDueDate').value(true)
  })

  afterEach(() => {
    Sinon.restore()
  })

  before(async () => {
    returnsPeriod = {
      dueDate: null,
      endDate: new Date('2025-03-31'),
      quarterly: false,
      startDate: new Date('2024-04-01'),
      summer: 'false'
    }

    returnLogs = []

    // INVITATIONS - due date is null
    // 1st return log has a status of 'due' and is in the period - should be included
    await _addReturnLog(returnLogs, returnsPeriod)
    // 2nd return log has a status of 'due' and is in the period - should be included unless we exclude the licence
    await _addReturnLog(returnLogs, returnsPeriod)

    // REMINDERS - due date is set
    // 3rd return log has a status of 'due' and is in the period - should be included
    await _addReturnLog(returnLogs, returnsPeriod, { dueDate: new Date('2025-04-28') })
    // 4th return log has a status of 'due' and is in the period - should be included unless we exclude the licence
    await _addReturnLog(returnLogs, returnsPeriod, { dueDate: new Date('2025-04-28') })

    // GENERAL - these would be excluded irrespective of notice type, so we stick with null due date for simplicity
    // 5th return log has a status of 'completed' - should NOT be included in results
    await _addReturnLog(returnLogs, returnsPeriod, { status: 'completed' })
    // 6th return log is not current - should NOT be included in results
    await _addReturnLog(returnLogs, returnsPeriod, { isCurrent: false })
    // 7th return log is for the summer cycle - should NOT be included in results
    await _addReturnLog(returnLogs, { ...returnsPeriod, summer: 'true' })
    // 8th return log is quarterly - should NOT be included in results
    await _addReturnLog(returnLogs, { ...returnsPeriod, quarterly: true })
    // 9th return log is not in the period - should NOT be included in results
    await _addReturnLog(returnLogs, { ...returnsPeriod, startDate: new Date('2023-04-01') })
  })

  after(async () => {
    for (const returnLog of returnLogs) {
      await returnLog.$query().delete()
    }
  })

  describe('when called', () => {
    describe('and the notice type is "invitations"', () => {
      before(() => {
        noticeType = NoticeType.INVITATIONS
        licencesToExclude = []
      })

      it('returns the expected query and bindings', () => {
        const result = GenerateReturnLogsByPeriodQueryService.go(noticeType, licencesToExclude, returnsPeriod)

        expect(result).to.equal({
          bindings: [
            returnsPeriod.startDate,
            returnsPeriod.endDate,
            returnsPeriod.summer,
            returnsPeriod.quarterly,
            licencesToExclude
          ],
          query: `
  SELECT
    rl.due_date,
    rl.end_date,
    rl.licence_ref,
    rl.return_id,
    rl.return_reference,
    rl.start_date
  FROM
    public.return_logs rl
  WHERE
    rl.status = 'due'
    AND rl.metadata->>'isCurrent' = 'true'
    AND rl.start_date >= ?
    AND rl.end_date <= ?
    AND rl.metadata->>'isSummer' = ?
    AND rl.quarterly = ?
    AND NOT (rl.licence_ref = ANY (?))
    AND rl.due_date IS NULL
  `
        })
      })
    })

    describe('and the notice type is "reminders"', () => {
      before(() => {
        noticeType = NoticeType.REMINDERS
        licencesToExclude = []
      })

      it('returns the expected query and bindings', () => {
        const result = GenerateReturnLogsByPeriodQueryService.go(noticeType, licencesToExclude, returnsPeriod)

        expect(result).to.equal({
          bindings: [
            returnsPeriod.startDate,
            returnsPeriod.endDate,
            returnsPeriod.summer,
            returnsPeriod.quarterly,
            licencesToExclude
          ],
          query: `
  SELECT
    rl.due_date,
    rl.end_date,
    rl.licence_ref,
    rl.return_id,
    rl.return_reference,
    rl.start_date
  FROM
    public.return_logs rl
  WHERE
    rl.status = 'due'
    AND rl.metadata->>'isCurrent' = 'true'
    AND rl.start_date >= ?
    AND rl.end_date <= ?
    AND rl.metadata->>'isSummer' = ?
    AND rl.quarterly = ?
    AND NOT (rl.licence_ref = ANY (?))
    AND rl.due_date IS NOT NULL
  `
        })
      })
    })
  })

  describe('when executed', () => {
    describe('and the notice type is "invitations"', () => {
      before(() => {
        noticeType = NoticeType.INVITATIONS
      })

      describe('and there are licences to exclude', () => {
        before(() => {
          licencesToExclude = [returnLogs[1].licenceRef]
        })

        it('returns the expected return logs', async () => {
          const { bindings, query } = GenerateReturnLogsByPeriodQueryService.go(
            noticeType,
            licencesToExclude,
            returnsPeriod
          )
          const { rows } = await db.raw(query, bindings)

          expect(rows).to.include(_transformToResult(returnLogs[0]))

          // This matches on all other parameters but the licence is excluded
          expect(rows).not.to.include(_transformToResult(returnLogs[1]))

          expect(rows).not.to.include(_transformToResult(returnLogs[2]))
          expect(rows).not.to.include(_transformToResult(returnLogs[3]))
          expect(rows).not.to.include(_transformToResult(returnLogs[4]))
          expect(rows).not.to.include(_transformToResult(returnLogs[5]))
          expect(rows).not.to.include(_transformToResult(returnLogs[6]))
          expect(rows).not.to.include(_transformToResult(returnLogs[7]))
          expect(rows).not.to.include(_transformToResult(returnLogs[8]))
        })
      })

      describe('and there are NO licences to exclude', () => {
        before(() => {
          licencesToExclude = []
        })

        it('returns the expected return logs', async () => {
          const { bindings, query } = GenerateReturnLogsByPeriodQueryService.go(
            noticeType,
            licencesToExclude,
            returnsPeriod
          )
          const { rows } = await db.raw(query, bindings)

          expect(rows).to.include(_transformToResult(returnLogs[0]))
          expect(rows).to.include(_transformToResult(returnLogs[1]))

          expect(rows).not.to.include(_transformToResult(returnLogs[2]))
          expect(rows).not.to.include(_transformToResult(returnLogs[3]))
          expect(rows).not.to.include(_transformToResult(returnLogs[4]))
          expect(rows).not.to.include(_transformToResult(returnLogs[5]))
          expect(rows).not.to.include(_transformToResult(returnLogs[6]))
          expect(rows).not.to.include(_transformToResult(returnLogs[7]))
          expect(rows).not.to.include(_transformToResult(returnLogs[8]))
        })
      })
    })

    describe('and the notice type is "reminders"', () => {
      before(() => {
        noticeType = NoticeType.REMINDERS
      })

      describe('and there are licences to exclude', () => {
        before(() => {
          licencesToExclude = [returnLogs[3].licenceRef]
        })

        it('returns the expected return logs', async () => {
          const { bindings, query } = GenerateReturnLogsByPeriodQueryService.go(
            noticeType,
            licencesToExclude,
            returnsPeriod
          )
          const { rows } = await db.raw(query, bindings)

          expect(rows).to.include(_transformToResult(returnLogs[2]))

          // This matches on all other parameters but the licence is excluded
          expect(rows).not.to.include(_transformToResult(returnLogs[3]))

          expect(rows).not.to.include(_transformToResult(returnLogs[0]))
          expect(rows).not.to.include(_transformToResult(returnLogs[1]))
          expect(rows).not.to.include(_transformToResult(returnLogs[4]))
          expect(rows).not.to.include(_transformToResult(returnLogs[5]))
          expect(rows).not.to.include(_transformToResult(returnLogs[6]))
          expect(rows).not.to.include(_transformToResult(returnLogs[7]))
          expect(rows).not.to.include(_transformToResult(returnLogs[8]))
        })
      })

      describe('and there are NO licences to exclude', () => {
        before(() => {
          licencesToExclude = []
        })

        it('returns the expected return logs', async () => {
          const { bindings, query } = GenerateReturnLogsByPeriodQueryService.go(
            noticeType,
            licencesToExclude,
            returnsPeriod
          )
          const { rows } = await db.raw(query, bindings)

          expect(rows).to.include(_transformToResult(returnLogs[2]))
          expect(rows).to.include(_transformToResult(returnLogs[3]))

          expect(rows).not.to.include(_transformToResult(returnLogs[0]))
          expect(rows).not.to.include(_transformToResult(returnLogs[1]))
          expect(rows).not.to.include(_transformToResult(returnLogs[4]))
          expect(rows).not.to.include(_transformToResult(returnLogs[5]))
          expect(rows).not.to.include(_transformToResult(returnLogs[6]))
          expect(rows).not.to.include(_transformToResult(returnLogs[7]))
          expect(rows).not.to.include(_transformToResult(returnLogs[8]))
        })
      })
    })
  })
})

async function _addReturnLog(returnLogs, returnsPeriod, overrides = {}) {
  const data = ReturnLogHelper.defaults()

  data.dueDate = returnsPeriod.dueDate
  data.endDate = returnsPeriod.endDate
  data.startDate = returnsPeriod.startDate
  data.quarterly = returnsPeriod.quarterly
  data.metadata.isSummer = returnsPeriod.summer === 'true'

  // NOTE: We use Object.hasOwn() because overrides.isCurrent may be present but false! We are just testing if it exists
  if (Object.hasOwn(overrides, 'isCurrent')) {
    data.metadata.isCurrent = overrides.isCurrent

    delete overrides.isCurrent
  }

  const returnLog = await ReturnLogHelper.add({
    ...data,
    ...overrides
  })

  returnLogs.push(returnLog)

  return returnLog
}

function _transformToResult(returnLog) {
  return {
    due_date: returnLog.dueDate,
    end_date: returnLog.endDate,
    licence_ref: returnLog.licenceRef,
    return_id: returnLog.returnId,
    return_reference: returnLog.returnReference,
    start_date: returnLog.startDate
  }
}
