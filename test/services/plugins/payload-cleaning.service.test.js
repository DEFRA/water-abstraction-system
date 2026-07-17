// Test framework
import { describe, expect, it } from 'vitest'

// Thing under test
import PayloadCleaningService from '../../../app/services/plugins/payload-cleaning.service.js'

describe('Payload cleaning service', () => {
  describe('when an object contains values with extra whitespace', () => {
    it('can remove them from simple objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        customerName: 'Bert & Ernie  '
      }

      const cleanedObject = PayloadCleaningService(dirtyObject)

      expect(cleanedObject.customerName).toEqual('Bert & Ernie')
    })

    it('can remove them from nested objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        details: {
          firstName: ' Bert',
          lastName: ' Ernie '
        }
      }

      const cleanedObject = PayloadCleaningService(dirtyObject)

      expect(cleanedObject.details.firstName).toEqual('Bert')

      expect(cleanedObject.details.lastName).toEqual('Ernie')
    })

    it('can remove them from arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        codes: [' ABD1 ', 'B1 ', ' C2']
      }

      const cleanedObject = PayloadCleaningService(dirtyObject)

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

      const cleanedObject = PayloadCleaningService(dirtyObject)

      expect(cleanedObject.contacts[0].firstName).toEqual('Bert')
      expect(cleanedObject.contacts[0].lastName).toEqual('Ernie')
    })
  })

  describe('when an object contains values which are just whitespace', () => {
    it('removes them from simple objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        customerName: ' '
      }

      const cleanedObject = PayloadCleaningService(dirtyObject)

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

      const cleanedObject = PayloadCleaningService(dirtyObject)

      expect(cleanedObject.details).not.toHaveProperty('firstName')
      expect(cleanedObject.details).toHaveProperty('lastName')
    })

    it('removes them from arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        codes: [' ABD1 ', ' ', 'C2']
      }

      const cleanedObject = PayloadCleaningService(dirtyObject)

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

      const cleanedObject = PayloadCleaningService(dirtyObject)

      expect(cleanedObject.contacts[0]).toHaveProperty('firstName')
      expect(cleanedObject.contacts[0]).not.toHaveProperty('lastName')
    })
  })

  describe('when an object contains values which are empty', () => {
    it('removes them from simple objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        customerName: ''
      }

      const cleanedObject = PayloadCleaningService(dirtyObject)

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

      const cleanedObject = PayloadCleaningService(dirtyObject)

      expect(cleanedObject.details).not.toHaveProperty('firstName')
      expect(cleanedObject.details).toHaveProperty('lastName')
    })

    it('removes them from arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        codes: [' ABD1 ', '', 'C2']
      }

      const cleanedObject = PayloadCleaningService(dirtyObject)

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

      const cleanedObject = PayloadCleaningService(dirtyObject)

      expect(cleanedObject.contacts[0]).toHaveProperty('firstName')
      expect(cleanedObject.contacts[0]).not.toHaveProperty('lastName')
    })
  })

  describe('when an object contains null values', () => {
    it('removes them from simple objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        customerName: null
      }

      const cleanedObject = PayloadCleaningService(dirtyObject)

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

      const cleanedObject = PayloadCleaningService(dirtyObject)

      expect(cleanedObject.details).not.toHaveProperty('firstName')
      expect(cleanedObject.details).toHaveProperty('lastName')
    })

    it('removes them from arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        codes: [' ABD1 ', null, 'C2']
      }

      const cleanedObject = PayloadCleaningService(dirtyObject)

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

      const cleanedObject = PayloadCleaningService(dirtyObject)

      expect(cleanedObject.contacts[0]).toHaveProperty('firstName')
      expect(cleanedObject.contacts[0]).not.toHaveProperty('lastName')
    })
  })

  describe('when an object contains boolean values', () => {
    it('leaves them untouched in simple objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        existingCustomer: true,
        hasOrders: false
      }

      const cleanedObject = PayloadCleaningService(dirtyObject)

      expect(cleanedObject).toEqual(dirtyObject)
    })

    it('leaves them untouched in nested objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        orderStatus: {
          packed: true,
          shipped: false
        }
      }

      const cleanedObject = PayloadCleaningService(dirtyObject)

      expect(cleanedObject).toEqual(dirtyObject)
    })

    it('leaves them untouched in arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        preferences: [true, false, true]
      }

      const cleanedObject = PayloadCleaningService(dirtyObject)

      expect(cleanedObject).toEqual(dirtyObject)
    })
  })

  describe('when an object contains number values', () => {
    it('leaves them untouched in simple objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        value: 120.3,
        lines: 5
      }

      const cleanedObject = PayloadCleaningService(dirtyObject)

      expect(cleanedObject).toEqual(dirtyObject)
    })

    it('leaves them untouched in nested objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        orderDetails: {
          value: 121.33,
          lines: 6
        }
      }

      const cleanedObject = PayloadCleaningService(dirtyObject)

      expect(cleanedObject).toEqual(dirtyObject)
    })

    it('leaves them untouched in arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        lineValues: [10.0, 11.54, 2.99]
      }

      const cleanedObject = PayloadCleaningService(dirtyObject)

      expect(cleanedObject).toEqual(dirtyObject)
    })
  })

  describe('when an object has values that contain characters like &, <, and >', () => {
    it('leaves them untouched in simple objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        customerName: 'Bert< & >Ernie'
      }

      const cleanedObject = PayloadCleaningService(dirtyObject)

      expect(cleanedObject).toEqual(dirtyObject)
    })

    it('leaves them untouched in nested objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        details: {
          firstName: 'Bert <',
          lastName: '>Ernie<'
        }
      }

      const cleanedObject = PayloadCleaningService(dirtyObject)

      expect(cleanedObject).toEqual(dirtyObject)
    })

    it('leaves them untouched in arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        codes: ['A1&', 'B2<', 'C3>']
      }

      const cleanedObject = PayloadCleaningService(dirtyObject)

      expect(cleanedObject).toEqual(dirtyObject)
    })
  })

  describe('when an object contains dangerous content', () => {
    it('removes it from simple objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        customerName: '<script>alert(1)</script>'
      }

      const cleanedObject = PayloadCleaningService(dirtyObject)

      expect(cleanedObject).not.toHaveProperty('customerName')
    })

    it('removes it from nested objects', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        details: {
          firstName: '<script>alert(1)</script>',
          lastName: 'Ernie'
        }
      }

      const cleanedObject = PayloadCleaningService(dirtyObject)

      expect(cleanedObject.details).not.toHaveProperty('firstName')
      expect(cleanedObject.details).toHaveProperty('lastName')
    })

    it('removes it from arrays', () => {
      const dirtyObject = {
        reference: 'BESESAME001',
        codes: ['ABD1', '<script>alert(1)</script>', 'C2']
      }

      const cleanedObject = PayloadCleaningService(dirtyObject)

      expect(cleanedObject.codes).toEqual(['ABD1', 'C2'])
    })
  })
})
