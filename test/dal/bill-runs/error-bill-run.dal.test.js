// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import BillRunHelper from 'water-abstraction-engine/test/helpers/bill-run.helper.js'

// Thing under test
import ErrorBillRunService from '../../../src/dal/bill-runs/error-bill-run.dal.js'

describe('Handle Errored Bill Run service', () => {
  let billRun

  beforeEach(async () => {
    billRun = await BillRunHelper.add()
  })

  describe('when the service is called successfully', () => {
    it('sets the bill run status to "error" and sets the error code', async () => {
      await ErrorBillRunService(billRun.id, 400)

      const result = await billRun.$query()

      expect(result.status).toEqual('error')
      expect(result.errorCode).toEqual(400)
    })

    describe('when no error code is passed', () => {
      it('does not set an error code', async () => {
        await ErrorBillRunService(billRun.id)

        const result = await billRun.$query()

        expect(result.status).toEqual('error')
        expect(result.errorCode).toBeNull()
      })
    })
  })
})
