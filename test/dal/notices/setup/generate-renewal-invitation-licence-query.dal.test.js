'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Thing under test
const GenerateRenewalInvitationLicenceQueryDal = require('../../../../app/dal/notices/setup/generate-renewal-invitation-licence-query.dal.js')

describe('Notices - Setup - Generate Renewal Invitation Licence Query DAL', () => {
  describe('when called with a licence reference', () => {
    it('returns the query and binding for that licence ref', () => {
      const licenceRef = generateLicenceRef()
      const result = GenerateRenewalInvitationLicenceQueryDal.go(licenceRef)

      expect(result).to.equal({
        bindings: [licenceRef],
        query: `SELECT l.licence_ref FROM public.licences l WHERE l.licence_ref = ?`
      })
    })
  })
})
