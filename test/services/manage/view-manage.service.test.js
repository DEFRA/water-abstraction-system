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
const ViewManageService = require('../../../app/services/manage/view-manage.service.js')

// Test helpers
const allLinks = (viewResult) => {
  return [
    ...viewResult.accounts,
    ...viewResult.chargeInformationWorkflow,
    ...viewResult.hofNotifications,
    ...viewResult.licenceNotifications,
    ...viewResult.reports,
    ...viewResult.returnNotifications,
    ...viewResult.uploadChargeInformation
  ]
}

describe('Manage - View service', () => {
  let featureStubAllowChargeVersionUploads
  let featureStubEnableAdHocNotifications
  let featureStubEnableSystemNotices
  let featureStubEnableSystemNotifications
  let sandbox
  let userScopes

  beforeEach(() => {
    sandbox = Sinon.createSandbox()
    // Stub all feature flags to false - we'll test activating the flags individually
    featureStubAllowChargeVersionUploads = sandbox.stub(featureFlags, 'allowChargeVersionUploads').value(false)
    featureStubEnableAdHocNotifications = sandbox.stub(featureFlags, 'enableAdHocNotifications').value(false)
    featureStubEnableSystemNotices = sandbox.stub(featureFlags, 'enableSystemNotices').value(false)
    featureStubEnableSystemNotifications = sandbox.stub(featureFlags, 'enableSystemNotifications').value(false)
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('when called', () => {
    describe('with no permissions', () => {
      beforeEach(() => {
        userScopes = []
      })

      it('returns the details for the manage page with no available links', async () => {
        const result = await ViewManageService.go({ credentials: { scope: userScopes } })

        expect(result).to.equal({
          accounts: [],
          activeNavBar: 'manage',
          chargeInformationWorkflow: [],
          hofNotifications: [],
          licenceNotifications: [],
          pageTitle: 'Manage reports and notices',
          reports: [],
          returnNotifications: [],
          uploadChargeInformation: []
        })
      })
    })

    describe('with abstraction reform approver scope', () => {
      beforeEach(() => {
        userScopes = ['ar_approver']
      })

      it('returns: Digitise! report and KPIs', async () => {
        const result = await ViewManageService.go({ credentials: { scope: userScopes } })

        expect(allLinks(result)).to.equal([
          { name: 'Digitise!', path: '/digitise/report' },
          { name: 'Key performance indicators', path: '/reporting/kpi-reporting' }
        ])
      })
    })

    describe('with billing scope', () => {
      beforeEach(() => {
        userScopes = ['billing']
      })

      it('returns: KPIs', async () => {
        const result = await ViewManageService.go({ credentials: { scope: userScopes } })

        expect(allLinks(result)).to.equal([{ name: 'Key performance indicators', path: '/reporting/kpi-reporting' }])
      })
    })

    describe('with bulk returns notifications permissions', () => {
      beforeEach(() => {
        userScopes = ['bulk_return_notifications']
      })

      it('returns: notices, KPIs, return invitations and return reminders notifications', async () => {
        const result = await ViewManageService.go({ credentials: { scope: userScopes } })

        expect(allLinks(result)).to.equal([
          { name: 'Notices', path: '/notifications/report' },
          { name: 'Key performance indicators', path: '/reporting/kpi-reporting' },
          { name: 'Invitations', path: '/returns-notifications/invitations' },
          { name: 'Reminders', path: '/returns-notifications/reminders' }
        ])
      })
    })

    describe('with charge version workflow editor scope', () => {
      beforeEach(() => {
        userScopes = ['charge_version_workflow_editor']
      })

      it('returns: check licences', async () => {
        const result = await ViewManageService.go({ credentials: { scope: userScopes } })

        expect(allLinks(result)).to.equal([
          { name: 'Check licences in workflow', path: '/charge-information-workflow' }
        ])
      })
    })

    describe('with charge version workflow reviewer scope', () => {
      beforeEach(() => {
        userScopes = ['charge_version_workflow_reviewer']
      })

      it('returns: upload a file and check licences', async () => {
        const result = await ViewManageService.go({ credentials: { scope: userScopes } })

        expect(allLinks(result)).to.equal([
          { name: 'Check licences in workflow', path: '/charge-information-workflow' }
        ])
      })
    })

    describe('with HoF notifications scope', () => {
      beforeEach(() => {
        userScopes = ['hof_notifications']
      })

      it('returns: all HoF notifications, notices and KPIs', async () => {
        const result = await ViewManageService.go({ credentials: { scope: userScopes } })

        expect(allLinks(result)).to.equal([
          { name: 'Restriction', path: 'notifications/1?start=1' },
          { name: 'Hands-off flow', path: 'notifications/3?start=1' },
          { name: 'Resume', path: 'notifications/4?start=1' },
          { name: 'Notices', path: '/notifications/report' },
          { name: 'Key performance indicators', path: '/reporting/kpi-reporting' }
        ])
      })
    })

    describe('with manage accounts scope', () => {
      beforeEach(() => {
        userScopes = ['manage_accounts']
      })

      it('returns: KPIs and create account', async () => {
        const result = await ViewManageService.go({ credentials: { scope: userScopes } })

        expect(allLinks(result)).to.equal([
          { name: 'Create an internal account', path: '/account/create-user' },
          { name: 'Key performance indicators', path: '/reporting/kpi-reporting' }
        ])
      })
    })

    describe('with renewal notifications scope', () => {
      beforeEach(() => {
        userScopes = ['renewal_notifications']
      })

      it('returns: renewals, notices and KPIs', async () => {
        const result = await ViewManageService.go({ credentials: { scope: userScopes } })

        expect(allLinks(result)).to.equal([
          { name: 'Renewal', path: 'notifications/2?start=1' },
          { name: 'Notices', path: '/notifications/report' },
          { name: 'Key performance indicators', path: '/reporting/kpi-reporting' }
        ])
      })
    })

    describe('with returns scope', () => {
      beforeEach(() => {
        userScopes = ['returns']
      })

      it('returns: notices, returns cycles, KPIs and paper forms', async () => {
        const result = await ViewManageService.go({ credentials: { scope: userScopes } })

        expect(allLinks(result)).to.equal([
          { name: 'Notices', path: '/notifications/report' },
          { name: 'Returns cycles', path: '/returns-reports' },
          { name: 'Key performance indicators', path: '/reporting/kpi-reporting' },
          { name: 'Paper forms', path: '/returns-notifications/forms' }
        ])
      })
    })

    describe('and the system notices feature is enabled', () => {
      beforeEach(() => {
        featureStubEnableSystemNotices.restore()
        featureStubEnableSystemNotices = sandbox.stub(featureFlags, 'enableSystemNotices').value(true)
        userScopes = ['returns']
      })

      it('returns the system notices link instead of the notifications report link', async () => {
        const result = await ViewManageService.go({ credentials: { scope: userScopes } })
        const allReturnedLinks = allLinks(result)

        expect(allReturnedLinks).to.not.contain([{ name: 'Notices', path: '/notifications/report' }])
        expect(allReturnedLinks).to.contain([{ name: 'Notices', path: '/system/notices' }])
      })
    })

    describe('and the system notifications feature is enabled', () => {
      beforeEach(() => {
        featureStubEnableSystemNotifications.restore()
        featureStubEnableSystemNotifications = sandbox.stub(featureFlags, 'enableSystemNotifications').value(true)
        userScopes = ['bulk_return_notifications']
      })

      it('returns the system invitation and reminder links instead of the notifications links', async () => {
        const result = await ViewManageService.go({ credentials: { scope: userScopes } })
        const allReturnedLinks = allLinks(result)

        expect(allReturnedLinks).to.not.contain([{ name: 'Invitations', path: '/returns-notifications/invitations' }])
        expect(allReturnedLinks).to.contain([
          { name: 'Invitations', path: '/system/notices/setup/standard?noticeType=invitations' }
        ])

        expect(allReturnedLinks).to.not.contain([{ name: 'Reminders', path: '/returns-notifications/reminders' }])
        expect(allReturnedLinks).to.contain([
          { name: 'Reminders', path: '/system/notices/setup/standard?noticeType=reminders' }
        ])
      })
    })

    describe('and the ad hoc notifications feature is enabled', () => {
      beforeEach(() => {
        featureStubEnableAdHocNotifications.restore()
        featureStubEnableAdHocNotifications = sandbox.stub(featureFlags, 'enableAdHocNotifications').value(true)
        userScopes = ['returns']
      })

      it('returns the ad hoc notifications link', async () => {
        const result = await ViewManageService.go({ credentials: { scope: userScopes } })

        expect(allLinks(result)).to.contain([{ name: 'Ad-hoc', path: '/system/notices/setup/adhoc' }])
      })
    })

    describe('and the charge version upload feature is enabled', () => {
      beforeEach(() => {
        featureStubAllowChargeVersionUploads.restore()
        featureStubAllowChargeVersionUploads = sandbox.stub(featureFlags, 'allowChargeVersionUploads').value(true)
        userScopes = ['charge_version_workflow_reviewer']
      })

      it('returns the upload file link', async () => {
        const result = await ViewManageService.go({ credentials: { scope: userScopes } })

        expect(allLinks(result)).to.contain([{ name: 'Upload a file', path: '/charge-information/upload' }])
      })
    })
  })
})
