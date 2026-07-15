// Test helpers
import * as CustomersFixtures from '../../../support/fixtures/customers.fixture.js'
import LicenceHelper from '../../../support/helpers/licence.helper.js'
import SessionModel from '../../../../app/models/session.model.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Things we need to stub
import * as FetchCompanyLicencesDal from '../../../../app/dal/company-contacts/fetch-company-licences.dal.js'
import * as FetchCompanyService from '../../../../app/dal/companies/fetch-company.dal.js'

// Thing under test
import InitiateSessionService from '../../../../app/services/company-contacts/setup/initiate-session.service.js'

describe('Company Contacts - Setup - Initiate Session service', () => {
  let company
  let licences

  beforeEach(() => {
    company = CustomersFixtures.company()
    licences = [{ id: generateUUID(), licenceRef: LicenceHelper.generateLicenceRef() }]

    vi.spyOn(FetchCompanyService, 'default').mockReturnValue(company)
    vi.spyOn(FetchCompanyLicencesDal, 'default').mockReturnValue(licences)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('creates a new session record with the "company" saved', async () => {
      const result = await InitiateSessionService(company.id)

      const matchingSession = await SessionModel.query().findById(result.id)

      expect(matchingSession).toEqual({
        company,
        createdAt: matchingSession.createdAt,
        data: {
          company,
          licences
        },
        id: result.id,
        licences,
        updatedAt: matchingSession.updatedAt
      })
    })
  })
})
