'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogFixture = require('../../../fixtures/return-logs.fixture.js')

// Thing under test
const PreparePaperReturnPresenter = require('../../../../app/presenters/notices/setup/prepare-paper-return.presenter.js')

describe('Notices - Setup - Prepare Paper Return Presenter', () => {
  const licenceRef = '01/123'

  let clock
  let dueReturnLog
  let notification

  beforeEach(() => {
    dueReturnLog = ReturnLogFixture.dueReturn()

    dueReturnLog.dueDate = '2025-07-06'
    dueReturnLog.endDate = '2025-06-06'
    dueReturnLog.startDate = '2025-01-01'

    notification = {
      eventId: null,
      licences: [licenceRef],
      messageRef: 'pdf.return_form',
      messageType: 'letter',
      personalisation: {
        address_line_1: 'Mr H J Licence holder',
        address_line_2: '1',
        address_line_3: 'Privet Drive',
        address_line_4: 'Little Whinging',
        address_line_5: 'Surrey',
        address_line_6: 'WD25 7LR',
        due_date: dueReturnLog.dueDate,
        end_date: dueReturnLog.endDate,
        format_id: dueReturnLog.returnReference,
        is_two_part_tariff: false,
        licence_ref: licenceRef,
        naldAreaCode: 'MIDLT',
        purpose: 'Mineral Washing',
        qr_url: dueReturnLog.returnLogId,
        region_code: '1',
        region_name: 'North West',
        returns_frequency: dueReturnLog.returnsFrequency,
        site_description: 'BOREHOLE AT AVALON',
        start_date: dueReturnLog.startDate
      },
      returnLogIds: [dueReturnLog.returnId]
    }

    clock = Sinon.useFakeTimers(new Date(`2025-01-01`))
  })

  afterEach(() => {
    clock.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = PreparePaperReturnPresenter.go(notification)

      expect(result).to.equal({
        address: {
          address_line_1: 'Mr H J Licence holder',
          address_line_2: '1',
          address_line_3: 'Privet Drive',
          address_line_4: 'Little Whinging',
          address_line_5: 'Surrey',
          address_line_6: 'WD25 7LR',
          address_line_7: undefined
        },
        dueDate: '6 July 2025',
        endDate: '6 June 2025',
        licenceRef: '01/123',
        naldAreaCode: 'MIDLT',
        pageEntries: result.pageEntries,
        pageTitle: 'Water abstraction monthly return',
        purpose: 'Mineral Washing',
        regionAndArea: 'North West / Lower Trent',
        regionCode: '1',
        returnId: dueReturnLog.returnId,
        returnLogId: dueReturnLog.returnLogId,
        returnReference: dueReturnLog.returnReference,
        returnsFrequency: 'month',
        siteDescription: 'BOREHOLE AT AVALON',
        startDate: '1 January 2025',
        twoPartTariff: false
      })
    })

    describe('the "regionAndArea" property', () => {
      describe('when there is a "naldAreaCode"', () => {
        beforeEach(() => {
          notification.personalisation.naldAreaCode = 'MIDLT'
        })

        it('should return the "regionName" and "naldAreaCode" in the text ', () => {
          const result = PreparePaperReturnPresenter.go(notification)

          expect(result.regionAndArea).to.equal('North West / Lower Trent')
        })
      })

      describe('when there is no "naldAreaCode"', () => {
        beforeEach(() => {
          notification.personalisation.naldAreaCode = null
        })

        it('should return the "regionName" in the text', () => {
          const result = PreparePaperReturnPresenter.go(notification)

          expect(result.regionAndArea).to.equal('North West')
        })
      })
    })

    describe('the "pageTitle" property', () => {
      describe('when the "returnsFrequency" is "day"', () => {
        beforeEach(() => {
          notification.personalisation.returns_frequency = 'day'
        })

        it('should return the relevant title', () => {
          const result = PreparePaperReturnPresenter.go(notification)

          expect(result.pageTitle).to.equal('Water abstraction daily return')
        })
      })

      describe('when the "returnsFrequency" is "month"', () => {
        beforeEach(() => {
          dueReturnLog.returnsFrequency = 'month'
        })

        describe('the "pageTitle" property', () => {
          it('should return the relevant title', () => {
            const result = PreparePaperReturnPresenter.go(notification)

            expect(result.pageTitle).to.equal('Water abstraction monthly return')
          })
        })
      })

      describe('when the "returnsFrequency" is "week"', () => {
        beforeEach(() => {
          notification.personalisation.returns_frequency = 'week'
        })

        describe('the "pageTitle" property', () => {
          it('should return the relevant title', () => {
            const result = PreparePaperReturnPresenter.go(notification)

            expect(result.pageTitle).to.equal('Water abstraction weekly return')
          })
        })
      })
    })

    describe('the "pageEntries" property', () => {
      describe('when the "returnsFrequency" is "day"', () => {
        beforeEach(() => {
          notification.personalisation.returns_frequency = 'day'
        })

        it('should return entries', () => {
          const result = PreparePaperReturnPresenter.go(notification)

          expect(result.pageEntries).to.equal([
            // Page
            [
              // Column
              {
                days: [
                  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
                  29, 30, 31
                ],
                period: 'January 2025'
              },
              // Column
              {
                days: [
                  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28
                ],
                period: 'February 2025'
              },
              // Column
              {
                days: [
                  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
                  29, 30, 31
                ],
                period: 'March 2025'
              }
            ],
            // Page
            [
              // Column
              {
                days: [
                  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
                  29, 30
                ],
                period: 'April 2025'
              },
              // Column
              {
                days: [
                  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
                  29, 30, 31
                ],
                period: 'May 2025'
              },
              // Column
              {
                days: [1, 2, 3, 4, 5, 6],
                period: 'June 2025'
              }
            ]
          ])
        })
      })

      describe('when the "returnsFrequency" is "month"', () => {
        beforeEach(() => {
          notification.personalisation.returns_frequency = 'month'
        })

        describe('and the start and end are 6 months apart', () => {
          it('should return entries', () => {
            const result = PreparePaperReturnPresenter.go(notification)

            expect(result.pageEntries).to.equal([
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
            notification.personalisation.end_date = '2021-12-31'
            notification.personalisation.start_date = '2021-01-01'
          })

          it('should return entries', () => {
            const result = PreparePaperReturnPresenter.go(notification)

            expect(result.pageEntries).to.equal([
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
          notification.personalisation.returns_frequency = 'week'
        })

        describe('and the period fits onto one page', () => {
          it('should return entries', () => {
            const result = PreparePaperReturnPresenter.go(notification)

            expect(result.pageEntries.length).to.equal(1)
            expect(result.pageEntries).to.equal([
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
            notification.personalisation.end_date = '2021-12-31'
            notification.personalisation.start_date = '2021-01-01'
          })

          it('should return entries', () => {
            const result = PreparePaperReturnPresenter.go(notification)

            expect(result.pageEntries.length).to.equal(2)
            expect(result.pageEntries.length).to.equal(2)
            expect(result.pageEntries).to.equal([
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

    describe('the "dueDate"', () => {
      describe('when a due date is set', () => {
        it('should return the due date', () => {
          const result = PreparePaperReturnPresenter.go(notification)

          expect(result.dueDate).to.equal('6 July 2025')
        })
      })

      describe('when a due date is not set', () => {
        beforeEach(() => {
          delete notification.personalisation.due_date
        })

        it('should return the due date (29 days in the future)', () => {
          const result = PreparePaperReturnPresenter.go(notification)

          expect(result.dueDate).to.equal('30 January 2025')
        })
      })
    })
  })
})
