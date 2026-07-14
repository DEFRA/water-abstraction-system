// Test helpers
import * as CustomersFixtures from '../../support/fixtures/customers.fixture.js'

// Things we need to stub
import * as FetchCompanyDetailsDal from '../../../app/dal/companies/fetch-company-details.dal.js'

// Thing under test
import ViewCompanyService from '../../../app/services/companies/view-company.service.js'

describe('Companies - View Company Service', () => {
  let companyDetails
  let role

  beforeEach(async () => {
    companyDetails = {
      ...CustomersFixtures.company(),
      companyAddresses: []
    }

    const companyAddress = CustomersFixtures.companyAddress()

    companyAddress.startDate = new Date('2021-04-01')
    companyAddress.address.country = null
    companyDetails.companyAddresses.push({ ...companyAddress })

    vi.spyOn(FetchCompanyDetailsDal, 'default').mockReturnValue(companyDetails)
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
        const result = await ViewCompanyService(companyDetails.id, role)

        expect(result).toEqual({
          backLink: {
            href: `/system/companies/${companyDetails.id}/contacts`,
            text: 'Go back to licence holder contacts'
          },
          companyAddresses: [
            {
              address: [
                'The Tyrell Spire',
                'Floor 667 (Above the Smog)',
                'Southbank Industrial Sector',
                'Lambeth Precinct',
                'Greater London',
                'United Kingdom',
                'SE1 7TY'
              ],
              endDate: null,
              startDate: '1 April 2021'
            }
          ],
          pageTitle: 'Licence holder',
          pageTitleCaption: 'Tyrell Corporation'
        })
      })

      it('calls the fetch service with role converted to camelCase', async () => {
        await ViewCompanyService(companyDetails.id, role)

        expect(FetchCompanyDetailsDal.default).toHaveBeenCalledWith(companyDetails.id, 'licenceHolder')
      })
    })

    describe('and the role is "returns-to"', () => {
      beforeEach(() => {
        role = 'returns-to'
      })

      it('returns page data for the view', async () => {
        const result = await ViewCompanyService(companyDetails.id, role)

        expect(result).toEqual({
          backLink: {
            href: `/system/companies/${companyDetails.id}/contacts`,
            text: 'Go back to licence holder contacts'
          },
          companyAddresses: [
            {
              address: [
                'The Tyrell Spire',
                'Floor 667 (Above the Smog)',
                'Southbank Industrial Sector',
                'Lambeth Precinct',
                'Greater London',
                'United Kingdom',
                'SE1 7TY'
              ],
              endDate: null,
              startDate: '1 April 2021'
            }
          ],
          pageTitle: 'Returns to',
          pageTitleCaption: 'Tyrell Corporation'
        })
      })

      it('calls the fetch service with role converted to camelCase', async () => {
        await ViewCompanyService(companyDetails.id, role)

        expect(FetchCompanyDetailsDal.default).toHaveBeenCalledWith(companyDetails.id, 'returnsTo')
      })
    })
  })
})
