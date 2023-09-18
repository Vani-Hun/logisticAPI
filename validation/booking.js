import Error from "../helper/error.js"

export const createBookingValidate = data => {
    const error = new Error()
    error.isRequired(data.customerName, 'customerName')
    error.isRequiredObject(data.contactInfo, 'contactInfo',['email', 'phone'])
    error.isRequired(data.pickupAddress, 'pickupAddress')
    error.isRequired(data.deliveryAddress, 'deliveryAddress')
    error.isRequired(data.pickupDate, 'pickupDate')
    error.isRequired(data.deliveryDate, 'deliveryDate')
    error.isRequiredObjectArray(data.products, 'products', 1, ['name', 'quantity', 'unit'])
    return error.get()   
}