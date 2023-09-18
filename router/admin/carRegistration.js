import Car from "../../model/Car";
import CarRegistration from "../../model/CarRegistration";

const carRegistrationAdminRoute = express.Router()

/**
 * @route get /api/admin/carRegistration/:carId
 * @description get all car registration in car
 * @access private
 */
carRegistrationAdminRoute.get("/:carId", async (req, res) => {
    const { carId } = req.params;
    try {
        const car = await Car.findOne({ _id: carId });
        if (!car) return sendError(res, "car does not exist");
        const carregistration = await CarRegistration.find({ car: car });
        return sendSuccess(res, "get car registration information successfully.", {
            carregistration,
            car,
        });
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

/**
 * @route GET /api/admin/carRegistration/:carId/:id
 * @description get information in car registration
 * @access public
 */
carRegistrationAdminRoute.get("/:carId/:id", async (req, res) => {
    const { carId } = req.params;
    const { id } = req.params;
    try {
        const car = await Car.findOne({ _id: carId });
        if (!car) return sendError(res, "car does not exist");
        const carregistration = await CarRegistration.findOne({ _id: id });
        if (!carregistration) return sendError(res, "Information not found.");
        return sendSuccess(res, "get car registration information successfully.", {
            carregistration,
            car,
        });
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

/**
 * @route POST /api/admin/carRegistration/:carId
 * @description create about information of car registration
 * @access private
 */
carRegistrationAdminRoute.post("/:carId", async (req, res) => {
    const errors = createCarValidate(req.body);
    if (errors) return sendError(res, errors);
    const { carId } = req.params;
    try {

        const car = await Car.findOne({ _id: carId });
        if (!car) return sendError(res, "car does not exist");

        const { registration_date, expiration_date, fee, unit, note } = req.body;
        const carRegistration = await carRegistration.create({
            car,
            registration_date,
            expiration_date,
            fee,
            unit,
            note,
        });
        return sendSuccess(res, "set car registration information successfully.", carRegistration);
    }
    catch (error) {
        console.log(error);
        return sendServerError(res);
    }
})

/**
 * @route put /admin/carRegistration/:carId/:id
 * @description update car registration
 * @access private
 */
carRegistrationAdminRoute.put("/:carId/:id", async (req, res) => {
    try {
      const { carId,id } = req.params;
      const isExist = await Car.exists({ _id: carId })
      if (!isExist) return sendError(res, "car does not exist")
      const isExistCar = await CarRegistration.exists({ _id: id })
      if (!isExistCar) return sendError(res, "Car registration does not exist")
      const { registration_date, expiration_date, fee, unit, note } = req.body
      await CarRegistration.findByIdAndUpdate(id, {
        registration_date,
        expiration_date,
        fee,
        unit,
        note,
      });
      return sendSuccess(res, "Update Succesfully", {
        registration_date,
        expiration_date,
        fee,
        unit,
        note,
      })
    } catch (error) {
      console.log(error);
      return sendServerError(res)
    }
  })

/**
 * @route delete /api/admin/carRegistration/:carId/:id
 * @description delet car registration by id
 * @access private
 */
carRegistrationAdminRoute.delete("/:carId/:id", async (req, res) => {
    const { carId,id } = req.params;
    try {
        const isExist = await Car.exists({ _id: carId })
        if (!isExist) return sendError(res, "Car not exiteds")
        const isExistCar = await CarRegistration.exists({ _id: id })
        if (!isExistCar) return sendError(res, "Car registration does not exits")
      const data = await CarRegistration.findByIdAndRemove(id)
      return sendSuccess(res, "Delete car registration successfully", data)
    } catch (error) {
      console.log(error)
      return sendServerError(res)
    }
  })

export default carRegistrationAdminRoute;