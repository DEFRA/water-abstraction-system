// Test framework dependencies

// Test helpers
import * as CustomersFixtures from '../../../support/fixtures/customers.fixture.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Things we need to stub
import DeleteSessionDal from '../../../../app/dal/delete-session.dal.js'
import FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'
// Thing under test
import SubmitCancelService from '../../../../app/services/company-contacts/setup/submit-cancel.service.js'

describe('Company Contacts - Setup - Cancel Service', () => {
  let company
  let session
  let sessionData

  beforeEach(async () => {
    company = CustomersFixtures.company()

    sessionData = { company }

    session = SessionModelStub(sessionData)

    vi.mock('../../../../app/dal/fetch-session.dal.js')
    FetchSessionDal.mockResolvedValue(session)

    vi.mock('../../../../app/dal/delete-session.dal.js')
    DeleteSessionDal.mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('continues the journey', async () => {
      const result = await SubmitCancelService(session.id)

      expect(result).toEqual({
        redirectUrl: `/system/companies/${company.id}/contacts`
      })
    })

    it('clears the session', async () => {
      await SubmitCancelService(session.id)

      expect(DeleteSessionDal.go).toHaveBeenCalledWith(session.id)
    })

    describe('and the company contact is being edited', () => {
      beforeEach(async () => {
        sessionData.companyContact = { id: generateUUID() }

        session = SessionModelStub({
          ...sessionData,
          email: 'ERICE@TEST.COM'
        })

        FetchSessionDal.mockResolvedValue(session)
      })

      it('continues the journey', async () => {
        const result = await SubmitCancelService(session.id)

        expect(result).toEqual({
          redirectUrl: `/system/company-contacts/${sessionData.companyContact.id}/contact-details`
        })
      })
    })
  })
})
