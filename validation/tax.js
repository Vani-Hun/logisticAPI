import Error from "../helper/error.js"

export const taxValidate = data => {
    const error = new Error()
    error.isRequired(data.name, "name")
        .isRequired(data.cost, "cost")
    return error.get()
}