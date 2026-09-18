// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import { generateLicenceRef, generateUUID } from 'water-abstraction-engine/test/generators.js'

// Things we need to stub
import * as featureFlagsConfig from '../../../../src/config/feature-flags.config.js'

// Thing under test
import CheckNoticeTypePresenter from '../../../../src/presenters/notices/setup/check-notice-type.presenter.js'

describe('Notices - Setup - Check Notice Type presenter', () => {
  let licenceRef
  let session

  beforeEach(() => {
    licenceRef = generateLicenceRef()

    session = { id: generateUUID(), noticeType: 'invitations' }

    vi.spyOn(featureFlagsConfig, 'default', 'get').mockReturnValue({ alternateReturnInvitationPeriods: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CheckNoticeTypePresenter(session)

      expect(result).toEqual({
        links: {
          licenceNumber: `/system/notices/setup/${session.id}/licence`,
          noticeType: `/system/notices/setup/${session.id}/notice-type`,
          returns: `/system/notices/setup/${session.id}/paper-return`,
          returnsPeriod: `/system/notices/setup/${session.id}/invitation-period`
        },
        pageTitle: 'Check the notice type',
        sessionId: session.id,
        noticeType: 'Returns invitation'
      })
    })

    describe('and "licenceRef" is set', () => {
      beforeEach(() => {
        session.licenceRef = licenceRef
      })

      it('returns page data including "licenceRef"', () => {
        const result = CheckNoticeTypePresenter(session)

        expect(result).toEqual({
          links: {
            licenceNumber: `/system/notices/setup/${session.id}/licence`,
            noticeType: `/system/notices/setup/${session.id}/notice-type`,
            returns: `/system/notices/setup/${session.id}/paper-return`,
            returnsPeriod: `/system/notices/setup/${session.id}/invitation-period`
          },
          pageTitle: 'Check the notice type',
          sessionId: session.id,
          licenceRef,
          noticeType: 'Returns invitation'
        })
      })
    })

    describe('and "determinedReturnsPeriod" is set', () => {
      beforeEach(() => {
        session.determinedReturnsPeriod = {
          name: 'summer',
          summer: 'true',
          dueDate: '2025-11-28T00:00:00.000Z',
          endDate: '2025-10-31T00:00:00.000Z',
          startDate: '2024-11-01T00:00:00.000Z'
        }
      })

      it('returns page data including "returnsPeriodText"', () => {
        const result = CheckNoticeTypePresenter(session)

        expect(result).toEqual({
          links: {
            licenceNumber: `/system/notices/setup/${session.id}/licence`,
            noticeType: `/system/notices/setup/${session.id}/notice-type`,
            returns: `/system/notices/setup/${session.id}/paper-return`,
            returnsPeriod: `/system/notices/setup/${session.id}/invitation-period`
          },
          pageTitle: 'Check the notice type',
          sessionId: session.id,
          noticeType: 'Returns invitation',
          returnsPeriodText: 'Summer annual 1 November 2024 to 31 October 2025'
        })
      })
    })

    describe('and the notice type is "reminders"', () => {
      beforeEach(() => {
        session.noticeType = 'reminders'
      })

      it('returns page data', () => {
        const result = CheckNoticeTypePresenter(session)

        expect(result).toEqual({
          links: {
            licenceNumber: `/system/notices/setup/${session.id}/licence`,
            noticeType: `/system/notices/setup/${session.id}/notice-type`,
            returns: `/system/notices/setup/${session.id}/paper-return`,
            returnsPeriod: `/system/notices/setup/${session.id}/returns-period`
          },
          pageTitle: 'Check the notice type',
          sessionId: session.id,
          noticeType: 'Returns reminder'
        })
      })
    })

    describe('and the notice type is "paperReturn"', () => {
      let dueReturnOne
      let dueReturnTwo

      beforeEach(() => {
        dueReturnOne = {
          description: 'Potable Water Supply - Direct',
          endDate: '2003-03-31',
          returnLogId: generateUUID(),
          returnReference: '3135',
          startDate: '2002-04-01'
        }

        dueReturnTwo = {
          description: 'Potable Water Supply - Direct',
          endDate: '2004-03-31',
          returnLogId: generateUUID(),
          returnReference: '3135',
          startDate: '2003-04-01'
        }

        session.dueReturns = [dueReturnOne, dueReturnTwo]
        session.licenceRef = licenceRef
        session.noticeType = 'paperReturn'
        session.selectedReturns = [dueReturnOne.returnLogId]
      })

      it('returns the page data', () => {
        const result = CheckNoticeTypePresenter(session)

        expect(result).toEqual({
          links: {
            licenceNumber: `/system/notices/setup/${session.id}/licence`,
            noticeType: `/system/notices/setup/${session.id}/notice-type`,
            returns: `/system/notices/setup/${session.id}/paper-return`,
            returnsPeriod: `/system/notices/setup/${session.id}/returns-period`
          },
          pageTitle: 'Check the notice type',
          sessionId: session.id,
          licenceRef,
          noticeType: 'Paper return',
          returns: ['3135 - 1 April 2002 to 31 March 2003']
        })
      })

      describe('and there are more than one "selectedReturns"', () => {
        beforeEach(() => {
          session.selectedReturns = [dueReturnOne.returnLogId, dueReturnTwo.returnLogId]
        })

        it('returns an array of "selectedDueReturns"', () => {
          const result = CheckNoticeTypePresenter(session)

          expect(result.returns).toEqual([
            '3135 - 1 April 2002 to 31 March 2003',
            '3135 - 1 April 2003 to 31 March 2004'
          ])
        })
      })
    })

    describe('and the notice type is "renewalInvitations"', () => {
      beforeEach(() => {
        session.noticeType = 'renewalInvitations'
      })

      it('returns page data', () => {
        const result = CheckNoticeTypePresenter(session)

        expect(result).toEqual({
          links: {
            licenceNumber: `/system/notices/setup/${session.id}/licence`,
            noticeType: `/system/notices/setup/${session.id}/notice-type`,
            returns: `/system/notices/setup/${session.id}/paper-return`,
            returnsPeriod: `/system/notices/setup/${session.id}/returns-period`
          },
          pageTitle: 'Check the notice type',
          sessionId: session.id,
          noticeType: 'Renewals invitation'
        })
      })
    })
  })
})
