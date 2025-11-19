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
const FetchLicenceRefService = require('../../../app/services/licences/fetch-licence-ref.service.js')

describe('Licences - Fetch Licence ref service', () => {
  let licence

  describe('when there is a matching licence', () => {
    beforeEach(async () => {
      licence = await LicenceHelper.add()
    })

    it('returns the matching licence', async () => {
      const result = await FetchLicenceRefService.go(licence.id)

      expect(result).to.be.an.instanceOf(LicenceModel)
      expect(result).to.equal({
        id: licence.id,
        includeInPresrocBilling: 'no',
        licenceRef: licence.licenceRef
      })
    })
  })

  describe('when there is not a matching licence', () => {
    it('returns undefined', async () => {
      const result = await FetchLicenceRefService.go(generateUUID())

      expect(result).to.be.undefined()
    })
  })
})
