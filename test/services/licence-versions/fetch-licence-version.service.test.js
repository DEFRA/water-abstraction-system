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
  let licence
  let licenceVersion

  describe('when there is licence version', () => {
    before(async () => {
      licence = await LicenceHelper.add()

      licenceVersion = await LicenceVersionHelper.add({ licenceId: licence.id })
    })

    it('returns the matching licence version', async () => {
      const result = await FetchLicenceVersionService.go(licenceVersion.id)

      expect(result).to.equal({
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
      })
    })
  })
})
