// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'
import YarStub from 'water-abstraction-engine/test/stubs/yar.stub.js'
import { generateNoticeReferenceCode, generateUUID } from 'water-abstraction-engine/test/generators.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

import * as FetchReturnCycleDal from '../../../../src/dal/notices/setup/fetch-return-cycle.dal.js'
import * as FetchReturnsInvitationPeriodsDal from '../../../../src/dal/notices/setup/fetch-returns-invitation-periods.dal.js'

// Thing under test
import SubmitInvitationPeriodService from '../../../../src/services/notices/setup/submit-invitation-period.service.js'

describe('Notices - Setup - Submit Invitation Period service', () => {
  let payload
  let referenceCode
  let returnCycles
  let selectedReturnCycle
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    referenceCode = generateNoticeReferenceCode('RINV-')

    selectedReturnCycle = {
      dueDate: new Date('2026-11-28'),
      endDate: new Date('2026-10-31'),
      id: generateUUID(),
      startDate: new Date('2025-11-01'),
      summer: true
    }

    returnCycles = [
      selectedReturnCycle,
      {
        endDate: new Date('2026-03-31'),
        id: generateUUID(),
        startDate: new Date('2025-04-01'),
        summer: false
      }
    ]

    sessionData = { id: generateUUID(), journey: 'standard', noticeType: 'invitations', referenceCode }
    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
    vi.spyOn(FetchReturnCycleDal, 'default').mockResolvedValue(selectedReturnCycle)

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when validation is successful', () => {
    beforeEach(() => {
      payload = { invitationPeriod: selectedReturnCycle.id }
    })

    describe('and the check page has been visited', () => {
      beforeEach(() => {
        sessionData.checkPageVisited = true
        sessionData.invitationPeriod = selectedReturnCycle.id

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitInvitationPeriodService(session.id, payload, yarStub)

        expect(session.invitationPeriod).toEqual(selectedReturnCycle.id)
        expect(session.$update).toHaveBeenCalled()
      })

      it('saves the determined returns period', async () => {
        await SubmitInvitationPeriodService(session.id, payload, yarStub)

        expect(session.determinedReturnsPeriod).toEqual({
          // The dates would be strings and not date objects when saved to the database
          dueDate: selectedReturnCycle.dueDate,
          endDate: selectedReturnCycle.endDate,
          name: 'summer',
          startDate: selectedReturnCycle.startDate,
          summer: 'true',
          quarterly: false
        })
      })

      it('returns a redirect to the "/check-notice-type" page', async () => {
        const result = await SubmitInvitationPeriodService(session.id, payload, yarStub)

        expect(result).toEqual({ redirectUrl: `/system/notices/setup/${session.id}/check-notice-type` })
      })

      describe('and the selected "invitationPeriod" has changed', () => {
        beforeEach(() => {
          sessionData.invitationPeriod = returnCycles[1].id

          session = SessionModelStub(sessionData)

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('sets a flash message', async () => {
          await SubmitInvitationPeriodService(session.id, payload, yarStub)

          // Check we add the flash message
          const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(bannerMessage).toEqual({
            text: 'Returns period updated',
            titleText: 'Updated'
          })
        })
      })

      describe('and the selected "invitationPeriod" has not changed', () => {
        it('does not set a flash message', async () => {
          await SubmitInvitationPeriodService(session.id, payload, yarStub)

          expect(yarStub.flash).not.toHaveBeenCalled()
        })
      })
    })

    describe('and the check page has not been visited', () => {
      beforeEach(async () => {
        sessionData.checkPageVisited = false

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitInvitationPeriodService(session.id, payload, yarStub)

        expect(session.invitationPeriod).toEqual(selectedReturnCycle.id)
        expect(session.$update).toHaveBeenCalled()
      })

      it('saves the determined returns period', async () => {
        await SubmitInvitationPeriodService(session.id, payload, yarStub)

        expect(session.determinedReturnsPeriod).toEqual({
          // The dates would be strings and not date objects when saved to the database
          dueDate: selectedReturnCycle.dueDate,
          endDate: selectedReturnCycle.endDate,
          name: 'summer',
          startDate: selectedReturnCycle.startDate,
          summer: 'true',
          quarterly: false
        })
      })

      it('still returns a redirect to the "check-notice-type" page', async () => {
        const result = await SubmitInvitationPeriodService(session.id, payload, yarStub)

        expect(result).toEqual({ redirectUrl: `/system/notices/setup/${session.id}/check-notice-type` })
      })

      it('does not set a flash message', async () => {
        await SubmitInvitationPeriodService(session.id, payload, yarStub)

        expect(yarStub.flash).not.toHaveBeenCalled()
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}

      vi.spyOn(FetchReturnsInvitationPeriodsDal, 'default').mockResolvedValue(returnCycles)
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitInvitationPeriodService(session.id, payload, yarStub)

      expect(result).toEqual({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/notice-type`,
          text: 'Back'
        },
        error: {
          errorList: [
            {
              href: '#invitationPeriod',
              text: 'Select the returns period for the invitations'
            }
          ],
          invitationPeriod: {
            text: 'Select the returns period for the invitations'
          }
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
  })
})
