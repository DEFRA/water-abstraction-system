'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientScenariosSeeder = require('../../../support/seeders/recipient-scenarios.seeder.js')
const { db } = require('../../../../db/db.js')

// Thing under test
const GenerateRenewalRecipientsQueryService = require('../../../../app/services/jobs/renewal-invitations/generate-renewal-recipients-query.service.js')

describe('Jobs - Renewal Invitations - Fetch Renewal recipients service', () => {
  const expiredLicencesQuery = `
    SELECT l.licence_ref
    FROM public.licences l
    WHERE l.expired_date = ?
  `

  let clock
  let expiredDate
  let scenarios
  let todayDate

  before(async () => {
    todayDate = new Date('2026-04-15')

    clock = Sinon.useFakeTimers(todayDate)

    scenarios = []

    let scenario

    // 1) Licence holder only
    expiredDate = new Date('2027-02-09')
    scenario = await RecipientScenariosSeeder.licenceHolderOnly([], expiredDate)
    scenarios.push(scenario)

    // 2) Same licence holder, but is linked to multiple licences with due return logs - only one recipient record
    // will be returned with multiple licence refs
    expiredDate = new Date('2027-02-10')
    scenario = await RecipientScenariosSeeder.licenceHolderWithMultipleLicences([], expiredDate)
    scenarios.push(scenario)

    // 3) Primary user only. All licences have a licence holder record, but when 'registered' the query will only
    // return the primary user recipient.
    expiredDate = new Date('2027-02-11')
    scenario = await RecipientScenariosSeeder.primaryUserOnly([], expiredDate)
    scenarios.push(scenario)

    // 7) Same primary user, but is linked to multiple licences - only one recipient record will be returned with
    // multiple licence refs
    expiredDate = new Date('2027-02-12')
    scenario = await RecipientScenariosSeeder.primaryUserWithMultipleLicences([], expiredDate)
    scenarios.push(scenario)
  })

  after(async () => {
    await RecipientScenariosSeeder.clean(scenarios)

    clock.restore()
    Sinon.restore()
  })

  describe('when there are renewal invitations to send', () => {
    it('(Scenario 1) returns the licence holder when only the licence holder is present', async () => {
      const query = GenerateRenewalRecipientsQueryService.go(expiredLicencesQuery)

      const { rows } = await db.raw(query, [new Date('2027-02-09')])

      const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[0])

      _formatScenario(sendingResults[0])

      expect(rows).to.equal(sendingResults)
    })

    it('(Scenario 2) returns the licence holder when only it is present and the same for multiple licences', async () => {
      const query = GenerateRenewalRecipientsQueryService.go(expiredLicencesQuery)

      const { rows } = await db.raw(query, [new Date('2027-02-10')])

      const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[1])

      _formatScenario(sendingResults[0])
      _formatScenario(sendingResults[1])

      expect(rows).to.contain(sendingResults[0])
      // We could test rows contains the second licence holder recipient recorded in the scenario, but they are the
      // same so it would also return true and not prove anything
      expect(sendingResults[0]).to.equal(sendingResults[1])
    })

    it('(Scenario 3) returns only the primary user when the licence', async () => {
      const query = GenerateRenewalRecipientsQueryService.go(expiredLicencesQuery)

      const { rows } = await db.raw(query, [new Date('2027-02-11')])

      const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[2])

      _formatScenario(sendingResults[1])

      expect(rows).to.contain(sendingResults[1])

      // NOTE: When a licence is registered sendingResult[0] will always reference the licence holder
      expect(rows).not.to.contain(sendingResults[0])
    })

    it('(Scenario 4) returns only the primary user when it is the same for multiple registered licences', async () => {
      const query = GenerateRenewalRecipientsQueryService.go(expiredLicencesQuery)

      const { rows } = await db.raw(query, [new Date('2027-02-12')])

      const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[3])

      _formatScenario(sendingResults[2])

      expect(rows).to.contain(sendingResults[2])

      // NOTE: When a licence is registered, sendingResult[0] will always reference the licence holder
      expect(rows).not.to.contain(sendingResults[0])
    })
  })
})

function _formatScenario(sendingResults) {
  delete sendingResults.due_date_status
  delete sendingResults.return_log_ids
  delete sendingResults.latest_due_date
}
