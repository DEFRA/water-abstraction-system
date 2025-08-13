'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const PrepareReturnFormsPresenter = require('../../../../app/presenters/notices/setup/prepare-return-forms.presenter.js')

describe('Notices - Setup - Prepare Return Forms Presenter', () => {
  let session
  let dueReturnLog

  beforeEach(() => {
    session = { licenceRef: '123' }

    dueReturnLog = {
      dueDate: '2025-07-06',
      endDate: '2025-06-06',
      purpose: 'A purpose',
      returnsFrequency: 'day',
      returnReference: '123456',
      siteDescription: 'Water park',
      startDate: '2025-01-01',
      twoPartTariff: false
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = PrepareReturnFormsPresenter.go(session, dueReturnLog)

      expect(result).to.equal({
        address: {
          addressLine1: 'Sherlock Holmes',
          addressLine2: '221B Baker Street',
          addressLine3: 'London',
          addressLine4: 'NW1 6XE',
          addressLine5: 'United Kingdom'
        },
        siteDescription: 'Water park',
        dueDate: '6 July 2025',
        endDate: '6 June 2025',
        licenceRef: '123',
        purpose: 'A purpose',
        regionAndArea: 'A place / in the sun',
        returnReference: '123456',
        startDate: '1 January 2025',
        pageTitle: 'Water abstraction daily return',
        twoPartTariff: false
      })
    })

    describe('the "pageTitle" property', () => {
      describe('when the "returnsFrequency" is "day"', () => {
        beforeEach(() => {
          dueReturnLog.returnsFrequency = 'day'
        })

        it('should return the relevant title', () => {
          const result = PrepareReturnFormsPresenter.go(session, dueReturnLog)

          expect(result.pageTitle).to.equal('Water abstraction daily return')
        })
      })

      describe('when the "returnsFrequency" is "month"', () => {
        beforeEach(() => {
          dueReturnLog.returnsFrequency = 'month'
        })

        it('should return the relevant title', () => {
          const result = PrepareReturnFormsPresenter.go(session, dueReturnLog)

          expect(result.pageTitle).to.equal('Water abstraction monthly return')
        })
      })

      describe('when the "returnsFrequency" is "quarter"', () => {
        beforeEach(() => {
          dueReturnLog.returnsFrequency = 'quarter'
        })

        it('should return the relevant title', () => {
          const result = PrepareReturnFormsPresenter.go(session, dueReturnLog)

          expect(result.pageTitle).to.equal('Water abstraction quarterly return')
        })
      })

      describe('when the "returnsFrequency" is "week"', () => {
        beforeEach(() => {
          dueReturnLog.returnsFrequency = 'week'
        })

        it('should return the relevant title', () => {
          const result = PrepareReturnFormsPresenter.go(session, dueReturnLog)

          expect(result.pageTitle).to.equal('Water abstraction weekly return')
        })
      })

      describe('when the "returnsFrequency" is "year"', () => {
        beforeEach(() => {
          dueReturnLog.returnsFrequency = 'year'
        })

        it('should return the relevant title', () => {
          const result = PrepareReturnFormsPresenter.go(session, dueReturnLog)

          expect(result.pageTitle).to.equal('Water abstraction yearly return')
        })
      })
    })
  })
})
