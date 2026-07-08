// Thing under test
import ViewManageService from '../../../app/services/manage/view-manage.service.js'

describe('Manage - View Manage service', () => {
  let userAuth

  describe('when called', () => {
    beforeEach(() => {
      userAuth = { credentials: { scope: ['billing'] } }
    })

    it('returns page data for the view', async () => {
      const result = await ViewManageService(userAuth)

      expect(result).toEqual({
        activeNavBar: 'manage',
        manageUsers: { show: false, links: { createAccount: false } },
        pageTitle: 'Manage',
        viewReports: {
          show: true,
          links: {
            digitise: false,
            invalidAddresses: true,
            kpis: true,
            returnsCycles: false
          }
        },
        viewWorkflow: { show: false, links: { checkLicences: false } }
      })
    })
  })
})
