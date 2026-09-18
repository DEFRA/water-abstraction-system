// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import { generateNoticeReferenceCode, generateUUID } from 'water-abstraction-engine/test/generators.js'

// Thing under test
import InvitationPeriodPresenter from '../../../../src/presenters/notices/setup/invitation-period.presenter.js'

describe('Notices - Setup - Invitation Period presenter', () => {
  let referenceCode
  let returnCycles
  let session

  beforeEach(() => {
    referenceCode = generateNoticeReferenceCode('RINV-')
    session = { referenceCode, noticeType: 'invitations', id: generateUUID() }

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
      const result = InvitationPeriodPresenter(session, returnCycles)

      expect(result).toEqual({
        backLink: {
          href: `/system/notices/setup/${session.id}/notice-type`,
          text: 'Back'
        },
        invitationPeriods: [
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
        pageTitle: 'Select the returns period for the invitations'
      })
    })

    describe('the "backLink" property', () => {
      describe('when the check page has been visited', () => {
        beforeEach(() => {
          session.checkPageVisited = true
        })

        it('correctly returns the back link', () => {
          const result = InvitationPeriodPresenter(session, returnCycles)

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
          const result = InvitationPeriodPresenter(session, returnCycles)

          expect(result.backLink).toEqual({
            href: `/system/notices/setup/${session.id}/notice-type`,
            text: 'Back'
          })
        })
      })
    })

    describe('the "invitationPeriods" property', () => {
      describe('when the "session" has a saved invitation period', () => {
        beforeEach(() => {
          session.invitationPeriod = returnCycles[0].id
        })

        it('marks the matching invitation period as checked', () => {
          const result = InvitationPeriodPresenter(session, returnCycles)

          expect(result.invitationPeriods[0].checked).toEqual(true)
          expect(result.invitationPeriods[1].checked).toEqual(false)
        })
      })

      describe('when the "session" does not have a saved invitation period', () => {
        it('leaves all invitation periods as unchecked', () => {
          const result = InvitationPeriodPresenter(session, returnCycles)

          expect(result.invitationPeriods[0].checked).toEqual(false)
          expect(result.invitationPeriods[1].checked).toEqual(false)
        })
      })
    })
  })
})
