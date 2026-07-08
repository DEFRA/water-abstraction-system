// Test framework dependencies

// Test helpers
import * as CustomersFixtures from '../../../support/fixtures/customers.fixture.js'
import SessionModel from '../../../../app/models/session.model.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Test helpers
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as CreateCompanyContactDal from '../../../../app/dal/company-contacts/setup/create-company-contact.dal.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'
import * as UpdateCompanyContactDal from '../../../../app/dal/company-contacts/setup/update-company-contact.dal.js'

// Thing under test
import SubmitCheckService from '../../../../app/services/company-contacts/setup/submit-check.service.js'

describe('Company Contacts - Setup - Check Service', () => {
  let auth
  let company
  let companyContact
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    auth = { credentials: { user: { id: generateUUID() } } }

    company = CustomersFixtures.company()

    vi.spyOn(CreateCompanyContactDal, 'default').mockResolvedValue()
    vi.spyOn(UpdateCompanyContactDal, 'default').mockResolvedValue()

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when creating a company contact', () => {
    beforeEach(async () => {
      sessionData = _createSessionData(company)

      session = SessionModelStub(sessionData)

      vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
    })

    it('clears the session', async () => {
      await SubmitCheckService(session.id, yarStub, auth)

      const deletedSession = await SessionModel.query().findById(session.id)

      expect(deletedSession).toBeUndefined()
    })

    it('returns the redirect URL', async () => {
      const result = await SubmitCheckService(session.id, yarStub, auth)

      expect(result).toEqual({
        redirectUrl: `/system/companies/${company.id}/contacts`
      })
    })

    it('persists the company contact details', async () => {
      await SubmitCheckService(session.id, yarStub, auth)

      const actualContact = CreateCompanyContactDal.go.mock.calls[0]

      expect(actualContact).toEqual([
        company.id,
        {
          abstractionAlertLicences: null,
          abstractionAlerts: true,
          createdBy: auth.credentials.user.id,
          email: 'eric@test.com',
          name: 'Eric'
        }
      ])
    })

    it('sets a notification', async () => {
      await SubmitCheckService(session.id, yarStub, auth)

      const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

      expect(flashType).toEqual('notification')
      expect(bannerMessage).toEqual({ titleText: 'Contact added', text: `Eric was added to this company` })
    })

    describe('the "abstractionAlerts" property', () => {
      describe('is "yes"', () => {
        it('persists the "abstractionAlerts" as "true"', async () => {
          await SubmitCheckService(session.id, yarStub, auth)

          const actualContact = CreateCompanyContactDal.go.mock.calls[0][1]

          expect(actualContact.abstractionAlerts).toBe(true)
        })
      })

      describe('is "some"', () => {
        beforeEach(() => {
          session = SessionModelStub({ ...sessionData, abstractionAlerts: 'some' })

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('persists the "abstractionAlerts" as "true"', async () => {
          await SubmitCheckService(session.id, yarStub, auth)

          const actualContact = CreateCompanyContactDal.go.mock.calls[0][1]

          expect(actualContact.abstractionAlerts).toBe(true)
        })
      })

      describe('is "no"', () => {
        beforeEach(async () => {
          session = SessionModelStub({ ...sessionData, abstractionAlerts: 'no' })

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('persists the "abstractionAlerts" as "false"', async () => {
          await SubmitCheckService(session.id, yarStub, auth)

          const actualContact = CreateCompanyContactDal.go.mock.calls[0][1]

          expect(actualContact.abstractionAlerts).toBe(false)
        })
      })
    })

    describe('the "abstractionAlertLicences" property', () => {
      describe('when "abstractionAlerts" is "some"', () => {
        let abstractionAlertLicences

        beforeEach(() => {
          abstractionAlertLicences = [generateUUID(), generateUUID()]

          session = SessionModelStub({
            ...sessionData,
            abstractionAlerts: 'some',
            abstractionAlertLicences
          })

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('persists "abstractionAlertLicences" as a JSON string', async () => {
          await SubmitCheckService(session.id, yarStub, auth)

          const actualContact = CreateCompanyContactDal.go.mock.calls[0][1]
          const expectedAbstractionAlertLicences = JSON.stringify(abstractionAlertLicences)

          expect(actualContact.abstractionAlertLicences).toEqual(expectedAbstractionAlertLicences)
        })
      })

      describe('when "abstractionAlerts" is not "some"', () => {
        it('persists "abstractionAlertLicences" as null', async () => {
          await SubmitCheckService(session.id, yarStub, auth)

          const actualContact = CreateCompanyContactDal.go.mock.calls[0][1]

          expect(actualContact.abstractionAlertLicences).toBeNull()
        })
      })
    })

    describe('the "email" property', () => {
      beforeEach(async () => {
        session = SessionModelStub({ ...sessionData, email: 'ERICE@TEST.COM' })

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('persists the "email" in lowercase', async () => {
        await SubmitCheckService(session.id, yarStub, auth)

        const actualContact = CreateCompanyContactDal.go.mock.calls[0][1]

        expect(actualContact.email).toEqual('erice@test.com')
      })
    })
  })

  describe('when updating a company contact', () => {
    beforeEach(async () => {
      companyContact = CustomersFixtures.companyContact()

      sessionData = _updateSessionData(company, companyContact)

      session = SessionModelStub(sessionData)

      vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
    })

    it('returns the redirect URL', async () => {
      const result = await SubmitCheckService(session.id, yarStub, auth)

      expect(result).toEqual({
        redirectUrl: `/system/company-contacts/${companyContact.id}/contact-details`
      })
    })

    it('persists the company contact details', async () => {
      await SubmitCheckService(session.id, yarStub, auth)

      const [actualContact] = UpdateCompanyContactDal.go.mock.calls[0]

      expect(actualContact).toEqual({
        id: companyContact.id,
        abstractionAlertLicences: null,
        abstractionAlerts: true,
        contactId: companyContact.contact.id,
        email: 'eric@test.com',
        name: 'Eric',
        updatedBy: auth.credentials.user.id
      })
    })

    it('sets a notification', async () => {
      await SubmitCheckService(session.id, yarStub, auth)

      const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

      expect(flashType).toEqual('notification')
      expect(bannerMessage).toEqual({ titleText: 'Updated', text: `Contact details updated.` })
    })

    describe('the "abstractionAlerts" property', () => {
      describe('is "yes"', () => {
        it('persists the "abstractionAlerts" as "true"', async () => {
          await SubmitCheckService(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactDal.go.mock.calls[0]

          expect(actualContact.abstractionAlerts).toBe(true)
        })
      })

      describe('is "some"', () => {
        beforeEach(() => {
          session = SessionModelStub({ ...sessionData, abstractionAlerts: 'some' })

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('persists the "abstractionAlerts" as "true"', async () => {
          await SubmitCheckService(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactDal.go.mock.calls[0]

          expect(actualContact.abstractionAlerts).toBe(true)
        })
      })

      describe('is "no"', () => {
        beforeEach(async () => {
          session = SessionModelStub({ ...sessionData, abstractionAlerts: 'no' })

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('persists the "abstractionAlerts" as "false"', async () => {
          await SubmitCheckService(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactDal.go.mock.calls[0]

          expect(actualContact.abstractionAlerts).toBe(false)
        })
      })
    })

    describe('the "abstractionAlertLicences" property', () => {
      describe('when "abstractionAlerts" is "some"', () => {
        let abstractionAlertLicences

        beforeEach(() => {
          abstractionAlertLicences = [generateUUID(), generateUUID()]

          session = SessionModelStub({
            ...sessionData,
            abstractionAlerts: 'some',
            abstractionAlertLicences
          })

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('persists "abstractionAlertLicences" as a JSON string', async () => {
          await SubmitCheckService(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactDal.go.mock.calls[0]
          const expectedAbstractionAlertLicences = JSON.stringify(abstractionAlertLicences)

          expect(actualContact.abstractionAlertLicences).toEqual(expectedAbstractionAlertLicences)
        })
      })

      describe('when "abstractionAlerts" is not "some"', () => {
        it('persists "abstractionAlertLicences" as null', async () => {
          await SubmitCheckService(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactDal.go.mock.calls[0]

          expect(actualContact.abstractionAlertLicences).toBeNull()
        })
      })
    })

    describe('the "email" property', () => {
      describe('when email is in multi cases', () => {
        beforeEach(async () => {
          session = SessionModelStub({ ...sessionData, email: 'ERICE@TEST.COM' })

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('persists the "email" in lowercase', async () => {
          await SubmitCheckService(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactDal.go.mock.calls[0]

          expect(actualContact.email).toEqual('erice@test.com')
        })
      })
    })
  })
})

function _createSessionData(company) {
  return {
    abstractionAlerts: 'yes',
    company,
    email: 'eric@test.com',
    name: 'Eric'
  }
}

function _updateSessionData(company, companyContact) {
  return {
    abstractionAlerts: 'yes',
    company,
    companyContact,
    email: 'eric@test.com',
    name: 'Eric'
  }
}
