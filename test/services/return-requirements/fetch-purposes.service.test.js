'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeHelper = require('../../support/helpers/licence-version-purpose.helper.js')
const PurposeHelper = require('../../support/helpers/purpose.helper.js')

// Thing under test
const FetchPurposesService = require('../../../app/services/return-requirements/fetch-purposes.service.js')

describe('Fetch purposes service', () => {
  let purposes
  let licenceVersion

  beforeEach(async () => {
    await DatabaseSupport.clean()

    // Create the initial licenceVersion
    licenceVersion = await LicenceVersionHelper.add()

    // Create 3 descriptions for the purposes
    purposes = await Promise.all([
      await PurposeHelper.add({ description: 'Heat Pump' }),
      await PurposeHelper.add({ description: 'Horticultural Watering' }),
      await PurposeHelper.add({ description: 'Large Garden Watering' })
    ])

    // Create the licenceVersionPurposes with the purposes and licenceVersion
    for (const purpose of purposes) {
      await LicenceVersionPurposeHelper.add({
        licenceVersionId: licenceVersion.id,
        purposeId: purpose.id
      })
    }
  })

  describe('when called with a valid licenceId', () => {
    it('fetches the data', async () => {
      const result = await FetchPurposesService.go(licenceVersion.licenceId)

      expect(result).to.equal([
        'Heat Pump',
        'Horticultural Watering',
        'Large Garden Watering'
      ])
    })
  })

  describe('when called with an invalid licenceId', () => {
    it('returns empty result', async () => {
      const result = await FetchPurposesService.go('5505ca34-270a-4dfb-894c-168c8a4d6e23')

      expect(result).to.be.empty()
    })
  })
})
