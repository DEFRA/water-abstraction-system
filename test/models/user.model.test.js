// Test framework
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import ChargeVersionNoteHelper from '../support/helpers/charge-version-note.helper.js'
import ChargeVersionNoteModel from '../../app/models/charge-version-note.model.js'
import CompanyContactHelper from '../support/helpers/company-contact.helper.js'
import CompanyContactModel from '../../app/models/company-contact.model.js'
import GroupHelper from '../support/helpers/group.helper.js'
import GroupModel from '../../app/models/group.model.js'
import LicenceDocumentHeaderHelper from '../support/helpers/licence-document-header.helper.js'
import LicenceEntityHelper from '../support/helpers/licence-entity.helper.js'
import LicenceEntityModel from '../../app/models/licence-entity.model.js'
import LicenceEntityRoleHelper from '../support/helpers/licence-entity-role.helper.js'
import LicenceHelper from '../support/helpers/licence.helper.js'
import LicenceMonitoringStationHelper from '../support/helpers/licence-monitoring-station.helper.js'
import LicenceMonitoringStationModel from '../../app/models/licence-monitoring-station.model.js'
import LicenceUnregistrationHelper from '../support/helpers/licence-unregistration.helper.js'
import LicenceUnregistrationModel from '../../app/models/licence-unregistration.model.js'
import ReturnVersionHelper from '../support/helpers/return-version.helper.js'
import ReturnVersionModel from '../../app/models/return-version.model.js'
import RoleHelper from '../support/helpers/role.helper.js'
import RoleModel from '../../app/models/role.model.js'
import UserGroupHelper from '../support/helpers/user-group.helper.js'
import UserGroupModel from '../../app/models/user-group.model.js'
import UserHelper from '../support/helpers/user.helper.js'
import UserRoleHelper from '../support/helpers/user-role.helper.js'
import UserRoleModel from '../../app/models/user-role.model.js'
import { generateUUID } from '../support/generators.js'
import { userPermissions } from '../../app/lib/static-lookups.lib.js'

// Thing under test
import UserModel from '../../app/models/user.model.js'

const GROUP_NPS_INDEX = 3
const ROLE_AR_USER_INDEX = 6
const USER_DIGITISE_EDITOR_INDEX = 11
const USER_GROUP_NPS_INDEX = 7
const USER_ROLE_AR_USER_INDEX = 0

describe('User model', () => {
  let testChargeVersionNotes
  let testCreatedCompanyContacts
  let testGroup
  let testLicence
  let testLicenceDocumentHeader
  let testLicenceEntity
  let testRecord
  let testRole
  let testUpdatedCompanyContacts
  let testUser
  let testUserRole
  let testUserGroup

  beforeAll(async () => {
    testRecord = UserHelper.select(USER_DIGITISE_EDITOR_INDEX)

    testRole = RoleHelper.select(ROLE_AR_USER_INDEX)
    testGroup = GroupHelper.select(GROUP_NPS_INDEX)
    testUserGroup = UserGroupHelper.select(USER_GROUP_NPS_INDEX)
    testUserRole = UserRoleHelper.select(USER_ROLE_AR_USER_INDEX)

    testChargeVersionNotes = []
    testCreatedCompanyContacts = []
    testUpdatedCompanyContacts = []
    for (let i = 0; i < 2; i++) {
      const chargeVersionNote = await ChargeVersionNoteHelper.add({ note: `Test note ${i}`, userId: testRecord.userId })
      testChargeVersionNotes.push(chargeVersionNote)

      const createdCompanyContact = await CompanyContactHelper.add({
        startDate: `2022-04-0${i + 1}`,
        createdBy: testRecord.id
      })
      testCreatedCompanyContacts.push(createdCompanyContact)

      const updatedCompanyContact = await CompanyContactHelper.add({
        startDate: `2022-04-0${i + 1}`,
        updatedBy: testRecord.id
      })
      testUpdatedCompanyContacts.push(updatedCompanyContact)
    }
  })

  afterEach(async () => {
    if (testLicence) {
      await testLicence.$query().delete()
    }

    if (testLicenceDocumentHeader) {
      await testLicenceDocumentHeader.$query().delete()
    }

    if (testLicenceEntity) {
      await testLicenceEntity.$query().delete()
    }

    if (testUser) {
      await testUser.$query().delete()
    }
  })

  afterAll(async () => {
    for (const testChargeVersionNote of testChargeVersionNotes) {
      await testChargeVersionNote.$query().delete()
    }

    for (const testCreatedCompanyContact of testCreatedCompanyContacts) {
      await testCreatedCompanyContact.$query().delete()
    }

    for (const testUpdatedCompanyContact of testUpdatedCompanyContacts) {
      await testUpdatedCompanyContact.$query().delete()
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await UserModel.query().where('userId', testRecord.userId).limit(1).first()

      expect(result).toBeInstanceOf(UserModel)
      expect(result.userId).toEqual(testRecord.userId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge version notes', () => {
      it('can successfully run a related query', async () => {
        const query = await UserModel.query().innerJoinRelated('chargeVersionNotes')

        expect(query).toBeDefined()
      })

      it('can eager load the charge version notes', async () => {
        const result = await UserModel.query()
          .where('userId', testRecord.userId)
          .limit(1)
          .first()
          .withGraphFetched('chargeVersionNotes')

        expect(result).toBeInstanceOf(UserModel)
        expect(result.userId).toEqual(testRecord.userId)

        expect(result.chargeVersionNotes).toBeInstanceOf(Array)
        expect(result.chargeVersionNotes[0]).toBeInstanceOf(ChargeVersionNoteModel)
        expect(result.chargeVersionNotes).toContainEqual(testChargeVersionNotes[0])
        expect(result.chargeVersionNotes).toContainEqual(testChargeVersionNotes[1])
      })
    })

    describe('when linking to created company contacts', () => {
      it('can successfully run a related query', async () => {
        const query = await UserModel.query().innerJoinRelated('createdCompanyContacts')

        expect(query).toBeDefined()
      })

      it('can eager load the created company contacts', async () => {
        const result = await UserModel.query()
          .where('userId', testRecord.userId)
          .limit(1)
          .first()
          .withGraphFetched('createdCompanyContacts')

        expect(result).toBeInstanceOf(UserModel)
        expect(result.userId).toEqual(testRecord.userId)

        expect(result.createdCompanyContacts).toBeInstanceOf(Array)
        expect(result.createdCompanyContacts[0]).toBeInstanceOf(CompanyContactModel)
        expect(result.createdCompanyContacts).toContainEqual(testCreatedCompanyContacts[0])
        expect(result.createdCompanyContacts).toContainEqual(testCreatedCompanyContacts[1])
      })
    })

    describe('when linking through user groups to groups', () => {
      it('can successfully run a related query', async () => {
        const query = await UserModel.query().innerJoinRelated('groups')

        expect(query).toBeDefined()
      })

      it('can eager load the groups', async () => {
        const result = await UserModel.query()
          .where('userId', testRecord.userId)
          .limit(1)
          .first()
          .withGraphFetched('groups')

        expect(result).toBeInstanceOf(UserModel)
        expect(result.userId).toMatchObject(testRecord.userId)

        expect(result.groups).toBeInstanceOf(Array)
        expect(result.groups).toHaveLength(1)
        expect(result.groups[0]).toBeInstanceOf(GroupModel)
        expect(result.groups[0]).toMatchObject(testGroup)
      })
    })

    describe('when linking to licence entity', () => {
      beforeEach(async () => {
        testLicenceEntity = await LicenceEntityHelper.add()

        const { id: licenceEntityId } = testLicenceEntity

        // NOTE: The entity ID is held against the user, not the other way round!! Because of this we can't seed a user
        // with `licence_entity_id` set because the licence entity record is only created when an external user is
        // linked to a licence using the external UI.
        //
        // So, for this test we have to fall back to generating a user against which we assign the licence entity ID.
        testUser = await UserHelper.add({ licenceEntityId })
      })

      it('can successfully run a related query', async () => {
        const query = await UserModel.query().innerJoinRelated('licenceEntity')

        expect(query).toBeDefined()
      })

      it('can eager load the licence entity', async () => {
        const result = await UserModel.query().findById(testUser.id).withGraphFetched('licenceEntity')

        expect(result).toBeInstanceOf(UserModel)
        expect(result.id).toEqual(testUser.id)

        expect(result.licenceEntity).toBeInstanceOf(LicenceEntityModel)
        expect(result.licenceEntity).toEqual(testLicenceEntity)
      })
    })

    describe('when linking to licence monitoring stations', () => {
      let testLicenceMonitoringStations

      beforeEach(async () => {
        testLicenceMonitoringStations = []
        for (let i = 0; i < 2; i++) {
          const licenceMonitoringStation = await LicenceMonitoringStationHelper.add({ createdBy: testRecord.userId })

          testLicenceMonitoringStations.push(licenceMonitoringStation)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await UserModel.query().innerJoinRelated('licenceMonitoringStations')

        expect(query).toBeDefined()
      })

      it('can eager load the licence monitoring stations', async () => {
        const result = await UserModel.query()
          .where('userId', testRecord.userId)
          .limit(1)
          .first()
          .withGraphFetched('licenceMonitoringStations')

        expect(result).toBeInstanceOf(UserModel)
        expect(result.userId).toEqual(testRecord.userId)

        expect(result.licenceMonitoringStations).toBeInstanceOf(Array)
        expect(result.licenceMonitoringStations[0]).toBeInstanceOf(LicenceMonitoringStationModel)
        expect(result.licenceMonitoringStations).toContainEqual(testLicenceMonitoringStations[0])
        expect(result.licenceMonitoringStations).toContainEqual(testLicenceMonitoringStations[1])
      })
    })

    describe('when linking to licence unregistrations', () => {
      let testLicenceUnregistrations

      beforeEach(async () => {
        testLicenceUnregistrations = []
        for (let i = 0; i < 2; i++) {
          const licenceUnregistration = await LicenceUnregistrationHelper.add({ createdBy: testRecord.id })

          testLicenceUnregistrations.push(licenceUnregistration)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await UserModel.query().innerJoinRelated('licenceUnregistrations')

        expect(query).toBeDefined()
      })

      it('can eager load the licence unregistrations', async () => {
        const result = await UserModel.query()
          .findById(testRecord.id)
          .limit(1)
          .first()
          .withGraphFetched('licenceUnregistrations')

        expect(result).toBeInstanceOf(UserModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceUnregistrations).toBeInstanceOf(Array)
        expect(result.licenceUnregistrations[0]).toBeInstanceOf(LicenceUnregistrationModel)
        expect(result.licenceUnregistrations).toContainEqual(testLicenceUnregistrations[0])
        expect(result.licenceUnregistrations).toContainEqual(testLicenceUnregistrations[1])
      })
    })

    describe('when linking to return versions', () => {
      let testReturnVersions

      beforeEach(async () => {
        testReturnVersions = []
        for (let i = 0; i < 2; i++) {
          const returnVersion = await ReturnVersionHelper.add({ createdBy: testRecord.userId })

          testReturnVersions.push(returnVersion)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await UserModel.query().innerJoinRelated('returnVersions')

        expect(query).toBeDefined()
      })

      it('can eager load the return versions', async () => {
        const result = await UserModel.query()
          .where('userId', testRecord.userId)
          .limit(1)
          .first()
          .withGraphFetched('returnVersions')

        expect(result).toBeInstanceOf(UserModel)
        expect(result.userId).toEqual(testRecord.userId)

        expect(result.returnVersions).toBeInstanceOf(Array)
        expect(result.returnVersions[0]).toBeInstanceOf(ReturnVersionModel)
        expect(result.returnVersions).toContainEqual(testReturnVersions[0])
        expect(result.returnVersions).toContainEqual(testReturnVersions[1])
      })
    })

    describe('when linking through user roles to roles', () => {
      it('can successfully run a related query', async () => {
        const query = await UserModel.query().innerJoinRelated('roles')

        expect(query).toBeDefined()
      })

      it('can eager load the roles', async () => {
        const result = await UserModel.query()
          .where('userId', testRecord.userId)
          .limit(1)
          .first()
          .withGraphFetched('roles')

        expect(result).toBeInstanceOf(UserModel)
        expect(result.userId).toMatchObject(testRecord.userId)

        expect(result.roles).toBeInstanceOf(Array)
        expect(result.roles).toHaveLength(1)
        expect(result.roles[0]).toBeInstanceOf(RoleModel)
        expect(result.roles[0]).toMatchObject(testRole)
      })
    })

    describe('when linking to updated company contacts', () => {
      it('can successfully run a related query', async () => {
        const query = await UserModel.query().innerJoinRelated('updatedCompanyContacts')

        expect(query).toBeDefined()
      })

      it('can eager load the updated company contacts', async () => {
        const result = await UserModel.query()
          .where('userId', testRecord.userId)
          .limit(1)
          .first()
          .withGraphFetched('updatedCompanyContacts')

        expect(result).toBeInstanceOf(UserModel)
        expect(result.userId).toEqual(testRecord.userId)

        expect(result.updatedCompanyContacts).toBeInstanceOf(Array)
        expect(result.updatedCompanyContacts[0]).toBeInstanceOf(CompanyContactModel)
        expect(result.updatedCompanyContacts).toContainEqual(testUpdatedCompanyContacts[0])
        expect(result.updatedCompanyContacts).toContainEqual(testUpdatedCompanyContacts[1])
      })
    })

    describe('when linking to user groups', () => {
      it('can successfully run a related query', async () => {
        const query = await UserModel.query().innerJoinRelated('userGroups')

        expect(query).toBeDefined()
      })

      it('can eager load the user groups', async () => {
        const result = await UserModel.query()
          .where('userId', testRecord.userId)
          .limit(1)
          .first()
          .withGraphFetched('userGroups')

        expect(result).toBeInstanceOf(UserModel)
        expect(result.userId).toMatchObject(testRecord.userId)

        expect(result.userGroups).toBeInstanceOf(Array)
        expect(result.userGroups).toHaveLength(1)
        expect(result.userGroups[0]).toBeInstanceOf(UserGroupModel)
        expect(result.userGroups[0]).toMatchObject(testUserGroup)
      })
    })

    describe('when linking to user roles', () => {
      it('can successfully run a related query', async () => {
        const query = await UserModel.query().innerJoinRelated('userRoles')

        expect(query).toBeDefined()
      })

      it('can eager load the user roles', async () => {
        const result = await UserModel.query()
          .where('userId', testRecord.userId)
          .withGraphFetched('userRoles')
          .limit(1)
          .first()

        expect(result).toBeInstanceOf(UserModel)
        expect(result.userId).toMatchObject(testRecord.userId)

        expect(result.userRoles).toBeInstanceOf(Array)
        expect(result.userRoles).toHaveLength(1)
        expect(result.userRoles[0]).toBeInstanceOf(UserRoleModel)
        expect(result.userRoles[0]).toMatchObject(testUserRole)
      })
    })
  })

  describe('#generateHashedPassword()', () => {
    it('can successfully generate a hashed password', () => {
      const result = UserModel.generateHashedPassword('password')

      // Hashed passwords always begin with $
      expect(result.charAt(0)).toEqual('$')
    })
  })

  describe('$internal()', () => {
    let internalTestRecord

    beforeEach(() => {
      internalTestRecord = UserHelper.select()
    })

    describe('when the "application" field is "water_admin"', () => {
      beforeEach(() => {
        internalTestRecord.application = 'water_admin'
      })

      it('returns true', async () => {
        const result = internalTestRecord.$internal()

        expect(result).toBe(true)
      })
    })

    describe('when the "application" field is "water_vml"', () => {
      beforeEach(() => {
        internalTestRecord.application = 'water_vml'
      })

      it('returns false', async () => {
        const result = internalTestRecord.$internal()

        expect(result).toBe(false)
      })
    })

    describe('when the "application" field is "water_dev"', () => {
      beforeEach(() => {
        internalTestRecord.application = 'water_dev'
      })

      it('returns false', async () => {
        const result = internalTestRecord.$internal()

        expect(result).toBe(false)
      })
    })

    describe('when the "application" field is null', () => {
      beforeEach(() => {
        internalTestRecord.application = null
      })

      it('returns false', async () => {
        const result = internalTestRecord.$internal()

        expect(result).toBe(false)
      })
    })
  })

  describe('$permissions()', () => {
    let licenceEntityRole
    let otherLicenceEntityRole
    let permissionRecord

    afterEach(async () => {
      if (licenceEntityRole) {
        await licenceEntityRole.$query().delete()
      }

      if (otherLicenceEntityRole) {
        await otherLicenceEntityRole.$query().delete()
      }
    })

    describe('when the user is "external"', () => {
      describe('but has yet to be linked to a licence so has no licence entity record', () => {
        beforeEach(async () => {
          testUser = await UserHelper.add({ application: 'water_vml' })

          permissionRecord = await UserModel.query().findById(testUser.id)
        })

        it('returns "None" permissions', async () => {
          const result = permissionRecord.$permissions()

          expect(result).toEqual(userPermissions.none)
        })
      })

      describe('and has been linked to a licence at some point so has a licence entity record', () => {
        beforeEach(async () => {
          testLicenceEntity = await LicenceEntityHelper.add()

          // NOTE: The entity ID is held against the user, not the other way round!! This is why we have to create the
          // licence entity first
          testUser = await UserHelper.add({ application: 'water_vml', licenceEntityId: testLicenceEntity.id })
        })

        describe('which is linked to the licence document header (the crm schema licence record)', () => {
          beforeEach(async () => {
            testLicenceDocumentHeader = await LicenceDocumentHeaderHelper.add({ companyEntityId: generateUUID() })
          })

          describe('and the licence itself still exists (has not been deleted)', () => {
            beforeEach(async () => {
              testLicence = await LicenceHelper.add({ licenceRef: testLicenceDocumentHeader.licenceRef })
            })

            describe('but it is not linked to any licence entity roles', () => {
              beforeEach(async () => {
                permissionRecord = await UserModel.query().modify('permissions').findById(testUser.id)
              })

              it('returns "None" permissions', async () => {
                const result = permissionRecord.$permissions()

                expect(result).toEqual(userPermissions.none)
              })
            })

            describe('and it is linked to a "admin" licence entity role', () => {
              describe('which is linked to the licence document header', () => {
                beforeEach(async () => {
                  licenceEntityRole = await LicenceEntityRoleHelper.add({
                    companyEntityId: testLicenceDocumentHeader.companyEntityId,
                    licenceEntityId: testLicenceEntity.id,
                    role: 'admin'
                  })

                  permissionRecord = await UserModel.query().modify('permissions').findById(testUser.id)
                })

                it('returns "Admin" permissions', async () => {
                  const result = permissionRecord.$permissions()

                  expect(result).toEqual(userPermissions.admin)
                })
              })

              describe('which is no longer linked to the licence document header', () => {
                beforeEach(async () => {
                  licenceEntityRole = await LicenceEntityRoleHelper.add({
                    companyEntityId: generateUUID(),
                    licenceEntityId: testLicenceEntity.id,
                    role: 'admin'
                  })

                  permissionRecord = await UserModel.query().modify('permissions').findById(testUser.id)
                })

                it('returns "None" permissions', async () => {
                  const result = permissionRecord.$permissions()

                  expect(result).toEqual(userPermissions.none)
                })
              })
            })

            describe('and it is linked to a "primary_user" licence entity role', () => {
              describe('which is linked to a licence document header', () => {
                beforeEach(async () => {
                  licenceEntityRole = await LicenceEntityRoleHelper.add({
                    companyEntityId: testLicenceDocumentHeader.companyEntityId,
                    licenceEntityId: testLicenceEntity.id,
                    role: 'primary_user'
                  })

                  permissionRecord = await UserModel.query().modify('permissions').findById(testUser.id)
                })

                it('returns "Primary user" permissions', async () => {
                  const result = permissionRecord.$permissions()

                  expect(result).toEqual(userPermissions.primary_user)
                })
              })

              describe('which is no longer linked to a licence document header', () => {
                beforeEach(async () => {
                  licenceEntityRole = await LicenceEntityRoleHelper.add({
                    companyEntityId: generateUUID(),
                    licenceEntityId: testLicenceEntity.id,
                    role: 'primary_user'
                  })

                  permissionRecord = await UserModel.query().modify('permissions').findById(testUser.id)
                })

                it('returns "None" permissions', async () => {
                  const result = permissionRecord.$permissions()

                  expect(result).toEqual(userPermissions.none)
                })
              })
            })

            describe('and it is linked to a "user_returns" licence entity role', () => {
              describe('which is linked to a licence document header', () => {
                beforeEach(async () => {
                  licenceEntityRole = await LicenceEntityRoleHelper.add({
                    companyEntityId: testLicenceDocumentHeader.companyEntityId,
                    licenceEntityId: testLicenceEntity.id,
                    role: 'user_returns'
                  })

                  permissionRecord = await UserModel.query().modify('permissions').findById(testUser.id)
                })

                it('returns "Returns user" permissions', async () => {
                  const result = permissionRecord.$permissions()

                  expect(result).toEqual(userPermissions.returns_user)
                })
              })

              describe('which is no longer linked to a licence document header', () => {
                beforeEach(async () => {
                  licenceEntityRole = await LicenceEntityRoleHelper.add({
                    companyEntityId: generateUUID(),
                    licenceEntityId: testLicenceEntity.id,
                    role: 'user_returns'
                  })

                  permissionRecord = await UserModel.query().modify('permissions').findById(testUser.id)
                })

                it('returns "None" permissions', async () => {
                  const result = permissionRecord.$permissions()

                  expect(result).toEqual(userPermissions.none)
                })
              })
            })

            describe('and it is linked to a "user" licence entity role', () => {
              describe('which is linked to a licence document header', () => {
                beforeEach(async () => {
                  licenceEntityRole = await LicenceEntityRoleHelper.add({
                    companyEntityId: testLicenceDocumentHeader.companyEntityId,
                    licenceEntityId: testLicenceEntity.id,
                    role: 'user'
                  })

                  permissionRecord = await UserModel.query().modify('permissions').findById(testUser.id)
                })

                it('returns "Basic access" permissions', async () => {
                  const result = permissionRecord.$permissions()

                  expect(result).toEqual(userPermissions.basic)
                })
              })

              describe('which is no longer linked to a licence document header', () => {
                beforeEach(async () => {
                  licenceEntityRole = await LicenceEntityRoleHelper.add({
                    companyEntityId: generateUUID(),
                    licenceEntityId: testLicenceEntity.id,
                    role: 'user'
                  })

                  permissionRecord = await UserModel.query().modify('permissions').findById(testUser.id)
                })

                it('returns "None" permissions', async () => {
                  const result = permissionRecord.$permissions()

                  expect(result).toEqual(userPermissions.none)
                })
              })
            })

            describe('and it is linked to multiple licence entity roles', () => {
              describe('which are linked to a licence document header', () => {
                beforeEach(async () => {
                  licenceEntityRole = await LicenceEntityRoleHelper.add({
                    companyEntityId: testLicenceDocumentHeader.companyEntityId,
                    licenceEntityId: testLicenceEntity.id,
                    role: 'primary_user'
                  })

                  otherLicenceEntityRole = await LicenceEntityRoleHelper.add({
                    companyEntityId: licenceEntityRole.companyEntityId,
                    licenceEntityId: testLicenceEntity.id,
                    role: 'user'
                  })

                  permissionRecord = await UserModel.query().modify('permissions').findById(testUser.id)
                })

                it('returns the highest role by order of precedence', async () => {
                  const result = permissionRecord.$permissions()

                  expect(result).toEqual(userPermissions.primary_user)
                })
              })

              describe('which are no longer linked to a licence document header', () => {
                beforeEach(async () => {
                  licenceEntityRole = await LicenceEntityRoleHelper.add({
                    companyEntityId: generateUUID(),
                    licenceEntityId: testLicenceEntity.id,
                    role: 'primary_user'
                  })

                  otherLicenceEntityRole = await LicenceEntityRoleHelper.add({
                    companyEntityId: licenceEntityRole.companyEntityId,
                    licenceEntityId: testLicenceEntity.id,
                    role: 'user'
                  })

                  permissionRecord = await UserModel.query().modify('permissions').findById(testUser.id)
                })

                it('returns "None" permissions', async () => {
                  const result = permissionRecord.$permissions()

                  expect(result).toEqual(userPermissions.none)
                })
              })
            })
          })

          describe('but the licence itself does not exist (it has been deleted)', () => {
            describe('and it is not linked to any licence entity roles', () => {
              beforeEach(async () => {
                permissionRecord = await UserModel.query().modify('permissions').findById(testUser.id)
              })

              it('returns "None" permissions', async () => {
                const result = permissionRecord.$permissions()

                expect(result).toEqual(userPermissions.none)
              })
            })

            describe('and it is linked to a "admin" licence entity role', () => {
              describe('which is linked to the licence document header', () => {
                beforeEach(async () => {
                  licenceEntityRole = await LicenceEntityRoleHelper.add({
                    companyEntityId: testLicenceDocumentHeader.companyEntityId,
                    licenceEntityId: testLicenceEntity.id,
                    role: 'admin'
                  })

                  permissionRecord = await UserModel.query().modify('permissions').findById(testUser.id)
                })

                it('returns "None" permissions', async () => {
                  const result = permissionRecord.$permissions()

                  expect(result).toEqual(userPermissions.none)
                })
              })

              describe('which is no longer linked to the licence document header', () => {
                beforeEach(async () => {
                  licenceEntityRole = await LicenceEntityRoleHelper.add({
                    companyEntityId: generateUUID(),
                    licenceEntityId: testLicenceEntity.id,
                    role: 'admin'
                  })

                  permissionRecord = await UserModel.query().modify('permissions').findById(testUser.id)
                })

                it('returns "None" permissions', async () => {
                  const result = permissionRecord.$permissions()

                  expect(result).toEqual(userPermissions.none)
                })
              })
            })

            describe('and it is linked to a "primary_user" licence entity role', () => {
              describe('which is linked to a licence document header', () => {
                beforeEach(async () => {
                  licenceEntityRole = await LicenceEntityRoleHelper.add({
                    companyEntityId: testLicenceDocumentHeader.companyEntityId,
                    licenceEntityId: testLicenceEntity.id,
                    role: 'primary_user'
                  })

                  permissionRecord = await UserModel.query().modify('permissions').findById(testUser.id)
                })

                it('returns "None" permissions', async () => {
                  const result = permissionRecord.$permissions()

                  expect(result).toEqual(userPermissions.none)
                })
              })

              describe('which is no longer linked to a licence document header', () => {
                beforeEach(async () => {
                  licenceEntityRole = await LicenceEntityRoleHelper.add({
                    companyEntityId: generateUUID(),
                    licenceEntityId: testLicenceEntity.id,
                    role: 'primary_user'
                  })

                  permissionRecord = await UserModel.query().modify('permissions').findById(testUser.id)
                })

                it('returns "None" permissions', async () => {
                  const result = permissionRecord.$permissions()

                  expect(result).toEqual(userPermissions.none)
                })
              })
            })

            describe('and it is linked to a "user_returns" licence entity role', () => {
              describe('which is linked to a licence document header', () => {
                beforeEach(async () => {
                  licenceEntityRole = await LicenceEntityRoleHelper.add({
                    companyEntityId: testLicenceDocumentHeader.companyEntityId,
                    licenceEntityId: testLicenceEntity.id,
                    role: 'user_returns'
                  })

                  permissionRecord = await UserModel.query().modify('permissions').findById(testUser.id)
                })

                it('returns "None" permissions', async () => {
                  const result = permissionRecord.$permissions()

                  expect(result).toEqual(userPermissions.none)
                })
              })

              describe('which is no longer linked to a licence document header', () => {
                beforeEach(async () => {
                  licenceEntityRole = await LicenceEntityRoleHelper.add({
                    companyEntityId: generateUUID(),
                    licenceEntityId: testLicenceEntity.id,
                    role: 'user_returns'
                  })

                  permissionRecord = await UserModel.query().modify('permissions').findById(testUser.id)
                })

                it('returns "None" permissions', async () => {
                  const result = permissionRecord.$permissions()

                  expect(result).toEqual(userPermissions.none)
                })
              })
            })

            describe('and it is linked to a "user" licence entity role', () => {
              describe('which is linked to a licence document header', () => {
                beforeEach(async () => {
                  licenceEntityRole = await LicenceEntityRoleHelper.add({
                    companyEntityId: testLicenceDocumentHeader.companyEntityId,
                    licenceEntityId: testLicenceEntity.id,
                    role: 'user'
                  })

                  permissionRecord = await UserModel.query().modify('permissions').findById(testUser.id)
                })

                it('returns "None" permissions', async () => {
                  const result = permissionRecord.$permissions()

                  expect(result).toEqual(userPermissions.none)
                })
              })

              describe('which is no longer linked to a licence document header', () => {
                beforeEach(async () => {
                  licenceEntityRole = await LicenceEntityRoleHelper.add({
                    companyEntityId: generateUUID(),
                    licenceEntityId: testLicenceEntity.id,
                    role: 'user'
                  })

                  permissionRecord = await UserModel.query().modify('permissions').findById(testUser.id)
                })

                it('returns "None" permissions', async () => {
                  const result = permissionRecord.$permissions()

                  expect(result).toEqual(userPermissions.none)
                })
              })
            })

            describe('and it is linked to multiple licence entity roles', () => {
              describe('which are linked to a licence document header', () => {
                beforeEach(async () => {
                  licenceEntityRole = await LicenceEntityRoleHelper.add({
                    companyEntityId: testLicenceDocumentHeader.companyEntityId,
                    licenceEntityId: testLicenceEntity.id,
                    role: 'primary_user'
                  })

                  otherLicenceEntityRole = await LicenceEntityRoleHelper.add({
                    companyEntityId: licenceEntityRole.companyEntityId,
                    licenceEntityId: testLicenceEntity.id,
                    role: 'user'
                  })

                  permissionRecord = await UserModel.query().modify('permissions').findById(testUser.id)
                })

                it('returns "None" permissions', async () => {
                  const result = permissionRecord.$permissions()

                  expect(result).toEqual(userPermissions.none)
                })
              })

              describe('which are no longer linked to a licence document header', () => {
                beforeEach(async () => {
                  licenceEntityRole = await LicenceEntityRoleHelper.add({
                    companyEntityId: generateUUID(),
                    licenceEntityId: testLicenceEntity.id,
                    role: 'primary_user'
                  })

                  otherLicenceEntityRole = await LicenceEntityRoleHelper.add({
                    companyEntityId: licenceEntityRole.companyEntityId,
                    licenceEntityId: testLicenceEntity.id,
                    role: 'user'
                  })

                  permissionRecord = await UserModel.query().modify('permissions').findById(testUser.id)
                })

                it('returns "None" permissions', async () => {
                  const result = permissionRecord.$permissions()

                  expect(result).toEqual(userPermissions.none)
                })
              })
            })
          })
        })
      })
    })

    describe('when the user is "internal"', () => {
      beforeEach(() => {
        permissionRecord = UserHelper.select()
        permissionRecord.application = 'water_admin'
      })

      describe('but the instance has not been populated properly', () => {
        describe('because "groups" is not present (it was not fetched)', () => {
          it('returns null', () => {
            const result = permissionRecord.$permissions()

            expect(result).toBeNull()
          })
        })

        describe('because "roles" is not present (it was not fetched)', () => {
          beforeEach(() => {
            permissionRecord.groups = []
          })

          it('returns null', () => {
            const result = permissionRecord.$permissions()

            expect(result).toBeNull()
          })
        })
      })

      describe('and the instance has been populated properly', () => {
        beforeEach(() => {
          permissionRecord.groups = []
          permissionRecord.roles = []
        })

        describe('but has no groups', () => {
          it('returns "Basic" permissions', () => {
            const result = permissionRecord.$permissions()

            expect(result).toEqual(userPermissions.basic)
          })
        })

        describe('and has a group', () => {
          beforeEach(() => {
            permissionRecord.groups = [{ group: 'nps' }]
          })

          describe('but no roles that start with "ar_"', () => {
            it('returns the matching permissions', () => {
              const result = permissionRecord.$permissions()

              expect(result).toEqual(userPermissions.nps)
            })
          })

          describe('and a role that start with "ar_"', () => {
            beforeEach(() => {
              permissionRecord.roles = [{ role: 'ar_approver' }]
            })

            it('returns the matching "Digitise!" permissions', () => {
              const result = permissionRecord.$permissions()

              expect(result).toEqual(userPermissions.nps_ar_approver)
            })
          })
        })
      })
    })
  })

  describe('$status()', () => {
    let statusTestRecord

    beforeEach(() => {
      statusTestRecord = UserHelper.select()
    })

    describe('when the user is "disabled"', () => {
      beforeEach(() => {
        statusTestRecord.enabled = false
      })

      it('returns "disabled"', async () => {
        const result = statusTestRecord.$status()

        expect(result).toEqual('disabled')
      })
    })

    describe('when the user is "enabled"', () => {
      beforeEach(() => {
        statusTestRecord.enabled = true
      })

      describe('and "password" is VOID', () => {
        beforeEach(() => {
          statusTestRecord.password = 'VOID'
        })

        it('returns "locked"', async () => {
          const result = statusTestRecord.$status()

          expect(result).toEqual('locked')
        })
      })

      describe('and "password" is not VOID', () => {
        describe('and "lastLogin" is not null', () => {
          beforeEach(() => {
            statusTestRecord.lastLogin = new Date()
          })

          it('returns "enabled"', async () => {
            const result = statusTestRecord.$status()

            expect(result).toEqual('enabled')
          })
        })

        describe('but "lastLogin" is null', () => {
          beforeEach(() => {
            statusTestRecord.lastLogin = null
          })

          it('returns "awaiting"', async () => {
            const result = statusTestRecord.$status()

            expect(result).toEqual('awaiting')
          })
        })
      })
    })
  })
})
