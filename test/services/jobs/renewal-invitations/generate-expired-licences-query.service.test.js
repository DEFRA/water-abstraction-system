'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const { db } = require('../../../../db/db.js')

// Thing under test
const GenerateExpiredLicencesQueryService = require('../../../../app/services/jobs/renewal-invitations/generate-expired-licences-query.service.js')

describe('Jobs - Renewal Invitations - Generate expires licences service', () => {
  let clock
  let expiredDate
  let testLicence
  let todayDate

  before(() => {
    todayDate = new Date('2026-04-15')

    clock = Sinon.useFakeTimers(todayDate)
  })

  after(() => {
    clock.restore()
    Sinon.restore()
  })

  describe('when there are renewal invitations to send', () => {
    describe('and there is a licence with the expired date', () => {
      beforeEach(async () => {
        expiredDate = new Date('2027-03-09')

        testLicence = await LicenceHelper.add({
          expiredDate
        })
      })

      it('returns licences with the expired date', async () => {
        const query = GenerateExpiredLicencesQueryService.go()

        const { rows } = await db.raw(query, [expiredDate])

        expect(rows).to.equal([
          {
            licence_ref: testLicence.licenceRef
          }
        ])
      })
    })

    describe('and the revoked and lapsed dates are before the expired date', () => {
      beforeEach(async () => {
        expiredDate = new Date('2027-03-10')

        testLicence = await LicenceHelper.add({
          revokedDate: new Date('2026-02-09'),
          lapsedDate: new Date('2026-02-09'),
          expiredDate
        })
      })

      it('returns licences with the expired date', async () => {
        const query = GenerateExpiredLicencesQueryService.go()

        const { rows } = await db.raw(query, [expiredDate])

        expect(rows).to.equal([
          {
            licence_ref: testLicence.licenceRef
          }
        ])
      })
    })
  })
})
