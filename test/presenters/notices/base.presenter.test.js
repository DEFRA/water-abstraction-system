'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../support/fixtures/recipients.fixtures.js')

// Thing under test
const BasePresenter = require('../../../app/presenters/notices/base.presenter.js')

describe('Notices - Base presenter', () => {
  let clock

  afterEach(() => {
    if (clock) {
      clock.restore()
    }
  })

  describe('#addressToCSV()', () => {
    let address

    describe('when there is an address', () => {
      describe('and all the address lines are present', () => {
        beforeEach(() => {
          address = RecipientsFixture.returnsNoticeLicenceHolder().contact

          address.addressLine3 = 'The Cupboard Under the Stairs'
        })

        it('returns a fixed array of 7 strings with all the address lines', () => {
          const result = BasePresenter.addressToCSV(address)

          expect(result.length).to.equal(7)
          expect(result).to.equal([
            'J Returnsholder',
            '4',
            'Privet Drive',
            'The Cupboard Under the Stairs',
            'Little Whinging',
            'Surrey',
            'WD25 7LR'
          ])
        })
      })

      describe('and some address lines are missing', () => {
        beforeEach(() => {
          address = RecipientsFixture.returnsNoticeLicenceHolder().contact

          delete address.county
        })

        it('returns a fixed array of 7 strings with some of the address lines, and missing strings at the end of the array', () => {
          const result = BasePresenter.addressToCSV(address)

          expect(result.length).to.equal(7)
          expect(result).to.equal(['J Returnsholder', '4', 'Privet Drive', 'Little Whinging', 'WD25 7LR', '', ''])
        })
      })

      describe('and all the address lines are missing', () => {
        beforeEach(() => {
          address = RecipientsFixture.returnsNoticeLicenceHolder().contact

          address.addressLine1 = null
          address.addressLine2 = null
          address.addressLine3 = null
          address.addressLine4 = null
          address.town = null
          address.county = null
          address.postcode = null
        })

        it('returns a fixed array of 7 strings with the contact name as address line 1, and the "INVALID ADDRESS" message', () => {
          const result = BasePresenter.addressToCSV(address)

          expect(result.length).to.equal(7)
          expect(result).to.equal([
            'J Returnsholder',
            'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
            '',
            '',
            '',
            '',
            ''
          ])
        })
      })
    })

    describe('when there is no address', () => {
      beforeEach(() => {
        address = null
      })

      it('returns a fixed array of 7 empty strings', () => {
        const result = BasePresenter.addressToCSV(address)

        expect(result.length).to.equal(7)
        expect(result).to.equal(['', '', '', '', '', '', ''])
      })
    })
  })

  describe('#futureDueDate()', () => {
    describe('when the "messageType" is "letter', () => {
      describe('and the current date is the start of the month', () => {
        beforeEach(() => {
          clock = Sinon.useFakeTimers(new Date(`2025-01-01`))
        })

        it('should set the date to 29 days in the future', () => {
          const result = BasePresenter.futureDueDate('letter')

          const expectedDate = new Date(`2025-01-30`)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('and the current date is towards the end of the month', () => {
        beforeEach(() => {
          clock = Sinon.useFakeTimers(new Date(`2025-01-15`))
        })

        it('should correctly calculate date across month boundary', () => {
          const result = BasePresenter.futureDueDate('letter')

          const expectedDate = new Date(`2025-02-13`)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('and the current date is towards the end of the year', () => {
        beforeEach(() => {
          clock = Sinon.useFakeTimers(new Date(`2024-12-15`))
        })

        it('should correctly calculate date across year boundary', () => {
          const result = BasePresenter.futureDueDate('letter')

          const expectedDate = new Date(`2025-01-13`)

          expect(result).to.equal(expectedDate)
        })
      })
    })

    describe('when the "messageType" is "email"', () => {
      describe('and the current date is the start of the month', () => {
        beforeEach(() => {
          clock = Sinon.useFakeTimers(new Date(`2025-01-01`))
        })

        it('should set the date to 28 days in the future', () => {
          const result = BasePresenter.futureDueDate('email')

          const expectedDate = new Date(`2025-01-29`)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('and the current date is towards the end of the month', () => {
        beforeEach(() => {
          clock = Sinon.useFakeTimers(new Date(`2025-01-15`))
        })

        it('should correctly calculate date across month boundary', () => {
          const result = BasePresenter.futureDueDate('email')

          const expectedDate = new Date(`2025-02-12`)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('and the current date is towards the end of the year', () => {
        beforeEach(() => {
          clock = Sinon.useFakeTimers(new Date(`2024-12-15`))
        })

        it('should correctly calculate date across year boundary', () => {
          const result = BasePresenter.futureDueDate('email')

          const expectedDate = new Date(`2025-01-12`)

          expect(result).to.equal(expectedDate)
        })
      })
    })

    describe('when no "messageType" is provided', () => {
      describe('and the current date is the start of the month', () => {
        beforeEach(() => {
          clock = Sinon.useFakeTimers(new Date(`2025-01-01`))
        })

        it('should set the date to 28 days in the future', () => {
          const result = BasePresenter.futureDueDate()

          const expectedDate = new Date(`2025-01-29`)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('and the current date is towards the end of the month', () => {
        beforeEach(() => {
          clock = Sinon.useFakeTimers(new Date(`2025-01-15`))
        })

        it('should correctly calculate date across month boundary', () => {
          const result = BasePresenter.futureDueDate()

          const expectedDate = new Date(`2025-02-12`)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('and the current date is towards the end of the year', () => {
        beforeEach(() => {
          clock = Sinon.useFakeTimers(new Date(`2024-12-15`))
        })

        it('should correctly calculate date across year boundary', () => {
          const result = BasePresenter.futureDueDate()

          const expectedDate = new Date(`2025-01-12`)

          expect(result).to.equal(expectedDate)
        })
      })
    })
  })

  describe('#returnsPeriodText', () => {
    let returnsPeriod

    beforeEach(() => {
      returnsPeriod = {
        name: 'allYear',
        summer: 'false',
        dueDate: '2025-11-28T00:00:00.000Z',
        endDate: '2025-10-31T00:00:00.000Z',
        startDate: '2024-11-01T00:00:00.000Z'
      }
    })

    describe('when the return period name is "allYear"', () => {
      it('should return the correct text', () => {
        const result = BasePresenter.returnsPeriodText(returnsPeriod)

        expect(result).to.equal('Winter and all year annual 1 November 2024 to 31 October 2025')
      })
    })

    describe('when the return period name is "summer"', () => {
      beforeEach(() => {
        returnsPeriod.name = 'summer'
      })

      it('should return the correct text', () => {
        const result = BasePresenter.returnsPeriodText(returnsPeriod)

        expect(result).to.equal('Summer annual 1 November 2024 to 31 October 2025')
      })
    })

    describe('when the return period name is "Quarterly"', () => {
      beforeEach(() => {
        returnsPeriod.name = 'Quarterly'
      })

      it('should return the correct text', () => {
        const result = BasePresenter.returnsPeriodText(returnsPeriod)

        expect(result).to.equal('Quarterly 1 November 2024 to 31 October 2025')
      })
    })
  })
})
