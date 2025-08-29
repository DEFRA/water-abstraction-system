'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewManageService = require('../../../app/services/manage/view-manage.service.js')

describe('Manage - View service', () => {
  let userAuth

  describe('when called', () => {
    beforeEach(() => {
      userAuth = { credentials: { scope: ['billing'] } }
    })

    it('returns page data for the view', async () => {
      const result = await ViewManageService.go(userAuth)

      expect(result.pageTitle).to.equal('Manage reports and notices')
      expect(result.activeNavBar).to.equal('manage')
      expect(result.viewReports.show).to.be.true()
      expect(result.viewReports.links.kpis).to.be.true()
    })
  })
})
