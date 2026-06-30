import { isString } from 'lodash';

function extractShouldDiscoverCollectionsFromConfig(taxiiConfigContent) {
    if (taxiiConfigContent && 'should_discover_collections' in taxiiConfigContent) {
        return taxiiConfigContent.should_discover_collections === '1';
    }
    // if should_discover_collections is not present, default to true for backwards compatibility
    return true;
}

export function useExtractFromTaxiiConfig({taxiiConfig, selectedTaxiiConfigName}){
    const taxiiConfigEntries = taxiiConfig?.entry || [];
    const taxiiConfigOptions = taxiiConfigEntries.map((entry) => ({
        label: `${entry.name} (${entry.content.api_root_url})`,
        value: entry.name,
    }));
    const taxiiConfigNameToContent = Object.fromEntries(
        taxiiConfigEntries.map((entry) => [entry.name, entry.content]),
    );
    const selectedTaxiiConfigContent = taxiiConfigNameToContent[selectedTaxiiConfigName];
    const shouldDiscoverTaxiiCollections = extractShouldDiscoverCollectionsFromConfig(
        selectedTaxiiConfigContent,
    );
    const defaultCollectionId = selectedTaxiiConfigContent?.default_collection_id;
    const selectedDefaultCollectionId =
        isString(defaultCollectionId) && defaultCollectionId !== '' ? defaultCollectionId : null;
    return {selectedDefaultCollectionId, taxiiConfigOptions, shouldDiscoverTaxiiCollections}

}
