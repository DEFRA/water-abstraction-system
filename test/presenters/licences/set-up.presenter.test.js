'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code
const Sinon = require('sinon')

// Thing under test
const SetUpPresenter = require('../../../app/presenters/licences/set-up.presenter.js')

describe('Licence set up presenter', () => {
  const licence = {
    id: 123
  }
  const now = new Date('2022-01-02')

  let chargeVersions
  let clock
  let workflows
  let auth = {}

  beforeEach(() => {
    chargeVersions = [{
      id: '123',
      startDate: new Date('2020-01-01'),
      endDate: new Date('2020-09-01'),
      status: 'current',
      changeReason: { description: 'Missing thing' },
      licenceId: '456'
    }]

    workflows = [{
      id: '123',
      createdAt: new Date('2020-01-01'),
      status: 'review',
      data: { chargeVersion: { changeReason: { description: 'changed something' } } },
      licenceId: '456'
    }]

    clock = Sinon.useFakeTimers(now.getTime())
  })

  afterEach(() => {
    clock.restore()
  })

  describe('when provided with populated licence set up data', () => {
    it('correctly presents the data', () => {
      const result = SetUpPresenter.go(chargeVersions, workflows, auth, licence)

      expect(result).to.equal({
        chargeInformation: [
          {
            action: [],
            id: '123',
            startDate: '1 January 2020',
            endDate: '-',
            status: 'review',
            reason: 'changed something'
          },
          {
            action: [
              {
                link: '/licences/456/charge-information/123/view',
                text: 'View'
              }
            ],
            id: '123',
            startDate: '1 January 2020',
            endDate: '1 September 2020',
            status: 'approved',
            reason: 'Missing thing'
          }
        ]
      })
    })
  })

  describe('when provided with populated licence set up data with only the charge versions', () => {
    it('correctly presents the charge version data', () => {
      const result = SetUpPresenter.go(chargeVersions, [], auth, licence)

      expect(result).to.equal({
        chargeInformation: [
          {
            action: [
              {
                link: '/licences/456/charge-information/123/view',
                text: 'View'
              }
            ],
            id: '123',
            startDate: '1 January 2020',
            endDate: '1 September 2020',
            status: 'approved',
            reason: 'Missing thing'
          }
        ]
      })
    })
  })

  describe('when provided with populated licence set up data with only the workflows', () => {
    it('correctly presents the workflows data', () => {
      const result = SetUpPresenter.go([], workflows, auth, licence)

      expect(result).to.equal({
        chargeInformation: [
          {
            action: [],
            endDate: '-',
            id: '123',
            reason: 'changed something',
            startDate: '1 January 2020',
            status: 'review'
          }
        ]
      })
    })

    describe('user is authorised to edit the workflow', () => {
      beforeEach(() => {
        auth = {
          credentials: {
            scope: ['charge_version_workflow_editor']
          }
        }

        workflows[0].status = 'to_setup'
        licence.startDate = '2020-01-01'
      })

      it('populates the \'action\' with the data for a user who can edit a charge version workflow and the \'status\' is to set up', () => {
        const result = SetUpPresenter.go([], workflows, auth, licence)
        expect(result.chargeInformation[0].action).to.equal(
          [
            {
              link: '/licences/456/charge-information/create?chargeVersionWorkflowId=123',
              text: 'Set up'
            },
            {
              link: '/charge-information-workflow/123/remove',
              text: 'Remove'
            }
          ]
        )
      })
      it('populates the \'makeLicenceNonChargeable\'  and \'setupNewCharge\' links ', () => {
        const result = SetUpPresenter.go([], workflows, auth, licence)

        expect(result.makeLicenceNonChargeable).to.equal('/licences/123/charge-information/non-chargeable-reason?start=1')
        expect(result.setupNewCharge).to.equal('/licences/123/charge-information/create')
      })
    })

    describe('user is authorised to review the workflow', () => {
      beforeEach(() => {
        auth = {
          credentials: {
            scope: ['charge_version_workflow_reviewer']
          }
        }

        workflows[0].status = 'review'
      })

      it('populates the \'action\' with the data for a user who can review a charge version', () => {
        const result = SetUpPresenter.go([], workflows, auth, licence)

        expect(result).to.equal({
          chargeInformation: [
            {
              action: [
                {
                  link: '/licences/456/charge-information/123/review',
                  text: 'Review'
                }
              ],
              endDate: '-',
              id: '123',
              reason: 'changed something',
              startDate: '1 January 2020',
              status: 'review'
            }
          ]
        })
      })
    })
    describe('user is not authorised', () => {
      beforeEach(() => {
        auth = {}
      })

      it('populates the \'action\' as empty if the user is not authorised', () => {
        const result = SetUpPresenter.go([], workflows, auth, licence)

        expect(result).to.equal({
          chargeInformation: [
            {
              action: [],
              endDate: '-',
              id: '123',
              reason: 'changed something',
              startDate: '1 January 2020',
              status: 'review'
            }
          ]
        })
      })
    })
  })

  describe('when provided with populated licence set up data with a start date before or after six years', () => {
    beforeEach(() => {
      auth = {
        credentials: {
          scope: ['charge_version_workflow_editor']
        }
      }
    })

    describe('user is authorised to edit the workflow and the licence is less than 6 years old', () => {
      beforeEach(() => {
        licence.startDate = '2020-01-01'
      })

      it('populates the \'makeLicenceNonChargeable\'  and \'setupNewCharge\' links ', () => {
        const result = SetUpPresenter.go([], workflows, auth, licence)

        expect(result.makeLicenceNonChargeable).to.equal('/licences/123/charge-information/non-chargeable-reason?start=1')
        expect(result.setupNewCharge).to.equal('/licences/123/charge-information/create')
      })
    })

    describe('user is authorised to edit the workflow and the licence is more than 6 years old', () => {
      beforeEach(() => {
        licence.startDate = '1990-01-01'
      })

      it('no links should be present', () => {
        const result = SetUpPresenter.go([], workflows, auth, licence)

        expect(result.makeLicenceNonChargeable).to.be.undefined()
        expect(result.setupNewCharge).to.be.undefined()
      })
    })
  })
})
