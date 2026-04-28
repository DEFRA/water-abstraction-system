'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, after, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ChargeVersionHelper = require('../../support/helpers/charge-version.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

// Thing under test
const FetchImpactedLicencesDal = require('../../../app/dal/billing-accounts/fetch-impacted-licences.dal.js')

describe('DAL - Fetch Impacted Licences dal', () => {
  const billingAccountId = generateUUID()
  const licenceRef = generateLicenceRef()

  let fristChargeVersion
  let secondChargeVersion
  let thirdChargeVersion
  let fourthChargeVersion

  before(async () => {
    fristChargeVersion = await ChargeVersionHelper.add({ billingAccountId })
    secondChargeVersion = await ChargeVersionHelper.add({ billingAccountId, licenceRef })
    thirdChargeVersion = await ChargeVersionHelper.add({ billingAccountId, licenceRef })
    fourthChargeVersion = await ChargeVersionHelper.add({ licenceRef })
  })

  after(async () => {
    await fristChargeVersion.$query().delete()
    await secondChargeVersion.$query().delete()
    await thirdChargeVersion.$query().delete()
    await fourthChargeVersion.$query().delete()
  })

  describe('when there are charge versions that match the billing account id', () => {
    it('returns an array of unique licence references', async () => {
      const result = await FetchImpactedLicencesDal.go(billingAccountId)

      expect(result.length).to.equal(2)
      expect(result).to.contain([fristChargeVersion.licenceRef, licenceRef])
    })
  })

  describe('when there are no charge versions that match the billing account id', () => {
    it('returns an empty array', async () => {
      const result = await FetchImpactedLicencesDal.go(generateUUID())

      expect(result).to.equal([])
    })
  })
})
