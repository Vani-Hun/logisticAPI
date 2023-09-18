import Error from "../helper/error.js"

export const postOfficeValidate = data => {
    const error = new Error()
 
    error.isRequired(data.name, 'name')
    .isRequired(data.province, 'province')
    .isRequired(data.district, 'district')
    .isRequired(data.address, 'address')

    return error.get()
} 

export const SearchPostOfficeValidate = data => {
    const error = new Error()
 
    error.isRequired(data.province, 'province')

    return error.get()
} 