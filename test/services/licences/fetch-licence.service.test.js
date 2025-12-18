'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceModel = require('../../../app/models/licence.model.js')
const LicenceSupplementaryYearModel = require('../../support/helpers/licence-supplementary-year.helper.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const FetchLicenceService = require('../../../app/services/licences/fetch-licence.service.js')

describe('Licences - Fetch Licence service', () => {
  let licence
  let licenceVersion

  describe('when there is a matching licence', () => {
    beforeEach(async () => {
      licence = await LicenceHelper.add()

      await LicenceSupplementaryYearModel.add({
        licenceId: licence.id,
        twoPartTariff: true
      })

      licenceVersion = await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2022-05-01')
      })

      // Create 2 licence versions so we can test the service only gets the 'current' version
      await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2021-10-11'),
        status: 'superseded'
      })
    })

    it('returns the matching licence', async () => {
      const result = await FetchLicenceService.go(licence.id)

      expect(result).to.be.an.instanceOf(LicenceModel)
      expect(result).to.equal({
        expiredDate: null,
        id: licence.id,
        includeInPresrocBilling: 'no',
        includeInSrocBilling: false,
        includeInTwoPartTariffBilling: true,
        lapsedDate: null,
        licenceRef: licence.licenceRef,
        licenceVersions: [
          {
            id: licenceVersion.id,
            issueDate: null,
            startDate: new Date('2022-05-01'),
            status: 'current'
          }
        ],
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
