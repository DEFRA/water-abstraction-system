// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'
import YarStub from 'water-abstraction-engine/test/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Thing under test
import SubmitAgreementsExceptionsService from '../../../../src/services/return-versions/setup/submit-agreements-exceptions.service.js'

describe('Return Versions Setup - Submit Agreements and Exceptions service', () => {
  const requirementIndex = 0

  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = {
      checkPageVisited: false,
      journey: 'returns-required',
      licence: {
        currentVersionStartDate: '2023-01-01T00:00:00.000Z',
        endDate: null,
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceHolder: 'Turbo Kid',
        licenceRef: '01/ABC',
        returnVersions: [
          {
            id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
            modLogs: [],
            reason: null,
            startDate: '2023-01-01T00:00:00.000Z'
          }
        ],
        startDate: '2022-04-01T00:00:00.000Z'
      },
      reason: 'major-change',
      requirements: [{}],
      startDateOptions: 'licenceStartDate'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    yarStub = YarStub()
    yarStub.flash.mockReturnValue([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          agreementsExceptions: ['gravity-fill', 'two-part-tariff', '56-returns-exception']
        }
      })

      it('saves the submitted value', async () => {
        await SubmitAgreementsExceptionsService(session.id, requirementIndex, payload, yarStub)

        expect(session.requirements[0].agreementsExceptions).toEqual([
          'gravity-fill',
          'two-part-tariff',
          '56-returns-exception'
        ])
        expect(session.$update).toHaveBeenCalled()
      })

      describe('and the page has been not been visited', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitAgreementsExceptionsService(session.id, requirementIndex, payload, yarStub)

          expect(result).toEqual({
            checkPageVisited: false
          })
        })

        it('sets the notification message title to "Added" and the text to "New requirement added" ', async () => {
          await SubmitAgreementsExceptionsService(session.id, requirementIndex, payload, yarStub)

          const [flashType, notification] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(notification).toEqual({ text: 'New requirement added', titleText: 'Added' })
        })
      })

      describe('and the page has been visited', () => {
        beforeEach(() => {
          session = SessionModelStub({
            ...sessionData,
            checkPageVisited: true
          })

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('returns the correct details the controller needs to redirect the journey to the check page', async () => {
          const result = await SubmitAgreementsExceptionsService(session.id, requirementIndex, payload, yarStub)

          expect(result).toEqual({
            checkPageVisited: true
          })
        })

        it('sets the notification message title to "Updated" and the text to "Requirements for returns updated" ', async () => {
          await SubmitAgreementsExceptionsService(session.id, requirementIndex, payload, yarStub)

          const [flashType, notification] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(notification).toEqual({
            text: 'Requirements for returns updated',
            titleText: 'Updated'
          })
        })
      })
    })
  })

  describe('with an invalid payload', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view', async () => {
      const result = await SubmitAgreementsExceptionsService(session.id, requirementIndex, payload, yarStub)

      expect(result).toMatchObject({
        agreementsExceptions: null,
        backLink: {
          href: `/system/return-versions/setup/${session.id}/frequency-reported/0`,
          text: 'Back'
        },
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
        pageTitle: 'Select agreements and exceptions for the requirements for returns',
        pageTitleCaption: 'Licence 01/ABC'
      })
    })

    describe('because the user has not submitted anything', () => {
      it('includes an error for the input element', async () => {
        const result = await SubmitAgreementsExceptionsService(session.id, requirementIndex, payload, yarStub)

        expect(result.error).toEqual({
          agreementsExceptions: {
            text: 'Select if there are any agreements and exceptions needed for the requirements for returns'
          },
          errorList: [
            {
              href: '#agreementsExceptions',
              text: 'Select if there are any agreements and exceptions needed for the requirements for returns'
            }
          ]
        })
      })
    })
  })
})
