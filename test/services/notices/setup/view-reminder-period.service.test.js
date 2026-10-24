import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

// Test helpers
import { generateNoticeReferenceCode, generateUUID } from 'water-abstraction-engine/test/generators.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'

import * as FetchReturnsReminderPeriods from '../../../../src/dal/notices/setup/fetch-returns-reminder-periods.dal.js'

// Thing under test
import ViewReminderPeriodService from '../../../../src/services/notices/setup/view-reminder-period.service.js'

describe('Notices - Setup - View Reminder Period service', () => {
  let referenceCode
  let returnCycles
  let session
  let sessionData

  beforeAll(async () => {
    referenceCode = generateNoticeReferenceCode('RREM-')

    sessionData = { id: generateUUID(), noticeType: 'reminders', referenceCode }
    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    returnCycles = [
      {
        endDate: new Date('2026-10-31'),
        id: generateUUID(),
        startDate: new Date('2025-11-01'),
        summer: true
      },
      {
        endDate: new Date('2026-03-31'),
        id: generateUUID(),
        startDate: new Date('2025-04-01'),
        summer: false
      }
    ]

    vi.spyOn(FetchReturnsReminderPeriods, 'default').mockResolvedValue(returnCycles)
  })

  afterAll(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewReminderPeriodService(session.id)

      expect(result).toEqual({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/notice-type`,
          text: 'Back'
        },
        reminderPeriods: [
          {
            checked: false,
            text: 'Summer 1 November 2025 to 31 October 2026',
            value: returnCycles[0].id
          },
          {
            checked: false,
            text: 'Winter 1 April 2025 to 31 March 2026',
            value: returnCycles[1].id
          }
        ],
        pageTitle: 'Select the returns period for the reminders'
      })
    })
  })
})
