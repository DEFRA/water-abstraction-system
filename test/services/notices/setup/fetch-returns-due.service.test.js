'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceDocumentHeaderSeeder = require('../../../support/seeders/licence-document-header.seeder.js')

// Thing under test
const FetchReturnsDueService = require('../../../../app/services/notices/setup/fetch-returns-due.service.js')

describe('Notices - Setup - Fetch returns due service', () => {
  let licenceDocumentHeader
  let licenceRefs
  let noticeType
  let returnsPeriod

  before(async () => {
    licenceDocumentHeader = await LicenceDocumentHeaderSeeder.seed('2025-04-')
  })

  describe('when there are licences', () => {
    beforeEach(() => {
      const returnLog = licenceDocumentHeader.licenceHolder.returnLog

      licenceRefs = [licenceDocumentHeader.licenceHolder.licenceRef]

      returnsPeriod = {
        dueDate: returnLog.dueDate,
        startDate: returnLog.startDate,
        endDate: returnLog.endDate,
        summer: returnLog.metadata.isSummer
      }

      noticeType = 'invitations'
    })

    it('correctly returns the matching licences', async () => {
      const result = await FetchReturnsDueService.go(licenceRefs, returnsPeriod, noticeType)

      expect(result).to.equal([
        {
          licenceRef: licenceDocumentHeader.licenceHolder.licenceRef
        }
      ])
    })
  })

  describe('when the "noticeType" is "reminders"', () => {
    beforeEach(() => {
      const returnLog = licenceDocumentHeader.primaryUserDueDate.returnLog

      licenceRefs = [licenceDocumentHeader.primaryUserDueDate.licenceRef]

      returnsPeriod = {
        dueDate: returnLog.dueDate,
        startDate: returnLog.startDate,
        endDate: returnLog.endDate,
        summer: returnLog.metadata.isSummer
      }

      noticeType = 'reminders'
    })

    describe('and there are licences', () => {
      it('correctly returns the matching licences', async () => {
        const result = await FetchReturnsDueService.go(licenceRefs, returnsPeriod, noticeType)

        expect(result).to.equal([
          {
            licenceRef: licenceDocumentHeader.primaryUserDueDate.licenceRef
          }
        ])
      })
    })
  })
})
