import Error from "../helper/error.js";

export const createMaterialValidate = data => {
    const error = new Error()
    error.isRequired(data.staff, 'staff')
    error.isRequired(data.car_fleet, 'car_fleet')
    error.isRequired(data.warehouse, 'warehouse')
    error.isRequiredObjectArray(data.materials, 'materials', 1, ['name', 'quantity', 'price','unit'])
    return error.get()
}