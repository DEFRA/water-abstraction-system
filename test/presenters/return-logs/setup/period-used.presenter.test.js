'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const PeriodUsedPresenter = require('../../../../app/presenters/return-logs/setup/period-used.presenter.js')

describe('Return Logs Setup - Period Used presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      returnReference: '012345',
      periodStartDay: '01',
      periodStartMonth: '04',
      periodEndDay: '31',
      periodEndMonth: '03'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = PeriodUsedPresenter.go(session)

      expect(result).to.equal({
        abstractionPeriod: '1 April to 31 March',
        backLink: '/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/single-volume',
        pageTitle: 'What period was used for this volume?',
        returnReference: '012345',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d',
        periodDateUsedOptions: null,
        periodUsedFromDay: null,
        periodUsedFromMonth: null,
        periodUsedFromYear: null,
        periodUsedToDay: null,
        periodUsedToMonth: null,
        periodUsedToYear: null
      })
    })
  })

  describe('the "periodDateUsedOptions" property', () => {
    describe('when the user has previously selected the default abstraction date as the period used', () => {
      beforeEach(() => {
        session.periodDateUsedOptions = 'default'
      })

      it('returns the "periodDateUsedOptions" property populated to re-select the option', () => {
        const result = PeriodUsedPresenter.go(session)

        expect(result.periodDateUsedOptions).to.equal('default')
      })
    })

    describe('when the user has previously selected custom date as the period used', () => {
      beforeEach(() => {
        session.periodDateUsedOptions = 'custom-dates'
      })

      it('returns the "periodDateUsedOptions" property populated to re-select the option', () => {
        const result = PeriodUsedPresenter.go(session)

        expect(result.periodDateUsedOptions).to.equal('custom-dates')
      })
    })
  })

  describe('the "periodUsedFromDay", "periodUsedFromMonth" and "periodUsedFromYear" properties', () => {
    describe('when the user has previously entered a used from day', () => {
      beforeEach(() => {
        session.periodUsedFromDay = '1'
        session.periodUsedFromMonth = '04'
        session.periodUsedFromYear = '2023'
      })

      it('returns the "periodUsedFrom" properties populated to re-select the option', () => {
        const result = PeriodUsedPresenter.go(session)

        expect(result.periodUsedFromDay).to.equal('1')
        expect(result.periodUsedFromMonth).to.equal('04')
        expect(result.periodUsedFromYear).to.equal('2023')
      })
    })
  })

  describe('the "periodUsedToDay", "periodUsedToMonth" and "periodUsedToYear" properties', () => {
    describe('when the user has previously entered a used to day', () => {
      beforeEach(() => {
        session.periodUsedToDay = '31'
        session.periodUsedToMonth = '03'
        session.periodUsedToYear = '2024'
      })

      it('returns the "periodUsedTo" properties populated to re-select the option', () => {
        const result = PeriodUsedPresenter.go(session)

        expect(result.periodUsedToDay).to.equal('31')
        expect(result.periodUsedToMonth).to.equal('03')
        expect(result.periodUsedToYear).to.equal('2024')
      })
    })
  })
})
