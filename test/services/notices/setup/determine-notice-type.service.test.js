'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const DetermineNoticeTypeService = require('../../../../app/services/notices/setup/determine-notice-type.service.js')

describe('Notices - Setup - Determine Notice Type service', () => {
  describe('when called', () => {
    describe('and the "notificationType" is "invitations"', () => {
      it('creates a new session record', () => {
        const result = DetermineNoticeTypeService.go('invitations')

        expect(result).to.equal({
          name: 'Returns: invitation',
          noticeType: 'invitations',
          notificationType: 'Returns invitation',
          referenceCode: result.referenceCode, // randomly generated
          subType: 'returnInvitation'
        })
      })

      describe('the "referenceCode" property', () => {
        it('returns a reference code for "invitations" notifications', () => {
          const result = DetermineNoticeTypeService.go('invitations')

          expect(result.referenceCode).to.include('RINV-')
          expect(result.referenceCode.length).to.equal(11)
        })
      })
    })

    describe('and the "notificationType" is "paper-forms"', () => {
      it('creates a new session record', () => {
        const result = DetermineNoticeTypeService.go('paper-forms')

        expect(result).to.equal({
          name: 'Paper returns',
          noticeType: 'paper-forms',
          notificationType: 'Paper invitation',
          referenceCode: result.referenceCode, // randomly generated
          subType: 'paperReturnForms'
        })
      })

      describe('the "referenceCode" property', () => {
        it('returns a reference code for "invitations" notifications', () => {
          const result = DetermineNoticeTypeService.go('paper-forms')

          expect(result.referenceCode).to.include('PRTF-')
          expect(result.referenceCode.length).to.equal(11)
        })
      })
    })

    describe('and the "notificationType" is "reminders"', () => {
      it('creates a new session record', () => {
        const result = DetermineNoticeTypeService.go('reminders')

        expect(result).to.equal({
          name: 'Returns: reminder',
          noticeType: 'reminders',
          notificationType: 'Returns reminder',
          referenceCode: result.referenceCode, // randomly generated
          subType: 'returnReminder'
        })
      })

      describe('the "referenceCode" property', () => {
        it('returns a reference code for "reminders" notifications', () => {
          const result = DetermineNoticeTypeService.go('reminders')

          expect(result.referenceCode).to.include('RREM-')
          expect(result.referenceCode.length).to.equal(11)
        })
      })
    })

    describe('when the "notificationType" is "abstraction-alert"', () => {
      it('creates a new session record', () => {
        const result = DetermineNoticeTypeService.go('abstraction-alert')

        expect(result).to.equal({
          name: 'Water abstraction alert',
          noticeType: 'abstraction-alert',
          notificationType: 'Abstraction alert',
          referenceCode: result.referenceCode, // randomly generated
          subType: 'waterAbstractionAlerts'
        })
      })

      describe('the "referenceCode" property', () => {
        it('returns a reference code for an "abstraction-alert" notification', () => {
          const result = DetermineNoticeTypeService.go('abstraction-alert')

          expect(result.referenceCode).to.include('WAA-')
          expect(result.referenceCode.length).to.equal(10)
        })
      })
    })
  })
})
