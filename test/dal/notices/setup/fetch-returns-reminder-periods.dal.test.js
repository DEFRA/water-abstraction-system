// Test framework
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import NotificationHelper from 'water-abstraction-engine/test/helpers/notification.helper.js'
import ReturnCycleModel from 'water-abstraction-engine/models/return-cycle.model.js'
import ReturnLogHelper from 'water-abstraction-engine/test/helpers/return-log.helper.js'
import { generateUUID } from 'water-abstraction-engine/test/generators.js'
import { today } from 'water-abstraction-engine/lib/general.lib.js'
import { tomorrow, yesterday } from 'water-abstraction-engine/test/general.js'

import NoticesFixture from '../../../support/fixtures/notices.fixture.js'
import NotificationsFixture from '../../../support/fixtures/notifications.fixture.js'

// Thing under test
import FetchReturnsReminderPeriods from '../../../../src/dal/notices/setup/fetch-returns-reminder-periods.dal.js'

describe('Notices - Setup - Fetch Returns Reminder Periods DAL', () => {
  let noticeFixture
  let notificationFixture
  let returnCycles
  let returnLogs
  let returnReminderNotification
  let selectedReturnCycle
  let eightDaysForward

  beforeAll(async () => {
    noticeFixture = NoticesFixture.returnsReminder()
    notificationFixture = NotificationsFixture.returnsReminderEmail(noticeFixture)

    returnCycles = await _fetchReturnCyclesForTest()

    eightDaysForward = new Date(today().setDate(today().getDate() + 8))
  })

  afterEach(async () => {
    for (const returnLog of returnLogs) {
      await returnLog.$query().delete()
    }

    if (returnReminderNotification) {
      await returnReminderNotification.$query().delete()
    }
  })

  describe('when the return cycle "startDate" is less than or equal to 3 years ago', () => {
    beforeEach(() => {
      selectedReturnCycle = returnCycles.previous
    })

    describe('and at least one return log is "due", "current", has a due date 7 or more days ago, and has not been sent a reminder', () => {
      beforeEach(async () => {
        returnLogs = [
          await ReturnLogHelper.add({
            endDate: selectedReturnCycle.endDate,
            returnCycleId: selectedReturnCycle.id,
            dueDate: yesterday(),
            startDate: selectedReturnCycle.startDate,
            status: 'due'
          }),
          await ReturnLogHelper.add({
            endDate: selectedReturnCycle.endDate,
            returnCycleId: selectedReturnCycle.id,
            dueDate: yesterday(),
            startDate: selectedReturnCycle.startDate,
            status: 'void'
          }),
          await ReturnLogHelper.add({
            endDate: selectedReturnCycle.endDate,
            returnCycleId: selectedReturnCycle.id,
            dueDate: null,
            startDate: selectedReturnCycle.startDate,
            status: 'due'
          }),
          await ReturnLogHelper.add({
            endDate: selectedReturnCycle.endDate,
            returnCycleId: selectedReturnCycle.id,
            dueDate: yesterday(),
            startDate: selectedReturnCycle.startDate,
            status: 'due'
          }),
          await ReturnLogHelper.add({
            endDate: selectedReturnCycle.endDate,
            returnCycleId: selectedReturnCycle.id,
            dueDate: yesterday(),
            metadata: { isCurrent: false },
            startDate: selectedReturnCycle.startDate,
            status: 'due'
          }),
          await ReturnLogHelper.add({
            endDate: selectedReturnCycle.endDate,
            returnCycleId: selectedReturnCycle.id,
            dueDate: eightDaysForward,
            startDate: selectedReturnCycle.startDate,
            status: 'due'
          })
        ]

        returnReminderNotification = await NotificationHelper.add({
          ...notificationFixture,
          id: generateUUID(),
          returnLogIds: [returnLogs[0].id]
        })
      })

      it('is returned by the query', async () => {
        const results = await FetchReturnsReminderPeriods()

        expect(results.length).to.equal(1)
        expect(results).toContainEqual({ ...selectedReturnCycle })
      })
    })

    describe('but has no "due" return logs', () => {
      beforeEach(async () => {
        returnLogs = [
          await ReturnLogHelper.add({
            endDate: selectedReturnCycle.endDate,
            returnCycleId: selectedReturnCycle.id,
            dueDate: yesterday(),
            startDate: selectedReturnCycle.startDate,
            status: 'void'
          })
        ]
      })

      it('is not returned by the query', async () => {
        const results = await FetchReturnsReminderPeriods()

        expect(results.length).to.equal(0)
        expect(results).not.toContainEqual({ ...selectedReturnCycle })
      })
    })

    describe('but has no current "due" return logs', () => {
      beforeEach(async () => {
        returnLogs = [
          await ReturnLogHelper.add({
            endDate: selectedReturnCycle.endDate,
            returnCycleId: selectedReturnCycle.id,
            dueDate: yesterday(),
            metadata: { isCurrent: false },
            startDate: selectedReturnCycle.startDate,
            status: 'due'
          })
        ]
      })

      it('is not returned by the query', async () => {
        const results = await FetchReturnsReminderPeriods()

        expect(results.length).to.equal(0)
        expect(results).not.toContainEqual({ ...selectedReturnCycle })
      })
    })

    describe('but has no return logs with "dueDate" set', () => {
      beforeEach(async () => {
        returnLogs = [
          await ReturnLogHelper.add({
            endDate: selectedReturnCycle.endDate,
            returnCycleId: selectedReturnCycle.id,
            dueDate: null,
            startDate: selectedReturnCycle.startDate,
            status: 'due'
          })
        ]
      })

      it('is not returned by the query', async () => {
        const results = await FetchReturnsReminderPeriods()

        expect(results.length).to.equal(0)
        expect(results).not.toContainEqual({ ...selectedReturnCycle })
      })
    })

    describe('but has return logs with "dueDate" set less than seven days ago', () => {
      beforeEach(async () => {
        returnLogs = [
          await ReturnLogHelper.add({
            endDate: selectedReturnCycle.endDate,
            returnCycleId: selectedReturnCycle.id,
            dueDate: eightDaysForward,
            startDate: selectedReturnCycle.startDate,
            status: 'due'
          })
        ]
      })

      it('is not returned by the query', async () => {
        const results = await FetchReturnsReminderPeriods()

        expect(results.length).to.equal(0)
        expect(results).not.toContainEqual({ ...selectedReturnCycle })
      })
    })

    describe('but has return logs where the end date is after today', () => {
      beforeEach(async () => {
        returnLogs = [
          await ReturnLogHelper.add({
            endDate: tomorrow(),
            returnCycleId: selectedReturnCycle.id,
            dueDate: yesterday(),
            startDate: selectedReturnCycle.startDate,
            status: 'due'
          })
        ]
      })

      it('is not returned by the query', async () => {
        const results = await FetchReturnsReminderPeriods()

        expect(results.length).to.equal(0)
        expect(results).not.toContainEqual({ ...selectedReturnCycle })
      })
    })

    describe('but all the return logs have already been sent a reminder', () => {
      beforeEach(async () => {
        returnLogs = [
          await ReturnLogHelper.add({
            endDate: selectedReturnCycle.endDate,
            returnCycleId: selectedReturnCycle.id,
            dueDate: yesterday(),
            startDate: selectedReturnCycle.startDate,
            status: 'due'
          })
        ]

        returnReminderNotification = await NotificationHelper.add({
          ...notificationFixture,
          id: generateUUID(),
          returnLogIds: [returnLogs[0].id]
        })
      })

      it('is not returned by the query', async () => {
        const results = await FetchReturnsReminderPeriods()

        expect(results.length).to.equal(0)
        expect(results).not.toContainEqual({ ...selectedReturnCycle })
      })
    })
  })

  describe('when the return cycle is a current one', () => {
    beforeEach(() => {
      selectedReturnCycle = returnCycles.current
    })

    describe('and at least one return log is "due", "current", has a due date 7 or more days ago, and has not been sent a reminder', () => {
      beforeEach(async () => {
        returnLogs = [
          await ReturnLogHelper.add({
            endDate: selectedReturnCycle.endDate,
            returnCycleId: selectedReturnCycle.id,
            dueDate: yesterday(),
            startDate: selectedReturnCycle.startDate,
            status: 'due'
          }),
          await ReturnLogHelper.add({
            endDate: selectedReturnCycle.endDate,
            returnCycleId: selectedReturnCycle.id,
            dueDate: yesterday(),
            startDate: selectedReturnCycle.startDate,
            status: 'void'
          }),
          await ReturnLogHelper.add({
            endDate: selectedReturnCycle.endDate,
            returnCycleId: selectedReturnCycle.id,
            dueDate: null,
            startDate: selectedReturnCycle.startDate,
            status: 'due'
          }),
          await ReturnLogHelper.add({
            endDate: selectedReturnCycle.endDate,
            returnCycleId: selectedReturnCycle.id,
            dueDate: yesterday(),
            startDate: selectedReturnCycle.startDate,
            status: 'due'
          }),
          await ReturnLogHelper.add({
            endDate: selectedReturnCycle.endDate,
            returnCycleId: selectedReturnCycle.id,
            dueDate: yesterday(),
            metadata: { isCurrent: false },
            startDate: selectedReturnCycle.startDate,
            status: 'due'
          }),
          await ReturnLogHelper.add({
            endDate: selectedReturnCycle.endDate,
            returnCycleId: selectedReturnCycle.id,
            dueDate: eightDaysForward,
            startDate: selectedReturnCycle.startDate,
            status: 'due'
          })
        ]

        returnReminderNotification = await NotificationHelper.add({
          ...notificationFixture,
          id: generateUUID(),
          returnLogIds: [returnLogs[0].id]
        })
      })

      it('is returned by the query', async () => {
        const results = await FetchReturnsReminderPeriods()

        expect(results.length).to.equal(1)
        expect(results).toContainEqual({ ...selectedReturnCycle })
      })
    })

    describe('but has no "due" return logs', () => {
      beforeEach(async () => {
        returnLogs = [
          await ReturnLogHelper.add({
            endDate: selectedReturnCycle.endDate,
            returnCycleId: selectedReturnCycle.id,
            dueDate: yesterday(),
            startDate: selectedReturnCycle.startDate,
            status: 'void'
          })
        ]
      })

      it('is not returned by the query', async () => {
        const results = await FetchReturnsReminderPeriods()

        expect(results.length).to.equal(0)
        expect(results).not.toContainEqual({ ...selectedReturnCycle })
      })
    })

    describe('but has no current "due" return logs', () => {
      beforeEach(async () => {
        returnLogs = [
          await ReturnLogHelper.add({
            endDate: selectedReturnCycle.endDate,
            returnCycleId: selectedReturnCycle.id,
            dueDate: yesterday(),
            metadata: { isCurrent: false },
            startDate: selectedReturnCycle.startDate,
            status: 'due'
          })
        ]
      })

      it('is not returned by the query', async () => {
        const results = await FetchReturnsReminderPeriods()

        expect(results.length).to.equal(0)
        expect(results).not.toContainEqual({ ...selectedReturnCycle })
      })
    })

    describe('but has no return logs with "dueDate" set', () => {
      beforeEach(async () => {
        returnLogs = [
          await ReturnLogHelper.add({
            endDate: selectedReturnCycle.endDate,
            returnCycleId: selectedReturnCycle.id,
            dueDate: null,
            startDate: selectedReturnCycle.startDate,
            status: 'due'
          })
        ]
      })

      it('is not returned by the query', async () => {
        const results = await FetchReturnsReminderPeriods()

        expect(results.length).to.equal(0)
        expect(results).not.toContainEqual({ ...selectedReturnCycle })
      })
    })

    describe('but has return logs with "dueDate" set less than seven days ago', () => {
      beforeEach(async () => {
        returnLogs = [
          await ReturnLogHelper.add({
            endDate: selectedReturnCycle.endDate,
            returnCycleId: selectedReturnCycle.id,
            dueDate: eightDaysForward,
            startDate: selectedReturnCycle.startDate,
            status: 'due'
          })
        ]
      })

      it('is not returned by the query', async () => {
        const results = await FetchReturnsReminderPeriods()

        expect(results.length).to.equal(0)
        expect(results).not.toContainEqual({ ...selectedReturnCycle })
      })
    })

    describe('but has return logs where the end date is after today', () => {
      beforeEach(async () => {
        returnLogs = [
          await ReturnLogHelper.add({
            endDate: tomorrow(),
            returnCycleId: selectedReturnCycle.id,
            dueDate: yesterday(),
            startDate: selectedReturnCycle.startDate,
            status: 'due'
          })
        ]
      })

      it('is not returned by the query', async () => {
        const results = await FetchReturnsReminderPeriods()

        expect(results.length).to.equal(0)
        expect(results).not.toContainEqual({ ...selectedReturnCycle })
      })
    })

    describe('but all the return logs have already been sent a reminder', () => {
      beforeEach(async () => {
        returnLogs = [
          await ReturnLogHelper.add({
            endDate: selectedReturnCycle.endDate,
            returnCycleId: selectedReturnCycle.id,
            dueDate: yesterday(),
            startDate: selectedReturnCycle.startDate,
            status: 'due'
          })
        ]

        returnReminderNotification = await NotificationHelper.add({
          ...notificationFixture,
          id: generateUUID(),
          returnLogIds: [returnLogs[0].id]
        })
      })

      it('is not returned by the query', async () => {
        const results = await FetchReturnsReminderPeriods()

        expect(results.length).to.equal(0)
        expect(results).not.toContainEqual({ ...selectedReturnCycle })
      })
    })
  })

  describe('when the return cycle started more than 3 years ago', () => {
    beforeEach(async () => {
      selectedReturnCycle = returnCycles.old

      returnLogs = [
        await ReturnLogHelper.add({
          endDate: selectedReturnCycle.endDate,
          returnCycleId: selectedReturnCycle.id,
          dueDate: yesterday(),
          startDate: selectedReturnCycle.startDate,
          status: 'due'
        })
      ]
    })

    it('is not returned by the query', async () => {
      const results = await FetchReturnsReminderPeriods()

      expect(results.length).to.equal(0)
      expect(results).not.toContainEqual({ ...selectedReturnCycle })
    })
  })
})

async function _fetchReturnCyclesForTest() {
  const todaysDate = today()
  const threeYearsAgo = new Date(todaysDate)
  const fourYearsAgo = new Date(todaysDate)

  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3)
  fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4)

  const results = await ReturnCycleModel.query()
    .select(['endDate', 'id', 'startDate', 'summer'])
    .where('startDate', '>=', fourYearsAgo)
    .orderBy('endDate', 'desc')

  const old = results.filter((returnCycle) => {
    return returnCycle.startDate < threeYearsAgo
  })

  // Only cycles that have ended can have return logs that qualify (the query requires the log's end date to be in the
  // past). So, 'current' is the latest ended cycle and 'previous' is the one before it.
  const ended = results.filter((returnCycle) => {
    return returnCycle.startDate >= threeYearsAgo && returnCycle.endDate < todaysDate
  })

  return { current: ended[0], previous: ended[1], old: old[0] }
}
