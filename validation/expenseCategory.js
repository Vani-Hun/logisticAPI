import Error from "../helper/error.js"

export const expenseCategoryValidate = data => {
    const error = new Error()
    error.isRequired(data.name, 'name')
    error.isRequired(data.description, 'description')
    return error.get()
}