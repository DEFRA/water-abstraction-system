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
        returnReference: '012345',
        units: null,
        backLink: '/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/reported'
      })
    })
  })

  describe('the "units" property', () => {
    describe('when the user has previously selected "Cubic Meters" as the reported type', () => {
      beforeEach(() => {
        session.units = 'cubic-meters'
      })

      it('returns the "units" property populated to re-select the option', () => {
        const result = UnitsPresenter.go(session)

        expect(result.units).to.equal('cubic-meters')
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
