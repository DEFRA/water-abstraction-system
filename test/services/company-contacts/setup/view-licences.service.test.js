// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'
import { generateLicenceRef, generateUUID } from 'water-abstraction-engine/test/generators.js'
import CustomersFixtures from '../../../support/fixtures/customers.fixture.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Thing under test
import ViewLicencesService from '../../../../src/services/company-contacts/setup/view-licences.service.js'

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
