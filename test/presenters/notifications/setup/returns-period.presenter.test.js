'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ReturnsPeriodPresenter = require('../../../../app/presenters/notifications/setup/returns-period.presenter.js')

describe('Notifications Setup - Returns Period presenter', () => {
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
    describe('When the current date is between 1st January - 28th January', () => {
      describe('and the date is in January', () => {
        beforeEach(() => {
          month = 0
          day = 15

          testDate = new Date(currentYear, month, day)
          clock = Sinon.useFakeTimers(testDate)
        })

        describe('Option 1 should be for Quarterly 1st October (previous year) to 31st December (previous year) with a due date 28 Jan (current year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [firstOption]
            } = ReturnsPeriodPresenter.go()

            expect(firstOption).to.equal({
              value: 'quarterFour',
              text: `Quarterly 1 October ${previousYear} to 31 December ${previousYear}`,
              hint: {
                text: `Due date 28 January ${currentYear}`
              }
            })
          })
        })

        describe('Option 2 should be for Quarterly 1st January (current year) to 31st March (current year) with a due date 28 April (current year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [, secondOption]
            } = ReturnsPeriodPresenter.go()

            expect(secondOption).to.equal({
              value: 'quarterOne',
              text: `Quarterly 1 January ${currentYear} to 31 March ${currentYear}`,
              hint: {
                text: `Due date 28 April ${currentYear}`
              }
            })
          })
        })
      })

      describe('and the date is 28th January', () => {
        beforeEach(() => {
          month = 0
          day = 28

          testDate = new Date(currentYear, month, day)
          clock = Sinon.useFakeTimers(testDate)
        })

        describe('Option 1 should be for Quarterly 1st October (previous year) to 31st December (previous year) with a due date 28 Jan (current year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [firstOption]
            } = ReturnsPeriodPresenter.go()

            expect(firstOption).to.equal({
              value: 'quarterFour',
              text: `Quarterly 1 October ${previousYear} to 31 December ${previousYear}`,
              hint: {
                text: `Due date 28 January ${currentYear}`
              }
            })
          })
        })

        describe('Option 2 should be for Quarterly 1st January (current year) to 31st March (current year) with a due date 28 April (current year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [, secondOption]
            } = ReturnsPeriodPresenter.go()

            expect(secondOption).to.equal({
              value: 'quarterOne',
              text: `Quarterly 1 January ${currentYear} to 31 March ${currentYear}`,
              hint: {
                text: `Due date 28 April ${currentYear}`
              }
            })
          })
        })
      })
    })

    describe('When the current date is between 29th October - 28th November', () => {
      describe('and the date is 29th October', () => {
        beforeEach(() => {
          month = 9
          day = 29

          testDate = new Date(currentYear, month, day)
          clock = Sinon.useFakeTimers(testDate)
        })

        describe('Option 1 should be for Summer annual 1st November (previous year) to 31st October (current year) with a due date 28 November (current year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [firstOption]
            } = ReturnsPeriodPresenter.go()

            expect(firstOption).to.equal({
              value: 'summer',
              text: `Summer annual 1 November ${previousYear} to 31 October ${currentYear}`,
              hint: {
                text: `Due date 28 November ${currentYear}`
              }
            })
          })
        })

        describe('Option 2 should be for Quarterly 1st October (current year) to 31st December (current year) with a due date 28 January (next year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [, secondOption]
            } = ReturnsPeriodPresenter.go()

            expect(secondOption).to.equal({
              value: 'quarterFour',
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

        describe('Option 1 should be for Summer annual 1st November (previous year) to 31st October (current year) with a due date 28 November (current year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [firstOption]
            } = ReturnsPeriodPresenter.go()

            expect(firstOption).to.equal({
              value: 'summer',
              text: `Summer annual 1 November ${previousYear} to 31 October ${currentYear}`,
              hint: {
                text: `Due date 28 November ${currentYear}`
              }
            })
          })
        })

        describe('Option 2 should be for Quarterly 1st October (current year) to 31st December (current year) with a due date 28 January (next year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [, secondOption]
            } = ReturnsPeriodPresenter.go()

            expect(secondOption).to.equal({
              value: 'quarterFour',
              text: `Quarterly 1 October ${currentYear} to 31 December ${currentYear}`,
              hint: {
                text: `Due date 28 January ${nextYear}`
              }
            })
          })
        })
      })
      describe('and the date is 28th November', () => {
        beforeEach(() => {
          testDate = new Date(`${currentYear}-11-28`)
          clock = Sinon.useFakeTimers(testDate)
        })

        describe('Option 1 should be for Summer annual 1st November (previous year) to 31st October (current year) with a due date 28 November (current year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [firstOption]
            } = ReturnsPeriodPresenter.go()

            expect(firstOption).to.equal({
              value: 'summer',
              text: `Summer annual 1 November ${previousYear} to 31 October ${currentYear}`,
              hint: {
                text: `Due date 28 November ${currentYear}`
              }
            })
          })
        })

        describe('Option 2 should be for Quarterly 1st October (current year) to 31st December (current year) with a due date 28 January (next year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [, secondOption]
            } = ReturnsPeriodPresenter.go()

            expect(secondOption).to.equal({
              value: 'quarterFour',
              text: `Quarterly 1 October ${currentYear} to 31 December ${currentYear}`,
              hint: {
                text: `Due date 28 January ${nextYear}`
              }
            })
          })
        })
      })
    })

    describe('When the current date is between 29th November - 31st December', () => {
      describe('and the date is in December', () => {
        beforeEach(() => {
          month = 11
          day = 25

          testDate = new Date(currentYear, month, day)
          clock = Sinon.useFakeTimers(testDate)
        })

        describe('Option 1 should be for Quarterly 1st October (current year) to 31st December (current year) with a due date 28 Jan (next year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [firstOption]
            } = ReturnsPeriodPresenter.go()

            expect(firstOption).to.equal({
              value: 'quarterFour',
              text: `Quarterly 1 October ${currentYear} to 31 December ${currentYear}`,
              hint: {
                text: `Due date 28 January ${nextYear}`
              }
            })
          })
        })

        describe('Option 2 should be for Quarterly 1st January (next year) to 31st March (next year) with a due date 28 April (next year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [, secondOption]
            } = ReturnsPeriodPresenter.go()

            expect(secondOption).to.equal({
              value: 'quarterOne',
              text: `Quarterly 1 January ${nextYear} to 31 March ${nextYear}`,
              hint: {
                text: `Due date 28 April ${nextYear}`
              }
            })
          })
        })
      })
      describe('and the date is 29th November', () => {
        beforeEach(() => {
          month = 10
          day = 29

          testDate = new Date(currentYear, month, day)
          clock = Sinon.useFakeTimers(testDate)
        })

        describe('Option 1 should be for Quarterly 1st October (current year) to 31st December (current year) with a due date 28 Jan (next year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [firstOption]
            } = ReturnsPeriodPresenter.go()

            expect(firstOption).to.equal({
              value: 'quarterFour',
              text: `Quarterly 1 October ${currentYear} to 31 December ${currentYear}`,
              hint: {
                text: `Due date 28 January ${nextYear}`
              }
            })
          })
        })

        describe('Option 2 should be for Quarterly 1st January (next year) to 31st March (next year) with a due date 28 April (next year)', () => {
          it('should return the correct "text" and "hint" values', () => {
            const {
              returnsPeriod: [, secondOption]
            } = ReturnsPeriodPresenter.go()

            expect(secondOption).to.equal({
              value: 'quarterOne',
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
