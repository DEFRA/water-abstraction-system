'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const LicenceNumberPresenter = require('../../../../app/presenters/licence-monitoring-station/setup/licence-number.presenter.js')

describe('Licence Monitoring Station Setup - Licence Number Presenter', () => {
  let session

  beforeEach(() => {
    session = {
      label: 'LABEL',
      id: 'd9afac37-9754-4bfa-95f7-87ab26824423'
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = LicenceNumberPresenter.go(session)

      expect(result).to.equal(
        {
          monitoringStationLabel: 'LABEL',
          pageTitle: 'Enter the licence number this threshold applies to'
        },
        { skip: ['backLink'] }
      )
    })

    describe('when checkPageVisited is true', () => {
      beforeEach(() => {
        session.checkPageVisited = true
      })

      it('returns the back link to the check page', () => {
        const result = LicenceNumberPresenter.go(session)

        expect(result.backLink).to.equal(
          `/system/licence-monitoring-station/setup/d9afac37-9754-4bfa-95f7-87ab26824423/check`
        )
      })
    })

    describe('when checkPageVisited is false', () => {
      beforeEach(() => {
        session.checkPageVisited = false
      })

      it('returns the back link to the stop or reduce page', () => {
        const result = LicenceNumberPresenter.go(session)

        expect(result.backLink).to.equal(
          `/system/licence-monitoring-station/setup/d9afac37-9754-4bfa-95f7-87ab26824423/stop-or-reduce`
        )
      })
    })
  })
})
