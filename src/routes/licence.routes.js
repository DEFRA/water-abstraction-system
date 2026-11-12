import {
  markedForSupplementaryBilling,
  markForSupplementaryBilling,
  noReturnsRequired,
  returnsRequired,
  submitMarkForSupplementaryBilling,
  supplementary,
  viewBills,
  viewCommunications,
  viewContactDetails,
  viewHistory,
  viewLicenceConditions,
  viewLicencePoints,
  viewLicencePurposes,
  viewReturns,
  viewSetUp,
  viewSummary
} from '../controllers/licences.controller.js'

export default [
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: viewBills
    },
    path: '/licences/{id}/bills'
  },
  {
    handler: viewCommunications,
    method: 'GET',
    path: '/licences/{id}/communications'
  },
  {
    method: 'GET',
    options: {
      handler: viewLicenceConditions
    },
    path: '/licences/{id}/conditions'
  },
  {
    handler: viewContactDetails,
    method: 'GET',
    path: '/licences/{id}/contact-details'
  },
  {
    method: 'GET',
    options: {
      handler: viewHistory
    },
    path: '/licences/{id}/history'
  },
  {
    method: 'GET',
    options: {
      handler: viewLicencePoints
    },
    path: '/licences/{id}/points'
  },
  {
    method: 'GET',
    options: {
      handler: viewLicencePurposes
    },
    path: '/licences/{id}/purposes'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['view_charge_versions']
        }
      },
      handler: viewSetUp
    },
    path: '/licences/{id}/set-up'
  },
  {
    handler: viewSummary,
    method: 'GET',
    path: '/licences/{id}/summary'
  },
  {
    handler: viewReturns,
    method: 'GET',
    path: '/licences/{id}/returns'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: noReturnsRequired
    },
    path: '/licences/{id}/no-returns-required'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: returnsRequired
    },
    path: '/licences/{id}/returns-required'
  },
  {
    method: 'POST',
    options: {
      app: {
        plainOutput: true
      },
      auth: false,
      handler: supplementary,
      plugins: {
        crumb: false
      }
    },
    path: '/licences/supplementary'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: markForSupplementaryBilling
    },
    path: '/licences/{id}/mark-for-supplementary-billing'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitMarkForSupplementaryBilling
    },
    path: '/licences/{id}/mark-for-supplementary-billing'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: markedForSupplementaryBilling
    },
    path: '/licences/{id}/marked-for-supplementary-billing'
  }
]
