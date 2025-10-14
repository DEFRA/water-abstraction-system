'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AuthService = require('../../../app/services/plugins/auth.service.js')
const { data: users } = require('../../../db/seeds/data/users.js')

// Things we want to stub
const featureFlags = require('../../../config/feature-flags.config.js')

// Thing under test
const ManagePresenter = require('../../../app/presenters/manage/manage.presenter.js')

describe('Manage - Manage presenter', () => {
  let auth

  beforeEach(() => {
    Sinon.stub(featureFlags, 'enableAdHocNotifications').value(true)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the user is assigned "Super user" permissions', () => {
    beforeEach(async () => {
      auth = await _auth('super.user@wrls.gov.uk')
    })

    it('provides the correct items to display', async () => {
      const result = await ManagePresenter.go(auth.credentials.scope)

      expect(result).to.equal({
        pageTitle: 'Manage reports and notices',
        flowNotices: { links: { handsOffFlow: true, restriction: true, resume: true }, show: true },
        licenceNotices: { links: { renewal: true }, show: true },
        manageUsers: { links: { createAccount: true }, show: true },
        returnNotices: { links: { adHoc: true, invitations: true, paperForms: true, reminders: true }, show: true },
        viewReports: {
          links: { basicReports: true, digitise: true, notices: true, returnsCycles: true },
          show: true
        },
        viewWorkflow: { links: { checkLicences: true }, show: true }
      })
    })
  })

  describe('when the user is assigned "Basic access" permissions', () => {
    beforeEach(async () => {
      auth = await _auth('basic.access@wrls.gov.uk')
    })

    it('provides the correct items to display', async () => {
      const result = await ManagePresenter.go(auth.credentials.scope)

      expect(result).to.equal({
        pageTitle: 'Manage reports and notices',
        flowNotices: { links: { handsOffFlow: false, restriction: false, resume: false }, show: false },
        licenceNotices: { links: { renewal: false }, show: false },
        manageUsers: { links: { createAccount: false }, show: false },
        returnNotices: {
          links: { adHoc: false, invitations: false, paperForms: false, reminders: false },
          show: false
        },
        viewReports: {
          links: { basicReports: false, digitise: false, notices: false, returnsCycles: false },
          show: false
        },
        viewWorkflow: { links: { checkLicences: false }, show: false }
      })
    })
  })

  describe('when the user is assigned "Billing and Data" permissions', () => {
    beforeEach(async () => {
      auth = await _auth('billing.data@wrls.gov.uk')
    })

    it('provides the correct items to display', async () => {
      const result = await ManagePresenter.go(auth.credentials.scope)

      expect(result).to.equal({
        pageTitle: 'Manage reports and notices',
        flowNotices: { links: { handsOffFlow: false, restriction: false, resume: false }, show: false },
        licenceNotices: { links: { renewal: false }, show: false },
        manageUsers: { links: { createAccount: true }, show: true },
        returnNotices: { links: { adHoc: true, invitations: true, paperForms: true, reminders: true }, show: true },
        viewReports: {
          links: { basicReports: true, digitise: false, notices: true, returnsCycles: true },
          show: true
        },
        viewWorkflow: { links: { checkLicences: true }, show: true }
      })
    })
  })

  describe('when the user is assigned "Environment Officer" permissions', () => {
    beforeEach(async () => {
      auth = await _auth('environment.officer@wrls.gov.uk')
    })

    it('provides the correct items to display', async () => {
      const result = await ManagePresenter.go(auth.credentials.scope)

      expect(result).to.equal({
        pageTitle: 'Manage reports and notices',
        flowNotices: { links: { handsOffFlow: true, restriction: true, resume: true }, show: true },
        licenceNotices: { links: { renewal: false }, show: false },
        manageUsers: { links: { createAccount: false }, show: false },
        returnNotices: {
          links: { adHoc: false, invitations: false, paperForms: false, reminders: false },
          show: false
        },
        viewReports: {
          links: { basicReports: true, digitise: false, notices: true, returnsCycles: false },
          show: true
        },
        viewWorkflow: { links: { checkLicences: false }, show: false }
      })
    })
  })

  describe('when the user is assigned "National Permitting Service" permissions', () => {
    beforeEach(async () => {
      auth = await _auth('national.permitting.service@wrls.gov.uk')
    })

    it('provides the correct items to display', async () => {
      const result = await ManagePresenter.go(auth.credentials.scope)

      expect(result).to.equal({
        pageTitle: 'Manage reports and notices',
        flowNotices: { links: { handsOffFlow: false, restriction: false, resume: false }, show: false },
        licenceNotices: { links: { renewal: true }, show: true },
        manageUsers: { links: { createAccount: false }, show: false },
        returnNotices: {
          links: { adHoc: false, invitations: false, paperForms: false, reminders: false },
          show: false
        },
        viewReports: {
          links: { basicReports: true, digitise: false, notices: true, returnsCycles: false },
          show: true
        },
        viewWorkflow: { links: { checkLicences: false }, show: false }
      })
    })
  })

  describe('when the user is assigned "National Permitting Service and Digitise! editor" permissions', () => {
    beforeEach(async () => {
      auth = await _auth('digitise.editor@wrls.gov.uk')
    })

    it('provides the correct items to display', async () => {
      const result = await ManagePresenter.go(auth.credentials.scope)

      expect(result).to.equal({
        pageTitle: 'Manage reports and notices',
        flowNotices: { links: { handsOffFlow: false, restriction: false, resume: false }, show: false },
        licenceNotices: { links: { renewal: true }, show: true },
        manageUsers: { links: { createAccount: false }, show: false },
        returnNotices: {
          links: { adHoc: false, invitations: false, paperForms: false, reminders: false },
          show: false
        },
        viewReports: {
          links: { basicReports: true, digitise: false, notices: true, returnsCycles: false },
          show: true
        },
        viewWorkflow: { links: { checkLicences: false }, show: false }
      })
    })
  })

  describe('when the user is assigned "National Permitting Service and Digitise! approver" permissions', () => {
    beforeEach(async () => {
      auth = await _auth('digitise.approver@wrls.gov.uk')
    })

    it('provides the correct items to display', async () => {
      const result = await ManagePresenter.go(auth.credentials.scope)

      expect(result).to.equal({
        pageTitle: 'Manage reports and notices',
        flowNotices: { links: { handsOffFlow: false, restriction: false, resume: false }, show: false },
        licenceNotices: { links: { renewal: true }, show: true },
        manageUsers: { links: { createAccount: false }, show: false },
        returnNotices: {
          links: { adHoc: false, invitations: false, paperForms: false, reminders: false },
          show: false
        },
        viewReports: {
          links: { basicReports: true, digitise: true, notices: true, returnsCycles: false },
          show: true
        },
        viewWorkflow: { links: { checkLicences: false }, show: false }
      })
    })
  })

  describe('when the user is assigned "Permitting and Support Centre" permissions', () => {
    beforeEach(async () => {
      auth = await _auth('permitting.support.centre@wrls.gov.uk')
    })

    it('provides the correct items to display', async () => {
      const result = await ManagePresenter.go(auth.credentials.scope)

      expect(result).to.equal({
        pageTitle: 'Manage reports and notices',
        flowNotices: { links: { handsOffFlow: false, restriction: false, resume: false }, show: false },
        licenceNotices: { links: { renewal: true }, show: true },
        manageUsers: { links: { createAccount: false }, show: false },
        returnNotices: {
          links: { adHoc: false, invitations: false, paperForms: false, reminders: false },
          show: false
        },
        viewReports: {
          links: { basicReports: true, digitise: false, notices: true, returnsCycles: false },
          show: true
        },
        viewWorkflow: { links: { checkLicences: false }, show: false }
      })
    })
  })

  describe('when the user is assigned "Waste and Industry Regulatory Service" permissions', () => {
    beforeEach(async () => {
      auth = await _auth('waste.industry.regulatory.services@wrls.gov.uk')
    })

    it('provides the correct items to display', async () => {
      const result = await ManagePresenter.go(auth.credentials.scope)

      expect(result).to.equal({
        pageTitle: 'Manage reports and notices',
        flowNotices: { links: { handsOffFlow: false, restriction: false, resume: false }, show: false },
        licenceNotices: { links: { renewal: false }, show: false },
        manageUsers: { links: { createAccount: false }, show: false },
        returnNotices: {
          links: { adHoc: true, invitations: false, paperForms: true, reminders: false },
          show: true
        },
        viewReports: {
          links: { basicReports: true, digitise: false, notices: true, returnsCycles: true },
          show: true
        },
        viewWorkflow: { links: { checkLicences: false }, show: false }
      })
    })
  })
})

async function _auth(username) {
  const user = users.find((user) => {
    return user.username === username
  })

  return AuthService.go(user.id)
}
