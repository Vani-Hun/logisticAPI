import Error from "../helper/error.js"

export const insuranceValidate = data => {
    const error = new Error()
    error.isRequired(data.name, "name")
        .isRequired(data.department, "department")
        .isRequired(data.type_of_insurance, 'type_of_insurance')
        .isRequired(data.company, 'company')
    return error.get()
}