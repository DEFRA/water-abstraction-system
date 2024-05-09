'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const LicenceHolderSeeder = require('../../support/seeders/licence-holder.seeder.js')

// Thing under test
const InitiateSessionService = require('../../../app/services/return-requirements/initiate-session.service.js')

describe('Initiate Session service', () => {
  let journey
  let licence

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when called', () => {
    describe('and the licence exists', () => {
      beforeEach(async () => {
        // Create the licence record with an 'end' date so we can confirm the session gets populated with the licence's
        // 'ends' information
        licence = await LicenceHelper.add({ expiredDate: new Date('2024-08-10'), licenceRef: '01/ABC' })

        // Create 2 licence versions so we can test the service only gets the 'current' version
        await LicenceVersionHelper.add({
          licenceId: licence.id, startDate: new Date('2021-10-11'), status: 'superseded'
        })
        await LicenceVersionHelper.add({
          licenceId: licence.id, startDate: new Date('2022-05-01')
        })

        // Create a licence holder for the licence with the default name 'Licence Holder Ltd'
        await LicenceHolderSeeder.seed(licence.licenceRef)

        journey = 'returns-required'
      })

      it('creates a new session record containing details of the licence', async () => {
        const result = await InitiateSessionService.go(licence.id, journey)

        const { data } = result

        expect(data).to.equal({
          checkYourAnswersVisited: false,
          licence: {
            id: licence.id,
            currentVersionStartDate: new Date('2022-05-01'),
            endDate: new Date('2024-08-10'),
            licenceRef: '01/ABC',
            licenceHolder: 'Licence Holder Ltd',
            startDate: new Date('2022-01-01')
          },
          journey: 'returns-required',
          requirements: [{}]
        }, { skip: ['id'] })
      })
    })

    describe('but the licence does not exist', () => {
      it('throws a Boom not found error', async () => {
        const error = await expect(InitiateSessionService.go('e456e538-4d55-4552-84f7-6a7636eb1945', 'journey')).to.reject()

        expect(error.isBoom).to.be.true()
        expect(error.data).to.equal({ id: 'e456e538-4d55-4552-84f7-6a7636eb1945' })

        const { statusCode, error: errorType, message } = error.output.payload

        expect(statusCode).to.equal(404)
        expect(errorType).to.equal('Not Found')
        expect(message).to.equal('Licence for new return requirement not found')
      })
    })
  })
})
