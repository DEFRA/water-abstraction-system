// Test helpers
import * as RecipientsFixture from '../../../support/fixtures/recipients.fixture.js'

// Thing under test
import ContactPresenter from '../../../../app/presenters/notices/setup/contact.presenter.js'

describe('Notices - Setup - Contact presenter', () => {
  let recipients

  beforeEach(() => {
    recipients = RecipientsFixture.recipients()
  })

  describe('when the recipient is an email', () => {
    it('should return the email address', () => {
      const result = ContactPresenter(recipients.primaryUser)

      expect(result).toEqual(['primary.user@important.com'])
    })
  })

  describe('when the recipient is an address', () => {
    describe('and it is valid', () => {
      it('should return the postal address', () => {
        const result = ContactPresenter(recipients.licenceHolder)

        expect(result).toEqual(['Harry Potter', '1', 'Privet Drive', 'Little Whinging', 'Surrey', 'WD25 7LR'])
      })
    })

    describe('and it is invalid', () => {
      beforeEach(() => {
        recipients.licenceHolder.contact.postcode = null
      })

      it('should return the postal address flagged as INVALID', () => {
        const result = ContactPresenter(recipients.licenceHolder)

        expect(result).toEqual([
          'Harry Potter',
          'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
          '1',
          'Privet Drive',
          'Little Whinging',
          'Surrey'
        ])
      })
    })
  })
})
