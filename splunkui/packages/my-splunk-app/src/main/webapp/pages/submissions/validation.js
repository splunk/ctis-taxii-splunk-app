import moment from 'moment/moment';

export function validateScheduledAt(value){
    if (!value) {
        return `Scheduled At is required`;
    }
    const now = moment();
    const dateValue = moment.utc(value);
    if (dateValue < now) {
        return `Scheduled At must be in the future`;
    }
    return null;
}
