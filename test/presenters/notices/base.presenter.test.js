'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../fixtures/recipients.fixtures.js')

// Thing under test
const BasePresenter = require('../../../app/presenters/notices/base.presenter.js')

describe('Notices - Base presenter', () => {
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
})
