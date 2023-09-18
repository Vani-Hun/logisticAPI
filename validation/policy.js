import Error from "../helper/error.js"

export const policyValidate = data => {
    const error = new Error()
    error.isRequired(data.companyName, 'Company name')
    .isRequired(data.brc, 'Business registration certificate')
    .isRequired(data.issuedBy, 'Licensing authority')
    .isRequired(data.privacyPolicy, 'Privacy policy')
    return error.get()
} 