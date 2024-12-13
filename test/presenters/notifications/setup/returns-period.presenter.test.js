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
  let clock

  afterEach(() => {
    clock.restore()
  })

  describe('the "backLink" property', () => {
    beforeEach(() => {
      testDate = new Date(`${currentYear}-01-15`)
      clock = Sinon.useFakeTimers(testDate)
    })
    it('correctly presents the data', () => {
      const result = ReturnsPeriodPresenter.go()

      expect(result).to.equal({ backLink: '/manage' }, { skip: ['returnsPeriod'] })
    })
  })

  describe('the "returnsPeriod" property', () => {
    describe('When the current period is due for "quarterOne"', () => {
      describe('and the current date is between 29 January - 28 April', () => {
        beforeEach(() => {
          testDate = new Date(`${currentYear}-01-29`)
          clock = Sinon.useFakeTimers(testDate)
        })

        it('returns the current return period as "quarterOne"', () => {
          const {
            returnsPeriod: [currentReturnPeriod]
          } = ReturnsPeriodPresenter.go()

          expect(currentReturnPeriod).to.equal({
            value: 'quarterOne',
            text: `Quarterly 1 January ${currentYear} to 31 March ${currentYear}`,
            hint: { text: `Due date 28 April ${currentYear}` }
          })
        })

        it('returns the next return period as "allYear"', () => {
          const {
            returnsPeriod: [, nextReturnPeriod]
          } = ReturnsPeriodPresenter.go()

          expect(nextReturnPeriod).to.equal({
            value: 'allYear',
            text: `Winter and all year 1 April 2024 to 31 March ${currentYear}`,
            hint: { text: `Due date 28 April ${currentYear}` }
          })
        })
      })
    })

    describe('When the current period is due for "quarterTwo"', () => {
      describe('and the current date is between 29 April - 28 July', () => {
        beforeEach(() => {
          testDate = new Date(`${currentYear}-04-29`)
          clock = Sinon.useFakeTimers(testDate)
        })

        it('returns the current return period as "quarterTwo"', () => {
          const {
            returnsPeriod: [currentReturnPeriod]
          } = ReturnsPeriodPresenter.go()

          expect(currentReturnPeriod).to.equal({
            value: 'quarterTwo',
            text: `Quarterly 1 April ${currentYear} to 30 June ${currentYear}`,
            hint: { text: `Due date 28 July ${currentYear}` }
          })
        })

        it('returns the next return period as "quarterThree"', () => {
          const {
            returnsPeriod: [, nextReturnPeriod]
          } = ReturnsPeriodPresenter.go()

          expect(nextReturnPeriod).to.equal({
            value: 'quarterThree',
            text: `Quarterly 1 July ${currentYear} to 30 September ${currentYear}`,
            hint: { text: `Due date 28 October ${currentYear}` }
          })
        })
      })
    })

    describe('When the current period is due for "quarterThree"', () => {
      describe('and the current date is between 29 July - 28 October', () => {
        beforeEach(() => {
          testDate = new Date(`${currentYear}-07-29`)
          clock = Sinon.useFakeTimers(testDate)
        })

        it('returns the current return period as "quarterThree"', () => {
          const {
            returnsPeriod: [currentReturnPeriod]
          } = ReturnsPeriodPresenter.go()

          expect(currentReturnPeriod).to.equal({
            value: 'quarterThree',
            text: `Quarterly 1 July ${currentYear} to 30 September ${currentYear}`,
            hint: { text: `Due date 28 October ${currentYear}` }
          })
        })

        it('returns the next return period as "summer"', () => {
          const {
            returnsPeriod: [, nextReturnPeriod]
          } = ReturnsPeriodPresenter.go()

          expect(nextReturnPeriod).to.equal({
            value: 'summer',
            text: `Summer annual 1 November ${previousYear} to 31 October ${currentYear}`,
            hint: { text: `Due date 28 November ${currentYear}` }
          })
        })
      })
    })

    describe('When the current period is due for "summer"', () => {
      describe('and the current date is between 29 October - 28 November', () => {
        beforeEach(() => {
          testDate = new Date(`${currentYear}-10-29`)
          clock = Sinon.useFakeTimers(testDate)
        })

        it('returns the current return period as "summer"', () => {
          const {
            returnsPeriod: [currentReturnPeriod]
          } = ReturnsPeriodPresenter.go()

          expect(currentReturnPeriod).to.equal({
            value: 'summer',
            text: `Summer annual 1 November ${previousYear} to 31 October ${currentYear}`,
            hint: { text: `Due date 28 November ${currentYear}` }
          })
        })

        it('returns the next return period as "quarterFour"', () => {
          const {
            returnsPeriod: [, nextReturnPeriod]
          } = ReturnsPeriodPresenter.go()

          expect(nextReturnPeriod).to.equal({
            value: 'quarterFour',
            text: `Quarterly 1 October ${currentYear} to 31 December ${currentYear}`,
            hint: { text: `Due date 28 January ${nextYear}` }
          })
        })
      })
    })

    describe('When the current period is due for "quarterFour"', () => {
      describe('and the current date is between 29 November - 31 December', () => {
        beforeEach(() => {
          testDate = new Date(`${currentYear}-11-29`)
          clock = Sinon.useFakeTimers(testDate)
        })

        it('returns the current return period as "quarterFour"', () => {
          const {
            returnsPeriod: [currentReturnPeriod]
          } = ReturnsPeriodPresenter.go()

          expect(currentReturnPeriod).to.equal({
            value: 'quarterFour',
            text: `Quarterly 1 October ${currentYear} to 31 December ${currentYear}`,
            hint: { text: `Due date 28 January ${nextYear}` }
          })
        })

        it('returns the next return period as "quarterOne"', () => {
          const {
            returnsPeriod: [, nextReturnPeriod]
          } = ReturnsPeriodPresenter.go()

          expect(nextReturnPeriod).to.equal({
            value: 'quarterOne',
            text: `Quarterly 1 January ${nextYear} to 31 March ${nextYear}`,
            hint: { text: `Due date 28 April ${nextYear}` }
          })
        })
      })

      describe('and the current date is between 1 January - 28 January', () => {
        beforeEach(() => {
          testDate = new Date(`${currentYear}-01-01`)
          clock = Sinon.useFakeTimers(testDate)
        })

        it('returns the current return period as "quarterFour" - with the start and end date in the previous year', () => {
          const {
            returnsPeriod: [currentReturnPeriod]
          } = ReturnsPeriodPresenter.go()

          expect(currentReturnPeriod).to.equal({
            value: 'quarterFour',
            text: `Quarterly 1 October ${previousYear} to 31 December ${previousYear}`,
            hint: { text: `Due date 28 January ${currentYear}` }
          })
        })

        it('returns the next return period as "quarterFour" - with the start and end date in the current year', () => {
          const {
            returnsPeriod: [, nextReturnPeriod]
          } = ReturnsPeriodPresenter.go()

          expect(nextReturnPeriod).to.equal({
            value: 'quarterOne',
            text: `Quarterly 1 January ${currentYear} to 31 March ${currentYear}`,
            hint: { text: `Due date 28 April ${currentYear}` }
          })
        })
      })
    })
  })
})
