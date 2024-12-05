'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ReturnsPeriodPresenter = require('../../../../app/presenters/notifications/setup/returns-period.presenter.js')

describe.only('Notifications Setup - Returns Period presenter', () => {
  const currentYear = 2025
  const previousYear = currentYear - 1
  const nextYear = currentYear + 1

  let testDate
  let month
  let day
  let clock

  afterEach(() => {
    clock.restore()
  })

  describe('when provided no params', () => {
    beforeEach(() => {
      month = 0
      day = 15

      testDate = new Date(currentYear, month, day)
      clock = Sinon.useFakeTimers(testDate)
    })
    it('correctly presents the data', () => {
      const result = ReturnsPeriodPresenter.go()

      expect(result).to.equal({ backLink: '/manage' }, { skip: ['returnsPeriod'] })
    })
  })

  describe('Options availability based on the current date', () => {
    describe('When the current date is between 1 January - 28 January', () => {
      describe('and the date is in January', () => {
        beforeEach(() => {
          month = 0
          day = 15

          testDate = new Date(currentYear, month, day)
          clock = Sinon.useFakeTimers(testDate)
        })

        describe('Option 1 should be for Quarterly 1 October (previous year) to 31 December (previous year) with a due date 28 January (current year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [firstOption]
            } = ReturnsPeriodPresenter.go()

            expect(firstOption).to.equal({
              value: 'currentPeriod',
              text: `Quarterly 1 October ${previousYear} to 31 December ${previousYear}`,
              hint: {
                text: `Due date 28 January ${currentYear}`
              }
            })
          })
        })

        describe('Option 2 should be for Quarterly 1 January (current year) to 31 March (current year) with a due date 28 April (current year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [, secondOption]
            } = ReturnsPeriodPresenter.go()

            expect(secondOption).to.equal({
              value: 'nextPeriod',
              text: `Quarterly 1 January ${currentYear} to 31 March ${currentYear}`,
              hint: {
                text: `Due date 28 April ${currentYear}`
              }
            })
          })
        })
      })

      describe('and the date is 28 January', () => {
        beforeEach(() => {
          month = 0
          day = 28

          testDate = new Date(currentYear, month, day)
          clock = Sinon.useFakeTimers(testDate)
        })

        describe('Option 1 should be for Quarterly 1 October (previous year) to 31 December (previous year) with a due date 28 January (current year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [firstOption]
            } = ReturnsPeriodPresenter.go()

            expect(firstOption).to.equal({
              value: 'currentPeriod',
              text: `Quarterly 1 October ${previousYear} to 31 December ${previousYear}`,
              hint: {
                text: `Due date 28 January ${currentYear}`
              }
            })
          })
        })

        describe('Option 2 should be for Quarterly 1 January (current year) to 31 March (current year) with a due date 28 April (current year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [, secondOption]
            } = ReturnsPeriodPresenter.go()

            expect(secondOption).to.equal({
              value: 'nextPeriod',
              text: `Quarterly 1 January ${currentYear} to 31 March ${currentYear}`,
              hint: {
                text: `Due date 28 April ${currentYear}`
              }
            })
          })
        })
      })
    })

    describe('When the current date is between 29 October - 28 November', () => {
      describe('and the date is 29th October', () => {
        beforeEach(() => {
          month = 9
          day = 29

          testDate = new Date(currentYear, month, day)
          clock = Sinon.useFakeTimers(testDate)
        })

        describe('Option 1 should be for Summer annual 1 November (previous year) to 31 October (current year) with a due date 28 November (current year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [firstOption]
            } = ReturnsPeriodPresenter.go()

            expect(firstOption).to.equal({
              value: 'currentPeriod',
              text: `Summer annual 1 November ${previousYear} to 31 October ${currentYear}`,
              hint: {
                text: `Due date 28 November ${currentYear}`
              }
            })
          })
        })

        describe('Option 2 should be for Quarterly 1 October (current year) to 31 December (current year) with a due date 28 January (next year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [, secondOption]
            } = ReturnsPeriodPresenter.go()

            expect(secondOption).to.equal({
              value: 'nextPeriod',
              text: `Quarterly 1 October ${currentYear} to 31 December ${currentYear}`,
              hint: {
                text: `Due date 28 January ${nextYear}`
              }
            })
          })
        })
      })
      describe('and the date is in November', () => {
        beforeEach(() => {
          month = 10
          day = 20

          testDate = new Date(currentYear, month, day)
          clock = Sinon.useFakeTimers(testDate)
        })

        describe('Option 1 should be for Summer annual 1 November (previous year) to 31 October (current year) with a due date 28 November (current year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [firstOption]
            } = ReturnsPeriodPresenter.go()

            expect(firstOption).to.equal({
              value: 'currentPeriod',
              text: `Summer annual 1 November ${previousYear} to 31 October ${currentYear}`,
              hint: {
                text: `Due date 28 November ${currentYear}`
              }
            })
          })
        })

        describe('Option 2 should be for Quarterly 1 October (current year) to 31 December (current year) with a due date 28 January (next year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [, secondOption]
            } = ReturnsPeriodPresenter.go()

            expect(secondOption).to.equal({
              value: 'nextPeriod',
              text: `Quarterly 1 October ${currentYear} to 31 December ${currentYear}`,
              hint: {
                text: `Due date 28 January ${nextYear}`
              }
            })
          })
        })
      })
      describe('and the date is 28 November', () => {
        beforeEach(() => {
          month = 10
          day = 28

          testDate = new Date(currentYear, month, day)
          clock = Sinon.useFakeTimers(testDate)
        })

        describe('Option 1 should be for Summer annual 1 November (previous year) to 31 October (current year) with a due date 28 November (current year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [firstOption]
            } = ReturnsPeriodPresenter.go()

            expect(firstOption).to.equal({
              value: 'currentPeriod',
              text: `Summer annual 1 November ${previousYear} to 31 October ${currentYear}`,
              hint: {
                text: `Due date 28 November ${currentYear}`
              }
            })
          })
        })

        describe('Option 2 should be for Quarterly 1 October (current year) to 31 December (current year) with a due date 28 January (next year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [, secondOption]
            } = ReturnsPeriodPresenter.go()

            expect(secondOption).to.equal({
              value: 'nextPeriod',
              text: `Quarterly 1 October ${currentYear} to 31 December ${currentYear}`,
              hint: {
                text: `Due date 28 January ${nextYear}`
              }
            })
          })
        })
      })
    })

    describe('When the current date is between 29 November - 31 December', () => {
      describe('and the date is in December', () => {
        beforeEach(() => {
          month = 11
          day = 25

          testDate = new Date(currentYear, month, day)
          clock = Sinon.useFakeTimers(testDate)
        })

        describe('Option 1 should be for Quarterly 1 October (current year) to 31 December (current year) with a due date 28 January (next year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [firstOption]
            } = ReturnsPeriodPresenter.go()

            expect(firstOption).to.equal({
              value: 'currentPeriod',
              text: `Quarterly 1 October ${currentYear} to 31 December ${currentYear}`,
              hint: {
                text: `Due date 28 January ${nextYear}`
              }
            })
          })
        })

        describe('Option 2 should be for Quarterly 1 January (next year) to 31 March (next year) with a due date 28 April (next year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [, secondOption]
            } = ReturnsPeriodPresenter.go()

            expect(secondOption).to.equal({
              value: 'nextPeriod',
              text: `Quarterly 1 January ${nextYear} to 31 March ${nextYear}`,
              hint: {
                text: `Due date 28 April ${nextYear}`
              }
            })
          })
        })
      })
      describe('and the date is 29 November', () => {
        beforeEach(() => {
          month = 10
          day = 29

          testDate = new Date(currentYear, month, day)
          clock = Sinon.useFakeTimers(testDate)
        })

        describe('Option 1 should be for Quarterly 1 October (current year) to 31 December (current year) with a due date 28 January (next year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [firstOption]
            } = ReturnsPeriodPresenter.go()

            expect(firstOption).to.equal({
              value: 'currentPeriod',
              text: `Quarterly 1 October ${currentYear} to 31 December ${currentYear}`,
              hint: {
                text: `Due date 28 January ${nextYear}`
              }
            })
          })
        })

        describe('Option 2 should be for Quarterly 1 January (next year) to 31 March (next year) with a due date 28 April (next year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [, secondOption]
            } = ReturnsPeriodPresenter.go()

            expect(secondOption).to.equal({
              value: 'nextPeriod',
              text: `Quarterly 1 January ${nextYear} to 31 March ${nextYear}`,
              hint: {
                text: `Due date 28 April ${nextYear}`
              }
            })
          })
        })
      })
    })
  })
})
