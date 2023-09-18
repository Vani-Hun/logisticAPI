import Error from "../helper/error.js";

export const reciptCategoryValidate = data => {
    const error = new Error()
    error.isRequired(data.expense_category, 'expense_category')
    error.isRequired(data.staff, 'staff')
    error.isRequired(data.amount, 'amount')
    return error.get()
}