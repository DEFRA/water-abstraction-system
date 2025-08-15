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
      returnsFrequency: 'week',
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
        meterReadings: result.meterReadings,
        purpose: 'A purpose',
        regionAndArea: 'North West / Lower Trent',
        returnReference: '123456',
        returnsFrequency: 'week',
        startDate: '1 January 2025',
        pageTitle: 'Water abstraction weekly return',
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

    describe('when the "returnsFrequency" is "day"', () => {
      beforeEach(() => {
        dueReturnLog.returnsFrequency = 'day'
      })

      describe('the "pageTitle" property', () => {
        it('should return the relevant title', () => {
          const result = PrepareReturnFormsPresenter.go(session, dueReturnLog, recipient)

          expect(result.pageTitle).to.equal('Water abstraction daily return')
        })
      })
    })

    describe('when the "returnsFrequency" is "month"', () => {
      beforeEach(() => {
        dueReturnLog.returnsFrequency = 'month'
      })

      describe('the "pageTitle" property', () => {
        it('should return the relevant title', () => {
          const result = PrepareReturnFormsPresenter.go(session, dueReturnLog, recipient)

          expect(result.pageTitle).to.equal('Water abstraction monthly return')
        })
      })

      describe('the "meterReadings" property', () => {
        it('should return meter readings', () => {
          const result = PrepareReturnFormsPresenter.go(session, dueReturnLog, recipient)

          expect(result.meterReadings).to.equal([
            [
              [
                '1 January 2021',
                '2 January 2021',
                '3 January 2021',
                '4 January 2021',
                '5 January 2021',
                '6 January 2021',
                '7 January 2021',
                '8 January 2021',
                '9 January 2021',
                '10 January 2021',
                '11 January 2021',
                '12 January 2021'
              ],
              [
                '13 January 2021',
                '14 January 2021',
                '15 January 2021',
                '16 January 2021',
                '17 January 2021',
                '18 January 2021',
                '19 January 2021',
                '20 January 2021',
                '21 January 2021',
                '22 January 2021',
                '23 January 2021',
                '24 January 2021'
              ]
            ],
            [
              [
                '25 January 2021',
                '26 January 2021',
                '27 January 2021',
                '28 January 2021',
                '29 January 2021',
                '30 January 2021',
                '31 January 2021',
                '1 February 2021',
                '2 February 2021',
                '3 February 2021',
                '4 February 2021',
                '5 February 2021'
              ],
              [
                '6 February 2021',
                '7 February 2021',
                '8 February 2021',
                '9 February 2021',
                '10 February 2021',
                '11 February 2021',
                '12 February 2021',
                '13 February 2021',
                '14 February 2021',
                '15 February 2021',
                '16 February 2021',
                '17 February 2021'
              ]
            ],
            [
              [
                '18 February 2021',
                '19 February 2021',
                '20 February 2021',
                '21 February 2021',
                '22 February 2021',
                '23 February 2021',
                '24 February 2021',
                '25 February 2021',
                '26 February 2021',
                '27 February 2021',
                '28 February 2021',
                '1 March 2021'
              ],
              ['2 March 2021', '3 March 2021', '4 March 2021', '5 March 2021']
            ]
          ])
        })
      })
    })

    describe('when the "returnsFrequency" is "week"', () => {
      beforeEach(() => {
        dueReturnLog.returnsFrequency = 'week'
      })

      describe('the "pageTitle" property', () => {
        it('should return the relevant title', () => {
          const result = PrepareReturnFormsPresenter.go(session, dueReturnLog, recipient)

          expect(result.pageTitle).to.equal('Water abstraction weekly return')
        })
      })

      describe('the "meterReadings" property', () => {
        it('should return meter readings', () => {
          const result = PrepareReturnFormsPresenter.go(session, dueReturnLog, recipient)

          expect(result.meterReadings).to.equal([
            [
              [
                '1 January 2021',
                '2 January 2021',
                '3 January 2021',
                '4 January 2021',
                '5 January 2021',
                '6 January 2021',
                '7 January 2021',
                '8 January 2021',
                '9 January 2021',
                '10 January 2021',
                '11 January 2021',
                '12 January 2021',
                '13 January 2021',
                '14 January 2021'
              ],
              [
                '15 January 2021',
                '16 January 2021',
                '17 January 2021',
                '18 January 2021',
                '19 January 2021',
                '20 January 2021',
                '21 January 2021',
                '22 January 2021',
                '23 January 2021',
                '24 January 2021',
                '25 January 2021',
                '26 January 2021',
                '27 January 2021',
                '28 January 2021'
              ]
            ],
            [
              [
                '29 January 2021',
                '30 January 2021',
                '31 January 2021',
                '1 February 2021',
                '2 February 2021',
                '3 February 2021',
                '4 February 2021',
                '5 February 2021',
                '6 February 2021',
                '7 February 2021',
                '8 February 2021',
                '9 February 2021',
                '10 February 2021',
                '11 February 2021'
              ],
              [
                '12 February 2021',
                '13 February 2021',
                '14 February 2021',
                '15 February 2021',
                '16 February 2021',
                '17 February 2021',
                '18 February 2021',
                '19 February 2021',
                '20 February 2021',
                '21 February 2021',
                '22 February 2021',
                '23 February 2021',
                '24 February 2021',
                '25 February 2021'
              ]
            ],
            [
              [
                '26 February 2021',
                '27 February 2021',
                '28 February 2021',
                '1 March 2021',
                '2 March 2021',
                '3 March 2021',
                '4 March 2021',
                '5 March 2021'
              ],
              []
            ]
          ])
        })
      })
    })
  })
})
