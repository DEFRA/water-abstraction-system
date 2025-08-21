'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const UnitsPresenter = require('../../../../app/presenters/return-logs/setup/units.presenter.js')

describe('Return Logs Setup - Units presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      returnReference: '012345'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = UnitsPresenter.go(session)

      expect(result).to.equal({
        pageTitle: 'Which units were used?',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d',
        caption: 'Return reference 012345',
        units: null,
        backLink: '/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/reported'
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when the user has come from the "check" page', () => {
      beforeEach(() => {
        session.checkPageVisited = true
      })

      it('returns a link back to the "check" page', () => {
        const result = UnitsPresenter.go(session)

        expect(result.backLink).to.equal('/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/check')
      })
    })

    describe('when the user has come from the "abstraction-volumes" route', () => {
      it('returns a link back to the "Reported" page on', () => {
        const result = UnitsPresenter.go(session)

        expect(result.backLink).to.equal('/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/reported')
      })
    })

    describe('when the user has come from the "meter-readings" route', () => {
      beforeEach(() => {
        session.reported = 'meter-readings'
      })

      it('returns a link back to the "Start reading" page on', () => {
        const result = UnitsPresenter.go(session)

        expect(result.backLink).to.equal('/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/start-reading')
      })
    })
  })

  describe('the "units" property', () => {
    describe('when the user has previously selected "Cubic Metres" as the reported type', () => {
      beforeEach(() => {
        session.units = 'cubic-metres'
      })

      it('returns the "units" property populated to re-select the option', () => {
        const result = UnitsPresenter.go(session)

        expect(result.units).to.equal('cubic-metres')
      })
    })

    describe('when the user has previously selected "Litres" as the reported type', () => {
      beforeEach(() => {
        session.units = 'litres'
      })

      it('returns the "units" property populated to re-select the option', () => {
        const result = UnitsPresenter.go(session)

        expect(result.units).to.equal('litres')
      })
    })

    describe('when the user has previously selected "Megalitres" as the reported type', () => {
      beforeEach(() => {
        session.units = 'megalitres'
      })

      it('returns the "units" property populated to re-select the option', () => {
        const result = UnitsPresenter.go(session)

        expect(result.units).to.equal('megalitres')
      })
    })

    describe('when the user has previously selected "Gallons" as the reported type', () => {
      beforeEach(() => {
        session.units = 'gallons'
      })

      it('returns the "units" property populated to re-select the option', () => {
        const result = UnitsPresenter.go(session)

        expect(result.units).to.equal('gallons')
      })
    })
  })
})
