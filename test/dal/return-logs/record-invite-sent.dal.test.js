// Test framework
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import ReturnLogHelper from 'water-abstraction-engine/test/helpers/return-log.helper.js'
import ReturnLogModel from 'water-abstraction-engine/models/return-log.model.js'
import { yesterday } from 'water-abstraction-engine/test/general.js'
import { today } from 'water-abstraction-engine/lib/general.lib.js'

// Thing under test
import RecordInviteSentDal from '../../../src/dal/return-logs/record-invite-sent.dal.js'

describe('Return Logs - Record Invite Sent DAL', () => {
  let returnLogs
  let returnLogIds
  let dueDate
  let sentDate
  let trx

  beforeEach(async () => {
    dueDate = today()
    sentDate = yesterday()

    returnLogs = [
      await ReturnLogHelper.add({ dueDate: null, sentDate: null, status: 'due' }),
      await ReturnLogHelper.add({ dueDate: sentDate, sentDate, status: 'due' })
    ]

    returnLogIds = [returnLogs[0].id, returnLogs[1].id]
  })

  afterEach(async () => {
    for (const returnLog of returnLogs) {
      await returnLog.$query().delete()
    }
  })

  describe('when called', () => {
    describe('without a transaction', () => {
      it('updates the due and sent dates of the return logs', async () => {
        await RecordInviteSentDal(returnLogIds, dueDate, sentDate, trx)

        const updatedReturnLogs = await ReturnLogModel.query()
          .select(['dueDate', 'sentDate'])
          .whereIn('id', returnLogIds)

        expect(updatedReturnLogs).toHaveLength(2)

        expect(updatedReturnLogs[0].dueDate).toEqual(dueDate)
        expect(updatedReturnLogs[0].sentDate).toEqual(sentDate)

        expect(updatedReturnLogs[1].dueDate).toEqual(dueDate)
        expect(updatedReturnLogs[1].sentDate).toEqual(sentDate)
      })
    })

    describe('with a transaction', () => {
      beforeEach(async () => {
        trx = await ReturnLogModel.startTransaction()
      })

      afterEach(async () => {
        if (trx && !trx.isCompleted()) {
          await trx.rollback()
        }
      })

      it('updates the due and sent dates of the return logs', async () => {
        await RecordInviteSentDal(returnLogIds, dueDate, sentDate, trx)
        await trx.commit()

        const updatedReturnLogs = await ReturnLogModel.query()
          .select(['dueDate', 'sentDate'])
          .whereIn('id', returnLogIds)

        expect(updatedReturnLogs).toHaveLength(2)

        expect(updatedReturnLogs[0].dueDate).toEqual(dueDate)
        expect(updatedReturnLogs[0].sentDate).toEqual(sentDate)

        expect(updatedReturnLogs[1].dueDate).toEqual(dueDate)
        expect(updatedReturnLogs[1].sentDate).toEqual(sentDate)
      })
    })
  })
})
