// Test helpers
import { generateLicenceRef } from '../../support/helpers/licence.helper.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

// Things we need to stub
import * as FetchBillsService from '../../../app/services/licences/fetch-bills.service.js'
import * as FetchLicenceService from '../../../app/services/licences/fetch-licence.service.js'

// Thing under test
import ViewBillsService from '../../../app/services/licences/view-bills.service.js'

describe('Licences - View Bills service', () => {
  let auth
  let licenceId
  let licenceRef

  beforeEach(() => {
    auth = {
      credentials: {
        roles: [
          {
            role: 'billing'
          }
        ]
      }
    }

    licenceId = generateUUID()
    licenceRef = generateLicenceRef()

    vi.spyOn(FetchLicenceService, 'default').mockReturnValue({
      id: licenceId,
      licenceRef
    })

    vi.spyOn(FetchBillsService, 'default').mockReturnValue({
      bills: [],
      totalNumber: 1
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when a bill', () => {
    describe('and it has no optional fields', () => {
      it('will return all the mandatory data and default values for use in the licence bills page', async () => {
        const result = await ViewBillsService(licenceId, auth)

        expect(result).toEqual({
          activeSecondaryNav: 'bills',
          backLink: {
            href: '/',
            text: 'Go back to search'
          },
          bills: [],
          pageTitle: 'Bills',
          pageTitleCaption: `Licence ${licenceRef}`,
          pagination: { currentPageNumber: 1, numberOfPages: 1, showingMessage: 'Showing all 1 bills' },
          roles: ['billing']
        })
      })
    })
  })
})
