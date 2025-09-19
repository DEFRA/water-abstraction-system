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

// The full set of scopes that we will test against
const ALL_USER_SCOPES = [
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
]

// To avoid writing dozens of repetitive tests, we define the relationship between each item on the page and the scopes
// that it needs to be tested against.
// This can then be iterated over and each test can check the relevant scopes
const REQUIRED_SCOPES_FOR_LINKS = {
  flowNotices: {
    handsOffFlow: ['hof_notifications'],
    restriction: ['hof_notifications'],
    resume: ['hof_notifications']
  },
  licenceNotices: {
    renewal: ['renewal_notifications']
  },
  manageUsers: {
    createAccount: ['manage_accounts']
  },
  returnNotices: {
    adHoc: ['returns'],
    invitations: ['bulk_return_notifications'],
    paperForms: ['returns'],
    reminders: ['bulk_return_notifications']
  },
  viewReports: {
    digitise: ['ar_approver'],
    kpis: [
      'ar_approver',
      'billing',
      'bulk_return_notifications',
      'hof_notifications',
      'manage_accounts',
      'renewal_notifications',
      'returns'
    ],
    notices: ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications', 'returns'],
    returnsCycles: ['returns']
  },
  viewWorkflow: {
    checkLicences: ['charge_version_workflow_editor', 'charge_version_workflow_reviewer']
  }
}

// List derived from the definition above, to make the iteration in the tests simpler
// It just contains the section names and their required scopes, which are the set of distinct scopes of all links
// in the section
const SECTIONS_TO_TEST = Object.entries(REQUIRED_SCOPES_FOR_LINKS).map(([section, sectionLinks]) => {
  const scopesSet = new Set(Object.values(sectionLinks).flat()) // Use a Set to remove duplicates
  const scopes = [...scopesSet]

  // The other scopes, which are not valid for the section, will be used for negative testing
  const otherScopesForThisSection = new Set(ALL_USER_SCOPES).difference(scopesSet)
  const otherScopes = [...otherScopesForThisSection]

  return { section, scopes, otherScopes }
})

// List derived from the definition above, to make the iteration in the tests simpler
// It just contains a flattened set of link names with their section and required scopes
const LINKS_TO_TEST = Object.entries(REQUIRED_SCOPES_FOR_LINKS).flatMap(([section, sectionLinks]) => {
  return Object.entries(sectionLinks).map(([link, scopes]) => {
    // The other scopes, which are not valid for the link, will be used for negative testing
    const otherScopesForThisLink = new Set(ALL_USER_SCOPES).difference(new Set(scopes))
    const otherScopes = [...otherScopesForThisLink]

    return { section, link, scopes, otherScopes }
  })
})

describe('Manage - presenter', () => {
  let featureStubEnableAdHocNotifications
  let userScopes

  beforeEach(() => {
    // Stub feature flag to true - we'll test deactivating it separately
    featureStubEnableAdHocNotifications = Sinon.stub(featureFlags, 'enableAdHocNotifications').value(true)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when provided with the necessary user scopes', () => {
    beforeEach(() => {
      userScopes = [...ALL_USER_SCOPES]
    })
    it('provides the correct items to display', async () => {
      const result = await ManagePresenter.go(userScopes)

      expect(result).to.equal({
        pageTitle: 'Manage reports and notices',
        flowNotices: { links: { handsOffFlow: true, restriction: true, resume: true }, show: true },
        licenceNotices: { links: { renewal: true }, show: true },
        manageUsers: { links: { createAccount: true }, show: true },
        returnNotices: { links: { adHoc: true, invitations: true, paperForms: true, reminders: true }, show: true },
        viewReports: { links: { digitise: true, kpis: true, notices: true, returnsCycles: true }, show: true },
        viewWorkflow: { links: { checkLicences: true }, show: true }
      })
    })
  })

  describe('when the ad-hoc notifications feature flag is not set', () => {
    beforeEach(() => {
      userScopes = ['returns']
      featureStubEnableAdHocNotifications.restore()
      featureStubEnableAdHocNotifications = Sinon.stub(featureFlags, 'enableAdHocNotifications').value(false)
    })

    it('sets the ad-hoc item to not display', async () => {
      const result = await ManagePresenter.go(userScopes)

      expect(result.returnNotices.links.adHoc).to.not.be.true()
    })
  })

  // Tests to ensure the section headings are all correctly displayed - iterates over each section in turn
  SECTIONS_TO_TEST.forEach(({ section, scopes, otherScopes }) => {
    describe(`for the "${section}" section`, () => {
      scopes.forEach((scope) => {
        describe(`when the user has "${scope}" scope`, () => {
          beforeEach(() => {
            userScopes = [scope]
          })

          it('sets the section heading to be displayed', async () => {
            const result = await ManagePresenter.go(userScopes)
            expect(result[section].show).to.be.true()
          })
        })
      })

      describe('when the user has other scopes', () => {
        beforeEach(() => {
          userScopes = otherScopes
        })

        it('sets the section heading to not be displayed', async () => {
          const result = await ManagePresenter.go(userScopes)
          expect(result[section].show).to.not.be.true()
        })
      })
    })
  })

  // Tests to ensure the links within each section are all correctly displayed - iterates over each link in turn
  LINKS_TO_TEST.forEach(({ section, link, scopes, otherScopes }) => {
    describe(`for the "${link}" link in the "${section}" section`, () => {
      scopes.forEach((scope) => {
        describe(`when the user has "${scope}" scope`, () => {
          beforeEach(() => {
            userScopes = [scope]
          })

          it('sets the link to be displayed', async () => {
            const result = await ManagePresenter.go(userScopes)
            expect(result[section].links[link]).to.be.true()
          })
        })
      })

      describe('when the user has other scopes', () => {
        beforeEach(() => {
          userScopes = otherScopes
        })

        it('sets the link to not be displayed', async () => {
          const result = await ManagePresenter.go(userScopes)
          expect(result[section].links[link]).to.not.be.true()
        })
      })
    })
  })
})
