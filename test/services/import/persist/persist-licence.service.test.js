'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceModel = require('../../../../app/models/licence.model.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const { timestampForPostgres } = require('../../../../app/lib/general.lib.js')
const { transaction } = require('objection')

// Thing under test
const PersistLicenceService = require('../../../../app/services/import/persist/persist-licence.service.js')

describe('Persist licence service', () => {
  let newLicence
  let region
  let trx
  let updatedAt

  beforeEach(async () => {
    region = RegionHelper.select()

    updatedAt = timestampForPostgres()

    trx = await transaction.start(LicenceModel.knex())
  })

  afterEach(async () => {
    if (!trx.isCompleted()) {
      await trx.rollback()
    }
  })

  describe('when given a valid transformed licence', () => {
    describe('and that licence does not already exist', () => {
      let transformedLicence

      beforeEach(() => {
        transformedLicence = _transformedLicence(region.id)
      })

      it('creates a new licence record plus child records in WRLS and returns the licence ID', async () => {
        const result = await PersistLicenceService.go(trx, updatedAt, transformedLicence)

        // Commit the transaction so the data is saved to the database
        await trx.commit()

        newLicence = await _fetchPersistedLicence(transformedLicence.licenceRef)

        expect(result).to.equal(newLicence.id)
      })
    })

    describe('and that licence already exists', () => {
      let existingLicence
      let updatedLicence

      beforeEach(async () => {
        const existing = await _createExistingRecords(region)

        existingLicence = existing.licence
      })

      it('should return the updated licence', async () => {
        // Call the thing under test
        const result = await PersistLicenceService.go(trx, updatedAt, existingLicence)

        // Commit the transaction so the data is saved to the database
        await trx.commit()

        // Get the persisted data
        updatedLicence = await _fetchPersistedLicence(existingLicence.licenceRef)

        // Check the licence has updates the correct licence id
        expect(result).to.equal(existingLicence.id)

        // Check the updated licence
        expect(updatedLicence.expiredDate).to.equal(existingLicence.expiredDate)
        expect(updatedLicence.lapsedDate).to.equal(existingLicence.lapsedDate)
        expect(updatedLicence.regions).to.equal(existingLicence.regions)
        expect(updatedLicence.revokedDate).to.equal(existingLicence.revokedDate)
        expect(updatedLicence.startDate).to.equal(existingLicence.startDate)
      })
    })
  })
})

async function _fetchPersistedLicence(licenceRef) {
  return LicenceModel.query().where('licenceRef', licenceRef).select('*').limit(1).first()
}

function _transformedLicence(regionId) {
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
    licenceVersions: []
  }
}

async function _createExistingRecords(region) {
  const licence = await LicenceHelper.add({
    expiredDate: new Date('2052-06-23'),
    lapsedDate: new Date('2050-07-24'),
    licenceRef: LicenceHelper.generateLicenceRef(),
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

  return {
    licence
  }
}
