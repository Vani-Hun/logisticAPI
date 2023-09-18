const dateRegex = /^\d{4}-\d{1,2}-\d{1,2}(T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)?$/;
export const validateDates = (fromDate, toDate) => {
    let status = '';
    if (fromDate === '' || fromDate === ' ' || fromDate === undefined)
        return status = 'The start date cannot be empty.';
    if (toDate === '' || toDate === ' ' || toDate === undefined)
        return status = 'The end date cannot be empty.';
    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);
    if (fromDateObj > toDateObj)
        return status = 'The start date must be before the end date.'
    if (!dateRegex.test(fromDate))
        return status = 'The start date is malformed.'

    if (!dateRegex.test(toDate))
        return status = 'The end date is malformed.'
    return '';
};