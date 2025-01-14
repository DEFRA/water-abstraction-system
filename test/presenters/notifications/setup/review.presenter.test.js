'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ReviewPresenter = require('../../../../app/presenters/notifications/setup/review.presenter.js')

describe('Notifications Setup - Review presenter', () => {
  let recipients

  beforeEach(() => {
    recipients = _recipients()
  })

  describe('the "recipientsAmount" property', () => {
    it('should return the size of the recipients array', () => {
      const result = ReviewPresenter.go(recipients, recipients.length)
      expect(result.recipientsAmount).to.equal(1)
    })
  })

  describe('the "recipients" property', () => {
    it('should return the list of recipients', () => {
      const result = ReviewPresenter.go(recipients)

      expect(result.recipients).to.equal([
        {
          contact: [
            'The Court of Owls',
            'Licence holder',
            'Gotham',
            'Organisation',
            'Metropolis',
            'G1 B2',
            'Owl One',
            'The Nest'
          ],
          licences: ['01/1234/56'],
          method: 'Letter - licence holder'
        }
      ])
    })
  })
})

function _recipients() {
  return [
    {
      all_licences: '01/1234/56',
      message_type: 'Letter - licence holder',
      recipient: null,
      contact: {
        name: 'The Court of Owls',
        role: 'Licence holder',
        town: 'Gotham',
        type: 'Organisation',
        county: 'Metropolis',
        country: null,
        forename: null,
        initials: null,
        postcode: 'G1 B2',
        salutation: null,
        addressLine1: 'Owl One',
        addressLine2: 'The Nest',
        addressLine3: null,
        addressLine4: null
      },
      contact_hash_id: 185890350
    }
  ]
}
