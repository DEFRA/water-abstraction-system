'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')

// Thing under test
const PrepareReturnFormsPresenter = require('../../../../app/presenters/notices/setup/prepare-return-forms.presenter.js')

describe('Notices - Setup - Prepare Return Forms Presenter', () => {
  let dueReturnLog
  let recipient
  let session

  beforeEach(() => {
    session = { licenceRef: '123' }

    recipient = RecipientsFixture.recipients().licenceHolder

    dueReturnLog = {
      dueDate: '2025-07-06',
      endDate: '2025-06-06',
      naldAreaCode: 'MIDLT',
      purpose: 'A purpose',
      regionName: 'North West',
      returnReference: '123456',
      returnsFrequency: 'day',
      siteDescription: 'Water park',
      startDate: '2025-01-01',
      twoPartTariff: false
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = PrepareReturnFormsPresenter.go(session, dueReturnLog, recipient)

      expect(result).to.equal({
        address: {
          address_line_1: 'Mr H J Licence holder',
          address_line_2: '1',
          address_line_3: 'Privet Drive',
          address_line_4: 'Little Whinging',
          address_line_5: 'Surrey',
          address_line_6: 'WD25 7LR'
        },
        siteDescription: 'Water park',
        dueDate: '6 July 2025',
        endDate: '6 June 2025',
        licenceRef: '123',
        purpose: 'A purpose',
        regionAndArea: 'North West / Lower Trent',
        returnReference: '123456',
        startDate: '1 January 2025',
        pageTitle: 'Water abstraction daily return',
        twoPartTariff: false
      })
    })

    describe('the "regionAndArea" property', () => {
      describe('when there is a "naldAreaCode"', () => {
        beforeEach(() => {
          dueReturnLog.naldAreaCode = 'MIDLT'
        })

        it('should return the "regionName" and "naldAreaCode" in the text ', () => {
          const result = PrepareReturnFormsPresenter.go(session, dueReturnLog, recipient)

          expect(result.regionAndArea).to.equal('North West / Lower Trent')
        })
      })

      describe('when there is no "naldAreaCode"', () => {
        beforeEach(() => {
          dueReturnLog.naldAreaCode = null
        })

        it('should return the "regionName" in the text', () => {
          const result = PrepareReturnFormsPresenter.go(session, dueReturnLog, recipient)

          expect(result.regionAndArea).to.equal('North West')
        })
      })
    })

    describe('the "pageTitle" property', () => {
      describe('when the "returnsFrequency" is "day"', () => {
        beforeEach(() => {
          dueReturnLog.returnsFrequency = 'day'
        })

        it('should return the relevant title', () => {
          const result = PrepareReturnFormsPresenter.go(session, dueReturnLog, recipient)

          expect(result.pageTitle).to.equal('Water abstraction daily return')
        })
      })

      describe('when the "returnsFrequency" is "month"', () => {
        beforeEach(() => {
          dueReturnLog.returnsFrequency = 'month'
        })

        it('should return the relevant title', () => {
          const result = PrepareReturnFormsPresenter.go(session, dueReturnLog, recipient)

          expect(result.pageTitle).to.equal('Water abstraction monthly return')
        })
      })

      describe('when the "returnsFrequency" is "quarter"', () => {
        beforeEach(() => {
          dueReturnLog.returnsFrequency = 'quarter'
        })

        it('should return the relevant title', () => {
          const result = PrepareReturnFormsPresenter.go(session, dueReturnLog, recipient)

          expect(result.pageTitle).to.equal('Water abstraction quarterly return')
        })
      })

      describe('when the "returnsFrequency" is "week"', () => {
        beforeEach(() => {
          dueReturnLog.returnsFrequency = 'week'
        })

        it('should return the relevant title', () => {
          const result = PrepareReturnFormsPresenter.go(session, dueReturnLog, recipient)

          expect(result.pageTitle).to.equal('Water abstraction weekly return')
        })
      })

      describe('when the "returnsFrequency" is "year"', () => {
        beforeEach(() => {
          dueReturnLog.returnsFrequency = 'year'
        })

        it('should return the relevant title', () => {
          const result = PrepareReturnFormsPresenter.go(session, dueReturnLog, recipient)

          expect(result.pageTitle).to.equal('Water abstraction yearly return')
        })
      })
    })
  })
})
