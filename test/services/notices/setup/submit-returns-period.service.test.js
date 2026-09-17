// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'
import { generateNoticeReferenceCode, generateUUID } from 'water-abstraction-engine/test/generators.js'

// Test helpers
import YarStub from 'water-abstraction-engine/test/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Thing under test
import SubmitReturnsPeriodService from '../../../../src/services/notices/setup/submit-returns-period.service.js'

describe('Notices - Setup - Submit Returns Period service', () => {
  let payload
  let referenceCode
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    referenceCode = generateNoticeReferenceCode('RINV-')

    sessionData = { id: generateUUID(), noticeType: 'invitations', referenceCode }

    yarStub = YarStub()

    vi.useFakeTimers({ now: new Date('2024-12-01') })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('when validation is successful', () => {
    beforeEach(() => {
      payload = { returnsPeriod: 'quarterFour' }
    })

    describe('and the check page has been visited', () => {
      beforeEach(() => {
        sessionData.checkPageVisited = true
        sessionData.returnsPeriod = 'quarterFour'

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitReturnsPeriodService(session.id, payload, yarStub)

        expect(session.returnsPeriod).toEqual('quarterFour')
        expect(session.$update).toHaveBeenCalled()
      })

      it('saves the determined returns period', async () => {
        await SubmitReturnsPeriodService(session.id, payload, yarStub)

        expect(session.determinedReturnsPeriod).toEqual({
          // The dates would be strings and not date objects when saved to the database
          dueDate: new Date('2025-04-28'),
          endDate: new Date('2025-03-31'),
          name: 'quarterFour',
          startDate: new Date('2025-01-01'),
          summer: 'false',
          quarterly: true
        })
      })

      describe('and the selected "returnsPeriod" has changed', () => {
        beforeEach(() => {
          payload = { returnsPeriod: 'quarterThree' }
        })

        it('sets a flash message', async () => {
          await SubmitReturnsPeriodService(session.id, payload, yarStub)

          // Check we add the flash message
          const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(bannerMessage).toEqual({
            text: 'Returns period updated',
            titleText: 'Updated'
          })
        })

        it('returns a redirect to the "/check-notice-type" page', async () => {
          const result = await SubmitReturnsPeriodService(session.id, payload, yarStub)

          expect(result).toEqual({
            redirectUrl: `${session.id}/check-notice-type`
          })
        })
      })

      describe('and the selected "returnsPeriod" has not changed', () => {
        it('does not set a flash message', async () => {
          await SubmitReturnsPeriodService(session.id, payload, yarStub)

          expect(yarStub.flash).not.toHaveBeenCalled()
        })

        it('returns a redirect to the "/check-notice-type" page', async () => {
          const result = await SubmitReturnsPeriodService(session.id, payload, yarStub)

          expect(result).toEqual({
            redirectUrl: `${session.id}/check-notice-type`
          })
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
        await SubmitReturnsPeriodService(session.id, payload, yarStub)

        expect(session.returnsPeriod).toEqual('quarterFour')
        expect(session.$update).toHaveBeenCalled()
      })

      it('saves the determined returns period', async () => {
        await SubmitReturnsPeriodService(session.id, payload, yarStub)

        expect(session.determinedReturnsPeriod).toEqual({
          // The dates would be strings and not date objects when saved to the database
          dueDate: new Date('2025-04-28'),
          endDate: new Date('2025-03-31'),
          name: 'quarterFour',
          startDate: new Date('2025-01-01'),
          summer: 'false',
          quarterly: true
        })
      })

      it('does not set a flash message', async () => {
        await SubmitReturnsPeriodService(session.id, payload, yarStub)

        expect(yarStub.flash).not.toHaveBeenCalled()
      })

      it('still returns a redirect to the "/check-notice-type" page', async () => {
        const result = await SubmitReturnsPeriodService(session.id, payload, yarStub)

        expect(result).toEqual({
          redirectUrl: `${session.id}/check-notice-type`
        })
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}

      session = SessionModelStub(sessionData)

      vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitReturnsPeriodService(session.id, payload, yarStub)

      expect(result).toEqual({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/notice-type`,
          text: 'Back'
        },
        error: {
          errorList: [
            {
              href: '#returnsPeriod',
              text: 'Select the returns periods for the invitations'
            }
          ],
          returnsPeriod: {
            text: 'Select the returns periods for the invitations'
          }
        },
        pageTitle: 'Select the returns periods for the invitations',
        returnsPeriod: [
          {
            checked: false,
            hint: {
              text: 'Due date 28 January 2025'
            },
            text: 'Quarterly 1 October 2024 to 31 December 2024',
            value: 'quarterThree'
          },
          {
            checked: false,
            hint: {
              text: 'Due date 28 April 2025'
            },
            text: 'Quarterly 1 January 2025 to 31 March 2025',
            value: 'quarterFour'
          }
        ]
      })
    })
  })
})
