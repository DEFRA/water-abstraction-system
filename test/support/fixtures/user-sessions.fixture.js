import UsersFixture from './users.fixture.js'
import { generateLicenceRef } from '../generators.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

/**
 * Creates an external user unregistration session fixture for testing purposes
 *
 * This represents the initial session created, for an external user linked to two licences.
 *
 * @returns {object} The external user unregistration setup session fixture
 */
function unregistrationSession() {
  const user = UsersFixture.jonLee()

  return {
    activeNavBar: 'users',
    id: generateUUID(),
    licenceDocumentHeaderId: generateUUID(),
    licences: [
      {
        id: generateUUID(),
        licenceRef: generateLicenceRef(),
        licenceVersions: [
          {
            id: generateUUID(),
            issueDate: null,
            licenceId: generateUUID(),
            startDate: new Date('2022-04-01'),
            status: 'current',
            company: {
              id: generateUUID(),
              name: 'ACME Farms Ltd',
              type: 'organisation'
            }
          }
        ]
      },
      {
        id: generateUUID(),
        licenceRef: generateLicenceRef(),
        licenceVersions: [
          {
            id: generateUUID(),
            issueDate: null,
            licenceId: generateUUID(),
            startDate: new Date('2023-04-01'),
            status: 'current',
            company: {
              id: generateUUID(),
              name: 'ACME Industry Ltd',
              type: 'organisation'
            }
          }
        ]
      }
    ],
    selectedLicences: [],
    user: {
      id: user.id,
      licenceEntityId: generateUUID(),
      username: user.username
    }
  }
}

export default {
  unregistrationSession
}
