'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceVersionModel = require('../../../app/models/licence-version.model.js')
const FixtureValidLicenceVersions = require('./_fixtures/import-licence-versions.fixture.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')

// Thing under test
const PersistLicenceVersionsService =
  require('../../../app/services/import/persist-licence-versions.service.js')

describe('Persist licence versions and licence versions purposes service', () => {
  let licenceVersionsAndPurposes
  let licence

  beforeEach(async () => {
    licence = await LicenceHelper.add()

    licenceVersionsAndPurposes = [
      {
        ...FixtureValidLicenceVersions.importLicenceVersion,
        purposes: []
      }
    ]
  })

  describe('when the licence version does not exist', () => {
    it('returns the updated licence version', async () => {
      const [result] = await PersistLicenceVersionsService.go(licenceVersionsAndPurposes, licence.id)

      const savedLicenceVersion = await LicenceVersionModel.query()
        .select('*')
        .where('externalId', FixtureValidLicenceVersions.importLicenceVersion.externalId).first()

      expect(result).to.equal({
        createdAt: savedLicenceVersion.createdAt.toISOString(),
        endDate: '2002-01-01',
        externalId: FixtureValidLicenceVersions.importLicenceVersion.externalId,
        id: result.id,
        increment: 0,
        issue: 100,
        licenceId: licence.id,
        purposes: [],
        startDate: '2001-01-01',
        status: 'superseded',
        updatedAt: savedLicenceVersion.updatedAt.toISOString()
      })
    })
  })

  describe('when the licence version already exists', () => {
    beforeEach(async () => {
      licenceVersionsAndPurposes = [
        {
          ...FixtureValidLicenceVersions.importLicenceVersion,
          purposes: [],
          increment: 1
        }
      ]

      await PersistLicenceVersionsService.go(licenceVersionsAndPurposes, licence.id)
    })

    it('returns the created licence version with updated values', async () => {
      const [result] = await PersistLicenceVersionsService.go(licenceVersionsAndPurposes, licence.id)

      const savedLicenceVersion = await LicenceVersionModel.query()
        .select('*')
        .where('externalId', FixtureValidLicenceVersions.importLicenceVersion.externalId).first()

      expect(result).to.equal({
        endDate: '2002-01-01',
        externalId: FixtureValidLicenceVersions.importLicenceVersion.externalId,
        id: result.id,
        increment: 1,
        issue: 100,
        licenceId: licence.id,
        purposes: [],
        startDate: '2001-01-01',
        status: 'superseded',
        updatedAt: savedLicenceVersion.updatedAt.toISOString()
      }, { skip: ['createdAt'] })

      expect(result.increment).to.equal(1)
    })
  })

  // todo: add these tests
  // licence exists - purpose newly created and purpose updated ?
  // licence does not exists - purpose newly created
})
