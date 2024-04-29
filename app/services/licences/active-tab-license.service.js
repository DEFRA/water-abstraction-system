/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 * @module ViewLicenceActiveTabDataService
 */
const ViewLicenceSummaryPresenter = require("../../presenters/licences/summary.presenter");
const FetchLicenceAbstractionConditionsService = require("./fetch-licence-abstraction-conditions.service");

async function go(activeTab, licenceData) {
    let pageData = {}

    if(activeTab === 'summary') {
        const currentLicenceVersionId = licenceData?.licenceVersions[0]?.id
        const licenceAbstractionConditions = await FetchLicenceAbstractionConditionsService.go(currentLicenceVersionId)
        pageData = ViewLicenceSummaryPresenter.go(licenceData, licenceAbstractionConditions)
    }

    return pageData
}


module.exports = {
     go
}
