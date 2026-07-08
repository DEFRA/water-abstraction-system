// Test helpers
import * as CustomersFixtures from '../../../support/fixtures/customers.fixture.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Thing under test
import ContactEmailPresenter from '../../../../app/presenters/company-contacts/setup/contact-email.presenter.js'

describe('Company Contacts - Setup - Contact Email Presenter', () => {
  let company
  let session

  beforeEach(() => {
    company = CustomersFixtures.company()

    session = { id: generateUUID(), company }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ContactEmailPresenter(session)

      expect(result).toEqual({
        backLink: {
          href: `/system/company-contacts/setup/${session.id}/contact-name`,
          text: 'Back'
        },
        email: null,
        pageTitle: 'Enter an email address for the contact',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })

    describe('the "email" property', () => {
      describe('when the email has previously been saved', () => {
        beforeEach(() => {
          session.email = 'eric@test.com'
        })

        it('returns the email from the session', () => {
          const result = ContactEmailPresenter(session)

          expect(result.email).toEqual('eric@test.com')
        })
      })

      describe('when the email has not previously been saved', () => {
        it('returns an empty string', () => {
          const result = ContactEmailPresenter(session)

          expect(result.email).toBeNull()
        })
      })
    })
  })
})
