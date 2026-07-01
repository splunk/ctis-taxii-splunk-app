import CollapsiblePanel from '@splunk/react-ui/CollapsiblePanel';
import Loader from '@splunk/my-page/src/Loader';
import Code from '@splunk/react-ui/Code';
import React from 'react';
import PropTypes from 'prop-types';
import { useStixBundlePreview } from './hooks/useStixBundlePreview';

export function PreviewStixBundleJson({ groupingId, includeSightings }) {
    const { loading, error, bundleJsonString } = useStixBundlePreview(groupingId, includeSightings);

    return (
        <section>
            <CollapsiblePanel title="Preview of STIX Bundle JSON">
                <Loader error={error} loading={loading}>
                    <Code language="json" value={bundleJsonString} />
                </Loader>
            </CollapsiblePanel>
        </section>
    );
}
PreviewStixBundleJson.propTypes = {
    groupingId: PropTypes.string.isRequired,
    includeSightings: PropTypes.bool.isRequired,
};
