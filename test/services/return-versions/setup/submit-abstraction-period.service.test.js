// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'
import YarStub from 'water-abstraction-engine/test/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Thing under test
import SubmitAbstractionPeriodService from '../../../../src/services/return-versions/setup/submit-abstraction-period.service.js'

describe('Return Versions Setup - Submit Abstraction Period service', () => {
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
          abstractionPeriodEndDay: '02',
          abstractionPeriodEndMonth: '7',
          abstractionPeriodStartDay: '01',
          abstractionPeriodStartMonth: '12'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitAbstractionPeriodService(session.id, requirementIndex, payload, yarStub)

        expect(session.requirements[0].abstractionPeriod).toEqual({
          abstractionPeriodEndDay: '02',
          abstractionPeriodEndMonth: '7',
          abstractionPeriodStartDay: '01',
          abstractionPeriodStartMonth: '12'
        })

        expect(session.$update).toHaveBeenCalled()
      })

      describe('and the page has been not been visited', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitAbstractionPeriodService(session.id, requirementIndex, payload, yarStub)

          expect(result).toEqual({
            checkPageVisited: false
          })
        })
      })

      describe('and the page has been visited', () => {
        beforeEach(() => {
          session = SessionModelStub({ ...sessionData, checkPageVisited: true })

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('returns the correct details the controller needs to redirect the journey to the check page', async () => {
          const result = await SubmitAbstractionPeriodService(session.id, requirementIndex, payload, yarStub)

          expect(result).toEqual({
            checkPageVisited: true
          })
        })

        it('sets the notification message title to "Updated" and the text to "Requirements for returns updated" ', async () => {
          await SubmitAbstractionPeriodService(session.id, requirementIndex, payload, yarStub)

          const [flashType, notification] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(notification).toEqual({
            text: 'Requirements for returns updated',
            titleText: 'Updated'
          })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view', async () => {
        const result = await SubmitAbstractionPeriodService(session.id, requirementIndex, payload, yarStub)

        expect(result).toMatchObject({
          abstractionPeriod: null,
          backLink: {
            href: `/system/return-versions/setup/${session.id}/points/0`,
            text: 'Back'
          },
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licenceRef: '01/ABC',
          pageTitle: 'Enter the abstraction period for the requirements for returns',
          pageTitleCaption: 'Licence 01/ABC'
        })
      })

      describe('because the user has not submitted anything', () => {
        it('includes an error for both input elements', async () => {
          const result = await SubmitAbstractionPeriodService(session.id, requirementIndex, payload, yarStub)

          expect(result.error).toEqual({
            abstractionPeriodEnd: {
              text: 'Select the end date of the abstraction period'
            },
            abstractionPeriodStart: {
              text: 'Select the start date of the abstraction period'
            },
            errorList: [
              {
                href: '#abstractionPeriodStart',
                text: 'Select the start date of the abstraction period'
              },
              {
                href: '#abstractionPeriodEnd',
                text: 'Select the end date of the abstraction period'
              }
            ]
          })
        })
      })

      describe('because the user has not submitted a start abstraction period', () => {
        beforeEach(() => {
          payload = {
            abstractionPeriodEndDay: '02',
            abstractionPeriodEndMonth: '7',
            abstractionPeriodStartDay: null,
            abstractionPeriodStartMonth: null
          }
        })

        it('includes an error for the start date input element', async () => {
          const result = await SubmitAbstractionPeriodService(session.id, requirementIndex, payload, yarStub)

          expect(result.error).toEqual({
            abstractionPeriodStart: {
              text: 'Select the start date of the abstraction period'
            },
            errorList: [
              {
                href: '#abstractionPeriodStart',
                text: 'Select the start date of the abstraction period'
              }
            ]
          })
        })

        it('includes what was submitted', async () => {
          const result = await SubmitAbstractionPeriodService(session.id, requirementIndex, payload, yarStub)

          expect(result.abstractionPeriod).toEqual({
            abstractionPeriodEndDay: '02',
            abstractionPeriodEndMonth: '7',
            abstractionPeriodStartDay: null,
            abstractionPeriodStartMonth: null
          })
        })
      })

      describe('because the user has not submitted an end abstraction period', () => {
        beforeEach(() => {
          payload = {
            abstractionPeriodEndDay: null,
            abstractionPeriodEndMonth: null,
            abstractionPeriodStartDay: '08',
            abstractionPeriodStartMonth: '12'
          }
        })

        it('includes an error for the end date input element', async () => {
          const result = await SubmitAbstractionPeriodService(session.id, requirementIndex, payload, yarStub)

          expect(result.error).toEqual({
            abstractionPeriodEnd: {
              text: 'Select the end date of the abstraction period'
            },
            errorList: [
              {
                href: '#abstractionPeriodEnd',
                text: 'Select the end date of the abstraction period'
              }
            ]
          })
        })

        it('includes what was submitted', async () => {
          const result = await SubmitAbstractionPeriodService(session.id, requirementIndex, payload, yarStub)

          expect(result.abstractionPeriod).toEqual({
            abstractionPeriodEndDay: null,
            abstractionPeriodEndMonth: null,
            abstractionPeriodStartDay: '08',
            abstractionPeriodStartMonth: '12'
          })
        })
      })

      describe('because the user has submitted invalid values', () => {
        beforeEach(() => {
          payload = {
            abstractionPeriodEndDay: 'abc',
            abstractionPeriodEndMonth: '123',
            abstractionPeriodStartDay: 'abc',
            abstractionPeriodStartMonth: '123'
          }
        })

        it('includes an error for both input elements', async () => {
          const result = await SubmitAbstractionPeriodService(session.id, requirementIndex, payload, yarStub)

          expect(result.error).toEqual({
            abstractionPeriodEnd: {
              text: 'Enter a real end date'
            },
            abstractionPeriodStart: {
              text: 'Enter a real start date'
            },
            errorList: [
              {
                href: '#abstractionPeriodStart',
                text: 'Enter a real start date'
              },
              {
                href: '#abstractionPeriodEnd',
                text: 'Enter a real end date'
              }
            ]
          })
        })

        it('includes what was submitted', async () => {
          const result = await SubmitAbstractionPeriodService(session.id, requirementIndex, payload, yarStub)

          expect(result.abstractionPeriod).toEqual({
            abstractionPeriodEndDay: 'abc',
            abstractionPeriodEndMonth: '123',
            abstractionPeriodStartDay: 'abc',
            abstractionPeriodStartMonth: '123'
          })
        })
      })
    })
  })
})
