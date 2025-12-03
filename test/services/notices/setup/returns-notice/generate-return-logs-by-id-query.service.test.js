'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogHelper = require('../../../../support/helpers/return-log.helper.js')
const { db } = require('../../../../../db/db.js')

// Thing under test
const GenerateReturnLogsByIdQueryService = require('../../../../../app/services/notices/setup/returns-notice/generate-return-logs-by-id-query.service.js')

describe('Notices - Setup - Returns Notice - Generate Return Logs By ID Query Service', () => {
  let returnLogIds
  let returnLogs

  before(async () => {
    let returnLog

    returnLogs = []

    // First return log has a status of 'due' - should be included in results
    returnLog = await ReturnLogHelper.add({ status: 'due' })
    returnLogs.push(returnLog)

    // NOTE: This version of the generate return log query is used by paper returns and when we send an alternate
    // notice. It is unlikely that, for example, a return log we've shown to the user and that they have selected for
    // sending a paper return is completed or voided before we finish. But we include the `rl.status = 'due'` clause
    // just in case, which is why we include this test case.
    // Second return log has a status of 'completed' - should NOT be included in results
    returnLog = await ReturnLogHelper.add({ status: 'completed' })
    returnLogs.push(returnLog)

    // Third return log's ID is not included in those we pass to the service - should NOT be included in results
    await ReturnLogHelper.add({ status: 'due' })
    returnLogs.push(returnLog)

    returnLogIds = returnLogs.map((returnLog) => {
      return returnLog.returnId
    })
  })

  after(async () => {
    for (const returnLog of returnLogs) {
      await returnLog.$query().delete()
    }
  })

  describe('when called', () => {
    it('returns the expected query and bindings', () => {
      const result = GenerateReturnLogsByIdQueryService.go(returnLogIds)

      expect(result).to.equal({
        bindings: [returnLogIds],
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
    AND rl.return_id = ANY (?)
  `
      })
    })
  })

  describe('when executed', () => {
    it('returns the expected return logs', async () => {
      const { bindings, query } = GenerateReturnLogsByIdQueryService.go(returnLogIds)
      const { rows } = await db.raw(query, bindings)

      expect(rows).to.equal([
        {
          due_date: returnLogs[0].dueDate,
          end_date: returnLogs[0].endDate,
          licence_ref: returnLogs[0].licenceRef,
          return_id: returnLogs[0].returnId,
          return_reference: returnLogs[0].returnReference,
          start_date: returnLogs[0].startDate
        }
      ])
    })
  })
})
