// Test helpers
import LicenceHelper from '../../support/helpers/licence.helper.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

// Things we need to stub
import * as FetchLicenceCRMDataService from '../../../app/services/licences/fetch-licence-crm-data.service.js'
import * as FetchLicenceService from '../../../app/services/licences/fetch-licence.service.js'

// Thing under test
import ViewContactDetailsService from '../../../app/services/licences/view-contact-details.service.js'

describe('Licences - View Contact Details service', () => {
  let auth
  let companyId
  let contacts
  let licenceId
  let licenceRef

  beforeEach(() => {
    licenceId = generateUUID()
    licenceRef = LicenceHelper.generateLicenceRef()

    auth = {
      credentials: {
        roles: [
          {
            role: 'billing'
          }
        ]
      }
    }

    companyId = generateUUID()

    contacts = [
      {
        id: companyId,
        contactType: 'licence-holder',
        contactName: 'Eldon Tyrell'
      }
    ]

    vi.spyOn(FetchLicenceService, 'default').mockReturnValue({
      licenceRef
    })

    vi.spyOn(FetchLicenceCRMDataService, 'default').mockReturnValue({
      contacts,
      totalNumber: contacts.length
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewContactDetailsService(licenceId, auth)

      expect(result).toEqual({
        activeSecondaryNav: 'contact-details',
        backLink: {
          href: '/',
          text: 'Go back to search'
        },
        contacts: [
          {
            link: `/system/companies/${companyId}/licence-holder`,
            name: 'Eldon Tyrell',
            type: 'Licence holder'
          }
        ],
        licenceHolderContactsLink: `/system/companies/${companyId}/contacts`,
        pageTitle: 'Contact details',
        pageTitleCaption: `Licence ${licenceRef}`,
        pagination: {
          currentPageNumber: 1,
          numberOfPages: 1,
          showingMessage: 'Showing all 1 contacts'
        },
        roles: ['billing']
      })
    })
  })
})
