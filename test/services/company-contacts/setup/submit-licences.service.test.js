// Test helpers
import * as CustomersFixtures from '../../../support/fixtures/customers.fixture.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'
import LicenceHelper from '../../../support/helpers/licence.helper.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitLicencesService from '../../../../app/services/company-contacts/setup/submit-licences.service.js'

describe('Company Contacts - Setup - Licences Service', () => {
  let company
  let licence
  let payload
  let session
  let sessionData

  beforeEach(() => {
    licence = {
      id: generateUUID(),
      licenceRef: LicenceHelper.generateLicenceRef()
    }

    company = CustomersFixtures.company()

    payload = { licences: [licence.id] }

    sessionData = { company, licences: [licence] }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitLicencesService(session.id, payload)

      expect(session.abstractionAlertLicences).toEqual([licence.id])
      expect(session.$update).toHaveBeenCalled()
    })

    it('continues the journey', async () => {
      const result = await SubmitLicencesService(session.id, payload)

      expect(result).toEqual({ redirectUrl: `/system/company-contacts/setup/${session.id}/check` })
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitLicencesService(session.id, payload)

      expect(result).toEqual({
        backLink: {
          href: `/system/company-contacts/setup/${session.id}/abstraction-alerts`,
          text: 'Back'
        },
        error: {
          errorList: [
            {
              href: '#licences',
              text: 'Select the licences they should get water abstraction alerts emails for'
            }
          ],
          licences: {
            text: 'Select the licences they should get water abstraction alerts emails for'
          }
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
