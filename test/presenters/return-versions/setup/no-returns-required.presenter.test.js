'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const NoReturnsRequiredPresenter = require('../../../../app/presenters/return-versions/setup/no-returns-required.presenter.js')

describe('Return Versions Setup - No Returns Required presenter', () => {
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
      journey: 'no-returns-required',
      requirements: [{}],
      startDateOptions: 'licenceStartDate'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = NoReturnsRequiredPresenter.go(session)

      expect(result).to.equal({
        backLink: '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/start-date',
        licenceRef: '01/ABC',
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
        const result = NoReturnsRequiredPresenter.go(session)

        expect(result.backLink).to.equal('/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/check')
      })
    })

    describe('when the user has come from somewhere else', () => {
      it('returns a link back to the "start-date" page', () => {
        const result = NoReturnsRequiredPresenter.go(session)

        expect(result.backLink).to.equal(
          '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/start-date'
        )
      })
    })
  })

  describe('the "reason" property', () => {
    describe('when the user has previously submitted a reason', () => {
      beforeEach(() => {
        session.reason = 'licence-conditions-do-not-require-returns'
      })

      it('returns a populated reason', () => {
        const result = NoReturnsRequiredPresenter.go(session)

        expect(result.reason).to.equal('licence-conditions-do-not-require-returns')
      })
    })

    describe('when the user has not previously submitted a reason', () => {
      it('returns an empty reason', () => {
        const result = NoReturnsRequiredPresenter.go(session)

        expect(result.reason).to.be.null()
      })
    })
  })
})
