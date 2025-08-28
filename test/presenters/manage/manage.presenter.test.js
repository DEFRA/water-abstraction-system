'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we want to stub
const featureFlags = require('../../../config/feature-flags.config.js')

// Thing under test
const ManagePresenter = require('../../../app/presenters/manage/manage.presenter.js')

const ALL_USER_SCOPES = new Set([
  'ar_approver',
  'billing',
  'bulk_return_notifications',
  'charge_version_workflow_editor',
  'charge_version_workflow_reviewer',
  'hof_notifications',
  'manage_accounts',
  'renewal_notifications',
  'returns',
  'DUMMY_some_other_scope' // Used for negative testing
])

// This is the definition of the test cases for checking the dynamic display of each element
const REQUIRED_SCOPES_FOR_DISPLAY_ITEMS = {
  showAdHoc: new Set(['returns']),
  showCheckLicences: new Set(['charge_version_workflow_editor', 'charge_version_workflow_reviewer']),
  showCreateAccount: new Set(['manage_accounts']),
  showDigitise: new Set(['ar_approver']),
  showHandsOffFlow: new Set(['hof_notifications']),
  showInvitations: new Set(['bulk_return_notifications']),
  showKPIs: new Set([
    'ar_approver',
    'billing',
    'bulk_return_notifications',
    'hof_notifications',
    'manage_accounts',
    'renewal_notifications',
    'returns'
  ]),
  showNotices: new Set(['bulk_return_notifications', 'hof_notifications', 'renewal_notifications', 'returns']),
  showPaperForms: new Set(['returns']),
  showReminders: new Set(['bulk_return_notifications']),
  showRenewal: new Set(['renewal_notifications']),
  showRestriction: new Set(['hof_notifications']),
  showResume: new Set(['hof_notifications']),
  showReturnsCycles: new Set(['returns'])
}

describe('Manage - presenter', () => {
  let featureStubEnableAdHocNotifications
  let sandbox
  let userScopes

  beforeEach(() => {
    sandbox = Sinon.createSandbox()
    // Stub feature flag to true - we'll test deactivating it separately
    featureStubEnableAdHocNotifications = sandbox.stub(featureFlags, 'enableAdHocNotifications').value(true)
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('when provided with user scopes', () => {
    beforeEach(() => {
      userScopes = [...ALL_USER_SCOPES]
    })
    it('provides the correct items to display', async () => {
      const result = await ManagePresenter.go(userScopes)

      expect(result).to.equal({
        pageTitle: 'Manage reports and notices',
        showAdHoc: true,
        showCheckLicences: true,
        showCreateAccount: true,
        showDigitise: true,
        showHandsOffFlow: true,
        showInvitations: true,
        showKPIs: true,
        showNotices: true,
        showPaperForms: true,
        showReminders: true,
        showRenewal: true,
        showRestriction: true,
        showResume: true,
        showReturnsCycles: true
      })
    })
  })

  describe('when the ad-hoc notifications feature flag is not set', () => {
    beforeEach(() => {
      const adHocScopes = REQUIRED_SCOPES_FOR_DISPLAY_ITEMS.showAdHoc

      userScopes = [...adHocScopes]
      featureStubEnableAdHocNotifications.restore()
      featureStubEnableAdHocNotifications = sandbox.stub(featureFlags, 'enableAdHocNotifications').value(false)
    })

    it('sets the showAdHoc item to not display', async () => {
      const result = await ManagePresenter.go(userScopes)

      expect(result.showAdHoc).to.not.be.true()
    })
  })

  Object.entries(REQUIRED_SCOPES_FOR_DISPLAY_ITEMS).forEach(([displayItem, requiredScopes]) => {
    describe(`for the "${displayItem}" item`, () => {
      requiredScopes.forEach((scope) => {
        describe(`when the user has "${scope}" scope`, () => {
          beforeEach(() => {
            userScopes = [scope]
          })

          it('sets the item to display', async () => {
            const result = await ManagePresenter.go(userScopes)
            expect(result[displayItem]).to.be.true()
          })
        })
      })

      describe('when the user has other scopes', () => {
        beforeEach(() => {
          const otherScopes = ALL_USER_SCOPES.difference(requiredScopes)
          userScopes = [...otherScopes]
        })

        it('sets the item to not display', async () => {
          const result = await ManagePresenter.go(userScopes)
          expect(result[displayItem]).to.not.be.true()
        })
      })
    })
  })
})
