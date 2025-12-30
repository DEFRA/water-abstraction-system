'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const DetermineSearchItemsService = require('../../../app/services/search/determine-search-items.service.js')

describe('Search - Determine Search Items service', () => {
  let selectedResultType
  let query
  let userScopes

  describe('when called', () => {
    beforeEach(() => {
      selectedResultType = 'all'
      query = '12345678'
      userScopes = ['billing']
    })

    it('returns the correct list', () => {
      const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)

      expect(result).to.equal(['billingAccount', 'licenceHolder', 'licence', 'monitoringStation', 'returnLog', 'user'])
    })
  })

  describe('when billing accounts are requested', () => {
    beforeEach(() => {
      selectedResultType = 'billingAccount'
      query = 'A12345678A'
      userScopes = ['billing']
    })

    it('returns only the billing account type', () => {
      const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)
      expect(result).to.equal(['billingAccount'])
    })
  })

  describe('when licences holders are requested', () => {
    beforeEach(() => {
      selectedResultType = 'licenceHolder'
      query = 'Walker'
      userScopes = []
    })

    it('returns only the licence holder type', () => {
      const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)
      expect(result).to.equal(['licenceHolder'])
    })
  })

  describe('when licences are requested', () => {
    beforeEach(() => {
      selectedResultType = 'licence'
      query = '12345678'
      userScopes = []
    })

    it('returns only the licence type', () => {
      const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)
      expect(result).to.equal(['licence'])
    })
  })

  describe('when monitoring stations are requested', () => {
    beforeEach(() => {
      selectedResultType = 'monitoringStation'
      query = '12345678'
      userScopes = []
    })

    it('returns only the monitoring station type', () => {
      const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)
      expect(result).to.equal(['monitoringStation'])
    })
  })

  describe('when return logs are requested', () => {
    beforeEach(() => {
      selectedResultType = 'returnLog'
      query = '12345678'
      userScopes = []
    })

    it('returns only the return log type', () => {
      const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)
      expect(result).to.equal(['returnLog'])
    })
  })

  describe('when users are requested', () => {
    beforeEach(() => {
      selectedResultType = 'user'
      query = 'a@bb.com'
      userScopes = []
    })

    it('returns only the user type', () => {
      const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)

      expect(result).to.equal(['user'])
    })
  })

  describe('when the user does not have scope for billing account searches', () => {
    beforeEach(() => {
      query = 'A12345678A'
      userScopes = ['not-billing']
    })

    describe('and the user has requested billing accounts', () => {
      beforeEach(() => {
        selectedResultType = 'billingAccount'
      })

      it('returns no search types', () => {
        const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)

        expect(result).to.equal([])
      })
    })

    describe('and the user has requested all types', () => {
      beforeEach(() => {
        selectedResultType = 'all'
      })

      it('returns search types that do not include billing accounts', () => {
        const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)

        expect(result).to.not.include('billingAccount')
      })
    })
  })

  describe('when the user has scope for billing account searches', () => {
    beforeEach(() => {
      query = 'A12345678A'
      userScopes = ['billing']
    })

    describe('and billing accounts are requested', () => {
      beforeEach(() => {
        selectedResultType = 'billingAccount'
      })

      it('returns the billing account type', () => {
        const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)

        expect(result).to.equal(['billingAccount'])
      })
    })

    describe('and the user has requested all types', () => {
      beforeEach(() => {
        selectedResultType = 'all'
      })

      it('returns the billing account type', () => {
        const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)

        expect(result).to.include('billingAccount')
      })
    })

    describe('but billing accounts are not requested', () => {
      beforeEach(() => {
        selectedResultType = 'monitoringStation'
      })

      it('does not return the billing account type', () => {
        const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)

        expect(result).to.not.include('billingAccount')
      })
    })
  })

  describe('when the search is valid for a billing account reference', () => {
    beforeEach(() => {
      selectedResultType = 'billingAccount'
      userScopes = ['billing']
    })

    describe('because it can be part of a billing account reference', () => {
      beforeEach(() => {
        query = 'A1'
      })

      it('returns the billing account type', () => {
        const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)

        expect(result).to.include('billingAccount')
      })
    })

    describe('because it matches the full billing account reference', () => {
      beforeEach(() => {
        query = 'A12345678A'
      })

      it('returns the billing account type', () => {
        const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)

        expect(result).to.include('billingAccount')
      })
    })
  })

  describe('when the search is not valid for a billing account reference', () => {
    beforeEach(() => {
      selectedResultType = 'billingAccount'
      userScopes = ['billing']
    })

    describe('because it includes characters that are not allowed', () => {
      beforeEach(() => {
        query = 'X'
      })

      it('does not return the billing account type', () => {
        const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)

        expect(result).to.not.include('billingAccount')
      })
    })

    describe('because it is too long', () => {
      beforeEach(() => {
        query = 'A1234567890A'
      })

      it('does not return the billing account type', () => {
        const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)

        expect(result).to.not.include('billingAccount')
      })
    })

    describe('because it does not match the full format', () => {
      beforeEach(() => {
        query = 'A12345678B'
      })

      it('does not return the billing account type', () => {
        const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)

        expect(result).to.not.include('billingAccount')
      })
    })
  })

  describe('when the search is valid for a licence reference', () => {
    beforeEach(() => {
      selectedResultType = 'licence'
      userScopes = []
    })

    describe('because it can be part of a licence reference', () => {
      beforeEach(() => {
        query = '12/34'
      })

      it('returns the licence type', () => {
        const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)

        expect(result).to.include('licence')
      })
    })

    describe('because it is a full numeric licence reference', () => {
      beforeEach(() => {
        query = '1234567890'
      })

      it('returns the licence type', () => {
        const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)

        expect(result).to.include('licence')
      })
    })
  })

  describe('when the search is not valid for a licence reference', () => {
    beforeEach(() => {
      selectedResultType = 'licence'
      userScopes = []
    })

    describe('because it is too long', () => {
      beforeEach(() => {
        query = '1'.repeat(21)
      })

      it('does not return the licence type', () => {
        const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)

        expect(result).to.not.include('licence')
      })
    })

    describe('because it contain an invalid character', () => {
      beforeEach(() => {
        query = '#'
      })

      it('does not return the licence type', () => {
        const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)

        expect(result).to.not.include('licence')
      })
    })

    describe('because it contains too many consecutive letters', () => {
      beforeEach(() => {
        query = 'X'.repeat(4)
      })

      it('does not return the licence type', () => {
        const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)

        expect(result).to.not.include('licence')
      })
    })
  })

  describe('when the search is valid for a return reference', () => {
    beforeEach(() => {
      selectedResultType = 'returnLog'
      userScopes = []
    })

    describe('because it is a number', () => {
      beforeEach(() => {
        query = '123'
      })

      it('returns the return log type', () => {
        const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)

        expect(result).to.include('returnLog')
      })
    })
  })

  describe('when the search is not valid for a return reference', () => {
    beforeEach(() => {
      selectedResultType = 'returnLog'
      userScopes = []
    })

    describe('because it is too long', () => {
      beforeEach(() => {
        query = '1'.repeat(9)
      })

      it('does not return the return log type', () => {
        const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)

        expect(result).to.not.include('returnLog')
      })
    })

    describe('because it is non-numeric', () => {
      beforeEach(() => {
        query = 'A'
      })

      it('does not return the return log type', () => {
        const result = DetermineSearchItemsService.go(query, selectedResultType, userScopes)

        expect(result).to.not.include('returnLog')
      })
    })
  })
})
