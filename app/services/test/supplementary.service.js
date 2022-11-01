'use strict'

/**
 * @module TestSupplementaryService
 */

/**
 * Returns charge versions selected for supplementary billing
 * At present this returns a set response until further development
*/
class TestSupplementaryService {
  static async go () {
    const response = {
      chargeVersions: [
        { id: '986d5b14-8686-429e-9ae7-1164c1300f8d', licenceRef: 'AT/SROC/SUPB/01' },
        { id: 'ca0e4a77-bb13-4eef-a1a1-2ccf9e302cc4', licenceRef: 'AT/SROC/SUPB/03' }
      ]
    }

    return response
  }
}

module.exports = TestSupplementaryService
