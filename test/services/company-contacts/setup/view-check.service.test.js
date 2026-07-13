// Test framework dependencies

// Test helpers
import * as CustomersFixtures from '../../../support/fixtures/customers.fixture.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchCompanyContactsDal from '../../../../app/dal/company-contacts/setup/fetch-company-contacts.dal.js'
import * as FetchNotificationService from '../../../../app/services/company-contacts/fetch-notification.service.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ViewCheckService from '../../../../app/services/company-contacts/setup/view-check.service.js'

describe('Company Contacts - Setup - Check Service', () => {
  let company
  let notification
  let session
  let yarStub
  beforeEach(async () => {
    company = CustomersFixtures.company()

    session = SessionModelStub({ company, abstractionAlerts: 'yes', name: 'Eric', email: 'eric@test.com' })

    notification = undefined

    vi.spyOn(FetchNotificationService, 'default').mockResolvedValue(notification)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    yarStub = YarStub()
    yarStub.flash.mockReturnValue([{ title: 'Test', text: 'Notification' }])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('when there is no matching contact', () => {
      beforeEach(() => {
        vi.spyOn(FetchCompanyContactsDal, 'default').mockResolvedValue(CustomersFixtures.companyContacts())
      })

      it('returns page data for the view', async () => {
        const result = await ViewCheckService(session.id, yarStub)

        expect(result).toEqual({
          abstractionAlertsLabel: 'Yes, for all licences',
          email: 'eric@test.com',
          emailInUse: null,
          licences: [],
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
          await ViewCheckService(session.id, yarStub)

          expect(session.checkPageVisited).toBe(true)
          expect(session.$update).toHaveBeenCalled()
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

        vi.spyOn(FetchCompanyContactsDal, 'default').mockReturnValue([matchingContact])
      })

      it('updates the session', async () => {
        await ViewCheckService(session.id, yarStub)

        expect(session.matchingContact).toMatchObject(matchingContact)
      })
    })
  })
})
