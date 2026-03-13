'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach, after } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const DatabaseConfig = require('../../../config/database.config.js')

// Test helpers
const LicenceDocumentHeaderHelper = require('../../support/helpers/licence-document-header.helper.js')
const LicenceEntityHelper = require('../../support/helpers/licence-entity.helper.js')
const LicenceEntityRoleHelper = require('../../support/helpers/licence-entity-role.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const UserHelper = require('../../support/helpers/user.helper.js')
const UsersFixture = require('../../support/fixtures/users.fixture.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const FetchUsersService = require('../../../app/services/users/fetch-users.service.js')

describe('Users - Fetch Users service', () => {
  const seededUsersLength = UserHelper.data.length

  let externalBasicAccessUser
  let externalNoneUser
  let externalPrimaryUser
  let externalReturnsUser
  let filters
  let licence
  let licenceDocumentHeader
  let licenceEntities
  let pageNumber

  before(async () => {
    // NOTE: In general we try to use the seeded users in our tests. However, the external users we seed do not have
    // corresponding `LicenceEntityRole` records. These are what differentiate, for example, a primary user from a
    // returns user. But to create a `LicenceEntityRole` record we need a `LicenceEntity`, and a `LicenceDocument`.
    // This isn't what we consider 'general seed data'. So, we create specific instances for these tests.

    licence = await LicenceHelper.add()
    licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
      companyEntityId: generateUUID(),
      licenceRef: licence.licenceRef
    })

    licenceEntities = []

    // Basic access external user
    // NOTE: We set the password to 'VOID' to test this user is NOT returned when we filter by 'awaiting' status, but IS
    // returned when we filter by 'locked' status. We spotted that 'locked' users who had never managed to login were
    // appearing in the results for status 'Awaiting'.
    let licenceEntity = await LicenceEntityHelper.add()
    externalBasicAccessUser = await UserHelper.add({
      application: 'water_vml',
      licenceEntityId: licenceEntity.id,
      lastLogin: null,
      password: 'VOID',
      username: licenceEntity.name
    })

    let licenceEntityRole = await LicenceEntityRoleHelper.add({
      companyEntityId: licenceDocumentHeader.companyEntityId,
      licenceEntityId: externalBasicAccessUser.licenceEntityId,
      role: 'user'
    })

    licenceEntity.licenceEntityRoles = [licenceEntityRole]
    licenceEntities.push(licenceEntity)
    externalBasicAccessUser.licenceEntity = licenceEntity

    // Returns user external user
    // NOTE: We set the password to 'VOID' to test this user IS returned when we filter by 'disabled' status, but NOT
    // returned when we filter by 'locked' status. This is to ensure that the disabled status takes priority over the
    // locked status
    licenceEntity = await LicenceEntityHelper.add()
    externalReturnsUser = await UserHelper.add({
      application: 'water_vml',
      enabled: false,
      licenceEntityId: licenceEntity.id,
      password: 'VOID',
      username: licenceEntity.name
    })

    licenceEntityRole = await LicenceEntityRoleHelper.add({
      companyEntityId: licenceDocumentHeader.companyEntityId,
      licenceEntityId: externalReturnsUser.licenceEntityId,
      role: 'user_returns'
    })

    licenceEntity.licenceEntityRoles = [licenceEntityRole]
    licenceEntities.push(licenceEntity)
    externalReturnsUser.licenceEntity = licenceEntity

    // Primary user external user
    licenceEntity = await LicenceEntityHelper.add()
    externalPrimaryUser = await UserHelper.add({
      application: 'water_vml',
      licenceEntityId: licenceEntity.id,
      username: licenceEntity.name
    })

    licenceEntityRole = await LicenceEntityRoleHelper.add({
      companyEntityId: licenceDocumentHeader.companyEntityId,
      licenceEntityId: externalPrimaryUser.licenceEntityId,
      role: 'primary_user'
    })

    licenceEntity.licenceEntityRoles = [licenceEntityRole]
    licenceEntities.push(licenceEntity)
    externalPrimaryUser.licenceEntity = licenceEntity

    // None user
    // This user highlights a scenario we have to deal with. Where someone was a primary user for a licence but was then
    // unlinked. The service leaves the `primary_user` licence entity role in place, and simply sets to NULL the
    // company_entity_id in the licence document header. Licence entity roles that no longer link to a licence document
    // header should be ignored when it comes to determining a user's permissions, and therefore what permission
    // filter they should match to.
    licenceEntity = await LicenceEntityHelper.add()
    externalNoneUser = await UserHelper.add({
      application: 'water_vml',
      licenceEntityId: licenceEntity.id,
      username: licenceEntity.name
    })

    await LicenceEntityRoleHelper.add({
      companyEntityId: generateUUID(),
      licenceEntityId: externalNoneUser.licenceEntityId,
      role: 'primary_user'
    })

    // Though the licence entity and licence entity role are linked in the DB, we know the query won't return them
    // because it is ignoring those that are not linked to a licence document header. So, we don't set them in our test
    // object either.
    licenceEntity.licenceEntityRoles = []
    licenceEntities.push(licenceEntity)
    externalNoneUser.licenceEntity = licenceEntity
  })

  beforeEach(() => {
    // NOTE: _filters() generates an empty filters object as used by the services that call FetchNotices when no filter
    // has been applied by the user
    filters = _filters()

    pageNumber = '1'
  })

  afterEach(() => {
    Sinon.restore()
  })

  after(async () => {
    for (const licenceEntity of licenceEntities) {
      for (const licenceEntityRole of licenceEntity.licenceEntityRoles) {
        await licenceEntityRole.$query().delete()
      }

      await licenceEntity.$query().delete()
    }

    await externalBasicAccessUser.$query().delete()
    await externalReturnsUser.$query().delete()
    await externalPrimaryUser.$query().delete()
    await externalNoneUser.$query().delete()
    await licenceDocumentHeader.$query().delete()
    await licence.$query().delete()
  })

  describe('when no filter is applied', () => {
    beforeEach(() => {
      // NOTE: We set the default page size to 1000 to ensure we get all records and avoid failed tests when run as
      // part of the full suite, and the risk our test record is returned in the second page of results.
      Sinon.stub(DatabaseConfig, 'defaultPageSize').value(1000)
    })

    it('returns all users ordered by their username (email) ascending', async () => {
      const { results, total } = await FetchUsersService.go(filters, pageNumber)

      // Assert the total is equal to or greater than our seeded count plus created users. Other tests may create
      // records, so we don't assert exactly
      expect(total).to.be.at.least(seededUsersLength + 3)

      // Assert the results contain all our seeded users
      for (let i = 0; i < seededUsersLength; i++) {
        const userData = UsersFixture.user(i)

        expect(results).contains(UsersFixture.transformToFetchUsersResult(userData))
      }

      // Assert it contains those we created
      expect(results).contains(UsersFixture.transformToFetchUsersResult(externalBasicAccessUser))
      expect(results).contains(UsersFixture.transformToFetchUsersResult(externalReturnsUser))
      expect(results).contains(UsersFixture.transformToFetchUsersResult(externalPrimaryUser))
      expect(results).contains(UsersFixture.transformToFetchUsersResult(externalNoneUser))
    })
  })

  describe('when a filter is applied', () => {
    beforeEach(() => {
      Sinon.stub(DatabaseConfig, 'defaultPageSize').value(1000)
    })

    describe('and "Email" has been set', () => {
      beforeEach(() => {
        // NOTE: We use uppercase to test that the service is using case insensitive LIKE where clause
        filters.email = 'LEE'
      })

      it('returns the matching users', async () => {
        const { results } = await FetchUsersService.go(filters, pageNumber)

        // Assert the results contain only users with 'lee' in their username
        for (let i = 0; i < seededUsersLength; i++) {
          const userData = UsersFixture.user(i)

          if (userData.username.toUpperCase().includes(filters.email)) {
            expect(results).contains(UsersFixture.transformToFetchUsersResult(userData))
          }
        }
      })

      it('excludes those that do not match', async () => {
        const { results } = await FetchUsersService.go(filters, pageNumber)

        // Assert the results do not contain any users with 'lee' on their username
        const skipAssertions = ['jon.lee@example.co.uk']

        for (let i = 0; i < seededUsersLength; i++) {
          const userData = UsersFixture.user(i)

          if (!skipAssertions.includes(userData.username)) {
            expect(results).not.contains(UsersFixture.transformToFetchUsersResult(userData))
          }
        }

        // Assert the results do not contain those we created
        expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalBasicAccessUser))
        expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalReturnsUser))
        expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalPrimaryUser))
        expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalNoneUser))
      })
    })

    // NOTE: Because 'permissions' can be based on one or more properties depending on the value selected, we assert the
    // fetch can handle all possible scenarios (we don't have to check every permission because most are evaluated in
    // the same way)
    describe('and "Permissions" has been set', () => {
      // An internal user has "basic access" permissions if they are not linked to any groups.
      // An external user has "basic access" permissions if they _only_ have LicenceEntityRoles with role of "user".
      describe('as "Basic access"', () => {
        beforeEach(() => {
          filters.permissions = 'basic'
        })

        it('returns the matching users', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results contain our seeded internal basic user and created external user
          expect(results).contains(UsersFixture.transformToFetchUsersResult(UsersFixture.basicAccess()))
          expect(results).contains(UsersFixture.transformToFetchUsersResult(externalBasicAccessUser))
        })

        it('excludes those that do not match', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results do not contain our other seeded users
          const skipAssertions = ['basic.access@wrls.gov.uk', externalBasicAccessUser.username]

          for (let i = 0; i < seededUsersLength; i++) {
            const userData = UsersFixture.user(i)

            if (!skipAssertions.includes(userData.username)) {
              expect(results).not.contains(UsersFixture.transformToFetchUsersResult(userData))
            }
          }

          // Assert the results do not contain the other two we created
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalReturnsUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalPrimaryUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalNoneUser))
        })

        describe('as well as "Type"', () => {
          describe('set as "External"', () => {
            beforeEach(() => {
              filters.type = 'water_vml'
            })

            it('returns the matching users', async () => {
              const { results } = await FetchUsersService.go(filters, pageNumber)

              // Assert the results _only _contain our created external user
              expect(results).contains(UsersFixture.transformToFetchUsersResult(externalBasicAccessUser))
            })

            it('excludes those that do not match', async () => {
              const { results } = await FetchUsersService.go(filters, pageNumber)

              // Assert the results do not contain our seeded users
              const skipAssertions = [externalBasicAccessUser.username]

              for (let i = 0; i < seededUsersLength; i++) {
                const userData = UsersFixture.user(i)

                if (!skipAssertions.includes(userData.username)) {
                  expect(results).not.contains(UsersFixture.transformToFetchUsersResult(userData))
                }
              }

              // Assert the results do not contain the other two we created
              expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalReturnsUser))
              expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalPrimaryUser))
              expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalNoneUser))
            })
          })

          describe('set as "Internal"', () => {
            beforeEach(() => {
              filters.type = 'water_admin'
            })

            it('returns the matching users', async () => {
              const { results } = await FetchUsersService.go(filters, pageNumber)

              // Assert the results _only _contain our seeded external user
              expect(results).contains(UsersFixture.transformToFetchUsersResult(UsersFixture.basicAccess()))
            })

            it('excludes those that do not match', async () => {
              const { results } = await FetchUsersService.go(filters, pageNumber)

              // Assert the results do not contain our other seeded users
              const skipAssertions = ['basic.access@wrls.gov.uk']

              for (let i = 0; i < seededUsersLength; i++) {
                const userData = UsersFixture.user(i)

                if (!skipAssertions.includes(userData.username)) {
                  expect(results).not.contains(UsersFixture.transformToFetchUsersResult(userData))
                }
              }

              // Assert the results do not contain the created external users
              expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalBasicAccessUser))
              expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalReturnsUser))
              expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalPrimaryUser))
              expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalNoneUser))
            })
          })
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
          const skipAssertions = ['billing.data@wrls.gov.uk']

          for (let i = 0; i < seededUsersLength; i++) {
            const userData = UsersFixture.user(i)

            if (!skipAssertions.includes(userData.username)) {
              expect(results).not.contains(UsersFixture.transformToFetchUsersResult(userData))
            }
          }

          // Assert the results do not contain those we created
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalBasicAccessUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalReturnsUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalPrimaryUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalNoneUser))
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
          const skipAssertions = ['national.permitting.service@wrls.gov.uk']

          for (let i = 0; i < seededUsersLength; i++) {
            const userData = UsersFixture.user(i)

            if (!skipAssertions.includes(userData.username)) {
              expect(results).not.contains(UsersFixture.transformToFetchUsersResult(userData))
            }
          }

          // Assert the results do not contain those we created
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalBasicAccessUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalReturnsUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalPrimaryUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalNoneUser))
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
          const skipAssertions = ['digitise.approver@wrls.gov.uk']

          for (let i = 0; i < seededUsersLength; i++) {
            const userData = UsersFixture.user(i)

            if (!skipAssertions.includes(userData.username)) {
              expect(results).not.contains(UsersFixture.transformToFetchUsersResult(userData))
            }
          }

          // Assert the results do not contain those we created
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalBasicAccessUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalReturnsUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalPrimaryUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalNoneUser))
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
          const skipAssertions = ['digitise.editor@wrls.gov.uk']

          for (let i = 0; i < seededUsersLength; i++) {
            const userData = UsersFixture.user(i)

            if (!skipAssertions.includes(userData.username)) {
              expect(results).not.contains(UsersFixture.transformToFetchUsersResult(userData))
            }
          }

          // Assert the results do not contain those we created
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalBasicAccessUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalReturnsUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalPrimaryUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalNoneUser))
        })
      })

      // An external user has "None" permissions if they no longer have any LicenceEntityRole records. These are users
      // that have been unlinked from all licences.
      describe('as "None"', () => {
        beforeEach(() => {
          filters.permissions = 'none'
        })

        it('returns the matching users', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results contain our external users from the seed data. The ones we added as part of the test
          // setup have `LicenceEntityRoles` so have at least a 'basic' permission level.
          expect(results).contains(UsersFixture.transformToFetchUsersResult(UsersFixture.external()))
          expect(results).contains(UsersFixture.transformToFetchUsersResult(UsersFixture.jonLee()))
          expect(results).contains(UsersFixture.transformToFetchUsersResult(UsersFixture.rachelStevens()))
          expect(results).contains(UsersFixture.transformToFetchUsersResult(UsersFixture.tinaBarrett()))
        })

        it('excludes those that do not match', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results do not contain our other seeded users
          const skipAssertions = [
            'external@example.co.uk',
            'jon.lee@example.co.uk',
            'rachel.stevens@example.co.uk',
            'tina.barrett@example.co.uk'
          ]

          for (let i = 0; i < seededUsersLength.length; i++) {
            const userData = UserHelper.select(i)

            if (!skipAssertions.includes(userData.username)) {
              expect(results).not.contains(UsersFixture.transformToFetchUsersResult(userData))
            }
          }

          // Assert the results do not contain those we created
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalBasicAccessUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalReturnsUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalPrimaryUser))
        })
      })

      // An external user has "Primary user" permissions if they have one or more LicenceEntityRole records with the
      // role of "primary_user"
      describe('as "Primary user"', () => {
        beforeEach(() => {
          filters.permissions = 'primary_user'
        })

        it('returns the matching users', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results contain our created external primary user
          expect(results).contains(UsersFixture.transformToFetchUsersResult(externalPrimaryUser))
        })

        it('excludes those that do not match', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results do not contain our seeded users
          const skipAssertions = [externalPrimaryUser.username]

          for (let i = 0; i < seededUsersLength.length; i++) {
            const userData = UserHelper.select(i)

            if (!skipAssertions.includes(userData.username)) {
              expect(results).not.contains(UsersFixture.transformToFetchUsersResult(userData))
            }
          }

          // Assert the results do not contain the others we created
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalBasicAccessUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalReturnsUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalNoneUser))
        })
      })

      // An external user has "Returns user" permissions if they have one or more LicenceEntityRole records with the
      // role of "user_returns"
      describe('as "Returns user"', () => {
        beforeEach(() => {
          filters.permissions = 'returns_user'
        })

        it('returns the matching users', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results contain our created external returns user
          expect(results).contains(UsersFixture.transformToFetchUsersResult(externalReturnsUser))
        })

        it('excludes those that do not match', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results do not contain our seeded users
          const skipAssertions = [externalReturnsUser.username]

          for (let i = 0; i < seededUsersLength.length; i++) {
            const userData = UserHelper.select(i)

            if (!skipAssertions.includes(userData.username)) {
              expect(results).not.contains(UsersFixture.transformToFetchUsersResult(userData))
            }
          }

          // Assert the results do not contain the others we created
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalBasicAccessUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalPrimaryUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalNoneUser))
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
          for (let i = 0; i < seededUsersLength.length; i++) {
            const userData = UsersFixture.user(i)

            if (userData.enabled && userData.password !== 'VOID' && !userData.lastLogin) {
              expect(results).contains(UsersFixture.transformToFetchUsersResult(userData))
            }
          }

          // Assert the results contain the ones we created that are 'awaiting' (enabled, not locked, and no lastLogin)
          expect(results).contains(UsersFixture.transformToFetchUsersResult(externalPrimaryUser))
          expect(results).contains(UsersFixture.transformToFetchUsersResult(externalNoneUser))
        })

        it('excludes those that do not match', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results do not contain our seeded users where enabled is false, or enabled is true but lastLogin
          // is NOT null
          for (let i = 0; i < seededUsersLength.length; i++) {
            const userData = UsersFixture.user(i)

            if (!userData.enabled || userData.lastLogin) {
              expect(results).not.contains(UsersFixture.transformToFetchUsersResult(userData))
            }
          }

          // Assert the results do not contain the created users we disabled, locked or have a login.
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalBasicAccessUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalReturnsUser))
        })
      })

      describe('as "Disabled"', () => {
        beforeEach(() => {
          filters.status = 'disabled'
        })

        it('returns the matching users', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results contain our seeded users where enabled is false
          for (let i = 0; i < seededUsersLength; i++) {
            const userData = UsersFixture.user(i)

            if (!userData.enabled) {
              expect(results).contains(UsersFixture.transformToFetchUsersResult(userData))
            }
          }

          // Assert the results contain the one we created that is 'disabled'
          expect(results).contains(UsersFixture.transformToFetchUsersResult(externalReturnsUser))
        })

        it('excludes those that do not match', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results do not contain our seeded users where enabled is true
          for (let i = 0; i < seededUsersLength; i++) {
            const userData = UsersFixture.user(i)

            if (userData.enabled) {
              expect(results).not.contains(UsersFixture.transformToFetchUsersResult(userData))
            }
          }

          // Assert the results do not contain the created users we that are not 'disabled'
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalBasicAccessUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalPrimaryUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalNoneUser))
        })
      })

      describe('as "Enabled"', () => {
        beforeEach(() => {
          filters.status = 'enabled'
        })

        it('returns the matching users', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results contain our seeded users where enabled is true and lastLogin is NOT null
          for (let i = 0; i < seededUsersLength; i++) {
            const userData = UsersFixture.user(i)

            if (userData.enabled && userData.password !== 'VOID' && userData.lastLogin) {
              expect(results).contains(UsersFixture.transformToFetchUsersResult(userData))
            }
          }
        })

        it('excludes those that do not match', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results do not contain our seeded users where enabled is false, or enabled is true but lastLogin
          // is null
          for (let i = 0; i < seededUsersLength; i++) {
            const userData = UsersFixture.user(i)

            if (!userData.enabled || !userData.lastLogin) {
              expect(results).not.contains(UsersFixture.transformToFetchUsersResult(userData))
            }
          }

          // Assert the results do not contain those we created as they are either disabled, locked or awaiting
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalBasicAccessUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalReturnsUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalPrimaryUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalNoneUser))
        })
      })

      describe('as "Locked"', () => {
        beforeEach(() => {
          filters.status = 'locked'
        })

        it('returns the matching users', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results contain our seeded users where enabled is true and password is 'VOID'
          for (let i = 0; i < seededUsersLength; i++) {
            const userData = UsersFixture.user(i)

            if (userData.enabled && userData.password === 'VOID') {
              expect(results).contains(UsersFixture.transformToFetchUsersResult(userData))
            }
          }
        })

        it('excludes those that do not match', async () => {
          const { results } = await FetchUsersService.go(filters, pageNumber)

          // Assert the results do not contain our seeded users where enabled is false, or enabled is true but password
          // is not 'VOID'
          for (let i = 0; i < seededUsersLength; i++) {
            const userData = UsersFixture.user(i)

            if (!userData.enabled || userData.password !== 'VOID') {
              expect(results).not.contains(UsersFixture.transformToFetchUsersResult(userData))
            }
          }

          // Assert the results do not contain those we created which are not 'locked'
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalReturnsUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalPrimaryUser))
          expect(results).not.contains(UsersFixture.transformToFetchUsersResult(externalNoneUser))
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
        for (let i = 0; i < seededUsersLength; i++) {
          const userData = UsersFixture.user(i)

          if (userData.application === 'water_vml') {
            expect(results).contains(UsersFixture.transformToFetchUsersResult(userData))
          }
        }

        // Assert the results contain the ones we created
        expect(results).contains(UsersFixture.transformToFetchUsersResult(externalBasicAccessUser))
        expect(results).contains(UsersFixture.transformToFetchUsersResult(externalReturnsUser))
        expect(results).contains(UsersFixture.transformToFetchUsersResult(externalPrimaryUser))
        expect(results).contains(UsersFixture.transformToFetchUsersResult(externalNoneUser))
      })

      it('excludes those that do not match', async () => {
        const { results } = await FetchUsersService.go(filters, pageNumber)

        // Assert the results do not contain our seeded internal users
        for (let i = 0; i < seededUsersLength; i++) {
          const userData = UsersFixture.user(i)

          if (userData.application !== 'water_vml') {
            expect(results).not.contains(UsersFixture.transformToFetchUsersResult(userData))
          }
        }
      })
    })
  })

  describe('when the results are paginated', () => {
    beforeEach(() => {
      pageNumber = 2

      // NOTE: We know we create 3 records so we set the value to 2 to ensure the results are paginated
      Sinon.stub(DatabaseConfig, 'defaultPageSize').value(2)
    })

    it('can return the selected page', async () => {
      const result = await FetchUsersService.go(filters, pageNumber)

      expect(result.results).not.to.be.empty()
    })
  })
})

function _filters() {
  return {
    email: null,
    permissions: null,
    status: null,
    type: null
  }
}
