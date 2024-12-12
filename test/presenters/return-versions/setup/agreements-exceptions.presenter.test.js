'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const AgreementsExceptionsPresenter = require('../../../../app/presenters/return-versions/setup/agreements-exceptions.presenter.js')

describe('Return Versions Setup - Agreements Exceptions presenter', () => {
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
      const result = AgreementsExceptionsPresenter.go(session, requirementIndex)

      expect(result).to.equal({
        agreementsExceptions: null,
        backLink: '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/frequency-reported/0',
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d'
      })
    })
  })

  describe('the "agreementsExceptions" property', () => {
    describe('when the user has previously submitted an agreement or exception', () => {
      beforeEach(() => {
        session.requirements[0].agreementsExceptions = 'gravity-fill'
      })

      it('returns a populated agreements-exceptions', () => {
        const result = AgreementsExceptionsPresenter.go(session, requirementIndex)

        expect(result.agreementsExceptions).to.equal('gravity-fill')
      })
    })

    describe('when the user has not previously submitted an agreement or exception', () => {
      it('returns an empty agreements-exceptions', () => {
        const result = AgreementsExceptionsPresenter.go(session, requirementIndex)

        expect(result.agreementsExceptions).to.be.null()
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when the user has come from the "check" page', () => {
      beforeEach(() => {
        session.checkPageVisited = true
      })

      it('returns a link back to the "check" page', () => {
        const result = AgreementsExceptionsPresenter.go(session, requirementIndex)

        expect(result.backLink).to.equal('/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/check')
      })
    })

    describe('when the user has come from somewhere else', () => {
      it('returns a link back to the "frequency-reported" page', () => {
        const result = AgreementsExceptionsPresenter.go(session, requirementIndex)

        expect(result.backLink).to.equal(
          '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/frequency-reported/0'
        )
      })
    })
  })
})
