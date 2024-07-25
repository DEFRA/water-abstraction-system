'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ViewLicencePresenter = require('../../../app/presenters/licences/view-licence.presenter.js')

describe('View Licence presenter', () => {
  let licence
  let auth

  beforeEach(() => {
    licence = _licence()
    auth = undefined
  })

  describe('when provided with a populated licence', () => {
    it('correctly presents the data', () => {
      const result = ViewLicencePresenter.go(licence)

      expect(result).to.equal({
        activeNavBar: 'search',
        documentId: '28665d16-eba3-4c9a-aa55-7ab671b0c4fb',
        ends: null,
        includeInPresrocBilling: 'no',
        licenceId: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
        licenceName: 'Unregistered licence',
        licenceRef: '01/123',
        notification: null,
        pageTitle: 'Licence 01/123',
        registeredTo: null,
        roles: null,
        warning: null,
        workflowWarning: true
      })
    })
  })

  describe('the "licenceName" property', () => {
    describe('when there is no licenceName property', () => {
      it('returns Unregistered licence', () => {
        const result = ViewLicencePresenter.go(licence)

        expect(result.licenceName).to.equal('Unregistered licence')
      })
    })

    describe('when there is a licenceName property', () => {
      beforeEach(() => {
        licence.licenceName = 'example@example.com'
      })

      it('returns a string with the licence name values', () => {
        const result = ViewLicencePresenter.go(licence)

        expect(result.licenceName).to.equal('example@example.com')
      })
    })
  })
  describe('the "registeredTo" property', () => {
    describe('when there is no registeredTo property', () => {
      it('returns null', () => {
        const result = ViewLicencePresenter.go(licence)

        expect(result.registeredTo).to.equal(null)
      })
    })

    describe('when there is a registeredTo property', () => {
      beforeEach(() => {
        licence.registeredTo = 'Company'
      })

      it('returns a string with the registered to name', () => {
        const result = ViewLicencePresenter.go(licence)

        expect(result.registeredTo).to.equal('Company')
      })
    })
  })
  describe('the "warning" property', () => {
    describe('when the licence does not have an end date (expired, lapsed or revoked)', () => {
      it('returns NULL', () => {
        const result = ViewLicencePresenter.go(licence)

        expect(result.warning).to.be.null()
      })
    })

    describe('when the licence does have an end date but it is in the future (expired, lapsed or revoked)', () => {
      beforeEach(() => {
        licence.expiredDate = new Date('2099-04-01')
      })

      it('returns NULL', () => {
        const result = ViewLicencePresenter.go(licence)

        expect(result.warning).to.be.null()
      })
    })

    describe('when the licence ends today or in the past (2019-04-01) because it is expired', () => {
      beforeEach(() => {
        licence.ends = { date: new Date('2019-04-01'), reason: 'expired' }
      })

      it('returns "This licence expired on 1 April 2019"', () => {
        const result = ViewLicencePresenter.go(licence)

        expect(result.warning).to.equal('This licence expired on 1 April 2019')
      })
    })

    describe('when the licence ends today or in the past (2019-04-01) because it is lapsed', () => {
      beforeEach(() => {
        licence.ends = { date: new Date('2019-04-01'), reason: 'lapsed' }
      })

      it('returns "This licence lapsed on 1 April 2019"', () => {
        const result = ViewLicencePresenter.go(licence)

        expect(result.warning).to.equal('This licence lapsed on 1 April 2019')
      })
    })

    describe('when the licence was ends today or in the past (2019-04-01) because it is revoked', () => {
      beforeEach(() => {
        licence.ends = { date: new Date('2019-04-01'), reason: 'revoked' }
      })

      it('returns "This licence was revoked on 1 April 2019"', () => {
        const result = ViewLicencePresenter.go(licence)

        expect(result.warning).to.equal('This licence was revoked on 1 April 2019')
      })
    })
  })

  describe('the workflowWarning property', () => {
    describe('when the licence does not have a workflow', () => {
      beforeEach(() => {
        licence.workflows = []
      })

      it('returns false', () => {
        const result = ViewLicencePresenter.go(licence)

        expect(result.workflowWarning).to.equal(false)
      })
    })

    describe('when the licence has a workflow but the status is not `to_setup`', () => {
      beforeEach(() => {
        licence.workflows[0].status = 'changes_requested'
      })

      it('returns false', () => {
        const result = ViewLicencePresenter.go(licence)

        expect(result.workflowWarning).to.equal(false)
      })
    })

    describe('when the licence has a workflow and the status is `to_setup`', () => {
      beforeEach(() => {
        licence.workflows[0].status = 'to_setup'
      })

      it('returns true', () => {
        const result = ViewLicencePresenter.go(licence)

        expect(result.workflowWarning).to.equal(true)
      })
    })
  })

  describe('the "notification" property', () => {
    describe('when the licence will not be in the next supplementary bill run', () => {
      it('returns NULL', () => {
        const result = ViewLicencePresenter.go(licence)

        expect(result.notification).to.be.null()
      })
    })

    describe('when the licence will be in the next supplementary bill run (PRESROC)', () => {
      beforeEach(() => {
        licence.includeInPresrocBilling = 'yes'
      })

      it('returns the notification for PRESROC', () => {
        const result = ViewLicencePresenter.go(licence)

        expect(result.notification).to.equal('This licence has been marked for the next supplementary bill run for the old charge scheme.')
      })
    })

    describe('when the licence will be in the next supplementary bill run (SROC)', () => {
      beforeEach(() => {
        licence.includeInSrocBilling = true
      })

      it('returns the notification for SROC', () => {
        const result = ViewLicencePresenter.go(licence)

        expect(result.notification).to.equal('This licence has been marked for the next supplementary bill run.')
      })
    })

    describe('when the licence will be in the next supplementary bill run (SROC & PRESROC)', () => {
      beforeEach(() => {
        licence.includeInSrocBilling = true
        licence.includeInPresrocBilling = 'yes'
      })

      it('returns the notification for SROC & PRESROC)', () => {
        const result = ViewLicencePresenter.go(licence)

        expect(result.notification).to.equal('This licence has been marked for the next supplementary bill runs for the current and old charge schemes.')
      })
    })
  })
  describe('the "roles" property', () => {
    describe('when the authenticated user has roles', () => {
      beforeEach(() => {
        auth = {
          credentials: {
            roles: [{
              role: 'role 1'
            },
            {
              role: 'role 2'
            }]
          }
        }
      })

      it('returns the roles in a flat array', () => {
        const result = ViewLicencePresenter.go(licence, auth)

        expect(result.roles).to.equal(['role 1', 'role 2'])
      })
    })
    describe('when the authenticated user has NO roles', () => {
      beforeEach(() => {
        auth = undefined
      })

      it('returns null for the roles', () => {
        const result = ViewLicencePresenter.go(licence, auth)

        expect(result.roles).to.be.null()
      })
    })
  })
})

function _licence () {
  return {
    id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
    ends: null,
    expiredDate: null,
    includeInPresrocBilling: 'no',
    licenceDocumentHeader: { id: '28665d16-eba3-4c9a-aa55-7ab671b0c4fb' },
    licenceGaugingStations: [{
      gaugingStationId: 'ac075651-4781-4e24-a684-b943b98607ca',
      label: 'MEVAGISSEY FIRE STATION'
    }],
    licenceHolder: null,
    licenceName: 'Unregistered licence',
    licenceRef: '01/123',
    permitLicence: {
      purposes: [{
        ANNUAL_QTY: 'null',
        DAILY_QTY: 'null',
        HOURLY_QTY: 'null',
        INST_QTY: 'null',
        purposePoints: [{
          point_detail: {
            NGR1_SHEET: 'TL',
            NGR1_EAST: '23198',
            NGR1_NORTH: '88603'
          },
          point_source: {
            NAME: 'SURFACE WATER SOURCE OF SUPPLY'
          }
        }]
      }]
    },
    region: { displayName: 'Narnia' },
    registeredTo: null,
    startDate: new Date('2019-04-01'),
    workflows: [{ status: 'to_setup' }]
  }
}
