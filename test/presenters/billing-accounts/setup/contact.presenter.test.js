'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixtures.js')

// Thing under test
const ContactPresenter = require('../../../../app/presenters/billing-accounts/setup/contact.presenter.js')

describe('Billing Accounts - Setup - Contact Presenter', () => {
  let session
  const uuid = generateUUID()
  const exampleContacts = _exampleContacts(uuid)

  describe('when called', () => {
    beforeEach(() => {
      session = {
        billingAccount: BillingAccountsFixture.billingAccount().billingAccount
      }
    })

    it('returns page data for the view', () => {
      const result = ContactPresenter.go(session, exampleContacts)

      expect(result).to.equal({
        backLink: {
          href: `/system/billing-accounts/setup/${session.id}/fao`,
          text: 'Back'
        },
        contactSelected: null,
        items: [
          {
            id: uuid,
            value: uuid,
            text: 'Custome Name',
            checked: false
          },
          {
            divider: 'or'
          },
          {
            id: 'new',
            value: 'new',
            text: 'Add a new contact',
            checked: false
          }
        ],
        pageTitle: `Set up a contact for ${session.billingAccount.company.name}`,
        pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`
      })
    })
  })

  describe('when the "contactSelected" is set already', () => {
    beforeEach(() => {
      session = {
        billingAccount: BillingAccountsFixture.billingAccount().billingAccount,
        contactSelected: generateUUID()
      }
    })

    it('returns that value', () => {
      const result = ContactPresenter.go(session, exampleContacts)

      expect(result.contactSelected).to.equal(session.contactSelected)
    })
  })
})

function _exampleContacts(uuid) {
  return [
    {
      contact: {
        id: uuid,
        $name: () => {
          return 'Custome Name'
        }
      }
    }
  ]
}
