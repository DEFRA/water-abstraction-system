'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewManageService = require('../../../app/services/manage/view-manage.service.js')

describe('Manage - View Manage service', () => {
  let userAuth

  describe('when called', () => {
    beforeEach(() => {
      userAuth = { credentials: { scope: ['billing'] } }
    })

    it('returns page data for the view', async () => {
      const result = await ViewManageService.go(userAuth)

      expect(result).to.equal({
        activeNavBar: 'manage',
        manageUsers: { show: false, links: { createAccount: false } },
        pageTitle: 'Manage reports and notices',
        returnNotices: {
          show: false,
          links: {
            invitations: false,
            paperForms: false,
            reminders: false,
            adHoc: false
          }
        },
        viewReports: {
          show: true,
          links: {
            digitise: false,
            invalidAddresses: true,
            kpis: true,
            notices: false,
            returnsCycles: false
          }
        },
        viewWorkflow: { show: false, links: { checkLicences: false } }
      })
    })
  })
})
