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
const containsLinkName = (links, name) => {
  return links.some((link) => {
    return link.name === name
  })
}
const containsLinkNameAndPath = (links, name, path) => {
  return links.some((link) => {
    return link.name === name && link.path.includes(path)
  })
}

describe.only('ViewManageService', () => {
  let sandbox

  beforeEach(() => {
    sandbox = Sinon.createSandbox()
    // Stub all feature flags to true
    sandbox.stub(featureFlags, 'enableSystemNotices').value(true)
    sandbox.stub(featureFlags, 'enableSystemNotifications').value(true)
    sandbox.stub(featureFlags, 'enableAdHocNotifications').value(true)
    sandbox.stub(featureFlags, 'allowChargeVersionUploads').value(true)
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should return only links the user has scope for', async () => {
    const userScopes = ['returns']
    const result = await ViewManageService.go(userScopes)

    expect(result.activeNavBar).to.equal('manage')
    expect(result.pageTitle).to.equal('Manage reports and notices')

    expect(containsLinkName(result.reports, 'Returns cycles')).to.be.true()
    expect(containsLinkName(result.reports, 'Digitise!')).to.be.false()
    expect(containsLinkName(result.returnNotifications, 'Paper forms')).to.be.true()
    expect(containsLinkName(result.returnNotifications, 'Reminders')).to.be.false()
  })

  it('should include links based on feature flags', async () => {
    const userScopes = [
      'returns',
      'hof_notifications',
      'renewal_notifications',
      'bulk_return_notifications',
      'charge_version_workflow_reviewer'
    ]
    const result = await ViewManageService.go(userScopes)

    expect(containsLinkNameAndPath(result.reports, 'Notices', '/system/notices')).to.be.true()
    expect(
      containsLinkNameAndPath(
        result.returnNotifications,
        'Invitations',
        'system/notices/setup/standard?noticeType=invitations'
      )
    ).to.be.true()
    expect(
      containsLinkNameAndPath(
        result.returnNotifications,
        'Reminders',
        'system/notices/setup/standard?noticeType=reminders'
      )
    ).to.be.true()
    expect(containsLinkName(result.returnNotifications, 'Ad-hoc')).to.be.true()
    expect(containsLinkName(result.returnNotifications, 'Ad-hoc')).to.be.true()
    expect(containsLinkName(result.uploadChargeInformation, 'Upload a file')).to.be.true()
  })

  it('should return empty arrays for sections if user has no matching scopes', async () => {
    const userScopes = ['some_other_scope']
    const result = await ViewManageService.go(userScopes)
    Object.keys(result).forEach((key) => {
      if (Array.isArray(result[key])) {
        expect(result[key]).to.be.an.array().and.to.be.empty()
      }
    })
  })

  it('should handle userScopes as a string', async () => {
    const result = await ViewManageService.go('returns')
    expect(containsLinkName(result.reports, 'Returns cycles')).to.be.true()
  })

  it('should include charge information workflow links for correct scopes', async () => {
    const userScopes = ['charge_version_workflow_editor']
    const result = await ViewManageService.go(userScopes)
    expect(containsLinkName(result.chargeInformationWorkflow, 'Check licences in workflow')).to.be.true()
  })
})
