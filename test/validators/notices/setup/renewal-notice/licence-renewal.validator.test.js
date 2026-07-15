// Helpers
import LicenceHelper from '../../../../support/helpers/licence.helper.js'
import LicenceModel from '../../../../../app/models/licence.model.js'
import { generateUUID } from '../../../../../app/lib/general.lib.js'

// Thing under test
import LicenceRenewalValidator from '../../../../../app/validators/notices/setup/renewal-notice/licence-renewal.validator.js'

describe('Notices - Setup - Renewal Notice - licence renewal validator', () => {
  let licenceRenewal
  let payload
  let licenceRef

  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-05-21') })

    licenceRef = LicenceHelper.generateLicenceRef()

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
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('confirms the data is valid', () => {
    const result = LicenceRenewalValidator(payload, licenceRenewal)

    expect(result.value).toBeDefined()
    expect(result.error).toBeUndefined()
  })

  describe('when invalid data is provided', () => {
    describe('because a "licenceRef" has not been provided', () => {
      beforeEach(() => {
        licenceRenewal = undefined
        payload = {}
      })

      it('confirms the data is invalid', () => {
        const result = LicenceRenewalValidator(payload, licenceRenewal)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Enter a licence number')
      })
    })

    describe('because the "licenceRef" does not exist', () => {
      beforeEach(() => {
        licenceRenewal = undefined
      })

      it('confirms the data is invalid', () => {
        const result = LicenceRenewalValidator(payload, licenceRenewal)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Enter a valid licence number')
      })
    })

    describe('because the licence has ended', () => {
      describe('because the licence has expired', () => {
        beforeEach(() => {
          licenceRenewal.expiredDate = new Date('2026-05-20')
        })

        it('confirms the data is invalid', () => {
          const result = LicenceRenewalValidator(payload, licenceRenewal)

          expect(result.value).toBeDefined()
          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual('The licence has ended')
        })
      })

      describe('because the licence has lapsed', () => {
        beforeEach(() => {
          licenceRenewal.lapsedDate = new Date('2026-05-20')
        })

        it('confirms the data is invalid', () => {
          const result = LicenceRenewalValidator(payload, licenceRenewal)

          expect(result.value).toBeDefined()
          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual('The licence has ended')
        })
      })

      describe('because the licence has been revoked', () => {
        beforeEach(() => {
          licenceRenewal.revokedDate = new Date('2026-05-20')
        })

        it('confirms the data is invalid', () => {
          const result = LicenceRenewalValidator(payload, licenceRenewal)

          expect(result.value).toBeDefined()
          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual('The licence has ended')
        })
      })
    })

    describe('because the licence does not have an expiry date', () => {
      beforeEach(() => {
        licenceRenewal.expiredDate = null
        licenceRenewal.revokedDate = new Date('2026-06-01')
      })

      it('confirms the data is invalid', () => {
        const result = LicenceRenewalValidator(payload, licenceRenewal)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('The licence does not have an expiry date')
      })
    })

    describe('because the licence expiry date is less than 90 days in the future', () => {
      beforeEach(() => {
        licenceRenewal.expiredDate = new Date('2026-08-18')
      })

      it('confirms the data is invalid', () => {
        const result = LicenceRenewalValidator(payload, licenceRenewal)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('The licence expires in less than 90 days')
      })
    })
  })
})
