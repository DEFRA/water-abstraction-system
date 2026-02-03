'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const FetchCompanyContactsService = require('../../../../app/services/billing-accounts/setup/fetch-company-contacts.service.js')

// Test helpers
const BillingAccountsFixture = require('../../../support/fixtures/billing-accounts.fixtures.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const ViewContactService = require('../../../../app/services/billing-accounts/setup/view-contact.service.js')

describe('Billing Accounts - Setup - Contact Service', () => {
  const uuid = generateUUID()
  const exampleContacts = _exampleContacts(uuid)

  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      billingAccount: BillingAccountsFixture.billingAccount().billingAccount
    }

    session = await SessionHelper.add({ data: sessionData })

    Sinon.stub(FetchCompanyContactsService, 'go').resolves(exampleContacts)
  })

  afterEach(async () => {
    await session.$query().delete()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewContactService.go(session.id)

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
