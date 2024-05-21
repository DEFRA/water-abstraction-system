'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const LicenceEntityHelper = require('../../support/helpers/licence-entity.helper.js')
const LicenceEntityRoleHelper = require('../../support/helpers/licence-entity-role.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceDocumentHeaderHelper = require('../../support/helpers/licence-document-header.helper.js')
const LicenceHolderSeeder = require('../../support/seeders/licence-holder.seeder.js')

// Thing under test
const FetchLicenceService = require('../../../app/services/licences/fetch-licence.service.js')

describe('Fetch licence service', () => {
  let licence

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when there is no optional data in the model', () => {
    beforeEach(async () => {
      licence = await LicenceHelper.add({
        id: 'a8256ea1-4509-4992-b30f-d011509e5f62',
        expiredDate: null,
        include_in_presroc_billing: 'yes',
        include_in_sroc_billing: true,
        lapsedDate: null,
        revokedDate: null
      })

      // Create a licence holder for the licence with the default name 'Licence Holder Ltd'
      await LicenceHolderSeeder.seed(licence.licenceRef)
    })

    it('returns results', async () => {
      const result = await FetchLicenceService.go(licence.id)

      expect(result.id).to.equal('a8256ea1-4509-4992-b30f-d011509e5f62')
      expect(result.ends).to.equal(null)
      expect(result.expiredDate).to.equal(null)
      expect(result.lapsedDate).to.equal(null)
      expect(result.licenceName).to.equal('Unregistered licence')
      expect(result.licenceRef).to.equal(licence.licenceRef)
      expect(result.revokedDate).to.equal(null)
      expect(result.includeInPresrocBilling).to.equal('yes')
      expect(result.includeInSrocBilling).to.be.true()
      expect(result.startDate).to.equal(licence.startDate)
    })
  })

  describe('when there is optional data in the model', () => {
    beforeEach(async () => {
      licence = await LicenceHelper.add({
        expiredDate: '2020-01-01',
        lapsedDate: null,
        revokedDate: null
      })

      const licenceName = 'Test Company Ltd'
      const companyEntityId = 'c960a4a1-94f9-4c05-9db1-a70ce5d08738'
      const licenceRef = licence.licenceRef

      await LicenceDocumentHeaderHelper.add({ companyEntityId, licenceName, licenceRef })
      const { id: licenceEntityId } = await LicenceEntityHelper.add()

      await LicenceEntityRoleHelper.add({ companyEntityId, licenceEntityId })
    })

    it('returns results', async () => {
      const result = await FetchLicenceService.go(licence.id)
      expect(result.registeredTo).to.equal('grace.hopper@example.com')
      expect(result.licenceName).to.equal('Test Company Ltd')
      expect(result.ends).to.equal({
        date: new Date('2020-01-01'),
        priority: 3,
        reason: 'expired'
      }
      )
    })
  })
})
