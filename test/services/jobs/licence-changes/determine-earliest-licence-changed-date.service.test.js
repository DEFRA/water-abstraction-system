'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const DetermineEarliestLicenceChangedDateService = require('../../../../app/services/jobs/licence-changes/determine-earliest-licence-changed-date.service.js')

describe('Jobs - Licence Changes - Determine Earliest Licence Changed Date service', () => {
  let licence

  beforeEach(() => {
    licence = {
      id: '614d2443-7f26-4d5d-a3ca-918e3cd53faa',
      nald_expired_date: null,
      nald_lapsed_date: null,
      nald_revoked_date: null,
      wrls_expired_date: null,
      wrls_lapsed_date: null,
      wrls_revoked_date: null
    }
  })

  describe('when the NALD and WRLS end dates are the same', () => {
    beforeEach(() => {
      // NOTE: We set a date to show the logic determines matching dates as unchanged
      licence.nald_revoked_date = new Date('2023-01-01')
      licence.wrls_revoked_date = new Date('2023-01-01')
    })

    it('returns null', async () => {
      const result = await DetermineEarliestLicenceChangedDateService.go(licence)

      expect(result).to.equal(null)
    })
  })

  describe('when the NALD and WRLS "expired" dates are different', () => {
    describe('because the NALD date is now set but the WRLS date is not', () => {
      beforeEach(() => {
        licence.nald_expired_date = new Date('2023-01-01')
        licence.wrls_expired_date = null
      })

      it('returns details of the changed date with "changeDate" set as the NALD date', () => {
        const result = DetermineEarliestLicenceChangedDateService.go(licence)

        expect(result).to.equal({
          changeDate: licence.nald_expired_date,
          dateType: 'expired',
          naldDate: licence.nald_expired_date,
          wrlsDate: licence.wrls_expired_date
        })
      })
    })

    describe('because the NALD date has been unset and the WRLS date is still set', () => {
      beforeEach(() => {
        licence.nald_expired_date = null
        licence.wrls_expired_date = new Date('2023-01-01')
      })

      it('returns details of the changed date with "changeDate" set as the WRLS date', () => {
        const result = DetermineEarliestLicenceChangedDateService.go(licence)

        expect(result).to.equal({
          changeDate: licence.wrls_expired_date,
          dateType: 'expired',
          naldDate: licence.nald_expired_date,
          wrlsDate: licence.wrls_expired_date
        })
      })
    })

    describe('because the NALD date is now earlier than the WRLS date', () => {
      beforeEach(() => {
        licence.nald_expired_date = new Date('2022-12-31')
        licence.wrls_expired_date = new Date('2023-01-01')
      })

      it('returns details of the changed date with "changeDate" set as the NALD date', () => {
        const result = DetermineEarliestLicenceChangedDateService.go(licence)

        expect(result).to.equal({
          changeDate: licence.nald_expired_date,
          dateType: 'expired',
          naldDate: licence.nald_expired_date,
          wrlsDate: licence.wrls_expired_date
        })
      })
    })

    describe('because the NALD date is now later than the WRLS date', () => {
      beforeEach(() => {
        licence.nald_expired_date = new Date('2023-01-02')
        licence.wrls_expired_date = new Date('2023-01-01')
      })

      it('returns details of the changed date with "changeDate" set as the WRLS date', () => {
        const result = DetermineEarliestLicenceChangedDateService.go(licence)

        expect(result).to.equal({
          changeDate: licence.wrls_expired_date,
          dateType: 'expired',
          naldDate: licence.nald_expired_date,
          wrlsDate: licence.wrls_expired_date
        })
      })
    })
  })

  describe('when the NALD and WRLS "lapsed" dates are different', () => {
    describe('because the NALD date is now set but the WRLS date is not', () => {
      beforeEach(() => {
        licence.nald_lapsed_date = new Date('2023-01-01')
        licence.wrls_lapsed_date = null
      })

      it('returns details of the changed date with "changeDate" set as the NALD date', () => {
        const result = DetermineEarliestLicenceChangedDateService.go(licence)

        expect(result).to.equal({
          changeDate: licence.nald_lapsed_date,
          dateType: 'lapsed',
          naldDate: licence.nald_lapsed_date,
          wrlsDate: licence.wrls_lapsed_date
        })
      })
    })

    describe('because the NALD date has been unset and the WRLS date is still set', () => {
      beforeEach(() => {
        licence.nald_lapsed_date = null
        licence.wrls_lapsed_date = new Date('2023-01-01')
      })

      it('returns details of the changed date with "changeDate" set as the WRLS date', () => {
        const result = DetermineEarliestLicenceChangedDateService.go(licence)

        expect(result).to.equal({
          changeDate: licence.wrls_lapsed_date,
          dateType: 'lapsed',
          naldDate: licence.nald_lapsed_date,
          wrlsDate: licence.wrls_lapsed_date
        })
      })
    })

    describe('because the NALD date is now earlier than the WRLS date', () => {
      beforeEach(() => {
        licence.nald_lapsed_date = new Date('2022-12-31')
        licence.wrls_lapsed_date = new Date('2023-01-01')
      })

      it('returns details of the changed date with "changeDate" set as the NALD date', () => {
        const result = DetermineEarliestLicenceChangedDateService.go(licence)

        expect(result).to.equal({
          changeDate: licence.nald_lapsed_date,
          dateType: 'lapsed',
          naldDate: licence.nald_lapsed_date,
          wrlsDate: licence.wrls_lapsed_date
        })
      })
    })

    describe('because the NALD date is now later than the WRLS date', () => {
      beforeEach(() => {
        licence.nald_lapsed_date = new Date('2023-01-02')
        licence.wrls_lapsed_date = new Date('2023-01-01')
      })

      it('returns details of the changed date with "changeDate" set as the WRLS date', () => {
        const result = DetermineEarliestLicenceChangedDateService.go(licence)

        expect(result).to.equal({
          changeDate: licence.wrls_lapsed_date,
          dateType: 'lapsed',
          naldDate: licence.nald_lapsed_date,
          wrlsDate: licence.wrls_lapsed_date
        })
      })
    })
  })

  describe('when the NALD and WRLS "revoked" dates are different', () => {
    describe('because the NALD date is now set but the WRLS date is not', () => {
      beforeEach(() => {
        licence.nald_revoked_date = new Date('2023-01-01')
        licence.wrls_revoked_date = null
      })

      it('returns details of the changed date with "changeDate" set as the NALD date', () => {
        const result = DetermineEarliestLicenceChangedDateService.go(licence)

        expect(result).to.equal({
          changeDate: licence.nald_revoked_date,
          dateType: 'revoked',
          naldDate: licence.nald_revoked_date,
          wrlsDate: licence.wrls_revoked_date
        })
      })
    })

    describe('because the NALD date has been unset and the WRLS date is still set', () => {
      beforeEach(() => {
        licence.nald_revoked_date = null
        licence.wrls_revoked_date = new Date('2023-01-01')
      })

      it('returns details of the changed date with "changeDate" set as the WRLS date', () => {
        const result = DetermineEarliestLicenceChangedDateService.go(licence)

        expect(result).to.equal({
          changeDate: licence.wrls_revoked_date,
          dateType: 'revoked',
          naldDate: licence.nald_revoked_date,
          wrlsDate: licence.wrls_revoked_date
        })
      })
    })

    describe('because the NALD date is now earlier than the WRLS date', () => {
      beforeEach(() => {
        licence.nald_revoked_date = new Date('2022-12-31')
        licence.wrls_revoked_date = new Date('2023-01-01')
      })

      it('returns details of the changed date with "changeDate" set as the NALD date', () => {
        const result = DetermineEarliestLicenceChangedDateService.go(licence)

        expect(result).to.equal({
          changeDate: licence.nald_revoked_date,
          dateType: 'revoked',
          naldDate: licence.nald_revoked_date,
          wrlsDate: licence.wrls_revoked_date
        })
      })
    })

    describe('because the NALD date is now later than the WRLS date', () => {
      beforeEach(() => {
        licence.nald_revoked_date = new Date('2023-01-02')
        licence.wrls_revoked_date = new Date('2023-01-01')
      })

      it('returns details of the changed date with "changeDate" set as the WRLS date', () => {
        const result = DetermineEarliestLicenceChangedDateService.go(licence)

        expect(result).to.equal({
          changeDate: licence.wrls_revoked_date,
          dateType: 'revoked',
          naldDate: licence.nald_revoked_date,
          wrlsDate: licence.wrls_revoked_date
        })
      })
    })
  })

  describe('when multiple NALD and WRLS end dates are different', () => {
    beforeEach(() => {
      licence.nald_expired_date = new Date('2026-01-01')
      licence.wrls_expired_date = new Date('2037-01-01')
      licence.nald_revoked_date = new Date('2023-01-01')
      licence.wrls_revoked_date = null
    })

    it('returns just the details of the earliest changed date', async () => {
      const result = DetermineEarliestLicenceChangedDateService.go(licence)

      expect(result).to.equal({
        changeDate: licence.nald_revoked_date,
        dateType: 'revoked',
        naldDate: licence.nald_revoked_date,
        wrlsDate: licence.wrls_revoked_date
      })
    })
  })
})
