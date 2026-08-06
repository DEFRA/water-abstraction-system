// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModel from 'water-abstraction-engine/models/session.model.js'
import { generateLicenceRef, generateUUID } from 'water-abstraction-engine/test/generators.js'
import CustomersFixtures from '../../../support/fixtures/customers.fixture.js'

// Things we need to stub
import * as FetchCompanyLicencesDal from '../../../../src/dal/company-contacts/fetch-company-licences.dal.js'
import * as FetchCompanyService from '../../../../src/dal/companies/fetch-company.dal.js'

// Thing under test
import InitiateSessionService from '../../../../src/services/company-contacts/setup/initiate-session.service.js'

describe('Company Contacts - Setup - Initiate Session service', () => {
  let company
  let licences

  beforeEach(() => {
    company = CustomersFixtures.company()
    licences = [{ id: generateUUID(), licenceRef: generateLicenceRef() }]

    vi.spyOn(FetchCompanyService, 'default').mockReturnValue(company)
    vi.spyOn(FetchCompanyLicencesDal, 'default').mockReturnValue(licences)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('creates a new session record with the "company" saved', async () => {
      const result = await InitiateSessionService(company.id)

      const matchingSession = await SessionModel.query().findById(result.id)

      expect(matchingSession).toEqual({
        company,
        createdAt: matchingSession.createdAt,
        data: {
          company,
          licences
        },
        id: result.id,
        licences,
        updatedAt: matchingSession.updatedAt
      })
    })
  })
})
