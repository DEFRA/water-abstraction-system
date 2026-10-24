// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import { generateNoticeReferenceCode, generateUUID } from 'water-abstraction-engine/test/generators.js'

// Thing under test
import ReminderPeriodPresenter from '../../../../src/presenters/notices/setup/reminder-period.presenter.js'

describe('Notices - Setup - Reminder Period presenter', () => {
  let referenceCode
  let returnCycles
  let session

  beforeEach(() => {
    referenceCode = generateNoticeReferenceCode('RREM-')
    session = { referenceCode, noticeType: 'reminders', id: generateUUID() }

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
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ReminderPeriodPresenter(session, returnCycles)

      expect(result).toEqual({
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

    describe('the "backLink" property', () => {
      describe('when the check page has been visited', () => {
        beforeEach(() => {
          session.checkPageVisited = true
        })

        it('correctly returns the back link', () => {
          const result = ReminderPeriodPresenter(session, returnCycles)

          expect(result.backLink).toEqual({
            href: `/system/notices/setup/${session.id}/check-notice-type`,
            text: 'Back'
          })
        })
      })

      describe('when the check page has not been visited', () => {
        beforeEach(() => {
          session.checkPageVisited = false
        })

        it('correctly returns the back link', () => {
          const result = ReminderPeriodPresenter(session, returnCycles)

          expect(result.backLink).toEqual({
            href: `/system/notices/setup/${session.id}/notice-type`,
            text: 'Back'
          })
        })
      })
    })

    describe('the "reminderPeriods" property', () => {
      describe('when the "session" has a saved reminder period', () => {
        beforeEach(() => {
          session.reminderPeriod = returnCycles[0].id
        })

        it('marks the matching reminder period as checked', () => {
          const result = ReminderPeriodPresenter(session, returnCycles)

          expect(result.reminderPeriods[0].checked).toEqual(true)
          expect(result.reminderPeriods[1].checked).toEqual(false)
        })
      })

      describe('when the "session" does not have a saved reminder period', () => {
        it('leaves all reminder periods as unchecked', () => {
          const result = ReminderPeriodPresenter(session, returnCycles)

          expect(result.reminderPeriods[0].checked).toEqual(false)
          expect(result.reminderPeriods[1].checked).toEqual(false)
        })
      })
    })
  })
})
