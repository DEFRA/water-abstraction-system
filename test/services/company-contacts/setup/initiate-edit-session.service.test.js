// Test helpers
import * as CustomersFixtures from '../../../support/fixtures/customers.fixture.js'
import CompanyContactModel from '../../../../app/models/company-contact.model.js'
import LicenceHelper from '../../../support/helpers/licence.helper.js'
import SessionModel from '../../../../app/models/session.model.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Things we need to stub
import * as FetchCompanyContactDal from '../../../../app/dal/company-contacts/setup/fetch-company-contact.dal.js'
import * as FetchCompanyLicencesDal from '../../../../app/dal/company-contacts/fetch-company-licences.dal.js'

// Thing under test
import InitiateEditSessionService from '../../../../app/services/company-contacts/setup/initiate-edit-session.service.js'

describe('Company Contacts - Setup - Initiate edit Session service', () => {
  let company
  let companyContact
  let contact
  let licences
  beforeEach(() => {
    company = CustomersFixtures.company()
    contact = CustomersFixtures.contact()

    licences = [{ id: generateUUID(), licenceRef: LicenceHelper.generateLicenceRef() }]

    companyContact = CompanyContactModel.fromJson({
      id: generateUUID(),
      abstractionAlerts: false,
      abstractionAlertLicences: null,
      company,
      contact
    })

    vi.spyOn(FetchCompanyContactDal, 'default').mockResolvedValue(companyContact)
    vi.spyOn(FetchCompanyLicencesDal, 'default').mockResolvedValue(licences)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('creates a new session record with the "company contact" saved', async () => {
      const result = await InitiateEditSessionService(companyContact.id)

      const matchingSession = await SessionModel.query().findById(result.id)

      const expectedSessionData = _expectedSessionData(companyContact, company, contact, licences)

      expect(matchingSession).toEqual({
        ...expectedSessionData,
        createdAt: matchingSession.createdAt,
        data: expectedSessionData,
        id: result.id,
        updatedAt: matchingSession.updatedAt
      })
    })
  })

  describe('the "abstractionAlerts" property', () => {
    describe('and the company has active licences', () => {
      describe('when the "abstractionAlerts" property is true', () => {
        beforeEach(() => {
          companyContact.abstractionAlerts = true
        })

        it('returns "yes"', async () => {
          const result = await InitiateEditSessionService(companyContact.id)

          const matchingSession = await SessionModel.query().findById(result.id)

          expect(matchingSession.abstractionAlerts).toEqual('yes')
        })

        describe('and there are abstraction alert licences', () => {
          beforeEach(() => {
            companyContact.abstractionAlertLicences = [
              { id: generateUUID(), licenceRef: LicenceHelper.generateLicenceRef() }
            ]
          })

          it('returns "some"', async () => {
            const result = await InitiateEditSessionService(companyContact.id)

            const matchingSession = await SessionModel.query().findById(result.id)

            expect(matchingSession.abstractionAlerts).toEqual('some')
          })
        })
      })

      describe('when the "abstractionAlerts" property is false', () => {
        it('returns "no"', async () => {
          const result = await InitiateEditSessionService(companyContact.id)

          const matchingSession = await SessionModel.query().findById(result.id)

          expect(matchingSession.abstractionAlerts).toEqual('no')
        })
      })
    })

    describe('and the company has no active licences', () => {
      beforeEach(() => {
        vi.spyOn(FetchCompanyLicencesDal, 'default').mockResolvedValue([])
      })

      describe('when the "abstractionAlerts" property is true', () => {
        beforeEach(() => {
          companyContact.abstractionAlerts = true
        })

        it('returns "yes"', async () => {
          const result = await InitiateEditSessionService(companyContact.id)

          const matchingSession = await SessionModel.query().findById(result.id)

          expect(matchingSession.abstractionAlerts).toEqual('yes')
        })

        describe('and there are abstraction alert licences', () => {
          beforeEach(() => {
            companyContact.abstractionAlertLicences = [
              { id: generateUUID(), licenceRef: LicenceHelper.generateLicenceRef() }
            ]
          })

          it('returns "no"', async () => {
            const result = await InitiateEditSessionService(companyContact.id)

            const matchingSession = await SessionModel.query().findById(result.id)

            expect(matchingSession.abstractionAlerts).toEqual('no')
          })
        })
      })

      describe('when the "abstractionAlerts" property is false', () => {
        it('returns "no"', async () => {
          const result = await InitiateEditSessionService(companyContact.id)

          const matchingSession = await SessionModel.query().findById(result.id)

          expect(matchingSession.abstractionAlerts).toEqual('no')
        })
      })
    })
  })

  describe('the "name" property', () => {
    it('formats the name', async () => {
      const result = await InitiateEditSessionService(companyContact.id)

      const matchingSession = await SessionModel.query().findById(result.id)

      expect(matchingSession.name).toEqual('Rachael Tyrell')
    })
  })
})

function _expectedSessionData(companyContact, company, contact, licences) {
  return {
    abstractionAlerts: 'no',
    abstractionAlertLicences: null,
    companyContact: {
      abstractionAlerts: false,
      abstractionAlertLicences: null,
      company: {
        id: company.id,
        name: 'Tyrell Corporation'
      },
      contact,
      id: companyContact.id
    },
    company,
    email: 'rachael.tyrell@tyrellcorp.com',
    licences,
    name: 'Rachael Tyrell'
  }
}
