'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const LicenceSetUpPresenter = require('../../../app/presenters/licences/licence-set-up.presenter.js')

describe('Licence set up presenter', () => {
  let chargeVersions
  let workflows

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
  })

  describe('when provided with populated licence set up data', () => {
    it('correctly presents the data', () => {
      const result = LicenceSetUpPresenter.go(chargeVersions, workflows)

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
      const result = LicenceSetUpPresenter.go(chargeVersions, [])

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
      const result = LicenceSetUpPresenter.go([], workflows)

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
