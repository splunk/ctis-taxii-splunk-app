import PropTypes from "prop-types";

// Initial TLP and Confidence for a "New ..." form, sourced from Advanced Settings.
export const formDefaultsPropType = PropTypes.shape({
    tlpV2Rating: PropTypes.string,
    confidence: PropTypes.number,
});
