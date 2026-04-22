'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const { db } = require('../../../../db/db.js')

// Thing under test
const GenerateExpiredLicencesQueryService = require('../../../../app/services/jobs/renewal-invitations/generate-expired-licences-query.service.js')

describe('Jobs - Renewal Invitations - Generate expired licences service', () => {
  let additionalTestLicence
  let clock
  let expiredDate
  let testLicence
  let todayDate

  before(async () => {
    additionalTestLicence = await LicenceHelper.add()

    todayDate = new Date('2026-04-15')

    clock = Sinon.useFakeTimers(todayDate)
  })

  after(async () => {
    await additionalTestLicence.$query().delete()

    clock.restore()
    Sinon.restore()
  })

  afterEach(async () => {
    await testLicence.$query().delete()
  })

  describe('when there are renewal invitations to send', () => {
    describe('and there is a licence with the expired date', () => {
      beforeEach(async () => {
        expiredDate = new Date('2027-03-09')

        testLicence = await LicenceHelper.add({
          revokedDate: new Date('2027-03-11'),
          lapsedDate: new Date('2027-03-11'),
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

      describe('and the revoked and lapsed dates are after the expired date', () => {
        beforeEach(async () => {
          expiredDate = new Date('2027-03-10')

          testLicence = await LicenceHelper.add({
            revokedDate: new Date('2027-03-11'),
            lapsedDate: new Date('2027-03-11'),
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
            revokedDate: new Date('2027-03-01'),
            lapsedDate: new Date('2027-03-01'),
            expiredDate
          })
        })

        it('does not return licences', async () => {
          const query = GenerateExpiredLicencesQueryService.go()

          const { rows } = await db.raw(query, [expiredDate])

          expect(rows).to.equal([])
        })
      })

      describe('and the revoked and lapsed dates are null', () => {
        beforeEach(async () => {
          expiredDate = new Date('2027-03-10')

          testLicence = await LicenceHelper.add({
            revokedDate: null,
            lapsedDate: null,
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

      describe('and the revoked date is after the expired date', () => {
        beforeEach(async () => {
          expiredDate = new Date('2027-03-11')

          testLicence = await LicenceHelper.add({
            revokedDate: new Date('2027-03-12'),
            lapsedDate: null,
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

      describe('and the lapsed date is after the expired date', () => {
        beforeEach(async () => {
          expiredDate = new Date('2027-03-11')

          testLicence = await LicenceHelper.add({
            revokedDate: null,
            lapsedDate: new Date('2027-03-12'),
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
})
