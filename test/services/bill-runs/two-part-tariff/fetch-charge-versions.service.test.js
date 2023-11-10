'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const FetchChargeVersionsService = require('../../../../app/services/billing/two-part-tariff/fetch-charge-versions.service')

describe('Fetch Charge Versions service', () => {
  describe('when there are charge versions that should be considered for the next two-part tariff bill run', () => {
    describe('including those linked to soft-deleted workflow records', () => {
      it('returns the SROC charge versions that are applicable', () => {

      })
    })

    it('excludes licences in workflow', () => {

    })

    it("returns charge versions that have a 'SROC' scheme", () => {

    })

    it('returns charge versions that have a start date which is less than or equal to the billing period end date', () => {

    })
    it("returns only 'current' SROC charge versions that are applicable", () => {

    })
    it("returns only the charge versions that have the same 'region code'", () => {

    })
    it('returns charge versions with associated licence information', () => {

    })
    it('returns charge versions with correct ordering based on licence reference', () => {

    })
    it("returns only charge versions that have a reference marked as 's127' (two-part tariff)", () => {

    })
    describe('when there are multiple charge elements associated with the charge reference,', () => {
      it('returns the charge elements with correct ordering based on authorised annual quantity', () => {

      })
    })
  })
})
