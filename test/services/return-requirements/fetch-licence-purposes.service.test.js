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
const FetchPurposesService = require('../../../app/services/return-requirements/fetch-licence-purposes.service.js')

describe('Return Requirements - Fetch Purposes for a given licence service', () => {
  let licenceVersion
  let purposes

  beforeEach(async () => {
    await DatabaseSupport.clean()

    // Create the initial licenceVersion
    licenceVersion = await LicenceVersionHelper.add()

    // Create 3 descriptions for the purposes
    purposes = await Promise.all([
      await PurposeHelper.add({ id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f', description: 'Heat Pump' }),
      await PurposeHelper.add({ id: '49088608-ee9f-491a-8070-6831240945ac', description: 'Horticultural Watering' }),
      await PurposeHelper.add({ id: '8290bb6a-4265-4cc8-b9bb-37cde1357d5d', description: 'Large Garden Watering' })
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

      expect(result).to.equal([{
        id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f',
        description: 'Heat Pump'
      }, {
        id: '49088608-ee9f-491a-8070-6831240945ac',
        description: 'Horticultural Watering'
      }, {
        id: '8290bb6a-4265-4cc8-b9bb-37cde1357d5d',
        description: 'Large Garden Watering'
      }])
    })
  })

  describe('when called with an invalid licenceId', () => {
    it('returns empty result', async () => {
      const result = await FetchPurposesService.go('5505ca34-270a-4dfb-894c-168c8a4d6e23')

      expect(result).to.be.empty()
    })
  })
})
