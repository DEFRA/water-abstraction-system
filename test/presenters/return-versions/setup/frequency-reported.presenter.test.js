'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const FrequencyReportedPresenter = require('../../../../app/presenters/return-versions/setup/frequency-reported.presenter.js')

describe('Return Versions Setup - Frequency Reported presenter', () => {
  const requirementIndex = 0

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
      const result = FrequencyReportedPresenter.go(session, requirementIndex)

      expect(result).to.equal({
        backLink: '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/frequency-collected/0',
        frequencyReported: null,
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
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
        const result = FrequencyReportedPresenter.go(session, requirementIndex)

        expect(result.backLink).to.equal('/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/check')
      })
    })

    describe('when the user has come from somewhere else', () => {
      it('returns a link back to the "frequency-collected" page', () => {
        const result = FrequencyReportedPresenter.go(session, requirementIndex)

        expect(result.backLink).to.equal('/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/frequency-collected/0')
      })
    })
  })

  describe('the "frequencyReported" property', () => {
    describe('when the user has previously submitted the frequency reported', () => {
      beforeEach(() => {
        session.requirements[0].frequencyReported = 'week'
      })

      it('returns a populated frequency reported', () => {
        const result = FrequencyReportedPresenter.go(session, requirementIndex)

        expect(result.frequencyReported).to.equal('week')
      })
    })

    describe('when the user has not previously submitted the frequency reported', () => {
      it('returns an empty frequency reported', () => {
        const result = FrequencyReportedPresenter.go(session, requirementIndex)

        expect(result.frequencyReported).to.be.null()
      })
    })
  })
})
