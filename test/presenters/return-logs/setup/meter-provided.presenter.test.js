'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const MeterProvidedPresenter = require('../../../../app/presenters/return-logs/setup/meter-provided.presenter.js')

describe('Return Logs Setup - Meter Provided presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      returnReference: '012345'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = MeterProvidedPresenter.go(session)

      expect(result).to.equal({
        backLink: { href: '/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/units', text: 'Back' },
        meterProvided: null,
        pageTitle: 'Have meter details been provided?',
        pageTitleCaption: 'Return reference 012345',
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
        const result = MeterProvidedPresenter.go(session)

        expect(result.backLink.href).to.equal('/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/check')
      })
    })

    describe('when the user has come from somewhere else', () => {
      it('returns a link back to the "units" page on', () => {
        const result = MeterProvidedPresenter.go(session)

        expect(result.backLink.href).to.equal('/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/units')
      })
    })
  })

  describe('the "meterProvided" property', () => {
    describe('when the user has previously selected "yes" to a meter being provided', () => {
      beforeEach(() => {
        session.meterProvided = 'yes'
      })

      it('returns the "meterProvided" property populated to re-select the option', () => {
        const result = MeterProvidedPresenter.go(session)

        expect(result.meterProvided).to.equal('yes')
      })
    })

    describe('when the user has previously selected "no" to a meter being provided', () => {
      beforeEach(() => {
        session.meterProvided = 'no'
      })

      it('returns the "meterProvided" property populated to re-select the option', () => {
        const result = MeterProvidedPresenter.go(session)

        expect(result.meterProvided).to.equal('no')
      })
    })
  })
})
