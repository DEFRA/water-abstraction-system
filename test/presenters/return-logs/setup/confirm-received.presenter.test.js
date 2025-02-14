'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ConfirmReceivedPresenter = require('../../../../app/presenters/return-logs/setup/confirm-received.presenter.js')

describe('Return Logs - Setup - Confirm Received presenter', () => {
  let returnLog

  beforeEach(() => {
    returnLog = {
      licenceId: '91aff99a-3204-4727-86bd-7bdf3ef24533',
      licenceRef: '01/117',
      returnLogId: 'v1:6:01/117:10032788:2019-04-01:2019-05-12',
      returnReference: '10032788',
      purposes: [
        {
          alias: 'SPRAY IRRIGATION',
          primary: {
            code: 'I',
            description: 'Industrial, Commercial And Public Services'
          },
          tertiary: {
            code: '400',
            description: 'Spray Irrigation - Direct'
          },
          secondary: {
            code: 'GOF',
            description: 'Golf Courses'
          }
        }
      ],
      siteDescription: 'Addington Sandpits'
    }
  })

  describe('when provided with a return log', () => {
    it('correctly presents the data', () => {
      const result = ConfirmReceivedPresenter.go(returnLog)

      expect(result).to.equal({
        licenceId: '91aff99a-3204-4727-86bd-7bdf3ef24533',
        licenceRef: '01/117',
        pageTitle: 'Return 10032788 received',
        purposeDetails: {
          label: 'Purpose',
          value: 'Spray Irrigation - Direct'
        },
        siteDescription: 'Addington Sandpits'
      })
    })
  })

  describe('the "purposeDetails" property', () => {
    describe('when the return log has a single purpose', () => {
      it('returns an object with a label property set to "Purpose" and a value property containing the single purpose', () => {
        const result = ConfirmReceivedPresenter.go(returnLog)

        expect(result.purposeDetails).to.equal({ label: 'Purpose', value: 'Spray Irrigation - Direct' })
      })
    })

    describe('when the return log session has multiple purposes', () => {
      beforeEach(() => {
        returnLog.purposes.push({ tertiary: { code: '420', description: 'Spray Irrigation - Storage' } })
      })

      it('returns an object with a label property set to "Purposes" and a value property containing the comma separated purposes as a string', () => {
        const result = ConfirmReceivedPresenter.go(returnLog)

        expect(result.purposeDetails).to.equal({
          label: 'Purposes',
          value: 'Spray Irrigation - Direct, Spray Irrigation - Storage'
        })
      })
    })
  })
})
