'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, after, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ChargeVersionHelper = require('../../support/helpers/charge-version.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const FetchImpactedLicencesDal = require('../../../app/dal/billing-accounts/fetch-impacted-licences.dal.js')

describe('DAL - Fetch Impacted Licences dal', () => {
  const billingAccountId = generateUUID()

  let fristChargeVersion
  let secondChargeVersion

  before(async () => {
    fristChargeVersion = await ChargeVersionHelper.add({ billingAccountId })
    secondChargeVersion = await ChargeVersionHelper.add({ billingAccountId })
  })

  after(async () => {
    await fristChargeVersion.$query().delete()
    await secondChargeVersion.$query().delete()
  })

  describe('when there are charge versions that match the billing account id', () => {
    it('returns an array of licence references', async () => {
      const result = await FetchImpactedLicencesDal.go(billingAccountId)

      expect(result).to.equal([fristChargeVersion.licenceRef, secondChargeVersion.licenceRef])
    })
  })

  describe('when there are no charge versions that match the billing account id', () => {
    it('returns an empty array', async () => {
      const result = await FetchImpactedLicencesDal.go(generateUUID())

      expect(result).to.equal([])
    })
  })
})
