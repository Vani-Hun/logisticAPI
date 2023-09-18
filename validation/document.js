import Error from "../helper/error.js"

export const createDocument = data => {
    const error = new Error()

    error.isRequired(data.order, 'order')
    .isRequired(data.product, 'product')
    .isRequired(data.value, 'value')
    .isRequired(data.delivery_time, 'delivery_time')
    .isRequired(data.receiving_time, 'receiving_time')
    .isRequired(data.transport_means, 'transport_means')
    return error.get()
}