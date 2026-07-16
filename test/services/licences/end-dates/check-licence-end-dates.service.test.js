// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import LicenceEndDateChangeModel from '../../../../app/models/licence-end-date-change.model.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Things we need to stub
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'

// Thing under test
import CheckLicenceEndDatesService from '../../../../app/services/licences/end-dates/check-licence-end-dates.service.js'

describe('Licences - End Dates - Check Licence End Dates service', () => {
  let licence
  let licenceEndDateChanges
  let notifierStub

  beforeEach(() => {
    licence = {
      id: generateUUID(),
      nald_expired_date: null,
      nald_lapsed_date: null,
      nald_revoked_date: null,
      wrls_expired_date: null,
      wrls_lapsed_date: null,
      wrls_revoked_date: null
    }

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier

    if (licenceEndDateChanges) {
      await licenceEndDateChanges.$query().delete()
    }
  })

  describe('when the "end dates" on the licence have not changed', () => {
    it('does not record the change', async () => {
      await CheckLicenceEndDatesService(licence)

      const licenceEndDateChanges = await LicenceEndDateChangeModel.query().where('licenceId', licence.id)

      expect(licenceEndDateChanges.length).toEqual(0)
    })
  })

  describe('when the "end dates" on the licence have changed', () => {
    beforeEach(() => {
      licence.nald_revoked_date = new Date('2023-01-01')
      licence.wrls_revoked_date = null
    })

    it('records the change', async () => {
      await CheckLicenceEndDatesService(licence)

      const licenceEndDateChanges = await LicenceEndDateChangeModel.query().where('licenceId', licence.id)

      expect(licenceEndDateChanges.length).toEqual(1)
    })
  })

  describe('when an error is thrown whilst checking the licence', () => {
    beforeEach(() => {
      licence.nald_revoked_date = new Date('2023-01-01')
      licence.wrls_revoked_date = null

      vi.spyOn(LicenceEndDateChangeModel, 'query').mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        onConflict: vi.fn().mockReturnThis(),
        merge: vi.fn().mockRejectedValue(new Error())
      })
    })

    it('handles the error', async () => {
      await CheckLicenceEndDatesService(licence)

      const errorLogArgs = notifierStub.omfg.mock.calls[0]

      expect(notifierStub.omfg).toHaveBeenCalledWith(
        'Check licence end dates failed',
        expect.any(Object),
        expect.any(Error)
      )
      expect(errorLogArgs[1]).toEqual({
        id: licence.id,
        changedDateDetails: {
          changeDate: new Date('2023-01-01'),
          dateType: 'revoked',
          naldDate: new Date('2023-01-01'),
          wrlsDate: null
        }
      })
      expect(errorLogArgs[2]).toBeInstanceOf(Error)
    })
  })
})
