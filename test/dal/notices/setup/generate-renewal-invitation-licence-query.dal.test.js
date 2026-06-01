'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const { db } = require('../../../../db/db.js')

// Thing under test
const GenerateRenewalInvitationLicenceQueryDal = require('../../../../app/dal/notices/setup/generate-renewal-invitation-licence-query.dal.js')

describe('Notices - Setup - Generate Renewal Invitation Licence Query DAL', () => {
  let licence

  before(async () => {
    licence = await LicenceHelper.add()
  })

  after(async () => {
    await licence.$query().delete()
  })

  describe('when called', () => {
    it('returns the expected query and bindings', () => {
      const result = GenerateRenewalInvitationLicenceQueryDal.go(licence.licenceRef)

      expect(result).to.equal({
        bindings: [licence.licenceRef],
        query: `SELECT l.licence_ref FROM public.licences l WHERE l.licence_ref = ?`
      })
    })
  })

  describe('when executed', () => {
    it('returns the expected licence', async () => {
      const { bindings, query } = GenerateRenewalInvitationLicenceQueryDal.go(licence.licenceRef)
      const { rows } = await db.raw(query, bindings)

      expect(rows).to.equal([{ licence_ref: licence.licenceRef }])
    })
  })
})
