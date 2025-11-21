'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceModel = require('../../../app/models/licence.model.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const FetchLicenceService = require('../../../app/services/licences/fetch-licence.service.js')

describe('Licences - Fetch Licence service', () => {
  let licence

  describe('when there is a matching licence', () => {
    beforeEach(async () => {
      licence = await LicenceHelper.add()
    })

    it('returns the matching licence', async () => {
      const result = await FetchLicenceService.go(licence.id)

      expect(result).to.be.an.instanceOf(LicenceModel)
      expect(result).to.equal({
        expiredDate: null,
        id: licence.id,
        lapsedDate: null,
        licenceRef: licence.licenceRef,
        revokedDate: null
      })
    })
  })

  describe('when there is not a matching licence', () => {
    it('returns undefined', async () => {
      const result = await FetchLicenceService.go(generateUUID())

      expect(result).to.be.undefined()
    })
  })
})
