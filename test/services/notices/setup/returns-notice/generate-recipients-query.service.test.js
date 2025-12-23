'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientScenariosSeeder = require('../../../../support/seeders/recipient-scenarios.seeder.js')
const ReturnLogHelper = require('../../../../support/helpers/return-log.helper.js')
const { db } = require('../../../../../db/db.js')
const { NoticeType } = require('../../../../../app/lib/static-lookups.lib.js')

// Thing under test
const GenerateRecipientsQueryService = require('../../../../../app/services/notices/setup/returns-notice/generate-recipients-query.service.js')

describe('Notices - Setup - Returns Notice - Generate Recipients Query Service', () => {
  const dueReturnLogsQuery = `
  SELECT
    rl.due_date,
    rl.end_date,
    rl.licence_ref,
    rl.return_id,
    rl.return_reference,
    rl.start_date
  FROM
    public.return_logs rl
  WHERE
    rl.status = 'due'
    AND rl.return_id = ANY (?)
  `
  const processForSendingExpectedQuery = `
  -- PROCESS FOR SENDING NOTICES

  `
  const processForDownloadingExpectedQuery = `
  -- PROCESS FOR DOWNLOADING NOTICES

  `
  const licenceHolderExpectedQuery = `
    SELECT
      contacts AS contact,
      (md5(
        LOWER(
          concat(
            contacts->>'salutation',
            contacts->>'forename',
            contacts->>'initials',
            contacts->>'name',
            contacts->>'addressLine1',
            contacts->>'addressLine2',
            contacts->>'addressLine3',
            contacts->>'addressLine4',
            contacts->>'town',
            contacts->>'county',
            contacts->>'postcode',
            contacts->>'country'
          )
        )
      )) AS contact_hash_id,
      ('licence holder') AS contact_type,
  `
  const primaryUserExpectedQuery = `
    SELECT
      NULL::jsonb AS contact,
      md5(LOWER(le."name")) AS contact_hash_id,
      ('primary user') AS contact_type,
  `
  const returnsAgentExpectedQuery = `
    SELECT
      NULL::jsonb AS contact,
      md5(LOWER(le."name")) AS contact_hash_id,
      ('returns agent') AS contact_type,
  `
  const returnsToExpectedQuery = `
    SELECT
      contacts AS contact,
      (md5(
        LOWER(
          concat(
            contacts->>'salutation',
            contacts->>'forename',
            contacts->>'initials',
            contacts->>'name',
            contacts->>'addressLine1',
            contacts->>'addressLine2',
            contacts->>'addressLine3',
            contacts->>'addressLine4',
            contacts->>'town',
            contacts->>'county',
            contacts->>'postcode',
            contacts->>'country'
          )
        )
      )) AS contact_hash_id,
      ('returns to') AS contact_type,
  `

  let download
  let noticeType
  let scenarios
  let returnLogIds
  let returnLogs

  // NOTE: Unlike the other generate query services in returns-notice, we don't assert the full `query` string here as
  // it is very large. Instead we assert that the dynamic sections are populated with the expected SQL.
  describe('when called', () => {
    describe('and the notice type is "invitations"', () => {
      before(() => {
        noticeType = NoticeType.INVITATIONS
      })

      describe('and the query is NOT for generating a download', () => {
        before(() => {
          download = false
        })

        it('returns the expected query', () => {
          const result = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          // Confirm it will extract primary user recipients
          expect(result).contains(primaryUserExpectedQuery)

          // Confirm it will extract returns agent recipients
          expect(result).contains(returnsAgentExpectedQuery)

          // Confirm it will extract licence holder recipients
          expect(result).contains(licenceHolderExpectedQuery)

          // Confirm it will extract returns to recipients
          expect(result).contains(returnsToExpectedQuery)

          // Confirm it will process the results for sending
          expect(result).contains(processForSendingExpectedQuery)

          // Confirm it will NOT process the results for downloading
          expect(result).not.contains(processForDownloadingExpectedQuery)
        })
      })

      describe('and the query is for generating a download', () => {
        before(() => {
          download = true
        })

        it('returns the expected query', () => {
          const result = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          // Confirm it will extract primary user recipients
          expect(result).contains(primaryUserExpectedQuery)

          // Confirm it will extract returns agent recipients
          expect(result).contains(returnsAgentExpectedQuery)

          // Confirm it will extract licence holder recipients
          expect(result).contains(licenceHolderExpectedQuery)

          // Confirm it will extract returns to recipients
          expect(result).contains(returnsToExpectedQuery)

          // Confirm it will process the results for downloading
          expect(result).contains(processForDownloadingExpectedQuery)

          /// Confirm it will NOT process the results for sending
          expect(result).not.contains(processForSendingExpectedQuery)
        })
      })
    })

    describe('and the notice type is "reminders"', () => {
      before(() => {
        noticeType = NoticeType.REMINDERS
      })

      describe('and the query is NOT for generating a download', () => {
        before(() => {
          download = false
        })

        it('returns the expected query', () => {
          const result = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          // Confirm it will extract primary user recipients
          expect(result).contains(primaryUserExpectedQuery)

          // Confirm it will extract returns agent recipients
          expect(result).contains(returnsAgentExpectedQuery)

          // Confirm it will extract licence holder recipients
          expect(result).contains(licenceHolderExpectedQuery)

          // Confirm it will extract returns to recipients
          expect(result).contains(returnsToExpectedQuery)

          // Confirm it will process the results for sending
          expect(result).contains(processForSendingExpectedQuery)

          // Confirm it will NOT process the results for downloading
          expect(result).not.contains(processForDownloadingExpectedQuery)
        })
      })

      describe('and the query is for generating a download', () => {
        before(() => {
          download = true
        })

        it('returns the expected query', () => {
          const result = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          // Confirm it will extract primary user recipients
          expect(result).contains(primaryUserExpectedQuery)

          // Confirm it will extract returns agent recipients
          expect(result).contains(returnsAgentExpectedQuery)

          // Confirm it will extract licence holder recipients
          expect(result).contains(licenceHolderExpectedQuery)

          // Confirm it will extract returns to recipients
          expect(result).contains(returnsToExpectedQuery)

          // Confirm it will process the results for downloading
          expect(result).contains(processForDownloadingExpectedQuery)

          /// Confirm it will NOT process the results for sending
          expect(result).not.contains(processForSendingExpectedQuery)
        })
      })
    })

    describe('and the notice type is "paper return"', () => {
      before(() => {
        noticeType = NoticeType.PAPER_RETURN
      })

      describe('and the query is NOT for generating a download', () => {
        before(() => {
          download = false
        })

        it('returns the expected query', () => {
          const result = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          // Confirm it will NOT extract primary user recipients
          expect(result).not.contains(primaryUserExpectedQuery)

          // Confirm it will NOT extract returns agent recipients
          expect(result).not.contains(returnsAgentExpectedQuery)

          // Confirm it will extract licence holder recipients
          expect(result).contains(licenceHolderExpectedQuery)

          // Confirm it will extract returns to recipients
          expect(result).contains(returnsToExpectedQuery)

          // Confirm it will process the results for sending
          expect(result).contains(processForSendingExpectedQuery)

          // Confirm it will NOT process the results for downloading
          expect(result).not.contains(processForDownloadingExpectedQuery)
        })
      })

      describe('and the query is for generating a download', () => {
        before(() => {
          download = true
        })

        it('returns the expected query', () => {
          const result = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          // Confirm it will NOT extract primary user recipients
          expect(result).not.contains(primaryUserExpectedQuery)

          // Confirm it will NOT extract returns agent recipients
          expect(result).not.contains(returnsAgentExpectedQuery)

          // Confirm it will extract licence holder recipients
          expect(result).contains(licenceHolderExpectedQuery)

          // Confirm it will extract returns to recipients
          expect(result).contains(returnsToExpectedQuery)

          // Confirm it will process the results for downloading
          expect(result).contains(processForDownloadingExpectedQuery)

          /// Confirm it will NOT process the results for sending
          expect(result).not.contains(processForSendingExpectedQuery)
        })
      })
    })

    describe('and the notice type is "failed invitation"', () => {
      before(() => {
        noticeType = NoticeType.ALTERNATE_INVITATION
        download = false
      })

      it('returns the expected query', () => {
        const result = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

        // Confirm it will NOT extract primary user recipients
        expect(result).not.contains(primaryUserExpectedQuery)

        // Confirm it will NOT extract returns agent recipients
        expect(result).not.contains(returnsAgentExpectedQuery)

        // Confirm it will extract licence holder recipients
        expect(result).contains(licenceHolderExpectedQuery)

        // Confirm it will NOT extract returns to recipients
        expect(result).not.contains(returnsToExpectedQuery)

        // Confirm it will process the results for sending
        expect(result).contains(processForSendingExpectedQuery)

        // Confirm it will NOT process the results for downloading
        expect(result).not.contains(processForDownloadingExpectedQuery)
      })
    })
  })

  describe('when executed', () => {
    before(async () => {
      scenarios = []
      returnLogs = []

      let returnLog
      let scenario

      // SCENARIOS

      // 1) Licence holder only but linked to multiple return logs with same licenceRef - only returns one recipient
      // record with the one licence ref
      await _addReturnLog(returnLogs)
      await _addReturnLog(returnLogs, { licenceRef: returnLogs[0].licenceRef })
      scenario = await RecipientScenariosSeeder.licenceHolderOnly([returnLogs[0], returnLogs[1]])
      scenarios.push(scenario)

      // 2) Licence holder and returns to - all versions of the query will return the licence holder. When the notice
      // type is ALTERNATE_INVITATION, only the licence holder will be returned
      returnLog = await _addReturnLog(returnLogs)
      scenario = await RecipientScenariosSeeder.licenceHolderWithDifferentReturnsTo([returnLog])
      scenarios.push(scenario)

      // 3) Same licence holder, but is linked to multiple licences with due return logs - only one recipient record
      // will be returned with multiple licence refs
      await _addReturnLog(returnLogs)
      await _addReturnLog(returnLogs)
      scenario = await RecipientScenariosSeeder.licenceHolderWithMultipleLicences([
        returnLogs[returnLogs.length - 2],
        returnLogs[returnLogs.length - 1]
      ])
      scenarios.push(scenario)

      // 4) Licence holder and returns to where they have the same contact details - only one recipient record will be
      // returned
      returnLog = await _addReturnLog(returnLogs)
      scenario = await RecipientScenariosSeeder.licenceHolderWithSameReturnsTo([returnLog])
      scenarios.push(scenario)

      // 5) Primary user only. All licences have a licence holder record, but when 'registered' the query will only
      // return the primary user recipient.
      returnLog = await _addReturnLog(returnLogs)
      scenario = await RecipientScenariosSeeder.primaryUserOnly([returnLog])
      scenarios.push(scenario)

      // 6) Primary user and returns agent. Just like with 5), the query will return the primary user details and not
      // the licence holder. But as a returns agent has also been added, it will be returned as well.
      returnLog = await _addReturnLog(returnLogs)
      scenario = await RecipientScenariosSeeder.primaryUserWithDifferentReturnsAgent([returnLog])
      scenarios.push(scenario)

      // 7) Same primary user, but is linked to multiple licences with due return logs - only one recipient record
      // will be returned with multiple licence refs
      await _addReturnLog(returnLogs)
      await _addReturnLog(returnLogs)
      scenario = await RecipientScenariosSeeder.primaryUserWithMultipleLicences([
        returnLogs[returnLogs.length - 2],
        returnLogs[returnLogs.length - 1]
      ])
      scenarios.push(scenario)

      // 8) Primary user and returns agent with the same email address - only one recipient record will be returned
      returnLog = await _addReturnLog(returnLogs)
      scenario = await RecipientScenariosSeeder.primaryUserWithSameReturnsAgent([returnLog])
      scenarios.push(scenario)

      // Prepare the array of returnLogIds for the query parameter
      returnLogIds = returnLogs.map((returnLog) => {
        return returnLog.returnId
      })
    })

    after(async () => {
      await RecipientScenariosSeeder.clean(scenarios)
    })

    describe('and the notice type is "invitations" or "reminders"', () => {
      before(() => {
        noticeType = NoticeType.INVITATIONS
      })

      describe('and the query is NOT for generating a download', () => {
        before(() => {
          download = false
        })

        it('returns the expected recipients', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          // NOTE: Because sorting is done in the code not the query, there is no 'order by' to improve performance.
          // That means we cannot assert the order that the records come out. But we can assert the number of records,
          // and that all we expect are present
          expect(rows.length).to.equal(10)
        })

        it('(Scenario 1) returns the licence holder when only the licence holder is present', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[0])

          expect(rows).to.contain(sendingResults[0])
        })

        it('(Scenario 2) returns both the licence holder and returns to when they are different', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[1])

          expect(rows).to.contain(sendingResults[0])
          expect(rows).to.contain(sendingResults[1])
        })

        it('(Scenario 3) returns the licence holder when only it is present and the same for multiple licences', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[2])

          expect(rows).to.contain(sendingResults[0])
          // We could test rows contains the second licence holder recipient recorded in the scenario, but they are the
          // same so it would also return true and not prove anything
          expect(sendingResults[0]).to.equal(sendingResults[1])
        })

        it('(Scenario 4) returns only the licence holder when it and the returns to are the same', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[3])

          expect(rows).to.contain(sendingResults[0])

          expect(rows).not.to.contain(sendingResults[1])
        })

        it('(Scenario 5) returns only the primary user when the licence is registered and there are no returns agents', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[4])

          expect(rows).to.contain(sendingResults[1])

          // NOTE: When a licence is registered sendingResult[0] will always reference the licence holder
          expect(rows).not.to.contain(sendingResults[0])
        })

        it('(Scenario 6) returns the primary user and returns agent when the licence is registered and they are different', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[5])

          expect(rows).to.contain(sendingResults[1])
          expect(rows).to.contain(sendingResults[2])

          expect(rows).not.to.contain(sendingResults[0])
        })

        it('(Scenario 7) returns only the primary user when it is the same for multiple registered licences', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[6])

          expect(rows).to.contain(sendingResults[2])

          // sendingResults[2] and [3] reference the two primary users, with the same details. This means the
          // sendingResults for each are the same, which we prove here.
          expect(sendingResults[2]).to.equal(sendingResults[3])

          // NOTE: Because we created two return logs with different licence refs, we have to create two licence
          // document headers with the same 'licence holder' to recreate linking the same primary user across multiple
          // licences. This means sendingResults[0] references the first licence holder, and [1] the second.
          expect(rows).not.to.contain(sendingResults[0])
          expect(rows).not.to.contain(sendingResults[1])
        })

        it('(Scenario 8) returns only the primary user when it and the returns agent are the same for a registered licence', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[7])

          expect(rows).to.contain(sendingResults[1])

          expect(rows).not.to.contain(sendingResults[0])
          expect(rows).not.to.contain(sendingResults[2])
        })
      })

      describe('and the query is for generating a download', () => {
        before(() => {
          download = true
        })

        it('returns the expected recipients', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          // NOTE: Because sorting is done in the code not the query, there is no 'order by' to improve performance.
          // That means we cannot assert the order that the records come out. But we can assert the number of records,
          // and that all we expect are present
          expect(rows.length).to.equal(13)
        })

        it('(Scenario 1) returns the licence holder when only the licence holder is present', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const downloadingResults = RecipientScenariosSeeder.transformToDownloadingResults(scenarios[0])

          // We created two return logs for the same licence  and licence holder. So we expect two results: one for each
          // return log
          expect(rows).to.contain(downloadingResults[0])
          expect(rows).to.contain(downloadingResults[1])
        })

        it('(Scenario 2) returns both the licence holder and returns to when they are different', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const downloadingResults = RecipientScenariosSeeder.transformToDownloadingResults(scenarios[1])

          expect(rows).to.contain(downloadingResults[0])
          expect(rows).to.contain(downloadingResults[1])
        })

        it('(Scenario 3) returns the licence holder when only it is present and the same for multiple licences', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const downloadingResults = RecipientScenariosSeeder.transformToDownloadingResults(scenarios[2])

          // Unlike sending, because we want the return log information it means though the recipient details are the
          // same, the return logs are not. So, we get a row per return log for the licence holder.
          expect(rows).to.contain(downloadingResults[0])
          expect(rows).to.contain(downloadingResults[1])

          // downloadingResults[0] & [1], and [2] & [3] reference the two licence holders, with the same details. This
          // means the downloadingResults for each are the same, which we prove here.
          expect(downloadingResults[0]).to.equal(downloadingResults[2])
          expect(downloadingResults[1]).to.equal(downloadingResults[3])
        })

        it('(Scenario 4) returns only the licence holder when it and the returns to are the same', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const downloadingResults = RecipientScenariosSeeder.transformToDownloadingResults(scenarios[3])

          expect(rows).to.contain(downloadingResults[0])

          expect(rows).not.to.contain(downloadingResults[1])
        })

        it('(Scenario 5) returns only the primary user when the licence is registered and there are no returns agents', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const downloadingResults = RecipientScenariosSeeder.transformToDownloadingResults(scenarios[4])

          expect(rows).to.contain(downloadingResults[1])

          // NOTE: When a licence is registered downloadingResults[0] will always reference the licence holder
          expect(rows).not.to.contain(downloadingResults[0])
        })

        it('(Scenario 6) returns the primary user and returns agent when the licence is registered and they are different', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const downloadingResults = RecipientScenariosSeeder.transformToDownloadingResults(scenarios[5])

          expect(rows).to.contain(downloadingResults[1])
          expect(rows).to.contain(downloadingResults[2])

          expect(rows).not.to.contain(downloadingResults[0])
        })

        it('(Scenario 7) returns only the primary user when it is the same for multiple registered licences', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const downloadingResults = RecipientScenariosSeeder.transformToDownloadingResults(scenarios[6])

          // Unlike sending, because we want the return log information it means though the recipient details are the
          // same, the return logs are not. So, we get a row per return log for the primary user.
          expect(rows).to.contain(downloadingResults[4])
          expect(rows).to.contain(downloadingResults[5])

          // downloadingResults[4] & [5], and [6] & [7] reference the two primary users, with the same details. This
          // means the downloadingResults for each are the same, which we prove here.
          expect(downloadingResults[4]).to.equal(downloadingResults[6])
          expect(downloadingResults[5]).to.equal(downloadingResults[7])

          // NOTE: Because we created two return logs with different licence refs, we have to create two licence
          // document headers with the same 'licence holder' to recreate linking the same primary user across multiple
          // licences. This means downloadingResults[0] and [1] reference the first licence holder, and [2] and [3] the
          // second.
          expect(rows).not.to.contain(downloadingResults[0])
          expect(rows).not.to.contain(downloadingResults[1])
          expect(rows).not.to.contain(downloadingResults[2])
          expect(rows).not.to.contain(downloadingResults[3])
        })

        it('(Scenario 8) returns only the primary user when it and the returns agent are the same for a registered licence', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const downloadingResults = RecipientScenariosSeeder.transformToDownloadingResults(scenarios[7])

          expect(rows).to.contain(downloadingResults[1])

          expect(rows).not.to.contain(downloadingResults[0])
          expect(rows).not.to.contain(downloadingResults[2])
        })
      })
    })

    describe('and the notice type is "paper return"', () => {
      before(() => {
        noticeType = NoticeType.PAPER_RETURN
      })

      describe('and the query is NOT for generating a download', () => {
        before(() => {
          download = false
        })

        it('returns the expected recipients', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          // NOTE: Because sorting is done in the code not the query, there is no 'order by' to improve performance.
          // That means we cannot assert the order that the records come out. But we can assert the number of records,
          // and that all we expect are present
          expect(rows.length).to.equal(9)
        })

        it('(Scenario 1) returns the licence holder when only the licence holder is present', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[0])

          expect(rows).to.contain(sendingResults[0])
        })

        it('(Scenario 2) returns both the licence holder and returns to when they are different', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[1])

          expect(rows).to.contain(sendingResults[0])
          expect(rows).to.contain(sendingResults[1])
        })

        it('(Scenario 3) returns the licence holder when only it is present and the same for multiple licences', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[2])

          expect(rows).to.contain(sendingResults[0])
          // We could test rows contains the second licence holder recipient recorded in the scenario, but they are the
          // same so it would also return true and not prove anything
          expect(sendingResults[0]).to.equal(sendingResults[1])
        })

        it('(Scenario 4) returns only the licence holder when it and the returns to are the same', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[3])

          expect(rows).to.contain(sendingResults[0])

          expect(rows).not.to.contain(sendingResults[1])
        })

        it('(Scenario 5) returns the licence holder, not the primary user when the licence is registered and there are no returns agents', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[4])

          expect(rows).to.contain(sendingResults[0])

          expect(rows).not.to.contain(sendingResults[1])
        })

        it('(Scenario 6) returns the licence holder, not the primary user or returns agent when the licence is registered and has a different returns agent', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[5])

          expect(rows).to.contain(sendingResults[0])

          expect(rows).not.to.contain(sendingResults[1])
          expect(rows).not.to.contain(sendingResults[2])
        })

        it('(Scenario 7) returns the licence holder, not the primary user when it is the same for multiple registered licences', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[6])

          // NOTE: Because we created two return logs with different licence refs, we have to create two licence
          // document headers with the same 'licence holder' to recreate linking the same primary user across multiple
          // licences. This means sendingResults[0] references the first licence holder, and [1] the second. For paper
          // returns it's one of these we expect to see in the results. Either will do as they are both the same.
          expect(rows).to.contain(sendingResults[0])
          expect(sendingResults[0]).to.equal(sendingResults[1])

          // sendingResults[2] and [3] reference the two primary users, with the same details. We don't send paper
          // returns via email so they should not be included
          expect(rows).not.to.contain(sendingResults[2])
          expect(rows).not.to.contain(sendingResults[3])
        })

        it('(Scenario 8) returns the licence holder, not the primary user when it and the returns agent are the same for a registered licence', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[7])

          expect(rows).to.contain(sendingResults[0])

          expect(rows).not.to.contain(sendingResults[1])
          expect(rows).not.to.contain(sendingResults[2])
        })
      })

      describe('and the query is for generating a download', () => {
        before(() => {
          download = true
        })

        it('returns the expected recipients', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          // NOTE: Because sorting is done in the code not the query, there is no 'order by' to improve performance.
          // That means we cannot assert the order that the records come out. But we can assert the number of records,
          // and that all we expect are present
          expect(rows.length).to.equal(12)
        })

        it('(Scenario 1) returns the licence holder when only the licence holder is present', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const downloadingResults = RecipientScenariosSeeder.transformToDownloadingResults(scenarios[0])

          // We created two return logs for the same licence  and licence holder. So we expect two results: one for each
          // return log
          expect(rows).to.contain(downloadingResults[0])
          expect(rows).to.contain(downloadingResults[1])
        })

        it('(Scenario 2) returns both the licence holder and returns to when they are different', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const downloadingResults = RecipientScenariosSeeder.transformToDownloadingResults(scenarios[1])

          expect(rows).to.contain(downloadingResults[0])
          expect(rows).to.contain(downloadingResults[1])
        })

        it('(Scenario 3) returns the licence holder when only it is present and the same for multiple licences', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const downloadingResults = RecipientScenariosSeeder.transformToDownloadingResults(scenarios[2])

          // Unlike sending, because we want the return log information it means though the recipient details are the
          // same, the return logs are not. So, we get a row per return log for the licence holder.
          expect(rows).to.contain(downloadingResults[0])
          expect(rows).to.contain(downloadingResults[1])

          // downloadingResults[0] & [1], and [2] & [3] reference the two licence holders, with the same details. This
          // means the downloadingResults for each are the same, which we prove here.
          expect(downloadingResults[0]).to.equal(downloadingResults[2])
          expect(downloadingResults[1]).to.equal(downloadingResults[3])
        })

        it('(Scenario 4) returns only the licence holder when it and the returns to are the same', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const downloadingResults = RecipientScenariosSeeder.transformToDownloadingResults(scenarios[3])

          expect(rows).to.contain(downloadingResults[0])

          expect(rows).not.to.contain(downloadingResults[1])
        })

        it('(Scenario 5) returns the licence holder, not the primary user when the licence is registered and there are no returns agents', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const downloadingResults = RecipientScenariosSeeder.transformToDownloadingResults(scenarios[4])

          expect(rows).to.contain(downloadingResults[0])

          expect(rows).not.to.contain(downloadingResults[1])
        })

        it('(Scenario 6) returns the licence holder, not the primary user or returns agent when the licence is registered and has a different returns agent', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const downloadingResults = RecipientScenariosSeeder.transformToDownloadingResults(scenarios[5])

          expect(rows).to.contain(downloadingResults[0])

          expect(rows).not.to.contain(downloadingResults[1])
          expect(rows).not.to.contain(downloadingResults[2])
        })

        it('(Scenario 7) returns the licence holder, not the primary user when it is the same for multiple registered licences', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const downloadingResults = RecipientScenariosSeeder.transformToDownloadingResults(scenarios[6])

          // Unlike sending, because we want the return log information it means though the recipient details are the
          // same, the return logs are not. So, we get a row per return log for the licence holder.
          expect(rows).to.contain(downloadingResults[0])
          expect(rows).to.contain(downloadingResults[1])

          // Because we created two return logs with different licence refs, we have to create two licence
          // document headers with the same 'licence holder' to recreate linking the same primary user across multiple
          // licences. This means downloadingResults[0] and [1] reference the first licence holder, and [2] and [3] the
          // second.
          // However, as the licence holder details are the same, the downloadingResults will be the same, though the
          // query will just return one set
          expect(downloadingResults[0]).to.equal(downloadingResults[2])
          expect(downloadingResults[1]).to.equal(downloadingResults[3])

          // downloadingResults[4] & [5], and [6] & [7] reference the two primary users, with the same details. We don't
          // send paper returns via email so they should not be included
          expect(rows).not.to.contain(downloadingResults[4])
          expect(rows).not.to.contain(downloadingResults[5])
          expect(rows).not.to.contain(downloadingResults[6])
          expect(rows).not.to.contain(downloadingResults[7])
        })

        it('(Scenario 8) returns the licence holder, not the primary user when it and the returns agent are the same for a registered licence', async () => {
          const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

          const { rows } = await db.raw(query, [returnLogIds])

          const downloadingResults = RecipientScenariosSeeder.transformToDownloadingResults(scenarios[7])

          expect(rows).to.contain(downloadingResults[0])

          expect(rows).not.to.contain(downloadingResults[1])
          expect(rows).not.to.contain(downloadingResults[2])
        })
      })
    })

    describe('and the notice type is "failed invitation"', () => {
      before(() => {
        noticeType = NoticeType.ALTERNATE_INVITATION
        download = false
      })

      it('returns the expected recipients', async () => {
        const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

        const { rows } = await db.raw(query, [returnLogIds])

        // NOTE: Because sorting is done in the code not the query, there is no 'order by' to improve performance.
        // That means we cannot assert the order that the records come out. But we can assert the number of records,
        // and that all we expect are present
        expect(rows.length).to.equal(8)
      })

      it('(Scenario 1) returns the licence holder when only the licence holder is present', async () => {
        const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

        const { rows } = await db.raw(query, [returnLogIds])

        const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[0])

        expect(rows).to.contain(sendingResults[0])
      })

      it('(Scenario 2) returns only the licence holder, even if the returns to is different', async () => {
        const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

        const { rows } = await db.raw(query, [returnLogIds])

        const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[1])

        expect(rows).to.contain(sendingResults[0])

        expect(rows).not.to.contain(sendingResults[1])
      })

      it('(Scenario 3) returns the licence holder when only it is present and the same for multiple licences', async () => {
        const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

        const { rows } = await db.raw(query, [returnLogIds])

        const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[2])

        expect(rows).to.contain(sendingResults[0])
        // We could test rows contains the second licence holder recipient recorded in the scenario, but they are the
        // same so it would also return true and not prove anything
        expect(sendingResults[0]).to.equal(sendingResults[1])
      })

      it('(Scenario 4) returns only the licence holder when it and the returns to are the same', async () => {
        const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

        const { rows } = await db.raw(query, [returnLogIds])

        const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[3])

        expect(rows).to.contain(sendingResults[0])

        expect(rows).not.to.contain(sendingResults[1])
      })

      it('(Scenario 5) returns the licence holder, not the primary user when the licence is registered and there are no returns agents', async () => {
        const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

        const { rows } = await db.raw(query, [returnLogIds])

        const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[4])

        expect(rows).to.contain(sendingResults[0])

        expect(rows).not.to.contain(sendingResults[1])
      })

      it('(Scenario 6) returns the licence holder, not the primary user or returns agent when the licence is registered and has a different returns agent', async () => {
        const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

        const { rows } = await db.raw(query, [returnLogIds])

        const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[5])

        expect(rows).to.contain(sendingResults[0])

        expect(rows).not.to.contain(sendingResults[1])
        expect(rows).not.to.contain(sendingResults[2])
      })

      it('(Scenario 7) returns the licence holder, not the primary user when it is the same for multiple registered licences', async () => {
        const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

        const { rows } = await db.raw(query, [returnLogIds])

        const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[6])

        // NOTE: Because we created two return logs with different licence refs, we have to create two licence
        // document headers with the same 'licence holder' to recreate linking the same primary user across multiple
        // licences. This means sendingResults[0] references the first licence holder, and [1] the second. For paper
        // returns it's one of these we expect to see in the results. Either will do as they are both the same.
        expect(rows).to.contain(sendingResults[0])
        expect(sendingResults[0]).to.equal(sendingResults[1])

        // sendingResults[2] and [3] reference the two primary users, with the same details. We don't send paper
        // returns via email so they should not be included
        expect(rows).not.to.contain(sendingResults[2])
        expect(rows).not.to.contain(sendingResults[3])
      })

      it('(Scenario 8) returns the licence holder, not the primary user when it and the returns agent are the same for a registered licence', async () => {
        const query = GenerateRecipientsQueryService.go(noticeType, dueReturnLogsQuery, download)

        const { rows } = await db.raw(query, [returnLogIds])

        const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[7])

        expect(rows).to.contain(sendingResults[0])

        expect(rows).not.to.contain(sendingResults[1])
        expect(rows).not.to.contain(sendingResults[2])
      })
    })
  })
})

async function _addReturnLog(returnLogs, overrides = {}) {
  const returnLog = await ReturnLogHelper.add(overrides)

  returnLogs.push(returnLog)

  return returnLog
}
