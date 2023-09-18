import { DAY_OF_WEEK, COMPARE_REVIEW_TYPE } from "../constant.js"

/**
 * @param {Date} today - The date
 * @param {number} dateOfWeek - The number
 */
const jumbToDateOfWeek = (today, dateOfWeek) => {
    let resultDate = today;

    let distance = dateOfWeek - today.getDay();

    if (distance <= 0) distance += DAY_OF_WEEK.LENGTH;

    resultDate.setDate(today.getDate() + distance);

    return resultDate;
}


export const getDateWhenEditSchedule = async (schedule_type) => {
    try {
        let today = new Date();
        let selected_date = today;

        //0 for Sunday, 1 for Monday, 2 for Tuesday, and so on
        let currentDayOfWeek = today.getDay();

        let currentDayOfMonth = today.getDate();
        let lastDayOfMonth = (new Date(today.getFullYear(), today.getMonth() + 1, 0));

        switch (schedule_type) {
            case COMPARE_REVIEW_TYPE.ONCE_A_DAY:
                // to tomorrow             
                selected_date.setDate(currentDayOfMonth + 1);
                break;
            case COMPARE_REVIEW_TYPE.ONCE_A_WEEK:
                // to friday
                selected_date = jumbToDateOfWeek(today, DAY_OF_WEEK.FRIDAY);
                break;
            case COMPARE_REVIEW_TYPE.TWICE_A_WEEK:
                // Timeline_in_week : --- tuesday ---- thursday ----
                if (currentDayOfWeek < DAY_OF_WEEK.TUESDAY || currentDayOfWeek >= DAY_OF_WEEK.THURSDAY) {
                    // to tuesday
                    selected_date = jumbToDateOfWeek(today, DAY_OF_WEEK.TUESDAY);
                }
                if (currentDayOfWeek >= DAY_OF_WEEK.TUESDAY && currentDayOfWeek < DAY_OF_WEEK.THURSDAY) {
                    // to thursday
                    selected_date = jumbToDateOfWeek(today, DAY_OF_WEEK.THURSDAY);
                }
                break;
            case COMPARE_REVIEW_TYPE.THREE_TIMES_A_WEEK:
                // Timeline_in_week : --- monday ---- wednesday ---- friday ----
                if (currentDayOfWeek < DAY_OF_WEEK.MONDAY || currentDayOfWeek >= DAY_OF_WEEK.FRIDAY) {
                    // to monday
                    selected_date = jumbToDateOfWeek(today, DAY_OF_WEEK.MONDAY);
                }
                if (currentDayOfWeek >= DAY_OF_WEEK.MONDAY && currentDayOfWeek < DAY_OF_WEEK.WEDNESDAY) {
                    // to wednesday
                    selected_date = jumbToDateOfWeek(today, DAY_OF_WEEK.WEDNESDAY);
                }
                if (currentDayOfWeek >= DAY_OF_WEEK.WEDNESDAY && currentDayOfWeek < DAY_OF_WEEK.FRIDAY) {
                    // to friday
                    selected_date = jumbToDateOfWeek(today, DAY_OF_WEEK.FRIDAY);
                }
                break;
            case COMPARE_REVIEW_TYPE.ONCE_A_MONTH:
                if (currentDayOfMonth < lastDayOfMonth.getDate()) {
                    // last day of this month
                    selected_date = lastDayOfMonth;
                }
                else {
                    // last day of next month
                    selected_date = (new Date(today.getFullYear(), today.getMonth() + 2, 0));
                }
                break;
            case COMPARE_REVIEW_TYPE.TWICE_A_MONTH:
                // Timeline_in_month : --- 15 ---- last_day ----
                if (currentDayOfMonth < 15) {
                    // 15th day of this month
                    selected_date.setDate(15);
                }
                if (currentDayOfMonth >= 15 && currentDayOfMonth < lastDayOfMonth.getDate()) {
                    // last day of this month
                    selected_date = lastDayOfMonth;
                }
                if (currentDayOfMonth == lastDayOfMonth.getDate()) {
                    // 15th day of next month
                    selected_date.setDate(15);
                    selected_date.setMonth(today.getMonth() + 1);
                }
                break;
            default:
            // code block
        }
        return selected_date;
    } catch (error) {
        console.log(error)
    }
}