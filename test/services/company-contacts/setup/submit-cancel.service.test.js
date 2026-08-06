// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'
import { generateUUID } from 'water-abstraction-engine/test/generators.js'
import CustomersFixtures from '../../../support/fixtures/customers.fixture.js'

// Things we need to stub
import * as DeleteSessionDal from 'water-abstraction-engine/dal/delete-session.dal.js'
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'
// Thing under test
import SubmitCancelService from '../../../../src/services/company-contacts/setup/submit-cancel.service.js'

describe('Company Contacts - Setup - Cancel Service', () => {
  let company
  let session
  let sessionData

  beforeEach(async () => {
    company = CustomersFixtures.company()

    sessionData = { company }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    vi.spyOn(DeleteSessionDal, 'default').mockResolvedValue()
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

      expect(DeleteSessionDal.default).toHaveBeenCalledWith(session.id)
    })

    describe('and the company contact is being edited', () => {
      beforeEach(async () => {
        sessionData.companyContact = { id: generateUUID() }

        session = SessionModelStub({
          ...sessionData,
          email: 'ERICE@TEST.COM'
        })

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
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
