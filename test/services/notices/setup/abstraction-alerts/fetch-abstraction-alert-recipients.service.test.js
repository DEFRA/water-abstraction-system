'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CRMContactsSeeder = require('../../../../support/seeders/crm-contacts.seeder.js')
const EmptyLicence = require('../../../../support/seeders/empty-licence.seeder.js')
const RecipientScenariosSeeder = require('../../../../support/seeders/recipient-scenarios.seeder.js')
const RecipientsSeeder = require('../../../../support/seeders/recipients.seeder.js')

// Thing under test
const FetchAbstractionAlertRecipientsService = require('../../../../../app/services/notices/setup/abstraction-alerts/fetch-abstraction-alert-recipients.service.js')

describe('Notices - Setup - Abstraction Alerts - Fetch Abstraction Alert Recipients service', () => {
  let scenarios
  let session

  before(async () => {
    scenarios = []

    // 1) Licence holder only
    const licenceHolder = await _licenceHolder()
    const licenceHolderRecipient = await _licenceHolderRecipient(licenceHolder.licence, licenceHolder.licenceHolder)
    scenarios.push([licenceHolderRecipient])

    session = { licenceRefs: [scenarios[0][0].licenceRef] }
  })

  after(async () => {
    await RecipientScenariosSeeder.clean(scenarios)
  })

  describe('when there are abstraction alert recipients to notify', () => {
    it('fetches the correct recipient data', async () => {
      const result = await FetchAbstractionAlertRecipientsService.go(session)

      const expectedResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[0])

      expect(result).to.equal(expectedResults)
    })
  })
})

async function _licenceHolder() {
  const licence = await EmptyLicence.seed()
  const licenceHolder = await CRMContactsSeeder.licenceHolder(licence, 'Holderwithadditionalcontact')

  return {
    licence,
    licenceHolder
  }
}

async function _licenceHolderRecipient(licence, licenceHolder) {
  const licenceHolderRecipient = await RecipientsSeeder.licenceHolder(licence, licenceHolder)

  licenceHolderRecipient.licenceRefs = [licence.licence.licenceRef]

  return licenceHolderRecipient
}
