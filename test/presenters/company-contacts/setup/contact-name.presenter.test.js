// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import * as CustomersFixtures from '../../../support/fixtures/customers.fixture.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Thing under test
import ContactNamePresenter from '../../../../app/presenters/company-contacts/setup/contact-name.presenter.js'

describe('Company Contacts - Setup - Contact Name Presenter', () => {
  let company
  let session

  beforeEach(() => {
    company = CustomersFixtures.company()

    session = { id: generateUUID(), company }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ContactNamePresenter(session)

      expect(result).toEqual({
        backLink: {
          href: `/system/companies/${company.id}/contacts`,
          text: 'Back'
        },
        name: '',
        pageTitle: 'Enter a name for the contact',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })

    describe('the "name" property', () => {
      describe('when the name has previously been saved', () => {
        beforeEach(() => {
          session.name = 'Eric'
        })

        it('returns the name from the session', () => {
          const result = ContactNamePresenter(session)

          expect(result.name).toEqual('Eric')
        })
      })

      describe('when the name has not previously been saved', () => {
        it('returns an empty string', () => {
          const result = ContactNamePresenter(session)

          expect(result.name).toEqual('')
        })
      })
    })

    describe('the "backLink" property', () => {
      describe('when check page has been visited', () => {
        beforeEach(() => {
          session.checkPageVisited = true
        })

        it('returns the link to the "check" page', () => {
          const result = ContactNamePresenter(session)

          expect(result.backLink).toEqual({
            href: `/system/company-contacts/setup/${session.id}/check`,
            text: 'Back'
          })
        })
      })

      describe('when the check page has not been visited', () => {
        it('returns a link to the company "contacts" page', () => {
          const result = ContactNamePresenter(session)

          expect(result.backLink).toEqual({
            href: `/system/companies/${company.id}/contacts`,
            text: 'Back'
          })
        })
      })
    })
  })
})
