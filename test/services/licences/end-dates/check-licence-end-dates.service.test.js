'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const LicenceEndDateChangeModel = require('../../../../app/models/licence-end-date-change.model.js')

// Thing under test
const CheckLicenceEndDatesService = require('../../../../app/services/licences/end-dates/check-licence-end-dates.service.js')

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
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(async () => {
    Sinon.restore()
    delete global.GlobalNotifier

    if (licenceEndDateChanges) {
      await licenceEndDateChanges.$query().delete()
    }
  })

  describe('when the "end dates" on the licence have not changed', () => {
    it('does not record the change', async () => {
      await CheckLicenceEndDatesService.go(licence)

      const licenceEndDateChanges = await LicenceEndDateChangeModel.query().where('licenceId', licence.id)

      expect(licenceEndDateChanges.length).to.equal(0)
    })
  })

  describe('when the "end dates" on the licence have changed', () => {
    beforeEach(() => {
      licence.nald_revoked_date = new Date('2023-01-01')
      licence.wrls_revoked_date = null
    })

    it('records the change', async () => {
      await CheckLicenceEndDatesService.go(licence)

      const licenceEndDateChanges = await LicenceEndDateChangeModel.query().where('licenceId', licence.id)

      expect(licenceEndDateChanges.length).to.equal(1)
    })
  })

  describe('when an error is thrown whilst checking the licence', () => {
    beforeEach(() => {
      licence.nald_revoked_date = new Date('2023-01-01')
      licence.wrls_revoked_date = null

      Sinon.stub(LicenceEndDateChangeModel, 'query').returns({
        insert: Sinon.stub().returnsThis(),
        onConflict: Sinon.stub().returnsThis(),
        merge: Sinon.stub().rejects()
      })
    })

    it('handles the error', async () => {
      await CheckLicenceEndDatesService.go(licence)

      const errorLogArgs = notifierStub.omfg.firstCall.args

      expect(notifierStub.omfg.calledWith('Check licence end dates failed')).to.be.true()
      expect(errorLogArgs[1]).to.equal({
        id: licence.id,
        changedDateDetails: {
          changeDate: new Date('2023-01-01'),
          dateType: 'revoked',
          naldDate: new Date('2023-01-01'),
          wrlsDate: null
        }
      })
      expect(errorLogArgs[2]).to.be.instanceOf(Error)
    })
  })
})
