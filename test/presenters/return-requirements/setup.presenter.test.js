'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const SetupPresenter = require('../../../app/presenters/return-requirements/setup.presenter.js')

describe('Return Requirements - Setup presenter', () => {
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
      startDateOptions: 'licenceStartDate',
      reason: 'major-change'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = SetupPresenter.go(session)

      expect(result).to.equal({
        backLink: '/system/return-requirements/61e07498-f309-4829-96a9-72084a54996d/reason',
        licenceRef: '01/ABC',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d',
        setup: null
      })
    })
  })

  describe('the "backLink" property', () => {
    it('returns a link back to the "start-date" page', () => {
      const result = SetupPresenter.go(session)

      expect(result.backLink).to.equal('/system/return-requirements/61e07498-f309-4829-96a9-72084a54996d/reason')
    })
  })

  describe('the "setup" property', () => {
    describe('when the user has previously submitted a setup option', () => {
      beforeEach(() => {
        session.setup = 'set-up-manually'
      })

      it('returns a populated setup', () => {
        const result = SetupPresenter.go(session)

        expect(result.setup).to.equal('set-up-manually')
      })
    })

    describe('when the user has not previously submitted a setup option', () => {
      it('returns an empty setup', () => {
        const result = SetupPresenter.go(session)

        expect(result.setup).to.be.null()
      })
    })
  })
})
