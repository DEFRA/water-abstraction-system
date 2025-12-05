'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')

// Thing under test
const FetchLicenceVersionService = require('../../../app/services/licence-versions/fetch-licence-version.service.js')

describe('Licence Versions - Fetch licence version service', () => {
  let additionalLicenceVersionOne
  let additionalLicenceVersionTwo
  let licence
  let licenceVersion

  describe('when there is licence version', () => {
    before(async () => {
      licence = await LicenceHelper.add()

      licenceVersion = await LicenceVersionHelper.add({ licenceId: licence.id })

      // Add additional licence for the pagination array
      additionalLicenceVersionOne = await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2023-01-01')
      })

      additionalLicenceVersionTwo = await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2019-01-01')
      })
    })

    it('returns the matching licence version and the pagination array (in order)', async () => {
      const result = await FetchLicenceVersionService.go(licenceVersion.id)

      expect(result).to.equal({
        licenceVersion: {
          administrative: null,
          createdAt: licenceVersion.createdAt,
          endDate: null,
          id: licenceVersion.id,
          licence: {
            id: licence.id,
            licenceRef: licence.licenceRef
          },
          modLogs: [],
          startDate: licenceVersion.startDate
        },
        licenceVersionsForPagination: [
          {
            id: additionalLicenceVersionTwo.id,
            startDate: new Date('2019-01-01')
          },
          {
            id: licenceVersion.id,
            startDate: new Date('2022-01-01')
          },
          {
            id: additionalLicenceVersionOne.id,
            startDate: new Date('2023-01-01')
          }
        ]
      })
    })
  })
})
