'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Test helpers
const LicenceVersionHelper = require('../../../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeHelper = require('../../../support/helpers/licence-version-purpose.helper.js')
const PurposeHelper = require('../../../support/helpers/purpose.helper.js')

// Thing under test
const FetchPurposesService = require('../../../../app/services/return-versions/setup/fetch-purposes.service.js')

describe('Return Versions Setup - Fetch Purposes service', () => {
  let licenceVersion
  let purposes

  beforeEach(async () => {
    // Create the initial licenceVersion
    licenceVersion = await LicenceVersionHelper.add()

    // we purposefully don't add them in alphabetical order so we can test they get sorted by the service
    purposes = [
      { ...PurposeHelper.data.find((purpose) => { return purpose.description === 'Large Garden Watering' }) },
      { ...PurposeHelper.data.find((purpose) => { return purpose.description === 'Heat Pump' }) },
      { ...PurposeHelper.data.find((purpose) => { return purpose.description === 'Horticultural Watering' }) }
    ]

    // Create the licenceVersionPurposes. Note - two of them are for the same purpose. This is common in the service
    // where, for example, a licence might abstract water from 2 different points for the same purpose, but they were
    // set up separately (rather than the licence version purpose being linked to multiple points) because the details
    // and/or conditions are different at the 2 points.
    const licenceVersionId = licenceVersion.id

    await Promise.all([
      LicenceVersionPurposeHelper.add({ licenceVersionId, purposeId: purposes[0].id }),
      LicenceVersionPurposeHelper.add({ licenceVersionId, purposeId: purposes[1].id }),
      LicenceVersionPurposeHelper.add({ licenceVersionId, purposeId: purposes[1].id }),
      LicenceVersionPurposeHelper.add({ licenceVersionId, purposeId: purposes[2].id })
    ])
  })

  describe('when called with a valid licenceId', () => {
    it('fetches the data', async () => {
      const result = await FetchPurposesService.go(licenceVersion.licenceId)

      expect(result[0]).to.equal({
        id: purposes[1].id,
        description: 'Heat Pump'
      })
      expect(result[1]).to.equal({
        id: purposes[2].id,
        description: 'Horticultural Watering'
      })
      expect(result[2]).to.equal({
        id: purposes[0].id,
        description: 'Large Garden Watering'
      })
    })
  })

  describe('when called with an invalid licenceId', () => {
    it('returns an empty result', async () => {
      const result = await FetchPurposesService.go('5505ca34-270a-4dfb-894c-168c8a4d6e23')

      expect(result).to.be.empty()
    })
  })
})
