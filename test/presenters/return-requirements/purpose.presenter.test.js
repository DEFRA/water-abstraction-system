'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const PurposePresenter = require('../../../app/presenters/return-requirements/purpose.presenter.js')

describe('Purpose presenter', () => {
  const requirementIndex = 0

  let purposesData
  let session

  beforeEach(() => {
    purposesData = [
      { description: 'Heat Pump' },
      { description: 'Horticultural Watering' },
      { description: 'Hydraulic Rams' },
      { description: 'Hydraulic Testing' }
    ]

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
      const result = PurposePresenter.go(session, requirementIndex, purposesData)

      expect(result).to.equal({
        backLink: '/system/return-requirements/61e07498-f309-4829-96a9-72084a54996d/setup',
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licencePurposes: ['Heat Pump', 'Horticultural Watering', 'Hydraulic Rams', 'Hydraulic Testing'],
        licenceRef: '01/ABC',
        purposes: '',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d'
      })
    })
  })

  describe("the 'backLink' property", () => {
    describe("when the user has come from 'check your answers'", () => {
      beforeEach(() => {
        session.checkYourAnswersVisited = true
      })

      it("returns a link back to the 'check your answers' page", () => {
        const result = PurposePresenter.go(session, requirementIndex, purposesData)

        expect(result.backLink).to.equal('/system/return-requirements/61e07498-f309-4829-96a9-72084a54996d/check-your-answers')
      })
    })

    describe('when the user has come from somewhere else', () => {
      it("returns a link back to the 'setup' page", () => {
        const result = PurposePresenter.go(session, requirementIndex, purposesData)

        expect(result.backLink).to.equal('/system/return-requirements/61e07498-f309-4829-96a9-72084a54996d/setup')
      })
    })
  })

  describe("the 'licencePurposes' property", () => {
    it("returns the description from each 'purpose' passed in", () => {
      const result = PurposePresenter.go(session, requirementIndex, purposesData)

      expect(result.licencePurposes).to.equal(['Heat Pump', 'Horticultural Watering', 'Hydraulic Rams', 'Hydraulic Testing'])
    })
  })

  describe("the 'purposes' property", () => {
    describe('when the user has previously submitted purposes', () => {
      beforeEach(() => {
        session.requirements[0].purposes = ['Heat Pump', 'Hydraulic Rams']
      })

      it('returns a populated purposes', () => {
        const result = PurposePresenter.go(session, requirementIndex, purposesData)

        expect(result.purposes).to.equal('Heat Pump,Hydraulic Rams')
      })
    })

    describe('when the user has not previously submitted a purpose', () => {
      it('returns an empty purposes', () => {
        const result = PurposePresenter.go(session, requirementIndex, purposesData)

        expect(result.purposes).to.equal('')
      })
    })
  })
})
