'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CRMContactsSeeder = require('../../support/seeders/crm-contacts.seeder.js')
const EmptyLicence = require('../../support/seeders/empty-licence.seeder.js')
const RecipientScenariosSeeder = require('../../support/seeders/recipient-scenarios.seeder.js')
const RecipientsFormatter = require('../../support/seeders/recipients.formatter.js')
const { db } = require('../../../db/db.js')

// Thing under test
const RecipientQueriesDal = require('../../../app/dal/notices/recipient-queries.dal.js')

describe('Notices - Setup - Abstraction Alerts - Generate Abstraction Alert Additional Contact Query DAL', () => {
  let scenarios

  before(async () => {
    scenarios = {}

    // 1) Additional contact present
    let licence = await EmptyLicence.seed()
    scenarios.withAdditionalContact = {
      additionalContactRecipient: await _additionalContactRecipient(licence)
    }

    // 2) Additional contact where abstractionAlerts = false. The contact should NOT appear in results.
    licence = await EmptyLicence.seed()
    scenarios.additionalContactNoAlerts = {
      additionalContactRecipient: await _additionalContactRecipient(licence, false)
    }

    // 3) Additional contact where the end date has passed. The expired contact should NOT appear in results.
    licence = await EmptyLicence.seed()
    scenarios.expiredAdditionalContact = {
      additionalContactRecipient: await _additionalContactRecipient(licence, true, null, new Date('2023-01-01'))
    }

    // 4) Additional contact where the deleted at is true. The contact should NOT appear in results.
    licence = await EmptyLicence.seed()
    scenarios.deletedAdditionalContact = {
      additionalContactRecipient: await _additionalContactRecipient(licence, true, null, null, new Date('2023-01-01'))
    }
  })

  after(async () => {
    await RecipientScenariosSeeder.clean(scenarios)
  })

  describe('when called', () => {
    it('returns the expected query and bindings', () => {
      const query = RecipientQueriesDal.additionalContactRecipientQuery

      expect(query).to.startWith(`
    SELECT`)
    })
  })

  describe('when executed', () => {
    it('(Scenario 1) returns the additional contact when it is present', async () => {
      const licenceRefs = scenarios.withAdditionalContact.additionalContactRecipient.licenceRefs

      const query = RecipientQueriesDal.additionalContactRecipientQuery

      const { rows } = await db.raw(query, [licenceRefs])

      const expectedResults = RecipientScenariosSeeder.transformToSendingResults(scenarios.withAdditionalContact)

      expectedResults[0].licence_ref = expectedResults[0].licence_refs[0]
      delete expectedResults[0].licence_refs

      expect(rows).to.equal(expectedResults)
    })

    it('(Scenario 2) does not return the additional contact when abstractionAlerts is false', async () => {
      const licenceRefs = scenarios.additionalContactNoAlerts.additionalContactRecipient.licenceRefs

      const query = RecipientQueriesDal.additionalContactRecipientQuery

      const { rows } = await db.raw(query, [licenceRefs])

      expect(rows).to.equal([])
    })

    it('(Scenario 3) does not return the additional contact when the end date has passed', async () => {
      const licenceRefs = scenarios.expiredAdditionalContact.additionalContactRecipient.licenceRefs

      const query = RecipientQueriesDal.additionalContactRecipientQuery

      const { rows } = await db.raw(query, [licenceRefs])

      expect(rows).to.equal([])
    })

    it('(Scenario 4) does not return the additional contact when deleted at is true', async () => {
      const licenceRefs = scenarios.deletedAdditionalContact.additionalContactRecipient.licenceRefs

      const query = RecipientQueriesDal.additionalContactRecipientQuery

      const { rows } = await db.raw(query, [licenceRefs])

      expect(rows).to.equal([])
    })
  })
})

async function _additionalContactRecipient(
  licence,
  abstractionAlerts = true,
  contactData = null,
  endDate = null,
  deletedAt = null
) {
  const additionalContact = await CRMContactsSeeder.additionalContact(
    licence,
    contactData,
    abstractionAlerts,
    endDate,
    deletedAt
  )

  return RecipientsFormatter.additionalContact(licence, additionalContact)
}
