'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Helpers
const LicenceModel = require('../../../../../app/models/licence.model.js')
const { generateLicenceRef } = require('../../../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../../../app/lib/general.lib.js')

// Thing under test
const LicenceRenewalValidator = require('../../../../../app/validators/notices/setup/renewal-notice/licence-renewal.validator.js')

describe('Notices - Setup - Renewal Notice - licence renewal validator', () => {
  let clock
  let licenceRenewal
  let payload
  let licenceRef

  beforeEach(() => {
    clock = Sinon.useFakeTimers(new Date('2026-05-21'))

    licenceRef = generateLicenceRef()

    payload = { licenceRef }

    licenceRenewal = LicenceModel.fromJson({
      expiredDate: new Date('2026-08-19'),
      id: generateUUID(),
      lapsedDate: null,
      licenceRef,
      revokedDate: null
    })
  })

  afterEach(() => {
    clock.restore()
    Sinon.restore()
  })

  it('confirms the data is valid', () => {
    const result = LicenceRenewalValidator.go(payload, licenceRenewal)

    expect(result.value).to.exist()
    expect(result.error).not.to.exist()
  })

  describe('when invalid data is provided', () => {
    describe('because a "licenceRef" has not been provided', () => {
      beforeEach(() => {
        licenceRenewal = undefined
        payload = { licenceRef: '' }
      })

      it('confirms the data is invalid', () => {
        const result = LicenceRenewalValidator.go(payload, licenceRenewal)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a licence number')
      })
    })

    describe('because the "licenceRef" does not exist', () => {
      beforeEach(() => {
        licenceRenewal = undefined
      })

      it('confirms the data is invalid', () => {
        const result = LicenceRenewalValidator.go(payload, licenceRenewal)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a valid licence number')
      })
    })

    describe('because the licence has ended', () => {
      beforeEach(() => {
        licenceRenewal.expiredDate = new Date('2026-05-20')
      })

      it('confirms the data is invalid', () => {
        const result = LicenceRenewalValidator.go(payload, licenceRenewal)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('The licence has ended')
      })
    })

    describe('because the licence does not have an expiry date', () => {
      beforeEach(() => {
        licenceRenewal.expiredDate = null
        licenceRenewal.revokedDate = new Date('2026-06-01')
      })

      it('confirms the data is invalid', () => {
        const result = LicenceRenewalValidator.go(payload, licenceRenewal)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('The licence does not have an expiry date')
      })
    })

    describe('because the licence expiry date is less than 90 days in the future', () => {
      beforeEach(() => {
        const expiredDate = new Date('2026-08-19')

        expiredDate.setDate(expiredDate.getDate() - 1)

        licenceRenewal.expiredDate = expiredDate
      })

      it('confirms the data is invalid', () => {
        const result = LicenceRenewalValidator.go(payload, licenceRenewal)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(
          'The licence expiry date must be at least 90 days in the future'
        )
      })
    })
  })
})
