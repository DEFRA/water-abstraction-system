// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import NoReturnsRequiredPresenter from '../../../../src/presenters/return-versions/setup/no-returns-required.presenter.js'

describe('Return Versions Setup - No Returns Required presenter', () => {
  let session

  beforeEach(() => {
    session = {
      checkPageVisited: false,
      id: '61e07498-f309-4829-96a9-72084a54996d',
      journey: 'no-returns-required',
      licence: {
        currentVersionStartDate: '2023-01-01T00:00:00.000Z',
        endDate: null,
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceHolder: 'Turbo Kid',
        licenceRef: '01/ABC',
        startDate: '2022-04-01T00:00:00.000Z'
      },
      requirements: [{}],
      startDateOptions: 'licenceStartDate'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = NoReturnsRequiredPresenter(session)

      expect(result).toEqual({
        backLink: {
          href: '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/start-date',
          text: 'Back'
        },
        licenceRef: '01/ABC',
        pageTitle: 'Why are no returns required?',
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
        const result = NoReturnsRequiredPresenter(session)

        expect(result.backLink).toEqual({
          href: '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/check',
          text: 'Back'
        })
      })
    })

    describe('when the user has come from somewhere else', () => {
      it('returns a link back to the "start-date" page', () => {
        const result = NoReturnsRequiredPresenter(session)

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
        session.reason = 'licence-conditions-do-not-require-returns'
      })

      it('returns a populated reason', () => {
        const result = NoReturnsRequiredPresenter(session)

        expect(result.reason).toEqual('licence-conditions-do-not-require-returns')
      })
    })

    describe('when the user has not previously submitted a reason', () => {
      it('returns an empty reason', () => {
        const result = NoReturnsRequiredPresenter(session)

        expect(result.reason).toBeNull()
      })
    })
  })
})
