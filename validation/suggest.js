import Error from "../helper/error.js"

export const createSuggestValidate = (data, user) => {
    const error = new Error()

    error.isRequired(data.order_id, 'orderId')
    .isRequired(data.content, 'content')

    if(data.phone != null && data.phone != ""){
        error.isInvalidPhone(data.phone);
    } else {
        if(user.phone == null || user.phone == "") {
            error.appendError("phone field is required");
        }
    }

    if(data.address == null || data.address == ""){
        if(user.role.address == null) {
            error.appendError("address field is required");
        }
    }

    return error.get()
}
