'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceModel = require('../../../app/models/licence.model.js')

// Thing under test
const ViewLicencePresenter = require('../../../app/presenters/licences/view-licence.presenter.js')

describe('View Licence presenter', () => {
  let auth
  let licence

  beforeEach(() => {
    auth = _auth()
    licence = _licence()
  })

  describe('when provided with a populated licence', () => {
    it('correctly presents the data', () => {
      const result = ViewLicencePresenter.go(licence, auth)

      expect(result).to.equal({
        documentId: 'e8f491f0-0c60-4083-9d41-d2be69f17a1e',
        licenceId: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
        licenceName: 'Between two ferns',
        licenceRef: '01/123',
        notification: null,
        pageTitle: 'Licence 01/123',
        primaryUser: {
          id: 10036,
          username: 'grace.hopper@example.co.uk'
        },
        roles: ['billing', 'view_charge_versions'],
        warning: null,
        workflowWarning: true
      })
    })
  })

  describe('the "licenceName" property', () => {
    describe('when the primary user has added a custom name for the licence', () => {
      it('returns the licence name', () => {
        const result = ViewLicencePresenter.go(licence, auth)

        expect(result.licenceName).to.equal('Between two ferns')
      })
    })

    describe('when the primary user has not added a custom name for the licence', () => {
      beforeEach(() => {
        licence.licenceDocumentHeader.licenceName = null
      })

      it('returns "Unregistered licence"', () => {
        const result = ViewLicencePresenter.go(licence, auth)

        expect(result.licenceName).to.equal('Unregistered licence')
      })
    })
  })

  describe('the "notification" property', () => {
    describe('when the licence has NOT been flagged for either supplementary bill run', () => {
      it('returns "null"', () => {
        const result = ViewLicencePresenter.go(licence, auth)

        expect(result.notification).to.be.null()
      })
    })

    describe('when the licence has been flagged just for the next PRESROC supplementary bill run', () => {
      beforeEach(() => {
        licence.includeInPresrocBilling = 'yes'
      })

      it('returns a notification just for the "old charge scheme"', () => {
        const result = ViewLicencePresenter.go(licence, auth)

        expect(result.notification).to.equal('This licence has been marked for the next supplementary bill run for the old charge scheme.')
      })
    })

    describe('when the licence has been flagged just for the next SROC supplementary bill run', () => {
      beforeEach(() => {
        licence.includeInSrocBilling = true
      })

      it('returns a notification just for the current charge scheme', () => {
        const result = ViewLicencePresenter.go(licence, auth)

        expect(result.notification).to.equal('This licence has been marked for the next supplementary bill run.')
      })
    })

    describe('when the licence has been flagged for the next PRESROC & SROC supplementary bill runs', () => {
      beforeEach(() => {
        licence.includeInPresrocBilling = 'yes'
        licence.includeInSrocBilling = true
      })

      it('returns a notification just for both charge schemes', () => {
        const result = ViewLicencePresenter.go(licence, auth)

        expect(result.notification).to.equal('This licence has been marked for the next supplementary bill runs for the current and old charge schemes.')
      })
    })
  })

  describe('the "roles" property', () => {
    describe('when the authenticated user has roles', () => {
      it('returns the roles names as an array', () => {
        const result = ViewLicencePresenter.go(licence, auth)

        expect(result.roles).to.equal(['billing', 'view_charge_versions'])
      })
    })

    describe('when the authenticated user has no roles', () => {
      beforeEach(() => {
        auth.credentials.roles = []
      })

      it('returns an empty array', () => {
        const result = ViewLicencePresenter.go(licence, auth)

        expect(result.roles).to.be.empty()
      })
    })
  })

  describe('the "warning" property', () => {
    describe('when the licence does not have an "end" date', () => {
      it('returns null', () => {
        const result = ViewLicencePresenter.go(licence, auth)

        expect(result.warning).to.be.null()
      })
    })

    describe('when the licence does have an "end" date', () => {
      describe('but it is in the future', () => {
        beforeEach(() => {
          licence.expiredDate = new Date('2099-04-01')
        })

        it('returns null', () => {
          const result = ViewLicencePresenter.go(licence, auth)

          expect(result.warning).to.be.null()
        })
      })

      describe('because it expired in the past', () => {
        beforeEach(() => {
          licence.expiredDate = new Date('2019-04-01')
        })

        it('returns "This licence expired on 1 April 2019"', () => {
          const result = ViewLicencePresenter.go(licence, auth)

          expect(result.warning).to.equal('This licence expired on 1 April 2019')
        })
      })

      describe('because it lapsed in the past', () => {
        beforeEach(() => {
          licence.lapsedDate = new Date('2019-04-01')
        })

        it('returns "This licence lapsed on 1 April 2019"', () => {
          const result = ViewLicencePresenter.go(licence, auth)

          expect(result.warning).to.equal('This licence lapsed on 1 April 2019')
        })
      })

      describe('because it was revoked in the past', () => {
        beforeEach(() => {
          licence.revokedDate = new Date('2019-04-01')
        })

        it('returns "This licence was revoked on 1 April 2019"', () => {
          const result = ViewLicencePresenter.go(licence, auth)

          expect(result.warning).to.equal('This licence was revoked on 1 April 2019')
        })
      })
    })
  })

  describe('the "workflowWarning" property', () => {
    describe('when the licence is not in workflow', () => {
      beforeEach(() => {
        licence.workflows = []
      })

      it('returns false', () => {
        const result = ViewLicencePresenter.go(licence, auth)

        expect(result.workflowWarning).to.be.false()
      })
    })

    describe('when the licence is in workflow', () => {
      describe('but the status is not "to_setup"', () => {
        beforeEach(() => {
          licence.workflows[0].status = 'changes_requested'
        })

        it('returns false', () => {
          const result = ViewLicencePresenter.go(licence, auth)

          expect(result.workflowWarning).to.be.false()
        })
      })

      describe('and the status is "to_setup"', () => {
        it('returns true', () => {
          const result = ViewLicencePresenter.go(licence, auth)

          expect(result.workflowWarning).to.be.true()
        })
      })
    })
  })
})

function _auth () {
  return {
    credentials: {
      roles: [
        {
          id: 'b62afe79-d599-4101-b374-729011711462',
          role: 'billing',
          description: 'Administer billing',
          createdAt: new Date('2023-12-14'),
          updatedAt: new Date('2024-08-19')
        },
        {
          id: '02b09477-8c1e-4f9a-956c-ad18f9d4f222',
          role: 'view_charge_versions',
          description: 'View charge information',
          createdAt: new Date('2023-12-14'),
          updatedAt: new Date('2024-08-19')
        }
      ]
    }
  }
}

function _licence () {
  const licence = LicenceModel.fromJson({
    id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
    expiredDate: null,
    lapsedDate: null,
    includeInPresrocBilling: 'no',
    includeInSrocBilling: false,
    licenceRef: '01/123',
    revokedDate: null,
    licenceDocumentHeader: {
      id: 'e8f491f0-0c60-4083-9d41-d2be69f17a1e',
      licenceName: 'Between two ferns',
      licenceEntityRole: {
        id: 'd7eecfc1-7afa-49f7-8bef-5dc477696a2d',
        licenceEntity: {
          id: 'ba7702cf-cd87-4419-a04c-8cea4e0cfdc2',
          user: {
            id: 10036,
            username: 'grace.hopper@example.co.uk'
          }
        }
      }
    },
    workflows: [{ id: 'b6f44c94-25e4-4ca8-a7db-364534157ba7', status: 'to_setup' }]
  })

  return licence
}
