import Error from "../helper/error.js"

export const checkFeeValidate = data => {
    const error = new Error()

    error.isRequired(data.VAT, 'VAT')
    .isRequired(data.fuel_fee, 'fuel_fee')

    return error.get()
}