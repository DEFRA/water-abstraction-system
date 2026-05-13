'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CRMContactsSeeder = require('../../../../support/seeders/crm-contacts.seeder.js')
const EmptyLicenceSeeder = require('../../../../support/seeders/empty-licence.seeder.js')
const RecipientsSeeder = require('../../../../support/seeders/recipients.seeder.js')

// Thing under test
const FetchAlternateRenewalRecipientsService = require('../../../../../app/services/notices/setup/renewal-notice/fetch-alternate-renewal-recipients.service.js')

describe('Notices - Setup - Renewal Notice - Fetch Alternate Renewal Recipients service', () => {
  let licenceHolder
  let licenceHolderSeedData
  let licenceRef
  let licenceSeedData

  before(async () => {
    licenceSeedData = await EmptyLicenceSeeder.seed(licenceRef)

    licenceRef = licenceSeedData.licence.licenceRef

    licenceHolderSeedData = await CRMContactsSeeder.licenceHolder(licenceSeedData, 'Test Licence Holder')

    licenceHolder = await RecipientsSeeder.licenceHolder(licenceSeedData, licenceHolderSeedData)
    licenceHolder.licenceRefs = [licenceRef]
  })

  after(async () => {
    await licenceSeedData.clean()
    await licenceHolderSeedData.clean()
    await RecipientsSeeder.clean(licenceHolder)
  })

  describe('when service is called for sending the "alternate notice"', () => {
    it('fetches the correct recipient data for sending the notice', async () => {
      const results = await FetchAlternateRenewalRecipientsService.go([licenceRef])

      expect(results).to.equal([RecipientsSeeder.transformToSendingResult(licenceHolder)])
    })
  })
})
