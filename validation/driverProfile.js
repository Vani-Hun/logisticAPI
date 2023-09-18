import Error from "../helper/error.js"

export const createDriverProfile = data => {
    const error = new Error()

    error.isRequired(data.staff, 'staff')
    .isRequired(data.license, 'license')
    .isRequired(data.training_certification, 'training_certification')
    .isRequired(data.driving_experience, 'driving_experience')
    return error.get()
}