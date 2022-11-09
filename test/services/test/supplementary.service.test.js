'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeVersionHelper = require('../../support/helpers/charge_version.helper')
const DatabaseHelper = require('../../support/helpers/database.helper')

// Thing under test
const SupplementaryService = require('../../../app/services/test/supplementary.service.js')

describe('Supplementary service', () => {
  const testData = {
    sroc: { licence_ref: '01/123', scheme: 'sroc' },
    alcs: { licence_ref: '01/456', scheme: 'alcs' }
  }
  let testRecords

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when there are charge versions to be included in supplimentery billing', () => {
    beforeEach(async () => {
      testRecords = await ChargeVersionHelper.add([testData.sroc, testData.alcs])
    })

    it('returns only those that match', async () => {
      const result = await SupplementaryService.go()

      expect(result.chargeVersions.length).to.equal(1)
      expect(result.chargeVersions[0].charge_version_id).to.equal(testRecords[0].charge_version_id)
    })
  })

  describe('when there are no charge versions to be included in supplimentery billing', () => {
    beforeEach(async () => {
      testRecords = await ChargeVersionHelper.add(testData.alcs)
    })

    it('returns no matches', async () => {
      const result = await SupplementaryService.go()

      expect(result.chargeVersions.length).to.equal(0)
    })
  })
})
