'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const SiteDescriptionPresenter = require('../../../app/presenters/return-requirements/site-description.presenter.js')

describe('Site Description presenter', () => {
  const requirementIndex = 0

  let session

  beforeEach(() => {
    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      licence: {
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        currentVersionStartDate: '2023-01-01T00:00:00.000Z',
        endDate: null,
        licenceRef: '01/ABC',
        licenceHolder: 'Turbo Kid',
        startDate: '2022-04-01T00:00:00.000Z'
      },
      requirements: [{}],
      checkYourAnswersVisited: false
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = SiteDescriptionPresenter.go(session, requirementIndex)

      expect(result).to.equal({
        backLink: '/system/return-requirements/61e07498-f309-4829-96a9-72084a54996d/returns-cycle/0',
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d',
        siteDescription: null
      })
    })
  })

  describe("the 'backLink' property", () => {
    describe("when the user has come from 'check your answers'", () => {
      beforeEach(() => {
        session.checkYourAnswersVisited = true
      })

      it("returns a link back to the 'check your answers' page", () => {
        const result = SiteDescriptionPresenter.go(session, requirementIndex)

        expect(result.backLink).to.equal('/system/return-requirements/61e07498-f309-4829-96a9-72084a54996d/check-your-answers')
      })
    })

    describe('when the user has come from somewhere else', () => {
      it("returns a link back to the 'returns-cycle' page", () => {
        const result = SiteDescriptionPresenter.go(session, requirementIndex)

        expect(result.backLink).to.equal('/system/return-requirements/61e07498-f309-4829-96a9-72084a54996d/returns-cycle/0')
      })
    })
  })

  describe("the 'siteDescription' property", () => {
    describe('when the user has previously submitted a site description', () => {
      beforeEach(() => {
        session.requirements[0].siteDescription = 'This is a valid return requirement description'
      })

      it('returns a populated site description', () => {
        const result = SiteDescriptionPresenter.go(session, requirementIndex)

        expect(result.siteDescription).to.equal('This is a valid return requirement description')
      })
    })

    describe('when the user has not previously submitted a site description', () => {
      it('returns an empty site description', () => {
        const result = SiteDescriptionPresenter.go(session, requirementIndex)

        expect(result.siteDescription).to.be.null()
      })
    })
  })
})
