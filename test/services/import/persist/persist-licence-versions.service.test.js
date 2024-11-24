'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceModel = require('../../../../app/models/licence.model.js')
const LicenceVersionHelper = require('../../../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeConditionHelper = require('../../../support/helpers/licence-version-purpose-condition.helper.js')
const LicenceVersionPurposeConditionTypeHelper = require('../../../support/helpers/licence-version-purpose-condition-type.helper.js')
const LicenceVersionPurposeHelper = require('../../../support/helpers/licence-version-purpose.helper.js')
const PrimaryPurposeHelper = require('../../../support/helpers/primary-purpose.helper.js')
const PurposeHelper = require('../../../support/helpers/purpose.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const SecondaryPurposeHelper = require('../../../support/helpers/secondary-purpose.helper.js')
const { randomInteger } = require('../../../support/general.js')
const { timestampForPostgres } = require('../../../../app/lib/general.lib.js')
const { transaction } = require('objection')

// Thing under test
const PersistLicenceVersionsService = require('../../../../app/services/import/persist/persist-licence-versions.service.js')

describe('Persist licence versions service', () => {
  let licenceVersionPurposeConditionType
  let primaryPurpose
  let purpose
  let region
  let secondaryPurpose
  let trx
  let updatedAt

  beforeEach(async () => {
    licenceVersionPurposeConditionType = LicenceVersionPurposeConditionTypeHelper.select()
    primaryPurpose = PrimaryPurposeHelper.select()
    purpose = PurposeHelper.select()
    region = RegionHelper.select()
    secondaryPurpose = SecondaryPurposeHelper.select()

    updatedAt = timestampForPostgres()

    trx = await transaction.start(LicenceModel.knex())
  })

  afterEach(async () => {
    if (!trx.isCompleted()) {
      await trx.rollback()
    }
  })

  describe('when given a valid transformed licence versions', () => {
    describe('and that licence versions does not already exist', () => {
      let licenceId
      let transformedLicence

      beforeEach(async () => {
        transformedLicence = _transformedLicence(
          region.id,
          primaryPurpose.id,
          purpose.id,
          secondaryPurpose.id,
          licenceVersionPurposeConditionType.id
        )

        // Licence
        const licence = await LicenceHelper.add({
          expiredDate: new Date('2052-06-23'),
          lapsedDate: new Date('2050-07-24'),
          licenceRef: transformedLicence.licenceRef,
          regionId: region.id,
          regions: {
            historicalAreaCode: 'RIDIN',
            regionalChargeArea: 'Yorkshire',
            standardUnitChargeCode: 'YORKI',
            localEnvironmentAgencyPlanCode: 'AIREL'
          },
          revokedDate: new Date('2049-08-25'),
          startDate: new Date('1992-08-19')
        })

        licenceId = licence.id
      })

      it('creates a new licence record plus child records in WRLS and returns the licence ID', async () => {
        await PersistLicenceVersionsService.go(trx, updatedAt, transformedLicence, licenceId)

        // Commit the transaction so the data is saved to the database
        await trx.commit()

        // Get the persisted data
        const newLicence = await _fetchPersistedLicence(transformedLicence.licenceRef)

        // Licence Version
        const newLicenceVersion = newLicence.licenceVersions[0]

        expect(newLicenceVersion.externalId).to.equal(transformedLicence.licenceVersions[0].externalId)

        // Licence Version Purpose
        const newLicenceVersionPurpose = newLicence.licenceVersions[0].licenceVersionPurposes[0]

        expect(newLicenceVersionPurpose.externalId).to.equal(
          transformedLicence.licenceVersions[0].licenceVersionPurposes[0].externalId
        )

        // Licence Version Purpose Condition
        const newLicenceVersionPurposeCondition =
          newLicence.licenceVersions[0].licenceVersionPurposes[0].licenceVersionPurposeConditions[0]

        expect(newLicenceVersionPurposeCondition.externalId).to.equal(
          transformedLicence.licenceVersions[0].licenceVersionPurposes[0].licenceVersionPurposeConditions[0].externalId
        )
      })
    })

    describe('and that licence versions already exists', () => {
      let existingLicence
      let existingLicenceVersion
      let existingLicenceVersionPurpose
      let existingLicenceVersionPurposeCondition
      let transformedLicence
      let updatedLicence

      beforeEach(async () => {
        transformedLicence = _transformedLicence(
          region.id,
          primaryPurpose.id,
          purpose.id,
          secondaryPurpose.id,
          licenceVersionPurposeConditionType.id
        )

        const existing = await _createExistingRecords(transformedLicence)

        existingLicence = existing.licence
        existingLicenceVersion = existing.licenceVersion
        existingLicenceVersionPurpose = existing.licenceVersionPurpose
        existingLicenceVersionPurposeCondition = existing.licenceVersionPurposeCondition
      })

      it('should return the updated licence', async () => {
        // Call the thing under test
        await PersistLicenceVersionsService.go(trx, updatedAt, transformedLicence, existingLicence.id)

        // Commit the transaction so the data is saved to the database
        await trx.commit()

        // Get the persisted data
        updatedLicence = await _fetchPersistedLicence(existingLicence.licenceRef)

        // Licence Version
        const updatedLicVer = updatedLicence.licenceVersions[0]
        const transformedLicVer = transformedLicence.licenceVersions[0]

        expect(updatedLicVer.id).to.equal(existingLicenceVersion.id)
        expect(updatedLicVer.endDate).to.equal(transformedLicVer.endDate)
        expect(updatedLicVer.startDate).to.equal(transformedLicVer.startDate)
        expect(updatedLicVer.status).to.equal(transformedLicVer.status)

        // Licence Version Purpose
        const updatedLicVerPur = updatedLicence.licenceVersions[0].licenceVersionPurposes[0]
        const transformedLicVerPur = transformedLicence.licenceVersions[0].licenceVersionPurposes[0]

        expect(updatedLicVerPur.id).to.equal(existingLicenceVersionPurpose.id)
        expect(updatedLicVerPur.abstractionPeriodEndDay).to.equal(transformedLicVerPur.abstractionPeriodEndDay)
        expect(updatedLicVerPur.abstractionPeriodEndMonth).to.equal(transformedLicVerPur.abstractionPeriodEndMonth)
        expect(updatedLicVerPur.abstractionPeriodStartDay).to.equal(transformedLicVerPur.abstractionPeriodStartDay)
        expect(updatedLicVerPur.abstractionPeriodStartMonth).to.equal(transformedLicVerPur.abstractionPeriodStartMonth)
        expect(updatedLicVerPur.annualQuantity).to.equal(transformedLicVerPur.annualQuantity)
        expect(updatedLicVerPur.dailyQuantity).to.equal(transformedLicVerPur.dailyQuantity)
        expect(updatedLicVerPur.hourlyQuantity).to.equal(transformedLicVerPur.hourlyQuantity)
        expect(updatedLicVerPur.instantQuantity).to.equal(transformedLicVerPur.instantQuantity)
        expect(updatedLicVerPur.notes).to.equal(transformedLicVerPur.notes)
        expect(updatedLicVerPur.primaryPurposeId).to.equal(transformedLicVerPur.primaryPurposeId)
        expect(updatedLicVerPur.purposeId).to.equal(transformedLicVerPur.purposeId)
        expect(updatedLicVerPur.secondaryPurposeId).to.equal(transformedLicVerPur.secondaryPurposeId)
        expect(updatedLicVerPur.timeLimitedEndDate).to.equal(transformedLicVerPur.timeLimitedEndDate)
        expect(updatedLicVerPur.timeLimitedStartDate).to.equal(transformedLicVerPur.timeLimitedStartDate)

        // Licence Version Purpose Conditions
        const updatedLicVerPurCon =
          updatedLicence.licenceVersions[0].licenceVersionPurposes[0].licenceVersionPurposeConditions[0]
        const transformedLicVerPurCon =
          transformedLicence.licenceVersions[0].licenceVersionPurposes[0].licenceVersionPurposeConditions[0]

        expect(updatedLicVerPurCon.id).to.equal(existingLicenceVersionPurposeCondition.id)
        expect(updatedLicVerPurCon.externalId).to.equal(transformedLicVerPurCon.externalId)
        expect(updatedLicVerPurCon.licenceVersionPurposeConditionTypeId).to.equal(
          transformedLicVerPurCon.licenceVersionPurposeConditionTypeId
        )
        expect(updatedLicVerPurCon.notes).to.equal(transformedLicVerPurCon.notes)
        expect(updatedLicVerPurCon.param1).to.equal(transformedLicVerPurCon.param1)
        expect(updatedLicVerPurCon.param2).to.equal(transformedLicVerPurCon.param2)
        expect(updatedLicVerPurCon.source).to.equal(transformedLicVerPurCon.source)
      })
    })
  })
})

async function _fetchPersistedLicence(licenceRef) {
  return LicenceModel.query()
    .where('licenceRef', licenceRef)
    .withGraphFetched('licenceVersions')
    .withGraphFetched('licenceVersions.licenceVersionPurposes')
    .withGraphFetched('licenceVersions.licenceVersionPurposes.licenceVersionPurposeConditions')
    .limit(1)
    .first()
}

function _transformedLicence(
  regionId,
  primaryPurposeId,
  purposeId,
  secondaryPurposeId,
  licenceVersionPurposeConditionTypeId
) {
  return {
    expiredDate: null,
    lapsedDate: null,
    licenceRef: LicenceHelper.generateLicenceRef(),
    regionId,
    regions: {
      historicalAreaCode: 'KAEA',
      regionalChargeArea: 'Southern',
      standardUnitChargeCode: 'SUCSO',
      localEnvironmentAgencyPlanCode: 'LEME'
    },
    revokedDate: null,
    startDate: new Date('1992-08-19'),
    waterUndertaker: false,
    licenceVersions: [
      {
        endDate: new Date('2052-06-23'),
        externalId: LicenceVersionHelper.generateLicenceVersionExternalId(),
        increment: 0,
        issue: 100,
        startDate: new Date('1999-01-01'),
        status: 'superseded',
        licenceVersionPurposes: [
          {
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            annualQuantity: 545520.1,
            dailyQuantity: 1500.2,
            externalId: LicenceVersionPurposeHelper.generateLicenceVersionPurposeExternalId(),
            hourlyQuantity: 140.929,
            instantQuantity: null,
            notes: 'This is a note',
            primaryPurposeId,
            purposeId,
            secondaryPurposeId,
            timeLimitedEndDate: null,
            timeLimitedStartDate: null,
            licenceVersionPurposeConditions: [
              {
                externalId: `${randomInteger(1, 99999)}:${randomInteger(1, 9)}:${randomInteger(1, 99999999)}`,
                licenceVersionPurposeConditionTypeId,
                notes: 'At each abstraction borehole',
                param1: null,
                param2: null,
                source: 'nald'
              }
            ]
          }
        ]
      }
    ]
  }
}

async function _createExistingRecords(transformedLicence) {
  const licence = await LicenceHelper.add({
    expiredDate: new Date('2052-06-23'),
    lapsedDate: new Date('2050-07-24'),
    licenceRef: transformedLicence.licenceRef,
    regionId: RegionHelper.select().id,
    regions: {
      historicalAreaCode: 'RIDIN',
      regionalChargeArea: 'Yorkshire',
      standardUnitChargeCode: 'YORKI',
      localEnvironmentAgencyPlanCode: 'AIREL'
    },
    revokedDate: new Date('2049-08-25'),
    startDate: new Date('1992-08-19')
  })

  const licenceVersion = await LicenceVersionHelper.add({
    endDate: new Date('2052-06-23'),
    externalId: transformedLicence.licenceVersions[0].externalId,
    licenceId: licence.id,
    startDate: new Date('1999-01-01'),
    status: 'current'
  })

  const licenceVersionPurpose = await LicenceVersionPurposeHelper.add({
    abstractionPeriodEndDay: 30,
    abstractionPeriodEndMonth: 9,
    abstractionPeriodStartDay: 1,
    abstractionPeriodStartMonth: 5,
    annualQuantity: 61371,
    dailyQuantity: 1091,
    externalId: transformedLicence.licenceVersions[0].licenceVersionPurposes[0].externalId,
    hourlyQuantity: 68,
    instantQuantity: 18.89,
    licenceVersionId: licenceVersion.id,
    notes: 'I was here first',
    primaryPurposeId: PrimaryPurposeHelper.select().id,
    purposeId: PurposeHelper.select().id,
    secondaryPurposeId: SecondaryPurposeHelper.select().id,
    timeLimitedEndDate: new Date('1992-08-19'),
    timeLimitedStartDate: new Date('2052-06-23')
  })

  const licenceVersionPurposeCondition = await LicenceVersionPurposeConditionHelper.add({
    licenceVersionPurposeId: licenceVersionPurpose.id,
    licenceVersionPurposeConditionTypeId: LicenceVersionPurposeConditionTypeHelper.select().id,
    externalId:
      transformedLicence.licenceVersions[0].licenceVersionPurposes[0].licenceVersionPurposeConditions[0].externalId,
    source: 'nald'
  })

  return {
    licence,
    licenceVersion,
    licenceVersionPurposeCondition,
    licenceVersionPurpose
  }
}
