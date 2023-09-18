import Error from "../helper/error.js"

export const createConsultancyValidate = data => {
    const error = new Error()

    error.isRequired(data.name, 'name')
        .isRequired(data.email, 'email')
        .isRequired(data.phone, 'phone')
        .isRequired(data.service, 'service')
    return error.get()
}

export const createAppointmentValidate = data => {
    const error = new Error()
    error.isRequired(data.customer.name, 'name')
        .isRequired(data.customer.phone, 'phone')
        .isRequired(data.description, 'description')
        .isRequired(data.time, 'time')
    return error.get()
}