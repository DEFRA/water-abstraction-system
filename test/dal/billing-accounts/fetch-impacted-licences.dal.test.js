'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, after, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ChargeVersionHelper = require('../../support/helpers/charge-version.helper.js')
const { compareStrings, generateUUID } = require('../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

// Thing under test
const FetchImpactedLicencesDal = require('../../../app/dal/billing-accounts/fetch-impacted-licences.dal.js')

describe('DAL - Fetch Impacted Licences dal', () => {
  const billingAccountId = generateUUID()

  let chargeVersions
  let multiUseLicenceRef
  let singleUseLicenceRef

  before(async () => {
    // NOTE: We want to confirm the results are sorted. So, of the two references generated, we'll use the 'higher'
    // one to create our first record, to confirm the order isn't a fluke of the order in which the records were created
    const licenceRefs = [generateLicenceRef(), generateLicenceRef()].sort((referenceString, compareString) => {
      return compareStrings(referenceString, compareString)
    })

    multiUseLicenceRef = licenceRefs[0]
    singleUseLicenceRef = licenceRefs[1]

    chargeVersions = [
      await ChargeVersionHelper.add({ billingAccountId, licenceRef: singleUseLicenceRef }),
      await ChargeVersionHelper.add({ billingAccountId, licenceRef: multiUseLicenceRef }),
      await ChargeVersionHelper.add({ billingAccountId, licenceRef: multiUseLicenceRef }),
      await ChargeVersionHelper.add({ licenceRef: generateLicenceRef() })
    ]
  })

  after(async () => {
    for (const chargeVersion of chargeVersions) {
      await chargeVersion.$query().delete()
    }
  })

  describe('when there are charge versions that match the billing account id', () => {
    it('returns an array of unique licence references', async () => {
      const result = await FetchImpactedLicencesDal.go(billingAccountId)

      expect(result).to.equal([multiUseLicenceRef, singleUseLicenceRef])
    })
  })

  describe('when there are no charge versions that match the billing account id', () => {
    it('returns an empty array', async () => {
      const result = await FetchImpactedLicencesDal.go(generateUUID())

      expect(result).to.equal([])
    })
  })
})
