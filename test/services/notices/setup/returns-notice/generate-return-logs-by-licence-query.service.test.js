'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogHelper = require('../../../../support/helpers/return-log.helper.js')
const { db } = require('../../../../../db/db.js')
const { generateLicenceRef } = require('../../../../support/helpers/licence.helper.js')
const { tomorrow } = require('../../../../support/general.js')
const { NoticeType } = require('../../../../../app/lib/static-lookups.lib.js')

// Thing under test
const GenerateReturnLogsByLicenceQueryService = require('../../../../../app/services/notices/setup/returns-notice/generate-return-logs-by-licence-query.service.js')

describe.only('Notices - Setup - Returns Notice - Generate Return Logs By Licence Query Service', () => {
  let licenceRef
  let noticeType
  let returnLogs

  before(async () => {
    let returnLog

    licenceRef = generateLicenceRef()
    returnLogs = []

    // First return log has a status of 'due' - should be included in results when notice type is NOT reminders
    returnLog = await ReturnLogHelper.add({ licenceRef, status: 'due' })
    returnLogs.push(returnLog)

    // NOTE: This version of the generate return log query is used when sending an ad-hoc notice. It is unlikely that a
    // return log that was returned when checking the recipients, is then completed or voided before the notice is sent.
    // But we include the `rl.status = 'due'` clause just in case, which is why we include this test case.
    // Second return log has a status of 'completed' - should NOT be included in ANY results
    returnLog = await ReturnLogHelper.add({ licenceRef, status: 'completed' })
    returnLogs.push(returnLog)

    // Third return log's end date is greater than todays date - should NOT be included in results when notice type is
    // NOT reminders
    returnLog = await ReturnLogHelper.add({ endDate: tomorrow(), licenceRef, status: 'due' })
    returnLogs.push(returnLog)

    // Fourth return log is for a different licence ref - should NOT be included in results ANY results
    returnLog = await ReturnLogHelper.add({ endDate: tomorrow(), status: 'due' })
    returnLogs.push(returnLog)

    // Fifth return log has a status of 'due' and a due date - should be included in ALL results
    returnLog = await ReturnLogHelper.add({ dueDate: new Date('2023-04-28'), licenceRef, status: 'due' })
    returnLogs.push(returnLog)
  })

  after(async () => {
    for (const returnLog of returnLogs) {
      await returnLog.$query().delete()
    }
  })

  describe('when called', () => {
    describe('and the "noticeType" is returns reminders', () => {
      beforeEach(() => {
        noticeType = NoticeType.REMINDERS
      })

      it('returns the expected query and bindings', () => {
        const result = GenerateReturnLogsByLicenceQueryService.go(licenceRef, noticeType)

        const todayAsString = new Date().toISOString().split('T')[0]

        // NOTE: The first param is the current time as a string so testing it starts with todays date is sufficient
        expect(result.bindings[0]).to.startWith(todayAsString)
        expect(result.bindings[1]).to.equal(licenceRef)

        expect(result.query).to.equal(`
  SELECT
    rl.due_date,
    rl.end_date,
    rl.licence_ref,
    rl.id AS return_log_id,
    rl.return_reference,
    rl.start_date
  FROM
    public.return_logs rl
  WHERE
    rl.status = 'due'
    AND rl.end_date < ?
    AND rl.licence_ref = ?
    AND rl.due_date IS NOT NULL`)
      })
    })

    describe('and the "noticeType" is NOT returns reminders', () => {
      beforeEach(() => {
        noticeType = NoticeType.INVITATIONS
      })

      it('returns the expected query and bindings', () => {
        const result = GenerateReturnLogsByLicenceQueryService.go(licenceRef, noticeType)

        const todayAsString = new Date().toISOString().split('T')[0]

        // NOTE: The first param is the current time as a string so testing it starts with todays date is sufficient
        expect(result.bindings[0]).to.startWith(todayAsString)
        expect(result.bindings[1]).to.equal(licenceRef)

        expect(result.query).to.equal(`
  SELECT
    rl.due_date,
    rl.end_date,
    rl.licence_ref,
    rl.id AS return_log_id,
    rl.return_reference,
    rl.start_date
  FROM
    public.return_logs rl
  WHERE
    rl.status = 'due'
    AND rl.end_date < ?
    AND rl.licence_ref = ?
`)
      })
    })
  })

  describe('when executed', () => {
    describe('and the "noticeType" is returns reminders', () => {
      beforeEach(() => {
        noticeType = NoticeType.REMINDERS
      })

      it('returns the expected return logs', async () => {
        const { bindings, query } = GenerateReturnLogsByLicenceQueryService.go(licenceRef, noticeType)
        const { rows } = await db.raw(query, bindings)

        expect(rows).to.equal([
          {
            due_date: returnLogs[4].dueDate,
            end_date: returnLogs[4].endDate,
            licence_ref: returnLogs[4].licenceRef,
            return_log_id: returnLogs[4].id,
            return_reference: returnLogs[4].returnReference,
            start_date: returnLogs[4].startDate
          }
        ])
      })
    })

    describe('and the "noticeType" is NOT returns reminders', () => {
      beforeEach(() => {
        noticeType = NoticeType.INVITATIONS
      })

      it('returns the expected return logs', async () => {
        const { bindings, query } = GenerateReturnLogsByLicenceQueryService.go(licenceRef, noticeType)
        const { rows } = await db.raw(query, bindings)

        expect(rows).to.equal([
          {
            due_date: returnLogs[0].dueDate,
            end_date: returnLogs[0].endDate,
            licence_ref: returnLogs[0].licenceRef,
            return_log_id: returnLogs[0].id,
            return_reference: returnLogs[0].returnReference,
            start_date: returnLogs[0].startDate
          },
          {
            due_date: returnLogs[4].dueDate,
            end_date: returnLogs[4].endDate,
            licence_ref: returnLogs[4].licenceRef,
            return_log_id: returnLogs[4].id,
            return_reference: returnLogs[4].returnReference,
            start_date: returnLogs[4].startDate
          }
        ])
      })
    })
  })
})
