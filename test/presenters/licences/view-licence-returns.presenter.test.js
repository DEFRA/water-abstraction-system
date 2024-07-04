'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ViewLicenceReturnsPresenter = require('../../../app/presenters/licences/view-licence-returns.presenter.js')

describe('View Licence returns presenter', () => {
  let returnsData
  let hasRequirements

  const returnItem = {
    id: 'd5912c1d-3928-48e9-b2fc-e99a96d704a3',
    dueDate: new Date('2012-11-28'),
    status: 'completed',
    startDate: new Date('2020/01/02'),
    endDate: new Date('2020/02/01'),
    metadata: {
      purposes: [
        {
          alias: 'SPRAY IRRIGATION',
          primary: {
            code: 'A',
            description: 'Agriculture'
          },
          tertiary: {
            code: '400',
            description: 'Spray Irrigation - Direct'
          },
          secondary: {
            code: 'AGR',
            description: 'General Agriculture'
          }
        }
      ],
      description: 'empty description'
    },
    returnReference: '1068'
  }

  beforeEach(() => {
    hasRequirements = true
    returnsData = [
      { ...returnItem },
      {
        ...returnItem,
        id: '2fb6d1be-5d56-45de-a252-3c1e8a955991',
        status: 'due',
        returnReference: '1069'
      }
    ]
  })

  describe('when provided with returns data', () => {
    it('correctly presents the data', () => {
      const result = ViewLicenceReturnsPresenter.go(returnsData, hasRequirements)

      expect(result).to.equal({
        activeTab: 'returns',
        noReturnsMessage: null,
        returns: [
          {
            dates: '2 January 2020 to 1 February 2020',
            description: 'empty description',
            dueDate: '28 November 2012',
            id: 'd5912c1d-3928-48e9-b2fc-e99a96d704a3',
            link: '/returns/return?id=d5912c1d-3928-48e9-b2fc-e99a96d704a3',
            purpose: 'SPRAY IRRIGATION',
            reference: '1068',
            status: 'complete'
          },
          {
            dates: '2 January 2020 to 1 February 2020',
            description: 'empty description',
            dueDate: '28 November 2012',
            id: '2fb6d1be-5d56-45de-a252-3c1e8a955991',
            link: '/return/internal?returnId=2fb6d1be-5d56-45de-a252-3c1e8a955991',
            purpose: 'SPRAY IRRIGATION',
            reference: '1069',
            status: 'overdue'
          }
        ]
      })
    })
  })

  describe('the "noReturnsMessage" property', () => {
    describe('when a licence has returns and requirements', () => {
      it('returns null', () => {
        const result = ViewLicenceReturnsPresenter.go(returnsData, hasRequirements)

        expect(result.noReturnsMessage).to.be.null()
      })
    })

    describe('when a licence has NO requirements and NO returns', () => {
      beforeEach(() => {
        returnsData = []
        hasRequirements = false
      })

      it('returns the message "No requirements for returns have been set up for this licence."', () => {
        const result = ViewLicenceReturnsPresenter.go(returnsData, hasRequirements)

        expect(result.noReturnsMessage).to.equal('No requirements for returns have been set up for this licence.')
      })
    })

    describe('when a licence has requirements but NO returns', () => {
      beforeEach(() => {
        returnsData = []
      })

      it('returns the message "No returns for this licence."', () => {
        const result = ViewLicenceReturnsPresenter.go(returnsData, hasRequirements)

        expect(result.noReturnsMessage).to.equal('No returns for this licence.')
      })
    })
  })
})
