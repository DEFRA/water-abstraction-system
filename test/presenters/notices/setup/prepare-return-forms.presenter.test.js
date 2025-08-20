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

        describe('the "pageTitle" property', () => {
          it('should return the relevant title', () => {
            const result = PrepareReturnFormsPresenter.go(session, dueReturnLog, recipient)

            expect(result.pageTitle).to.equal('Water abstraction monthly return')
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
      })
    })

    describe('the "meterReadings" property', () => {
      describe('when the "returnsFrequency" is "month"', () => {
        beforeEach(() => {
          dueReturnLog.returnsFrequency = 'month'
        })

        describe('and the start and end are 6 months apart', () => {
          it('should return meter readings', () => {
            const result = PrepareReturnFormsPresenter.go(session, dueReturnLog, recipient)

            expect(result.meterReadings).to.equal([
              // Page
              [
                // Column
                [
                  '31 January 2025',
                  '28 February 2025',
                  '31 March 2025',
                  '30 April 2025',
                  '31 May 2025',
                  '30 June 2025'
                ],
                // Column
                []
              ]
            ])
          })
        })

        describe('and the start and end are 1 year apart', () => {
          beforeEach(() => {
            dueReturnLog.startDate = '2021-01-01'
            dueReturnLog.endDate = '2021-12-31'
          })

          it('should return meter readings', () => {
            const result = PrepareReturnFormsPresenter.go(session, dueReturnLog, recipient)

            expect(result.meterReadings).to.equal([
              // Page
              [
                // Column
                [
                  '31 January 2021',
                  '28 February 2021',
                  '31 March 2021',
                  '30 April 2021',
                  '31 May 2021',
                  '30 June 2021',
                  '31 July 2021',
                  '31 August 2021',
                  '30 September 2021',
                  '31 October 2021',
                  '30 November 2021',
                  '31 December 2021'
                ],
                // Column
                []
              ]
            ])
          })
        })
      })

      describe('when the "returnsFrequency" is "week"', () => {
        beforeEach(() => {
          dueReturnLog.returnsFrequency = 'week'
        })

        describe('and the period fits onto one page', () => {
          it('should return meter readings', () => {
            const result = PrepareReturnFormsPresenter.go(session, dueReturnLog, recipient)

            expect(result.meterReadings.length).to.equal(1)
            expect(result.meterReadings).to.equal([
              // Page
              [
                // Column
                [
                  '4 January 2025',
                  '11 January 2025',
                  '18 January 2025',
                  '25 January 2025',
                  '1 February 2025',
                  '8 February 2025',
                  '15 February 2025',
                  '22 February 2025',
                  '1 March 2025',
                  '8 March 2025',
                  '15 March 2025',
                  '22 March 2025',
                  '29 March 2025',
                  '5 April 2025'
                ],
                // Column
                [
                  '12 April 2025',
                  '19 April 2025',
                  '26 April 2025',
                  '3 May 2025',
                  '10 May 2025',
                  '17 May 2025',
                  '24 May 2025',
                  '31 May 2025'
                ]
              ]
            ])
          })
        })

        describe('and the period spans multiple pages', () => {
          beforeEach(() => {
            dueReturnLog.startDate = '2021-01-01'
            dueReturnLog.endDate = '2021-12-31'
          })

          it('should return meter readings', () => {
            const result = PrepareReturnFormsPresenter.go(session, dueReturnLog, recipient)

            expect(result.meterReadings.length).to.equal(2)
            expect(result.meterReadings).to.equal([
              // Page 1
              [
                // Column
                [
                  '2 January 2021',
                  '9 January 2021',
                  '16 January 2021',
                  '23 January 2021',
                  '30 January 2021',
                  '6 February 2021',
                  '13 February 2021',
                  '20 February 2021',
                  '27 February 2021',
                  '6 March 2021',
                  '13 March 2021',
                  '20 March 2021',
                  '27 March 2021',
                  '3 April 2021'
                ],
                // Column
                [
                  '10 April 2021',
                  '17 April 2021',
                  '24 April 2021',
                  '1 May 2021',
                  '8 May 2021',
                  '15 May 2021',
                  '22 May 2021',
                  '29 May 2021',
                  '5 June 2021',
                  '12 June 2021',
                  '19 June 2021',
                  '26 June 2021',
                  '3 July 2021',
                  '10 July 2021'
                ]
              ],
              // Page 2
              [
                // Column
                [
                  '17 July 2021',
                  '24 July 2021',
                  '31 July 2021',
                  '7 August 2021',
                  '14 August 2021',
                  '21 August 2021',
                  '28 August 2021',
                  '4 September 2021',
                  '11 September 2021',
                  '18 September 2021',
                  '25 September 2021',
                  '2 October 2021',
                  '9 October 2021',
                  '16 October 2021'
                ],
                // Column
                [
                  '23 October 2021',
                  '30 October 2021',
                  '6 November 2021',
                  '13 November 2021',
                  '20 November 2021',
                  '27 November 2021',
                  '4 December 2021',
                  '11 December 2021',
                  '18 December 2021',
                  '25 December 2021'
                ]
              ]
            ])
          })
        })
      })
    })
  })
})
