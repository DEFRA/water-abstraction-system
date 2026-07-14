// Test helpers
import * as CustomersFixtures from '../../support/fixtures/customers.fixture.js'

// Things we need to stub
import * as FetchAddressDal from '../../../app/dal/companies/fetch-address.dal.js'
import * as FetchCompanyDal from '../../../app/dal/companies/fetch-company.dal.js'

// Thing under test
import ViewCompanyWithAddressService from '../../../app/services/companies/view-company-with-address.service.js'

describe('Companies - View Company With Address Service', () => {
  const licenceId = 'fbf2df24-ac78-4ee2-b5bb-eb7f9cf6b59a'

  let address
  let company
  let role

  beforeEach(async () => {
    company = CustomersFixtures.company()
    address = CustomersFixtures.companyAddress().address

    vi.spyOn(FetchCompanyDal, 'default').mockReturnValue(company)
    vi.spyOn(FetchAddressDal, 'default').mockReturnValue(address)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('and the role is "licence-holder"', () => {
      beforeEach(() => {
        role = 'licence-holder'
      })

      it('returns page data for the view', async () => {
        const result = await ViewCompanyWithAddressService(company.id, address.id, role, licenceId)

        expect(result).toEqual({
          backLink: {
            href: `/system/licences/${licenceId}/contact-details`,
            text: 'Go back to contact details'
          },
          details: {
            address: [
              'The Tyrell Spire',
              'Floor 667 (Above the Smog)',
              'Southbank Industrial Sector',
              'Lambeth Precinct',
              'Greater London',
              'United Kingdom',
              'SE1 7TY',
              'UK'
            ],
            name: 'Tyrell Corporation'
          },
          pageTitle: 'Licence holder',
          pageTitleCaption: 'Tyrell Corporation'
        })
      })
    })

    describe('and the role is "returns-to"', () => {
      beforeEach(() => {
        role = 'returns-to'
      })

      it('returns page data for the view', async () => {
        const result = await ViewCompanyWithAddressService(company.id, address.id, role, licenceId)

        expect(result).toEqual({
          backLink: {
            href: `/system/licences/${licenceId}/contact-details`,
            text: 'Go back to contact details'
          },
          details: {
            address: [
              'The Tyrell Spire',
              'Floor 667 (Above the Smog)',
              'Southbank Industrial Sector',
              'Lambeth Precinct',
              'Greater London',
              'United Kingdom',
              'SE1 7TY',
              'UK'
            ],
            name: 'Tyrell Corporation'
          },
          pageTitle: 'Returns to',
          pageTitleCaption: 'Tyrell Corporation'
        })
      })
    })
  })
})
