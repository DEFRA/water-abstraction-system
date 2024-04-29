'use strict'

/**
 * Formats data for the `/licences/{id}` page's summary tab
 * @module ViewLicenceTabNavBarPresenter
 */

function go(tab) {
    const tabs = [
        {
            name: 'Summary',
            id: 'summary',
            href: 'summary'
        },
        {
            name: 'Contact details',
            id: 'contact-details',
            href: 'contact-details'
        },
        {
            name: 'Returns',
            id: 'returns',
            href: 'returns'
        },
        {
            name: 'Communications',
            id: 'communications',
            href: 'communications'
        },
        {
            name: 'Bills',
            id: 'bills',
            href: 'bills'
        },
        {
            name: 'Charge information',
            id: 'charge-information',
            href: 'charge-information'
        }
    ]

    const tabIndex = tabs.findIndex((item) => item.href === tab)
    tabs[tabIndex].active = true

    return tabs
}

module.exports = {
    go
}
