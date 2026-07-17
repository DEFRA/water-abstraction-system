// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import ReasonPresenter from '../../../../app/presenters/return-versions/setup/reason.presenter.js'

describe('Return Versions Setup - Reason presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      checkPageVisited: false,
      licence: {
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        currentVersionStartDate: '2023-01-01T00:00:00.000Z',
        endDate: null,
        licenceRef: '01/ABC',
        licenceHolder: 'Turbo Kid',
        startDate: '2022-04-01T00:00:00.000Z'
      },
      journey: 'returns-required',
      requirements: [{}],
      startDateOptions: 'licenceStartDate'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = ReasonPresenter(session)

      expect(result).toEqual({
        backLink: {
          href: '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/start-date',
          text: 'Back'
        },
        licenceRef: '01/ABC',
        pageTitle: 'Select the reason for the requirements for returns',
        pageTitleCaption: 'Licence 01/ABC',
        reason: null,
        sessionId: '61e07498-f309-4829-96a9-72084a54996d'
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when the user has come from the "check" page', () => {
      beforeEach(() => {
        session.checkPageVisited = true
      })

      it('returns a link back to the "check" page', () => {
        const result = ReasonPresenter(session)

        expect(result.backLink).toEqual({
          href: '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/check',
          text: 'Back'
        })
      })
    })

    describe('when the user has come from somewhere else', () => {
      it('returns a link back to the "start-date" page', () => {
        const result = ReasonPresenter(session)

        expect(result.backLink).toEqual({
          href: '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/start-date',
          text: 'Back'
        })
      })
    })
  })

  describe('the "reason" property', () => {
    describe('when the user has previously submitted a reason', () => {
      beforeEach(() => {
        session.reason = 'major-change'
      })

      it('returns a populated reason', () => {
        const result = ReasonPresenter(session)

        expect(result.reason).toEqual('major-change')
      })
    })

    describe('when the user has not previously submitted a reason', () => {
      it('returns an empty reason', () => {
        const result = ReasonPresenter(session)

        expect(result.reason).toBeNull()
      })
    })
  })
})
