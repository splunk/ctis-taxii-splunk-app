import { FORM_FIELD_CONTEXT, FORM_FIELD_CREATED_BY_REF, FORM_FIELD_DESCRIPTION, FORM_FIELD_NAME } from './const';
import { FORM_FIELD_TLP_V2_RATING, FORM_FIELD_TLP_V2_RATING_OPTION } from '../tlp';
import { FIELD_CONFIDENCE, FIELD_CONFIDENCE_OPTION } from '../confidence';

export default function registerGroupingFields(register){
    register(FORM_FIELD_NAME, {required: "Name is required.", value: ""});
    register(FORM_FIELD_CONTEXT, {required: "Context is required.", value: ""});
    register(FORM_FIELD_CREATED_BY_REF, {required: "Created By Ref is required.", value: ""});
    register(FORM_FIELD_DESCRIPTION, {required: "Description is required.", value: ""});
    register(FORM_FIELD_TLP_V2_RATING, FORM_FIELD_TLP_V2_RATING_OPTION);
    register(FIELD_CONFIDENCE, FIELD_CONFIDENCE_OPTION);
}
