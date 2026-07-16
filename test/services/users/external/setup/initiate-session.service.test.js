// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModel from '../../../../../app/models/session.model.js'
import UsersFixture from '../../../../support/fixtures/users.fixture.js'
import { generateUUID } from '../../../../../app/lib/general.lib.js'

// Things to stub
import * as FetchLicencesDal from '../../../../../app/dal/users/external/setup/fetch-licences.dal.js'
import * as FetchUsersDal from '../../../../../app/dal/users/fetch-user.dal.js'

// Thing under test
import InitiateSessionService from '../../../../../app/services/users/external/setup/initiate-session.service.js'

describe('Users - External - Setup - Initiate Session service', () => {
  let back
  let licences
  let user

  beforeEach(() => {
    back = 'users'

    const { id, username } = UsersFixture.jonLee()

    user = { id, licenceEntityId: generateUUID(), username }

    licences = [
      {
        id: '2bc430cf-b108-4180-b6bd-0c34d256633f',
        licenceRef: '01/123',
        licenceVersions: [
          {
            id: 'a2793e26-8ef9-4477-9c02-6a1882fc27a0',
            issueDate: null,
            licenceId: '2bc430cf-b108-4180-b6bd-0c34d256633f',
            startDate: new Date('2022-04-01'),
            status: 'current',
            company: {
              id: 'ee365fa1-c434-4029-884e-3042e685638e',
              name: 'ACME Farms Ltd',
              type: 'organisation'
            }
          }
        ]
      }
    ]

    vi.spyOn(FetchUsersDal, 'default').mockResolvedValue(user)
    vi.spyOn(FetchLicencesDal, 'default').mockResolvedValue(licences)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns the session Id and an initialised data object', async () => {
      const result = await InitiateSessionService(user.id, back)

      expect(result).toEqual({
        data: { activeNavBar: back, licences, selectedLicences: [], user },
        id: result.id,
        activeNavBar: back,
        licences,
        selectedLicences: [],
        user
      })
    })

    it('initiates the session for the journey ', async () => {
      const result = await InitiateSessionService(user.id, back)

      const matchingSession = await SessionModel.query().findById(result.id)

      // When the licences get saved to the JSONB field, and then returned by a query, they come back as strings. So, we
      // have to account for this when asserting what we're getting back.
      const jsonParsedLicence = { ...licences[0] }

      jsonParsedLicence.licenceVersions[0].startDate = '2022-04-01T00:00:00.000Z'

      expect(matchingSession.data).toEqual({
        activeNavBar: back,
        licences: [jsonParsedLicence],
        selectedLicences: [],
        user
      })
    })
  })
})
