import Error from "../helper/error.js"

export const createVehicleProfile = data => {
    const error = new Error()

    error.isRequired(data.car, 'car')
    .isRequired(data.vehicle_registration, 'vehicle_registration')
    .isRequired(data.vehicle_type, 'vehicle_type')
    .isRequired(data.maintenance_schedule, 'maintenance_schedule')
    .isRequired(data.type_of_fuel, 'type_of_fuel')
    return error.get()
}