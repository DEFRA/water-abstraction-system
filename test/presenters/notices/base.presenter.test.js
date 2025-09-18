'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../fixtures/recipients.fixtures.js')

// Thing under test
const BasePresenter = require('../../../app/presenters/notices/base.presenter.js')

describe('Notices - Base presenter', () => {
  let clock

  beforeEach(() => {
    clock = Sinon.useFakeTimers(new Date(`2025-01-01`))
  })

  afterEach(() => {
    clock.restore()
  })

  describe('#addressToCSV()', () => {
    let recipient

    describe('when there is an address', () => {
      describe('and all the address lines are present', () => {
        beforeEach(() => {
          const recipients = RecipientsFixture.recipients()

          recipient = recipients.licenceHolder.contact

          recipient.addressLine3 = 'The Cupboard Under the Stairs'
        })

        it('returns a fixed array of 7 strings with all the address lines', () => {
          const result = BasePresenter.addressToCSV(recipient)

          expect(result.length).to.equal(7)
          expect(result).to.equal([
            'Mr H J Licence holder',
            '1',
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
          const recipients = RecipientsFixture.recipients()

          recipient = recipients.licenceHolder.contact

          delete recipient.county
        })

        it('returns a fixed array of 7 strings with some of the address lines, and missing strings at the end of the array', () => {
          const result = BasePresenter.addressToCSV(recipient)

          expect(result.length).to.equal(7)
          expect(result).to.equal(['Mr H J Licence holder', '1', 'Privet Drive', 'Little Whinging', 'WD25 7LR', '', ''])
        })
      })
    })

    describe('when there is no address', () => {
      it('returns a fixed array of 7 empty strings', () => {
        const result = BasePresenter.addressToCSV()

        expect(result.length).to.equal(7)
        expect(result).to.equal(['', '', '', '', '', '', ''])
      })
    })
  })

  describe('#futureDueDate()', () => {
    describe('when the "messageType" is "letter', () => {
      it('should set the date to 29 days in the future', () => {
        const result = BasePresenter.futureDueDate('letter')

        const expectedDate = new Date(`2025-01-30`)

        expect(result).to.equal(expectedDate)
      })

      describe('when calculating across month boundaries', () => {
        beforeEach(() => {
          clock.restore()
          clock = Sinon.useFakeTimers(new Date(`2025-01-15`))
        })

        it('should correctly calculate date across month boundary', () => {
          const result = BasePresenter.futureDueDate('letter')

          const expectedDate = new Date(`2025-02-13`)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('when calculating across year boundaries', () => {
        beforeEach(() => {
          clock.restore()
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
      it('should set the date to 28 days in the future', () => {
        const result = BasePresenter.futureDueDate('email')

        const expectedDate = new Date(`2025-01-29`)

        expect(result).to.equal(expectedDate)
      })

      describe('when calculating across month boundaries', () => {
        beforeEach(() => {
          clock.restore()
          clock = Sinon.useFakeTimers(new Date(`2025-01-15`))
        })

        it('should correctly calculate date across month boundary', () => {
          const result = BasePresenter.futureDueDate('email')

          const expectedDate = new Date(`2025-02-12`)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('when calculating across year boundaries', () => {
        beforeEach(() => {
          clock.restore()
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
      it('should set the date to 28 days in the future', () => {
        const result = BasePresenter.futureDueDate()

        const expectedDate = new Date(`2025-01-29`)

        expect(result).to.equal(expectedDate)
      })
    })
  })
})
