'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateReferenceCode } = require('../../../../support/helpers/notification.helper.js')

// Thing under test
const ReturnsPeriodPresenter = require('../../../../../app/presenters/notices/setup/returns-period/returns-period.presenter.js')

describe('Notices - Setup - Returns Period presenter', () => {
  const currentYear = 2025
  const previousYear = currentYear - 1
  const nextYear = currentYear + 1

  let testDate
  let referenceCode
  let clock
  let session = {}

  afterEach(() => {
    session = {}
    clock.restore()
  })

  describe('the data', () => {
    beforeEach(() => {
      referenceCode = generateReferenceCode()

      session = { referenceCode, journey: 'invitations' }
      testDate = new Date(`${currentYear}-01-15`)
      clock = Sinon.useFakeTimers(testDate)
    })

    it('correctly presents the data', () => {
      const result = ReturnsPeriodPresenter.go(session)

      expect(result).to.equal(
        {
          backLink: {
            href: '/manage',
            text: 'Back'
          },
          pageTitle: 'Select the returns periods for the invitations',
          pageTitleCaption: `Notice ${referenceCode}`
        },
        { skip: ['returnsPeriod'] }
      )
    })
  })

  describe('the "pageTitle" property', () => {
    beforeEach(() => {
      session = { referenceCode: 'RINV-123', journey: 'invitations' }
      testDate = new Date(`${currentYear}-01-15`)
      clock = Sinon.useFakeTimers(testDate)
    })

    describe('when the journey is "invitations"', () => {
      it('correctly presents the data', () => {
        const result = ReturnsPeriodPresenter.go(session)

        expect(result.pageTitle).to.equal('Select the returns periods for the invitations')
      })
    })

    describe('when the journey is "reminders"', () => {
      beforeEach(() => {
        session.journey = 'reminders'
      })

      it('correctly presents the data', () => {
        const result = ReturnsPeriodPresenter.go(session)

        expect(result.pageTitle).to.equal('Select the returns periods for the reminders')
      })
    })
  })

  describe('the "returnsPeriod" property', () => {
    describe('when the "session" has a saved returns period', () => {
      beforeEach(() => {
        session = { returnsPeriod: 'quarterOne' }

        testDate = new Date(`${currentYear}-04-29`)
        clock = Sinon.useFakeTimers(testDate)
      })

      it('should mark the returns period as checked', () => {
        const {
          returnsPeriod: [currentReturnPeriod]
        } = ReturnsPeriodPresenter.go(session)

        expect(currentReturnPeriod).to.equal({
          checked: true,
          value: 'quarterOne',
          text: `Quarterly 1 April ${currentYear} to 30 June ${currentYear}`,
          hint: { text: `Due date 28 July ${currentYear}` }
        })
      })
    })

    describe('when the current date is the same date', () => {
      beforeEach(() => {
        testDate = new Date(`${currentYear}-04-28T09:59:59.999Z`)
        clock = Sinon.useFakeTimers(testDate)
      })

      it('returns the current return period as "quarterFour"', () => {
        const {
          returnsPeriod: [currentReturnPeriod]
        } = ReturnsPeriodPresenter.go(session)

        expect(currentReturnPeriod).to.equal({
          checked: false,
          value: 'quarterFour',
          text: `Quarterly 1 January ${currentYear} to 31 March ${currentYear}`,
          hint: { text: `Due date 28 April ${currentYear}` }
        })
      })

      it('returns the next return period as "allYear"', () => {
        const {
          returnsPeriod: [, nextReturnPeriod]
        } = ReturnsPeriodPresenter.go(session)

        expect(nextReturnPeriod).to.equal({
          checked: false,
          value: 'allYear',
          text: `Winter and all year annual 1 April 2024 to 31 March ${currentYear}`,
          hint: { text: `Due date 28 April ${currentYear}` }
        })
      })
    })

    describe('When the current period is due for "quarterFour"', () => {
      describe('and the current date is between 29 January - 28 April', () => {
        beforeEach(() => {
          testDate = new Date(`${currentYear}-01-29`)
          clock = Sinon.useFakeTimers(testDate)
        })

        it('returns the current return period as "quarterFour"', () => {
          const {
            returnsPeriod: [currentReturnPeriod]
          } = ReturnsPeriodPresenter.go(session)

          expect(currentReturnPeriod).to.equal({
            checked: false,
            value: 'quarterFour',
            text: `Quarterly 1 January ${currentYear} to 31 March ${currentYear}`,
            hint: { text: `Due date 28 April ${currentYear}` }
          })
        })

        it('returns the next return period as "allYear"', () => {
          const {
            returnsPeriod: [, nextReturnPeriod]
          } = ReturnsPeriodPresenter.go(session)

          expect(nextReturnPeriod).to.equal({
            checked: false,
            value: 'allYear',
            text: `Winter and all year annual 1 April 2024 to 31 March ${currentYear}`,
            hint: { text: `Due date 28 April ${currentYear}` }
          })
        })
      })
    })

    describe('When the current period is due for "quarterOne"', () => {
      describe('and the current date is between 29 April - 28 July', () => {
        beforeEach(() => {
          testDate = new Date(`${currentYear}-04-29`)
          clock = Sinon.useFakeTimers(testDate)
        })

        it('returns the current return period as "quarterOne"', () => {
          const {
            returnsPeriod: [currentReturnPeriod]
          } = ReturnsPeriodPresenter.go(session)

          expect(currentReturnPeriod).to.equal({
            checked: false,
            value: 'quarterOne',
            text: `Quarterly 1 April ${currentYear} to 30 June ${currentYear}`,
            hint: { text: `Due date 28 July ${currentYear}` }
          })
        })

        it('returns the next return period as "quarterTwo"', () => {
          const {
            returnsPeriod: [, nextReturnPeriod]
          } = ReturnsPeriodPresenter.go(session)

          expect(nextReturnPeriod).to.equal({
            checked: false,
            value: 'quarterTwo',
            text: `Quarterly 1 July ${currentYear} to 30 September ${currentYear}`,
            hint: { text: `Due date 28 October ${currentYear}` }
          })
        })
      })
    })

    describe('When the current period is due for "quarterTwo"', () => {
      describe('and the current date is between 29 July - 28 October', () => {
        beforeEach(() => {
          testDate = new Date(`${currentYear}-07-29`)
          clock = Sinon.useFakeTimers(testDate)
        })

        it('returns the current return period as "quarterTwo"', () => {
          const {
            returnsPeriod: [currentReturnPeriod]
          } = ReturnsPeriodPresenter.go(session)

          expect(currentReturnPeriod).to.equal({
            checked: false,
            value: 'quarterTwo',
            text: `Quarterly 1 July ${currentYear} to 30 September ${currentYear}`,
            hint: { text: `Due date 28 October ${currentYear}` }
          })
        })

        it('returns the next return period as "summer"', () => {
          const {
            returnsPeriod: [, nextReturnPeriod]
          } = ReturnsPeriodPresenter.go(session)

          expect(nextReturnPeriod).to.equal({
            checked: false,
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
          } = ReturnsPeriodPresenter.go(session)

          expect(currentReturnPeriod).to.equal({
            checked: false,
            value: 'summer',
            text: `Summer annual 1 November ${previousYear} to 31 October ${currentYear}`,
            hint: { text: `Due date 28 November ${currentYear}` }
          })
        })

        it('returns the next return period as "quarterThree"', () => {
          const {
            returnsPeriod: [, nextReturnPeriod]
          } = ReturnsPeriodPresenter.go(session)

          expect(nextReturnPeriod).to.equal({
            checked: false,
            value: 'quarterThree',
            text: `Quarterly 1 October ${currentYear} to 31 December ${currentYear}`,
            hint: { text: `Due date 28 January ${nextYear}` }
          })
        })
      })
    })

    describe('When the current period is due for "quarterThree"', () => {
      describe('and the current date is between 29 November - 31 December', () => {
        beforeEach(() => {
          testDate = new Date(`${currentYear}-11-29`)
          clock = Sinon.useFakeTimers(testDate)
        })

        it('returns the current return period as "quarterThree"', () => {
          const {
            returnsPeriod: [currentReturnPeriod]
          } = ReturnsPeriodPresenter.go(session)

          expect(currentReturnPeriod).to.equal({
            checked: false,
            value: 'quarterThree',
            text: `Quarterly 1 October ${currentYear} to 31 December ${currentYear}`,
            hint: { text: `Due date 28 January ${nextYear}` }
          })
        })

        it('returns the next return period as "quarterFour"', () => {
          const {
            returnsPeriod: [, nextReturnPeriod]
          } = ReturnsPeriodPresenter.go(session)

          expect(nextReturnPeriod).to.equal({
            checked: false,
            value: 'quarterFour',
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

        it('returns the current return period as "quarterThree" - with the start and end date in the previous year', () => {
          const {
            returnsPeriod: [currentReturnPeriod]
          } = ReturnsPeriodPresenter.go(session)

          expect(currentReturnPeriod).to.equal({
            checked: false,
            value: 'quarterThree',
            text: `Quarterly 1 October ${previousYear} to 31 December ${previousYear}`,
            hint: { text: `Due date 28 January ${currentYear}` }
          })
        })

        it('returns the next return period as "quarterFour" - with the start and end date in the current year', () => {
          const {
            returnsPeriod: [, nextReturnPeriod]
          } = ReturnsPeriodPresenter.go(session)

          expect(nextReturnPeriod).to.equal({
            checked: false,
            value: 'quarterFour',
            text: `Quarterly 1 January ${currentYear} to 31 March ${currentYear}`,
            hint: { text: `Due date 28 April ${currentYear}` }
          })
        })
      })
    })
  })
})
