import {escapeRegExp} from "lodash";

export const generateRegexQuery = (field, value) => {
    return {[field]: {'$regex': escapeRegExp(value), '$options': 'i'}};
}
export const generateRegexQueryForFields = (fields, value) => {
    return {'$or': fields.map(field => generateRegexQuery(field, value))};
}
