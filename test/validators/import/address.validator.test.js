'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ImportAddressValidator = require('../../../app/validators/import/address.validator.js')

describe('Import Address validator', () => {
  let transformedAddress

  beforeEach(async () => {
    transformedAddress = _transformedAddress()
  })

  describe('when valid data is provided', () => {
    it('does not throw an error', () => {
      expect(() => {
        ImportAddressValidator.go(transformedAddress)
      }).to.not.throw()
    })
  })

  describe('the "address1" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedAddress.address1 = 1
      })

      it('throws an error', async () => {
        expect(() => {
          ImportAddressValidator.go(transformedAddress)
        }).to.throw('"address1" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedAddress.address1 = null
      })

      it('does not throw an error', async () => {
        expect(() => {
          ImportAddressValidator.go(transformedAddress)
        }).to.throw('"address1" must be a string')
      })
    })
  })

  describe('the "address2" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedAddress.address2 = 1
      })

      it('throws an error', async () => {
        expect(() => {
          ImportAddressValidator.go(transformedAddress)
        }).to.throw('"address2" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedAddress.address2 = null
      })

      it('does not throw an error', async () => {
        expect(() => {
          ImportAddressValidator.go(transformedAddress)
        }).to.not.throw()
      })
    })
  })

  describe('the "address3" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedAddress.address3 = 1
      })

      it('throws an error', async () => {
        expect(() => {
          ImportAddressValidator.go(transformedAddress)
        }).to.throw('"address3" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedAddress.address3 = null
      })

      it('does not throw an error', async () => {
        expect(() => {
          ImportAddressValidator.go(transformedAddress)
        }).to.not.throw()
      })
    })
  })

  describe('the "address4" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedAddress.address4 = 1
      })

      it('throws an error', async () => {
        expect(() => {
          ImportAddressValidator.go(transformedAddress)
        }).to.throw('"address4" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedAddress.address4 = null
      })

      it('does not throw an error', async () => {
        expect(() => {
          ImportAddressValidator.go(transformedAddress)
        }).to.not.throw()
      })
    })
  })

  describe('the "address5" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedAddress.address5 = 1
      })

      it('throws an error', async () => {
        expect(() => {
          ImportAddressValidator.go(transformedAddress)
        }).to.throw('"address5" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedAddress.address5 = null
      })

      it('does not throw an error', async () => {
        expect(() => {
          ImportAddressValidator.go(transformedAddress)
        }).to.not.throw()
      })
    })
  })

  describe('the "address6" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedAddress.address6 = 1
      })

      it('throws an error', async () => {
        expect(() => {
          ImportAddressValidator.go(transformedAddress)
        }).to.throw('"address6" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedAddress.address6 = null
      })

      it('does not throw an error', async () => {
        expect(() => {
          ImportAddressValidator.go(transformedAddress)
        }).to.not.throw()
      })
    })
  })

  describe('the "country" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedAddress.country = 1
      })

      it('throws an error', async () => {
        expect(() => {
          ImportAddressValidator.go(transformedAddress)
        }).to.throw('"country" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedAddress.country = null
      })

      it('does not throw an error', async () => {
        expect(() => {
          ImportAddressValidator.go(transformedAddress)
        }).to.not.throw()
      })
    })
  })

  describe('the "postcode" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedAddress.postcode = 1
      })

      it('throws an error', async () => {
        expect(() => {
          ImportAddressValidator.go(transformedAddress)
        }).to.throw('"postcode" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedAddress.postcode = null
      })

      it('does not throw an error', async () => {
        expect(() => {
          ImportAddressValidator.go(transformedAddress)
        }).to.not.throw()
      })
    })
  })

  describe('the "dataSource" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedAddress.dataSource = 1
      })

      it('throws an error', async () => {
        expect(() => {
          ImportAddressValidator.go(transformedAddress)
        }).to.throw('"dataSource" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedAddress.dataSource = null
      })

      it('does not throw an error', async () => {
        expect(() => {
          ImportAddressValidator.go(transformedAddress)
        }).to.throw('"dataSource" must be a string')
      })
    })
  })

  describe('the "externalId" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedAddress.externalId = 1
      })

      it('throws an error', async () => {
        expect(() => {
          ImportAddressValidator.go(transformedAddress)
        }).to.throw('"externalId" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedAddress.externalId = null
      })

      it('does not throw an error', async () => {
        expect(() => {
          ImportAddressValidator.go(transformedAddress)
        }).to.throw('"externalId" must be a string')
      })
    })
  })
})

function _transformedAddress() {
  return {
    address1: '4 Privet Drive',
    address2: null,
    address3: null,
    address4: null,
    address5: 'Little Whinging',
    address6: 'Surrey',
    country: 'United Kingdom',
    externalId: '7:7777',
    postcode: 'HP11',
    dataSource: 'nald'
  }
}
