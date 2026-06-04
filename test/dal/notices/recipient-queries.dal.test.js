'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EmptyLicence = require('../../support/seeders/empty-licence.seeder.js')
const RecipientScenariosSeeder = require('../../support/seeders/recipient-scenarios.seeder.js')
const { db } = require('../../../db/db.js')

// Thing under test
const RecipientQueriesDal = require('../../../app/dal/notices/recipient-queries.dal.js')

describe('Notices - Recipient Queries DAL', () => {
  describe('#additionalContactRecipientQuery', () => {
    let scenarios

    before(async () => {
      scenarios = {}

      // 1) Additional contact present
      let licence = await EmptyLicence.seed()
      scenarios.withAdditionalContact = await RecipientScenariosSeeder.additionalContactRecipient(licence)

      // 2) Additional contact where abstractionAlerts = false. The contact should NOT appear in results.
      licence = await EmptyLicence.seed()
      scenarios.additionalContactNoAlerts = await RecipientScenariosSeeder.additionalContactRecipient(licence, false)

      // 3) Additional contact where the end date has passed. The expired contact should NOT appear in results.
      licence = await EmptyLicence.seed()
      scenarios.expiredAdditionalContact = await RecipientScenariosSeeder.additionalContactRecipient(
        licence,
        true,
        null,
        new Date('2023-01-01')
      )

      // 4) Additional contact where the deleted at is true. The contact should NOT appear in results.
      licence = await EmptyLicence.seed()
      scenarios.deletedAdditionalContact = await RecipientScenariosSeeder.additionalContactRecipient(
        licence,
        true,
        null,
        null,
        new Date('2023-01-01')
      )
    })

    after(async () => {
      await RecipientScenariosSeeder.clean(scenarios)
    })

    describe('when called', () => {
      it('additionalContactRecipientQuery is a valid SQL string', () => {
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

        const expectedResult = _transformToRecipient(scenarios.withAdditionalContact.additionalContactRecipient)

        expect(rows).to.equal([expectedResult])
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

  describe('#licenceHolderRecipientQuery', () => {
    let scenarios

    before(async () => {
      scenarios = {}

      // 1) Licence holder present
      scenarios.withLicenceHolder = await RecipientScenariosSeeder.licenceHolderOnly()
    })

    after(async () => {
      await RecipientScenariosSeeder.clean(scenarios)
    })

    describe('when called', () => {
      it('licenceHolderRecipientQuery is a valid SQL string', () => {
        const query = RecipientQueriesDal.licenceHolderRecipientQuery

        expect(query).to.startWith(`
    SELECT`)
      })
    })

    describe('when executed', () => {
      it('(Scenario 1) returns the licence holder when it is present', async () => {
        const licenceRefs = scenarios.withLicenceHolder.licenceHolderRecipient.licenceRefs

        const query = RecipientQueriesDal.licenceHolderRecipientQuery

        const { rows } = await db.raw(`${query} WHERE l.licence_ref = ANY (?)`, [licenceRefs])

        const expectedResult = _transformToRecipient(scenarios.withLicenceHolder.licenceHolderRecipient, 2)

        expect(rows).to.equal([expectedResult])
      })
    })
  })

  describe('#primaryUserRecipientQuery', () => {
    let scenarios

    before(async () => {
      scenarios = {}

      // 1) Primary user present
      scenarios.withPrimaryUser = await RecipientScenariosSeeder.primaryUserOnly()

      // 2) No primary user present. The contact should NOT appear in results.
      scenarios.noPrimaryUser = await RecipientScenariosSeeder.licenceHolderOnly()
    })

    after(async () => {
      await RecipientScenariosSeeder.clean(scenarios)
    })

    describe('when called', () => {
      it('primaryUserRecipientQuery is a valid SQL string', () => {
        const query = RecipientQueriesDal.primaryUserRecipientQuery

        expect(query).to.startWith(`
    SELECT`)
      })
    })

    describe('when executed', () => {
      it('(Scenario 1) returns the primary user when it is present', async () => {
        const licenceRefs = scenarios.withPrimaryUser.primaryUserRecipient.licenceRefs

        const query = RecipientQueriesDal.primaryUserRecipientQuery

        const { rows } = await db.raw(`${query} WHERE ldh.licence_ref = ANY (?)`, [licenceRefs])

        const expectedResult = _transformToRecipient(scenarios.withPrimaryUser.primaryUserRecipient, 1)

        expect(rows).to.equal([expectedResult])
      })

      it('(Scenario 2) does not return when there is no primary user', async () => {
        const licenceRefs = scenarios.noPrimaryUser.licenceHolderRecipient.licenceRefs

        const query = RecipientQueriesDal.primaryUserRecipientQuery

        const { rows } = await db.raw(`${query} WHERE ldh.licence_ref = ANY (?)`, [licenceRefs])

        expect(rows).to.equal([])
      })
    })
  })
})

function _transformToRecipient(recipient, priority = null) {
  const result = {
    contact: recipient.contact,
    contact_hash_id: recipient.contactHashId,
    contact_type: recipient.contactType,
    email: recipient.email,
    licence_ref: recipient.licenceRefs[0],
    message_type: recipient.messageType
  }

  if (priority !== null) {
    result.priority = priority
  }

  return result
}
