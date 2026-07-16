// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import * as CustomersFixtures from '../../../support/fixtures/customers.fixture.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Test helpers
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as DeleteSessionDal from '../../../../app/dal/delete-session.dal.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'
import * as UpdateCompanyContactDal from '../../../../app/dal/company-contacts/setup/update-company-contact.dal.js'

// Thing under test
import SubmitRestoreService from '../../../../app/services/company-contacts/setup/submit-restore.service.js'

describe('Company Contacts - Setup - Submit Restore Service', () => {
  let auth
  let company
  let companyContact
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    auth = { credentials: { user: { id: generateUUID() } } }

    company = CustomersFixtures.company()

    companyContact = CustomersFixtures.companyContact()

    sessionData = {
      abstractionAlerts: 'yes',
      company,
      email: 'eric@test.com',
      matchingContact: companyContact,
      name: 'Eric'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    yarStub = YarStub()

    vi.spyOn(UpdateCompanyContactDal, 'default').mockResolvedValue()
    vi.spyOn(DeleteSessionDal, 'default').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('continues the journey', async () => {
      const result = await SubmitRestoreService(session.id, yarStub, auth)

      expect(result).toEqual({ redirectUrl: `/system/companies/${company.id}/contacts` })
    })

    it('persists the company contact details', async () => {
      await SubmitRestoreService(session.id, yarStub, auth)

      const [actualContact] = UpdateCompanyContactDal.default.mock.calls[0]

      expect(actualContact).toEqual({
        id: companyContact.id,
        abstractionAlerts: true,
        contactId: companyContact.contact.id,
        email: 'eric@test.com',
        name: 'Eric',
        updatedBy: auth.credentials.user.id
      })
    })

    it('sets a notification', async () => {
      await SubmitRestoreService(session.id, yarStub, auth)

      const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

      expect(flashType).toEqual('notification')
      expect(bannerMessage).toEqual({ titleText: 'Contact restored', text: `${session.name} was restored.` })
    })

    it('clears the session', async () => {
      await SubmitRestoreService(session.id, yarStub, auth)

      expect(DeleteSessionDal.default).toHaveBeenCalledWith(session.id)
    })

    describe('the "abstractionAlerts" property', () => {
      describe('when set to "yes"', () => {
        it('persists the "abstractionAlerts" as "true"', async () => {
          await SubmitRestoreService(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactDal.default.mock.calls[0]

          expect(actualContact.abstractionAlerts).toBe(true)
        })
      })

      describe('when set to "no"', () => {
        beforeEach(async () => {
          session = SessionModelStub({
            ...sessionData,
            abstractionAlerts: 'no'
          })

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('persists the "abstractionAlerts" as "false"', async () => {
          await SubmitRestoreService(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactDal.default.mock.calls[0]

          expect(actualContact.abstractionAlerts).toBe(false)
        })
      })
    })

    describe('the "email" property', () => {
      describe('when email is in uppercase', () => {
        beforeEach(async () => {
          session = SessionModelStub({
            ...sessionData,
            email: 'ERICE@TEST.COM'
          })

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('persists the "email" in lowercase', async () => {
          await SubmitRestoreService(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactDal.default.mock.calls[0]

          expect(actualContact.email).toEqual('erice@test.com')
        })
      })
    })
  })
})
