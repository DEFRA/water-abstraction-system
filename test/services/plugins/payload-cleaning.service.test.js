const PayloadCleaningService = require('../../../app/services/plugins/payload-cleaning.service.js')

describe('Payload cleaning service', () => {
  describe('when an object contains values with extra whitespace', () => {
    it('can remove them from simple objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        customerName: 'Bert & Ernie  '
      }

      const cleanedObject = PayloadCleaningService.go(dirtyObject)

      expect(cleanedObject.customerName).toBe('Bert & Ernie')
    })

    it('can remove them from nested objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        details: {
          firstName: ' Bert',
          lastName: ' Ernie '
        }
      }

      const cleanedObject = PayloadCleaningService.go(dirtyObject)

      expect(cleanedObject.details.firstName).toBe('Bert')
      expect(cleanedObject.details.lastName).toBe('Ernie')
    })

    it('can remove them from arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        codes: [' ABD1 ', 'B1 ', ' C2']
      }

      const cleanedObject = PayloadCleaningService.go(dirtyObject)

      expect(cleanedObject.codes).toEqual(['ABD1', 'B1', 'C2'])
    })

    it('can remove them from objects in arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        contacts: [
          { firstName: ' Bert', lastName: ' Ernie ' },
          { firstName: 'Big', lastName: 'Bird' }
        ]
      }

      const cleanedObject = PayloadCleaningService.go(dirtyObject)

      expect(cleanedObject.contacts[0].firstName).toBe('Bert')
      expect(cleanedObject.contacts[0].lastName).toBe('Ernie')
    })
  })

  describe('when an object contains values which are just whitespace', () => {
    it('removes them from simple objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        customerName: ' '
      }

      const cleanedObject = PayloadCleaningService.go(dirtyObject)

      expect(cleanedObject).not.toHaveProperty('customerName')
    })

    it('removes them from nested objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        details: {
          firstName: ' ',
          lastName: 'Ernie'
        }
      }

      const cleanedObject = PayloadCleaningService.go(dirtyObject)

      expect(cleanedObject.details).not.toHaveProperty('firstName')
      expect(cleanedObject.details).toHaveProperty('lastName', 'Ernie')
    })

    it('removes them from arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        codes: [' ABD1 ', ' ', 'C2']
      }

      const cleanedObject = PayloadCleaningService.go(dirtyObject)

      expect(cleanedObject.codes).toEqual(['ABD1', 'C2'])
    })

    it('removes them from objects in arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        contacts: [
          { firstName: 'Bert', lastName: ' ' },
          { firstName: 'Big', lastName: 'Bird' }
        ]
      }

      const cleanedObject = PayloadCleaningService.go(dirtyObject)

      expect(cleanedObject.contacts[0]).toHaveProperty('firstName', 'Bert')
      expect(cleanedObject.contacts[0]).not.toHaveProperty('lastName')
    })
  })

  describe('when an object contains values which are empty', () => {
    it('removes them from simple objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        customerName: ''
      }

      const cleanedObject = PayloadCleaningService.go(dirtyObject)

      expect(cleanedObject).not.toHaveProperty('customerName')
    })

    it('removes them from nested objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        details: {
          firstName: '',
          lastName: 'Ernie'
        }
      }

      const cleanedObject = PayloadCleaningService.go(dirtyObject)

      expect(cleanedObject.details).not.toHaveProperty('firstName')
      expect(cleanedObject.details).toHaveProperty('lastName', 'Ernie')
    })

    it('removes them from arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        codes: [' ABD1 ', '', 'C2']
      }

      const cleanedObject = PayloadCleaningService.go(dirtyObject)

      expect(cleanedObject.codes).toEqual(['ABD1', 'C2'])
    })

    it('removes them from objects in arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        contacts: [
          { firstName: 'Bert', lastName: '' },
          { firstName: 'Big', lastName: 'Bird' }
        ]
      }

      const cleanedObject = PayloadCleaningService.go(dirtyObject)

      expect(cleanedObject.contacts[0]).toHaveProperty('firstName', 'Bert')
      expect(cleanedObject.contacts[0]).not.toHaveProperty('lastName')
    })
  })

  describe('when an object contains null values', () => {
    it('removes them from simple objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        customerName: null
      }

      const cleanedObject = PayloadCleaningService.go(dirtyObject)

      expect(cleanedObject).not.toHaveProperty('customerName')
    })

    it('removes them from nested objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        details: {
          firstName: null,
          lastName: 'Ernie'
        }
      }

      const cleanedObject = PayloadCleaningService.go(dirtyObject)

      expect(cleanedObject.details).not.toHaveProperty('firstName')
      expect(cleanedObject.details).toHaveProperty('lastName', 'Ernie')
    })

    it('removes them from arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        codes: [' ABD1 ', null, 'C2']
      }

      const cleanedObject = PayloadCleaningService.go(dirtyObject)

      expect(cleanedObject.codes).toEqual(['ABD1', 'C2'])
    })

    it('removes them from objects in arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        contacts: [
          { firstName: 'Bert', lastName: null },
          { firstName: 'Big', lastName: 'Bird' }
        ]
      }

      const cleanedObject = PayloadCleaningService.go(dirtyObject)

      expect(cleanedObject.contacts[0]).toHaveProperty('firstName', 'Bert')
      expect(cleanedObject.contacts[0]).not.toHaveProperty('lastName')
    })
  })
})
