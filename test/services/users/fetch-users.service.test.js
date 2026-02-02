'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const databaseConfig = require('../../../config/database.config.js')

// Test helpers
const UserHelper = require('../../support/helpers/user.helper.js')
const UsersFixture = require('../../support/fixtures/users.fixture.js')

// Thing under test
const FetchUsersService = require('../../../app/services/users/fetch-users.service.js')

// NOTE: The users are seeded as part of setting up the test database, along with with their groups and roles. So,
// unlike other fetch tests we don't create any test records and assert they are in our results as we already have
// sufficient data to work with.
describe('Notices - Fetch Users service', () => {
  // We refer to this in all our tests. Pulling it in here means we only do it once
  const userSeedData = UserHelper.data

  let filters
  let pageNumber

  beforeEach(() => {
    // NOTE: _filters() generates an empty filters object as used by the services that call FetchNotices when no filter
    // has been applied by the user
    filters = _filters()

    pageNumber = 1
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when no filter is applied', () => {
    beforeEach(() => {
      // NOTE: We set the default page size to 1000 to ensure we get all records and avoid failed tests when run as
      // part of the full suite, and the risk our test record is returned in the second page of results.
      Sinon.stub(databaseConfig, 'defaultPageSize').value(1000)
    })

    it('returns all users ordered by their username (email) ascending', async () => {
      const { results, total } = await FetchUsersService.go(filters, pageNumber)

      // Assert the total is equal to or greater than our seeded count (other tests may create records) so we don't
      // assert exactly
      expect(total).to.be.at.least(userSeedData.length)

      // Assert the results contain all our seeded users
      for (let i = 0; i < userSeedData.length; i++) {
        expect(results).contains(_expectedResult(i))
      }
    })
  })

  describe('when a filter is applied', () => {
    beforeEach(() => {
      Sinon.stub(databaseConfig, 'defaultPageSize').value(1000)
    })

    describe('and "Email" has been set', () => {
      beforeEach(() => {
        // NOTE: We use uppercase to test that the service is using case insensitive LIKE where clause
        filters.email = 'LEE'
      })

      it('returns the matching users', async () => {
        const { results } = await FetchUsersService.go(filters, pageNumber)

        // Assert the results contain only users with 'lee' in their username
        for (let i = 0; i < userSeedData.length; i++) {
          if (userSeedData[i].username.toUpperCase().includes(filters.email)) {
            expect(results).contains(_expectedResult(i))
          }
        }
      })

      it('excludes those that do not match', async () => {
        const { results } = await FetchUsersService.go(filters, pageNumber)

        // Assert the results do not contain any users with 'lee' on their username
        for (let i = 0; i < userSeedData.length; i++) {
          if (!userSeedData[i].username.toUpperCase().includes(filters.email)) {
            expect(results).not.contains(_expectedResult(i))
          }
        }
      })
    })

    // NOTE: Because 'permissions' can be based on one or more properties depending on the value selected, we assert the
    // fetch can handle all possible scenarios (we don't have to check every permission because most are evaluated in
    // the same way)
    describe('and "Permissions" has been set', () => {
      // An internal user has "basic access" permissions if they are not linked to any groups
      describe('as "Basic access"', () => {
        beforeEach(() => {
          filters.permissions = 'basic'
        })

        it('returns the matching users', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results contain our seeded basic user
          expect(results).contains(UsersFixture.transformToFetchUsersResult(UsersFixture.basicAccess()))
        })

        it('excludes those that do not match', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results do not contain our other seeded users
          for (let i = 0; i < userSeedData.length; i++) {
            if (userSeedData[i].username !== 'basic.access@wrls.gov.uk') {
              expect(results).not.contains(_expectedResult(i))
            }
          }
        })
      })

      // An internal user has "[Group]" permissions if they are linked to that group and have no `ar_*` user roles. We
      // use billing and data as an example of this
      describe('as "Billing and data"', () => {
        beforeEach(() => {
          filters.permissions = 'billing_and_data'
        })

        it('returns the matching users', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results contain our seeded billing and data user
          expect(results).contains(UsersFixture.transformToFetchUsersResult(UsersFixture.billingAndData()))
        })

        it('excludes those that do not match', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results do not contain our other seeded users
          for (let i = 0; i < userSeedData.length; i++) {
            if (userSeedData[i].username !== 'billing.data@wrls.gov.uk') {
              expect(results).not.contains(_expectedResult(i))
            }
          }
        })
      })

      // We check the "National Permitting Service" permission, because for a user to have this they must be linked to
      // the nps group, but NOT any `ar_*` user roles
      describe('as "National Permitting Service"', () => {
        beforeEach(() => {
          filters.permissions = 'nps'
        })

        it('returns the matching users', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results contain our seeded national permitting service user
          expect(results).contains(UsersFixture.transformToFetchUsersResult(UsersFixture.nationalPermittingService()))
        })

        it('excludes those that do not match', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results do not contain our other seeded users
          for (let i = 0; i < userSeedData.length; i++) {
            if (userSeedData[i].username !== 'national.permitting.service@wrls.gov.uk') {
              expect(results).not.contains(_expectedResult(i))
            }
          }
        })
      })

      // An internal user has "National Permitting Service and Digitise! approver" permissions if they are linked to the
      // group 'nps' and have the `ar_approver` user role.
      describe('as "National Permitting Service and Digitise! approver"', () => {
        beforeEach(() => {
          filters.permissions = 'nps_ar_approver'
        })

        it('returns the matching users', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results contain our seeded national permitting service user
          expect(results).contains(UsersFixture.transformToFetchUsersResult(UsersFixture.digitiseApprover()))
        })

        it('excludes those that do not match', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results do not contain our other seeded users
          for (let i = 0; i < userSeedData.length; i++) {
            if (userSeedData[i].username !== 'digitise.approver@wrls.gov.uk') {
              expect(results).not.contains(_expectedResult(i))
            }
          }
        })
      })

      // An internal user has "National Permitting Service and Digitise! editor" permissions if they are linked to the
      // group 'nps' and have the `ar_user` user role.
      describe('as "National Permitting Service and Digitise! editor"', () => {
        beforeEach(() => {
          filters.permissions = 'nps_ar_user'
        })

        it('returns the matching users', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results contain our seeded national permitting service user
          expect(results).contains(UsersFixture.transformToFetchUsersResult(UsersFixture.digitiseEditor()))
        })

        it('excludes those that do not match', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results do not contain our other seeded users
          for (let i = 0; i < userSeedData.length; i++) {
            if (userSeedData[i].username !== 'digitise.editor@wrls.gov.uk') {
              expect(results).not.contains(_expectedResult(i))
            }
          }
        })
      })
    })

    // NOTE: Because 'status' can be based on one or more properties depending on the value selected, we assert the
    // fetch can handle all possible status values
    describe('and "Status" has been set', () => {
      describe('as "Awaiting"', () => {
        beforeEach(() => {
          filters.status = 'awaiting'
        })

        it('returns the matching users', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results contain our seeded users where enabled is true and lastLogin is null
          for (let i = 0; i < userSeedData.length; i++) {
            const userData = userSeedData[i]

            if (userData.enabled && !userData.lastLogin) {
              expect(results).contains(_expectedResult(i))
            }
          }
        })

        it('excludes those that do not match', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results do not contain our seeded users where enabled is false, or enabled is true but lastLogin
          // is NOT null
          for (let i = 0; i < userSeedData.length; i++) {
            const userData = userSeedData[i]

            if (!userData.enabled || userData.lastLogin) {
              expect(results).not.contains(_expectedResult(i))
            }
          }
        })
      })

      describe('as "Disabled"', () => {
        beforeEach(() => {
          filters.status = 'disabled'
        })

        it('returns the matching users', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results contain our seeded users where enabled is false
          for (let i = 0; i < userSeedData.length; i++) {
            if (!userSeedData[i].enabled) {
              expect(results).contains(_expectedResult(i))
            }
          }
        })

        it('excludes those that do not match', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results do not contain our seeded users where enabled is true
          for (let i = 0; i < userSeedData.length; i++) {
            if (userSeedData[i].enabled) {
              expect(results).not.contains(_expectedResult(i))
            }
          }
        })
      })

      describe('as "Enabled"', () => {
        beforeEach(() => {
          filters.status = 'enabled'
        })

        it('returns the matching users', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results contain our seeded users where enabled is true and lastLogin is NOT null
          for (let i = 0; i < userSeedData.length; i++) {
            const userData = userSeedData[i]

            if (userData.enabled && userData.lastLogin) {
              expect(results).contains(_expectedResult(i))
            }
          }
        })

        it('excludes those that do not match', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results do not contain our seeded users where enabled is false, or enabled is true but lastLogin
          // is null
          for (let i = 0; i < userSeedData.length; i++) {
            const userData = userSeedData[i]

            if (!userData.enabled || !userData.lastLogin) {
              expect(results).not.contains(_expectedResult(i))
            }
          }
        })
      })

      describe('as "Locked"', () => {
        beforeEach(() => {
          filters.status = 'locked'
        })

        it('returns the matching users', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results contain our seeded users where enabled is true and password is 'VOID'
          for (let i = 0; i < userSeedData.length; i++) {
            const userData = userSeedData[i]

            if (userData.enabled && userData.password === 'VOID') {
              expect(results).contains(_expectedResult(i))
            }
          }
        })

        it('excludes those that do not match', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results do not contain our seeded users where enabled is false, or enabled is true but password
          // is not 'VOID'
          for (let i = 0; i < userSeedData.length; i++) {
            const userData = userSeedData[i]

            if (!userData.enabled || userData.password !== 'VOID') {
              expect(results).not.contains(_expectedResult(i))
            }
          }
        })
      })
    })

    describe('and "Type" has been set', () => {
      beforeEach(() => {
        filters.type = 'water_vml'
      })

      it('returns the matching users', async () => {
        const { results } = await FetchUsersService.go(filters, pageNumber)

        // Assert the results contain our seeded external users
        for (let i = 0; i < userSeedData.length; i++) {
          if (userSeedData[i].application === 'water_vml') {
            expect(results).contains(_expectedResult(i))
          }
        }
      })

      it('excludes those that do not match', async () => {
        const { results } = await FetchUsersService.go(filters, pageNumber)

        // Assert the results do not contain our seeded internal users
        for (let i = 0; i < userSeedData.length; i++) {
          if (userSeedData[i].application !== 'water_vml') {
            expect(results).not.contains(_expectedResult(i))
          }
        }
      })
    })
  })

  describe('when the results are paginated', () => {
    beforeEach(() => {
      pageNumber = 2

      // NOTE: We know we create 3 records so we set the value to 2 to ensure the results are paginated
      Sinon.stub(databaseConfig, 'defaultPageSize').value(2)
    })

    it('can return the selected page', async () => {
      const result = await FetchUsersService.go(filters, pageNumber)

      expect(result.results).not.to.be.empty()
    })
  })
})

function _expectedResult(seedIndex) {
  return UsersFixture.transformToFetchUsersResult(UsersFixture.user(seedIndex))
}

function _filters() {
  return {
    email: null,
    permissions: null,
    status: null,
    type: null
  }
}
