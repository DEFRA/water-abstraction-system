'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../../support/database.js')
const PurposeHelper = require('../../../support/helpers/purpose.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const PermitLicenceHelper = require('../../../support/helpers/permit-licence.helper.js')

// Thing under test
const ReturnRequirementsService = require('../../../../app/services/return-requirements/check/returns-requirements.service.js')

describe('Return Requirements service', () => {
  let licence
  let points
  let purpose
  let requirement
  let session

  beforeEach(async () => {
    await DatabaseSupport.clean()

    purpose = await PurposeHelper.add()

    points = await PermitLicenceHelper.add()

    licence = await LicenceHelper.add({
      licenceRef: points.licenceRef
    })

    requirement = {
      abstractionPeriod: {
        'end-abstraction-period-day': '01',
        'end-abstraction-period-month': '03',
        'start-abstraction-period-day': '01',
        'start-abstraction-period-month': '06'
      },
      agreementsExceptions: [
        'gravity-fill'
      ],
      frequencyCollected: 'daily',
      frequencyReported: 'daily',
      points: [
        '9000031' // Hard coded from teh permit licence data
      ],
      purposes: [
        purpose.id
      ],
      returnsCycle: 'summer',
      siteDescription: 'A place in the sun'
    }
  })

  describe('when the session contains a single requirement', () => {
    beforeEach(() => {
      session = {
        licence: {
          id: licence.id
        },
        data: {
          journey: 'returns-required',
          requirements: [{ ...requirement }]
        }
      }
    })

    it('returns the return requirements data', async () => {
      const result = await ReturnRequirementsService.go(session)

      expect(result).to.equal({
        requirements: [{
          abstractionPeriod: 'From 1 June to 1 March',
          frequencyCollected: 'daily',
          frequencyReported: 'daily',
          index: 0,
          points: [
            'At National Grid Reference TQ 1234 1234 (Test local name)'
          ],
          purposes: [
            'Spray Irrigation - Storage'
          ],
          siteDescription: 'A place in the sun'
        }],
        returnsRequired: true
      })
    })

    describe('and the requirement has points', () => {
      it('returns point data formatted to the abstraction point details format', async () => {
        const result = await ReturnRequirementsService.go(session)

        expect(result.requirements[0].points).to.equal([
          'At National Grid Reference TQ 1234 1234 (Test local name)'
        ])
      })
    })
  })

  describe('when two or more requirements have purpose ids', () => {
    describe('and they are different', () => {
      let purposeAdditional

      beforeEach(async () => {
        purposeAdditional = await PurposeHelper.add({
          description: 'Sunny field'
        })

        session = {
          licence: {
            id: licence.id
          },
          data: {
            journey: 'returns-required',
            requirements: [{ ...requirement }, { ...requirement, purposes: [purposeAdditional.id] }]
          }
        }

        it('returns the first requirement with the correct purpose description ', async () => {
          const result = await ReturnRequirementsService.go(session)

          expect(result.requirements[0].purposes).to.equal(['Spray Irrigation - Storage'])
        })

        it('returns the second requirement with the correct purpose description ', async () => {
          const result = await ReturnRequirementsService.go(session)

          expect(result.requirements[1].purposes).to.equal(['Sunny field'])
        })
      })
    })

    describe('and the description is the same', () => {
      beforeEach(async () => {
        session = {
          licence: {
            id: licence.id
          },
          data: {
            journey: 'returns-required',
            requirements: [{ ...requirement }, { ...requirement }]
          }
        }
      })

      it('returns the requirements with the same description', async () => {
        const result = await ReturnRequirementsService.go(session)

        expect(result.requirements[0].purposes).to.equal(['Spray Irrigation - Storage'])
        expect(result.requirements[1].purposes).to.equal(['Spray Irrigation - Storage'])
      })
    })
  })
})
