// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import ReturnLogHelper from 'water-abstraction-engine/test/helpers/return-log.helper.js'
import ReturnRequirementHelper from 'water-abstraction-engine/test/helpers/return-requirement.helper.js'
import { db } from 'water-abstraction-engine/db/db.js'

// Thing under test
import GenerateReturnLogsByIdQueryService from '../../../../../src/services/notices/setup/returns-notice/generate-return-logs-by-id-query.service.js'

describe('Notices - Setup - Returns Notice - Generate Return Logs By ID Query Service', () => {
  let linkedReturnLog
  let returnLogIds
  let returnLogs
  let returnRequirement

  beforeAll(async () => {
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
      return returnLog.id
    })

    // Held separately so it is not included in the IDs the other tests pass to the service
    returnRequirement = await ReturnRequirementHelper.add()
    linkedReturnLog = await ReturnLogHelper.add({ returnRequirementId: returnRequirement.id, status: 'due' })
  })

  afterAll(async () => {
    for (const returnLog of returnLogs) {
      await returnLog.$query().delete()
    }

    await linkedReturnLog.$query().delete()
    await returnRequirement.$query().delete()
  })

  describe('when called', () => {
    it('returns the expected query and bindings', () => {
      const result = GenerateReturnLogsByIdQueryService(returnLogIds)

      expect(result).toEqual({
        bindings: [returnLogIds],
        query: `
  SELECT
    rl.due_date,
    rl.end_date,
    rl.licence_ref,
    rl.id AS return_log_id,
    COALESCE(rr.reference, rl.return_reference::integer) AS return_reference,
    rl.start_date,
    rl.quarterly
  FROM
    public.return_logs rl
  LEFT JOIN return_requirements as rr
    ON rl.return_requirement_id = rr.id
  WHERE
    rl.status = 'due'
    AND rl.id = ANY (?)
  `
      })
    })
  })

  describe('when executed', () => {
    it('returns the expected return logs', async () => {
      const { bindings, query } = GenerateReturnLogsByIdQueryService(returnLogIds)
      const { rows } = await db.raw(query, bindings)

      expect(rows).toEqual([
        {
          due_date: returnLogs[0].dueDate,
          end_date: returnLogs[0].endDate,
          licence_ref: returnLogs[0].licenceRef,
          return_log_id: returnLogs[0].id,
          return_reference: Number(returnLogs[0].returnReference),
          start_date: returnLogs[0].startDate,
          quarterly: returnLogs[0].quarterly
        }
      ])
    })

    describe('and the return log is linked to a return requirement', () => {
      it('returns the return reference from the return requirement', async () => {
        const { bindings, query } = GenerateReturnLogsByIdQueryService([linkedReturnLog.id])
        const { rows } = await db.raw(query, bindings)

        expect(rows).toEqual([
          {
            due_date: linkedReturnLog.dueDate,
            end_date: linkedReturnLog.endDate,
            licence_ref: linkedReturnLog.licenceRef,
            return_log_id: linkedReturnLog.id,
            return_reference: returnRequirement.reference,
            start_date: linkedReturnLog.startDate,
            quarterly: linkedReturnLog.quarterly
          }
        ])
      })
    })
  })
})
