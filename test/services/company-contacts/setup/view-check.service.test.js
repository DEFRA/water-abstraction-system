'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchCompanyContactsService = require('../../../../app/services/company-contacts/setup/fetch-company-contacts.service.js')
const FetchNotificationService = require('../../../../app/services/company-contacts/fetch-notification.service.js')
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewCheckService = require('../../../../app/services/company-contacts/setup/view-check.service.js')

describe('Company Contacts - Setup - Check Service', () => {
  let company
  let notification
  let session
  let yarStub

  beforeEach(async () => {
    company = CustomersFixtures.company()

    session = SessionModelStub.build(Sinon, { company, abstractionAlerts: 'yes', name: 'Eric', email: 'eric@test.com' })

    notification = undefined

    Sinon.stub(FetchNotificationService, 'go').resolves(notification)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)

    yarStub = { flash: Sinon.stub().returns([{ title: 'Test', text: 'Notification' }]) }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('when there is no matching contact', () => {
      beforeEach(() => {
        Sinon.stub(FetchCompanyContactsService, 'go').resolves(CustomersFixtures.companyContacts())
      })

      it('returns page data for the view', async () => {
        const result = await ViewCheckService.go(session.id, yarStub)

        expect(result).to.equal({
          abstractionAlerts: 'Yes',
          email: 'eric@test.com',
          emailInUse: null,
          links: {
            abstractionAlerts: `/system/company-contacts/setup/${session.id}/abstraction-alerts`,
            cancel: `/system/company-contacts/setup/${session.id}/cancel`,
            email: `/system/company-contacts/setup/${session.id}/contact-email`,
            name: `/system/company-contacts/setup/${session.id}/contact-name`,
            restoreContact: null
          },
          matchingContact: undefined,
          name: 'Eric',
          notification: {
            text: 'Notification',
            title: 'Test'
          },
          pageTitle: 'Check contact',
          pageTitleCaption: 'Tyrell Corporation',
          warning: null
        })
      })

      describe('marks the check page as visited', () => {
        it('updates the session', async () => {
          await ViewCheckService.go(session.id, yarStub)

          expect(session.checkPageVisited).to.be.true()
          expect(session.$update.called).to.be.true()
        })
      })
    })

    describe('when there is a matching contact', () => {
      let matchingContact

      beforeEach(() => {
        matchingContact = CustomersFixtures.companyContact()

        // If we spread the object we loose the models modifiers
        matchingContact.deletedAt = new Date()
        matchingContact.contact.department = 'Eric'
        matchingContact.contact.email = 'eric@test.com'
        matchingContact.contact.contactType = 'department'

        Sinon.stub(FetchCompanyContactsService, 'go').returns([matchingContact])
      })

      it('updates the session', async () => {
        await ViewCheckService.go(session.id, yarStub)

        expect(session.matchingContact).to.equal(matchingContact, {
          skip: ['createdAt', 'deletedAt', 'updatedAt']
        })
      })
    })
  })
})
