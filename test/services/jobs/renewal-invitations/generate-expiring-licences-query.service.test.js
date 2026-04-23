'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const { db } = require('../../../../db/db.js')
const { tomorrow, yesterday } = require('../../../support/general.js')

// Thing under test
const GenerateExpiringLicencesQueryService = require('../../../../app/services/jobs/renewal-invitations/generate-expiring-licences-query.service.js')

describe('Jobs - Renewal Invitations - Generate Expiring Licences Query Service', () => {
  let afterExpiredDate
  let expiredDate
  let licence

  before(async () => {
    expiredDate = new Date('2027-03-09')
    afterExpiredDate = new Date('2027-03-10')
  })

  afterEach(async () => {
    if (licence) {
      await licence.$query().delete()
    }
  })

  describe('when called', () => {
    it('returns the expected query', () => {
      const result = GenerateExpiringLicencesQueryService.go(expiredDate)

      expect(result).to.equal({
        bindings: [expiredDate],
        query: `
  SELECT
    l.licence_ref
  FROM
    public.licences l
  WHERE
    l.expired_date = ?
    AND (
      l.lapsed_date IS NULL OR l.lapsed_date > l.expired_date
    )
    AND (
      l.revoked_date IS NULL OR l.revoked_date > l.expired_date
    )
  `
      })
    })
  })

  describe('when executed', () => {
    describe('and there are no valid expiring licences', () => {
      describe('because they are not ending', () => {
        beforeEach(async () => {
          licence = await LicenceHelper.add()
        })

        it('returns no results', async () => {
          const { bindings, query } = GenerateExpiringLicencesQueryService.go(expiredDate)
          const { rows } = await db.raw(query, bindings)

          expect(rows).to.equal([])
        })
      })

      describe('because they are already expired', () => {
        beforeEach(async () => {
          licence = await LicenceHelper.add({ expiredDate: yesterday() })
        })

        it('returns no results', async () => {
          const { bindings, query } = GenerateExpiringLicencesQueryService.go(expiredDate)
          const { rows } = await db.raw(query, bindings)

          expect(rows).to.equal([])
        })
      })

      describe('because they expire before the expiry date', () => {
        beforeEach(async () => {
          licence = await LicenceHelper.add({ expiredDate: tomorrow() })
        })

        it('returns no results', async () => {
          const { bindings, query } = GenerateExpiringLicencesQueryService.go(expiredDate)
          const { rows } = await db.raw(query, bindings)

          expect(rows).to.equal([])
        })
      })

      describe('because even though they match the expired date', () => {
        describe('they lapse before it', () => {
          beforeEach(async () => {
            licence = await LicenceHelper.add({ expiredDate, lapsedDate: tomorrow() })
          })

          it('returns no results', async () => {
            const { bindings, query } = GenerateExpiringLicencesQueryService.go(expiredDate)
            const { rows } = await db.raw(query, bindings)

            expect(rows).to.equal([])
          })
        })

        describe('they are revoked before it', () => {
          beforeEach(async () => {
            licence = await LicenceHelper.add({ expiredDate, revokedDate: tomorrow() })
          })

          it('returns no results', async () => {
            const { bindings, query } = GenerateExpiringLicencesQueryService.go(expiredDate)
            const { rows } = await db.raw(query, bindings)

            expect(rows).to.equal([])
          })
        })
      })
    })

    describe('and there are matching expiring licences', () => {
      describe('which are not lapsing or being revoked', () => {
        beforeEach(async () => {
          licence = await LicenceHelper.add({ expiredDate })
        })

        it('returns the expected licences', async () => {
          const { bindings, query } = GenerateExpiringLicencesQueryService.go(expiredDate)
          const { rows } = await db.raw(query, bindings)

          expect(rows).to.equal([{ licence_ref: licence.licenceRef }])
        })
      })

      describe('which are lapsing after the expired date', () => {
        beforeEach(async () => {
          licence = await LicenceHelper.add({ expiredDate, lapsedDate: afterExpiredDate })
        })

        it('returns the expected licences', async () => {
          const { bindings, query } = GenerateExpiringLicencesQueryService.go(expiredDate)
          const { rows } = await db.raw(query, bindings)

          expect(rows).to.equal([{ licence_ref: licence.licenceRef }])
        })
      })

      describe('which are revoked after the expired date', () => {
        beforeEach(async () => {
          licence = await LicenceHelper.add({ expiredDate, revokedDate: afterExpiredDate })
        })

        it('returns the expected licences', async () => {
          const { bindings, query } = GenerateExpiringLicencesQueryService.go(expiredDate)
          const { rows } = await db.raw(query, bindings)

          expect(rows).to.equal([{ licence_ref: licence.licenceRef }])
        })
      })
    })
  })
})
