// Test helpers
import * as CustomersFixtures from '../../../support/fixtures/customers.fixture.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'
import { generateLicenceRef } from '../../../support/helpers/licence.helper.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ViewLicencesService from '../../../../app/services/company-contacts/setup/view-licences.service.js'

describe('Company Contacts - Setup - Licences Service', () => {
  let company
  let licence
  let session
  let sessionData

  beforeEach(() => {
    licence = {
      id: generateUUID(),
      licenceRef: generateLicenceRef()
    }

    company = CustomersFixtures.company()

    sessionData = { company, licences: [licence] }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewLicencesService(session.id)

      expect(result).toEqual({
        backLink: {
          href: `/system/company-contacts/setup/${session.id}/abstraction-alerts`,
          text: 'Back'
        },
        licences: [
          {
            checked: false,
            text: licence.licenceRef,
            value: licence.id
          }
        ],
        pageTitle: 'Select the licences they should get water abstraction alerts emails for',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
