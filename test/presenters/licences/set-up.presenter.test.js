'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const SetUpPresenter = require('../../../app/presenters/licences/set-up.presenter.js')

describe('Licence Set Up presenter', () => {
  const chargeVersion = {
    id: '0d514aa4-1550-46b1-8195-878957f2a5f8',
    startDate: new Date('2020-01-01'),
    endDate: new Date('2020-09-01'),
    status: 'current',
    changeReason: { description: 'Major change' },
    licenceId: 'f91bf145-ce8e-481c-a842-4da90348062b'
  }
  const workflow = {
    id: 'f547f465-0a62-45ff-9909-38825f05e0c4',
    createdAt: new Date('2020-01-01'),
    status: 'review',
    data: { chargeVersion: { changeReason: { description: 'changed something' } } },
    licenceId: 'f91bf145-ce8e-481c-a842-4da90348062b'
  }

  let auth
  let chargeVersions
  let commonData
  let workflows

  beforeEach(() => {
    auth = {
      isValid: true,
      credentials: {
        user: { id: 123 },
        roles: ['billing', 'charge_version_workflow_editor'],
        groups: [],
        scope: ['billing', 'charge_version_workflow_editor'],
        permissions: { abstractionReform: false, billRuns: true, manage: true }
      }
    }

    commonData = { licenceId: 'f91bf145-ce8e-481c-a842-4da90348062b' }
  })

  describe('when provided with populated licence set up data', () => {
    describe('that includes both charge versions and workflows', () => {
      beforeEach(() => {
        chargeVersions = [{ ...chargeVersion }]
        workflows = [{ ...workflow }]
      })

      it("groups both types of data into the 'chargeInformation' property", () => {
        const result = SetUpPresenter.go(chargeVersions, workflows, auth, commonData)

        expect(result).to.equal({
          chargeInformation: [
            {
              action: [],
              id: 'f547f465-0a62-45ff-9909-38825f05e0c4',
              startDate: '1 January 2020',
              endDate: '-',
              status: 'review',
              reason: 'changed something'
            },
            {
              action: [{
                link: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/charge-information/0d514aa4-1550-46b1-8195-878957f2a5f8/view',
                text: 'View'
              }],
              id: '0d514aa4-1550-46b1-8195-878957f2a5f8',
              startDate: '1 January 2020',
              endDate: '1 September 2020',
              status: 'approved',
              reason: 'Major change'
            }
          ],
          makeLicenceNonChargeable: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/charge-information/non-chargeable-reason?start=1',
          setupNewCharge: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/charge-information/create'
        })
      })
    })

    describe('that includes charge versions', () => {
      beforeEach(() => {
        workflows = []
      })

      describe('where the end date is not populated', () => {
        beforeEach(() => {
          chargeVersions = [{ ...chargeVersion }]
          chargeVersions[0].endDate = null
        })

        it('correctly presents the data with a dash for the end date', () => {
          const result = SetUpPresenter.go(chargeVersions, workflows, auth, commonData)

          expect(result).to.equal({
            chargeInformation: [{
              action: [{
                link: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/charge-information/0d514aa4-1550-46b1-8195-878957f2a5f8/view',
                text: 'View'
              }],
              id: '0d514aa4-1550-46b1-8195-878957f2a5f8',
              startDate: '1 January 2020',
              endDate: '-',
              status: 'approved',
              reason: 'Major change'
            }],
            makeLicenceNonChargeable: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/charge-information/non-chargeable-reason?start=1',
            setupNewCharge: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/charge-information/create'
          })
        })
      })

      describe('where the end date is populated', () => {
        beforeEach(() => {
          chargeVersions = [{ ...chargeVersion }]
        })

        it('correctly presents the data with the end date', () => {
          const result = SetUpPresenter.go(chargeVersions, workflows, auth, commonData)

          expect(result).to.equal({
            chargeInformation: [{
              action: [{
                link: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/charge-information/0d514aa4-1550-46b1-8195-878957f2a5f8/view',
                text: 'View'
              }],
              id: '0d514aa4-1550-46b1-8195-878957f2a5f8',
              startDate: '1 January 2020',
              endDate: '1 September 2020',
              status: 'approved',
              reason: 'Major change'
            }],
            makeLicenceNonChargeable: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/charge-information/non-chargeable-reason?start=1',
            setupNewCharge: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/charge-information/create'
          })
        })
      })
    })

    describe('that includes workflow records', () => {
      beforeEach(() => {
        chargeVersions = []
      })

      describe("that have a status of 'review'", () => {
        beforeEach(() => {
          workflows = [{ ...workflow }]
        })

        describe('and the user is permitted to review workflow records', () => {
          beforeEach(() => {
            auth.credentials.scope = ['billing', 'charge_version_workflow_reviewer']
          })

          it('correctly presents the data and workflow actions', () => {
            const result = SetUpPresenter.go(chargeVersions, workflows, auth, commonData)

            expect(result).to.equal({
              chargeInformation: [{
                action: [{
                  link: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/charge-information/f547f465-0a62-45ff-9909-38825f05e0c4/review',
                  text: 'Review'
                }],
                id: 'f547f465-0a62-45ff-9909-38825f05e0c4',
                startDate: '1 January 2020',
                endDate: '-',
                status: 'review',
                reason: 'changed something'
              }]
            })
          })
        })

        describe('and the user is not permitted to review workflow records', () => {
          it('correctly presents the data and workflow actions', () => {
            const result = SetUpPresenter.go(chargeVersions, workflows, auth, commonData)

            expect(result).to.equal({
              chargeInformation: [{
                action: [],
                id: 'f547f465-0a62-45ff-9909-38825f05e0c4',
                startDate: '1 January 2020',
                endDate: '-',
                status: 'review',
                reason: 'changed something'
              }],
              makeLicenceNonChargeable: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/charge-information/non-chargeable-reason?start=1',
              setupNewCharge: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/charge-information/create'
            })
          })
        })
      })

      describe("that have a status of 'to_setup'", () => {
        beforeEach(() => {
          workflows = [{ ...workflow }]
          workflows[0].status = 'to_setup'
        })

        describe('and the user is permitted to edit workflow records', () => {
          beforeEach(() => {
            auth.credentials.scope = ['billing', 'charge_version_workflow_reviewer']
          })

          it('correctly presents the data and workflow actions', () => {
            const result = SetUpPresenter.go(chargeVersions, workflows, auth, commonData)

            expect(result).to.equal({
              chargeInformation: [{
                action: [{
                  link: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/charge-information/f547f465-0a62-45ff-9909-38825f05e0c4/review',
                  text: 'Review'
                }],
                id: 'f547f465-0a62-45ff-9909-38825f05e0c4',
                startDate: '1 January 2020',
                endDate: '-',
                status: 'to set up',
                reason: 'changed something'
              }]
            })
          })
        })

        describe('and the user is not permitted to edit workflow records', () => {
          beforeEach(() => {
            auth.credentials.scope = ['billing']
          })

          it('correctly presents the data and workflow actions', () => {
            const result = SetUpPresenter.go(chargeVersions, workflows, auth, commonData)

            expect(result).to.equal({
              chargeInformation: [{
                action: [],
                id: 'f547f465-0a62-45ff-9909-38825f05e0c4',
                startDate: '1 January 2020',
                endDate: '-',
                status: 'to set up',
                reason: 'changed something'
              }]
            })
          })
        })
      })
    })

    describe("where the licence 'ends' more than 6 years ago", () => {
      beforeEach(() => {
        const sixYearsAndOneDayAgo = new Date()
        sixYearsAndOneDayAgo.setDate(sixYearsAndOneDayAgo.getDate() - 1)
        sixYearsAndOneDayAgo.setFullYear(sixYearsAndOneDayAgo.getFullYear() - 6)

        commonData.ends = sixYearsAndOneDayAgo

        chargeVersions = []
        workflows = [{ ...workflow }]
      })

      it('returns no links for editing', () => {
        const result = SetUpPresenter.go(chargeVersions, workflows, auth, commonData)

        expect(result.makeLicenceNonChargeable).to.be.undefined()
        expect(result.setupNewCharge).to.be.undefined()
      })
    })
  })
})
