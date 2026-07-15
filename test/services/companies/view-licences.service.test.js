// Test helpers
import * as CustomersFixtures from '../../support/fixtures/customers.fixture.js'
import LicenceModel from '../../../app/models/licence.model.js'

// Things we need to stub
import * as FetchCompanyService from '../../../app/dal/companies/fetch-company.dal.js'
import * as FetchLicencesService from '../../../app/dal/companies/fetch-licences.dal.js'
import { generateUUID } from '../../../app/lib/general.lib.js'
import LicenceHelper from '../../support/helpers/licence.helper.js'

// Thing under test
import ViewLicencesService from '../../../app/services/companies/view-licences.service.js'

describe('Companies - View Licences service', () => {
  let auth
  let company
  let licences
  let page

  beforeEach(async () => {
    auth = { credentials: { roles: [] } }

    company = CustomersFixtures.company()

    vi.spyOn(FetchCompanyService, 'default').mockReturnValue(company)

    licences = licences = [
      LicenceModel.fromJson({
        expiredDate: null,
        id: generateUUID(),
        lapsedDate: null,
        licenceRef: LicenceHelper.generateLicenceRef(),
        revokedDate: null,
        startDate: new Date('2022-01-01'),
        currentLicenceHolderId: company.id,
        currentLicenceHolder: company.name
      })
    ]

    vi.spyOn(FetchLicencesService, 'default').mockReturnValue({ licences, totalNumber: 1 })

    page = '1'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewLicencesService(company.id, auth, page)

      expect(result).toEqual({
        activeSecondaryNav: 'licences',
        backLink: {
          href: '/',
          text: 'Go back to search'
        },
        licences: [
          {
            currentLicenceHolder: {
              id: null,
              name: company.name
            },
            id: licences[0].id,
            licenceRef: licences[0].licenceRef,
            startDate: '1 January 2022',
            status: null
          }
        ],
        pageTitle: 'Licences',
        pageTitleCaption: 'Tyrell Corporation',
        pagination: {
          currentPageNumber: 1,
          numberOfPages: 1,
          showingMessage: 'Showing all 1 licences'
        },
        roles: []
      })
    })
  })
})
