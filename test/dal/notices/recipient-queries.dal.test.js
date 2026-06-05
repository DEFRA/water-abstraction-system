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
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const { db } = require('../../../db/db.js')

// Thing under test
const RecipientQueriesDal = require('../../../app/dal/notices/recipient-queries.dal.js')

describe('Notices - Recipient Queries DAL', () => {
  describe('#currentLicenceVersionsJoin', () => {
    const query = RecipientQueriesDal.currentLicenceVersionsJoin

    // The currentLicenceVersionsJoin is a join, to test we need to wrap the query
    const wrappedQuery = `
      SELECT
        l.licence_ref,
        llv.company_id,
        llv.address_id,
        llv.end_date
      FROM public.licences l
        ${query}
      WHERE l.licence_ref = ANY (?)
    `

    let scenarios

    before(async () => {
      scenarios = {}

      let licence
      let licenceHolder

      // 1) Licence with a current version (start_date <= CURRENT_DATE)
      licence = await EmptyLicence.seed()
      licenceHolder = await CRMContactsSeeder.licenceHolder(licence, 'CurrentVersionHolder')

      scenarios.currentVersion = { licence, licenceHolder }

      // 2) Licence with multiple versions. Only the most recent (highest issue) should be returned.
      licence = await EmptyLicence.seed()
      licenceHolder = await CRMContactsSeeder.licenceHolder(licence, 'MultipleVersionOldHolder')
      const newLicenceHolder = await CRMContactsSeeder.licenceHolder(licence, 'MultipleVersionNewHolder')
      await newLicenceHolder.licenceVersion.$query().patch({ issue: 2 })

      scenarios.multipleVersions = { licence, licenceHolder, newLicenceHolder }

      // 3) Licence with only a future-dated version (start_date > CURRENT_DATE). The licence should NOT appear in results.
      licence = await EmptyLicence.seed()
      const licenceVersionRecord = await LicenceVersionHelper.add({
        licenceId: licence.licence.id,
        startDate: new Date('2099-01-01')
      })

      scenarios.futureVersion = {
        licence,
        licenceVersion: {
          clean: async () => {
            await licenceVersionRecord.$query().delete()
          }
        }
      }
    })

    after(async () => {
      await RecipientScenariosSeeder.clean(scenarios)
    })

    describe('when called', () => {
      it('returns the expected query', () => {
        expect(query).to.startWith(`
  INNER JOIN (`)
      })
    })

    describe('when executed', () => {
      describe('and the licence has a current version (Scenario 1)', () => {
        it('returns the expected recipients', async () => {
          const { licence, licenceHolder } = scenarios.currentVersion
          const licenceRefs = [licence.licence.licenceRef]

          const { rows } = await db.raw(wrappedQuery, [licenceRefs])

          expect(rows).to.equal([
            {
              licence_ref: licence.licence.licenceRef,
              company_id: licenceHolder.company.id,
              address_id: licenceHolder.address.id,
              end_date: null
            }
          ])
        })
      })

      describe('and the licence has multiple versions (Scenario 2)', () => {
        it('returns only the most recent version', async () => {
          const { licence, newLicenceHolder } = scenarios.multipleVersions
          const licenceRefs = [licence.licence.licenceRef]

          const { rows } = await db.raw(wrappedQuery, [licenceRefs])

          expect(rows).to.equal([
            {
              licence_ref: licence.licence.licenceRef,
              company_id: newLicenceHolder.company.id,
              address_id: newLicenceHolder.address.id,
              end_date: null
            }
          ])
        })
      })

      describe('and the licence only has a future-dated version (Scenario 3)', () => {
        it('does not return the licence', async () => {
          const { licence } = scenarios.futureVersion
          const licenceRefs = [licence.licence.licenceRef]

          const { rows } = await db.raw(wrappedQuery, [licenceRefs])

          expect(rows).to.equal([])
        })
      })
    })
  })

  describe('#additionalContactRecipientQuery', () => {
    const query = RecipientQueriesDal.additionalContactRecipientQuery

    let scenarios

    before(async () => {
      scenarios = {}

      // 1) Additional contact present
      scenarios.withAdditionalContact = await RecipientScenariosSeeder.additionalContactRecipient()

      // 2) Additional contact where abstractionAlerts = false. The contact should NOT appear in results.
      scenarios.additionalContactNoAlerts = await RecipientScenariosSeeder.additionalContactRecipient(false)

      // 3) Additional contact where the end date has passed. The expired contact should NOT appear in results.
      scenarios.expiredAdditionalContact = await RecipientScenariosSeeder.additionalContactRecipient(
        true,
        null,
        new Date('2023-01-01')
      )

      // 4) Additional contact where the contact has been soft-deleted. The contact should NOT appear in results.
      scenarios.deletedAdditionalContact = await RecipientScenariosSeeder.additionalContactRecipient(
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
      it('returns the expected query', () => {
        const query = RecipientQueriesDal.additionalContactRecipientQuery

        expect(query).to.startWith(`
  SELECT DISTINCT`)
      })
    })

    describe('when executed', () => {
      describe('and the additional contact is present (Scenario 1)', () => {
        it('returns the expected recipients', async () => {
          const licenceRefs = scenarios.withAdditionalContact.licenceHolderRecipient.licenceRefs

          const { rows } = await db.raw(query, [licenceRefs])

          const expectedResult = _transformToRecipient(scenarios.withAdditionalContact.additionalContactRecipient)

          expect(rows).to.equal([expectedResult])
        })
      })

      describe('and abstractionAlerts is false for the additional contact (Scenario 2)', () => {
        it('does not return the additional contact', async () => {
          const licenceRefs = scenarios.additionalContactNoAlerts.additionalContactRecipient.licenceRefs

          const { rows } = await db.raw(query, [licenceRefs])

          expect(rows).to.equal([])
        })
      })

      describe('and the additional contact end date has passed (Scenario 3)', () => {
        it('does not return the additional contact', async () => {
          const licenceRefs = scenarios.expiredAdditionalContact.licenceHolderRecipient.licenceRefs

          const { rows } = await db.raw(query, [licenceRefs])

          expect(rows).to.equal([])
        })
      })

      describe('and the additional contact has been soft-deleted (Scenario 4)', () => {
        it('does not return the additional contact', async () => {
          const licenceRefs = scenarios.deletedAdditionalContact.licenceHolderRecipient.licenceRefs

          const { rows } = await db.raw(query, [licenceRefs])

          expect(rows).to.equal([])
        })
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
      it('returns the expected query', () => {
        const query = RecipientQueriesDal.licenceHolderRecipientQuery

        expect(query).to.startWith(`
  SELECT`)
      })
    })

    describe('when executed', () => {
      describe('and the licence holder is present (Scenario 1)', () => {
        it('returns the expected recipients', async () => {
          const licenceRefs = scenarios.withLicenceHolder.licenceHolderRecipient.licenceRefs

          const query = RecipientQueriesDal.licenceHolderRecipientQuery

          const { rows } = await db.raw(`${query} WHERE l.licence_ref = ANY (?)`, [licenceRefs])

          const expectedResult = _transformToRecipient(scenarios.withLicenceHolder.licenceHolderRecipient, 2)

          expect(rows).to.equal([expectedResult])
        })
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
      it('returns the expected query', () => {
        const query = RecipientQueriesDal.primaryUserRecipientQuery

        expect(query).to.startWith(`
  SELECT`)
      })
    })

    describe('when executed', () => {
      describe('and the primary user is present (Scenario 1)', () => {
        it('returns the expected recipients', async () => {
          const licenceRefs = scenarios.withPrimaryUser.primaryUserRecipient.licenceRefs

          const query = RecipientQueriesDal.primaryUserRecipientQuery

          const { rows } = await db.raw(`${query} WHERE ldh.licence_ref = ANY (?)`, [licenceRefs])

          const expectedResult = _transformToRecipient(scenarios.withPrimaryUser.primaryUserRecipient, 1)

          expect(rows).to.equal([expectedResult])
        })
      })

      describe('and there is no primary user (Scenario 2)', () => {
        it('does not return the primary user', async () => {
          const licenceRefs = scenarios.noPrimaryUser.licenceHolderRecipient.licenceRefs

          const query = RecipientQueriesDal.primaryUserRecipientQuery

          const { rows } = await db.raw(`${query} WHERE ldh.licence_ref = ANY (?)`, [licenceRefs])

          expect(rows).to.equal([])
        })
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
