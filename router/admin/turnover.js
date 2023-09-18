import express, { query } from "express";
import {
  sendError,
  sendServerError,
  sendSuccess,
} from "../../helper/client.js";
import Turnover from "../../model/Turnover.js";
import Bill from "../../model/Bill.js";
import Order from "../../model/Order.js";
import Car from "../../model/Car.js";
import CarFleet from "../../model/CarFleet.js";
import CarRepair from "../../model/CarRepair.js";
import Warehouse from "../../model/Warehouse.js";
import { BILL_STATUS } from "../../constant.js";
import { checkidobject } from "../../validation/checkid.js";

const turnoverAdminRoute = express.Router();

/**
 * @route GET /api/turnover
 * @description get turnover information
 * @access public
 */
turnoverAdminRoute.get("/", async (req, res) => {
  try {
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0;
    const page = req.query.page ? parseInt(req.query.page) : 0;
    const { keyword, sortBy, payment_method, type_of_turnover } = req.query;
    let query = {};
    let keywordCondition = keyword
      ? {
        $or: [
          { payment_method: { $regex: keyword, $options: "i" } },
          { type_of_turnover: { $regex: keyword, $options: "i" } },
          { message: { $regex: keyword, $options: "i" } },
        ],
      }
      : {};
    if (payment_method) {
      query.payment_method = payment_method;
    }
    if (type_of_turnover) {
      query.type_of_turnover = type_of_turnover;
    }
    const turnover = await Turnover.find({ $and: [query, keywordCondition] })
      .limit(pageSize)
      .skip(pageSize * page)
      .sort(`${sortBy}`)
      .populate("bill")
      .populate("order");
    const length = await Turnover.find({ $and: [query, keywordCondition] }).count();
    return sendSuccess(res, "Get turnover information successfully.", {
      length,
      turnover,
    });
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
})

/**
 * @route GET /api/turnover/:id
 * @description get a single turnover information
 * @access public
 */
turnoverAdminRoute.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const turnover = await Turnover.findById({ _id: id }).populate(['order', 'bill']);
    if (turnover) {
      return sendSuccess(
        res,
        "get turnover information successfully.",
        turnover,
      );
    }
    return sendError(res, "turnover information is not found.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
})

/**
 * @router GET /api/turnover/car/:carid
 * @description get turnover car by id car
 * @access private
 */
turnoverAdminRoute.get("/car/:carid", async (req, res) => {
  try {
    const { carid } = req.params
    const error = checkidobject(carid)
    if (error) return sendError(res, error)
    const { fromdate, todate } = req.query
    let query = {};
    if (fromdate) {
      query.createdAt = { $gte: fromdate, $lt: todate };
    }
    let shipments = []
    let turnover = 0
    let actual_fuel = 0
    let carrepairPrice = 0
    const car = await Car.findById({ _id: carid })
    if (!car) return sendError(res, "Carid Not Found")
    console.log(query)
    const carrepair = await CarRepair.find({
      car: carid, $and: [query]
    })
    console.log(carrepair)
    for (let i = 0; i < carrepair.length; i++) {
      carrepairPrice += carrepair[i].price
    }
    const bill = await Bill.find({
      car: carid, status: BILL_STATUS.completed, $and: [query]
    })
    // get list shipment in bill and get actual_fuel
    for (let i = 0; i < bill.length; i++) {
      const shipments1 = bill[i].product_shipments
      actual_fuel += bill[i].actual_fuel
      shipments.push(...shipments1)
    }
    //get turnover
    for (let i = 0; i < shipments.length; i++) {
      turnover += shipments[i].turnover
    }
    const Profit = turnover - actual_fuel - carrepairPrice
    sendSuccess(res, "Get Turnover Successfully",
      {
        "Name Car": car.plate,
        "Total revenue": turnover,
        "Acctual Fuel": actual_fuel,
        "Carrepair": carrepairPrice,
        "Profit": Profit

      }
    )
  } catch (error) {
    console.log(error)
    sendServerError(res)
  }
})

/**
 * @router GET /api/turnover/carfleet/:carfleetid
 * @description get turnover cafllet by carleetid
 * @access private
 */
turnoverAdminRoute.get("/carfleet/:carfleetid", async (req, res) => {
  try {
    const { carfleetid } = req.params
    const error = checkidobject(carfleetid)
    if (error) return sendError(res, error)
    const { fromdate, todate } = req.query
    let query = {};
    if (fromdate) {
      query.createdAt = { $gte: fromdate, $lt: todate };
    }
    const cafleets = await CarFleet.findById({ _id: carfleetid })
    if (!cafleets) return sendError(res, "CarFleet not found")
    const bill = cafleets.bills
    const car = await Car.find({ car_fleet: carfleetid })
    console.log(car)
    let bills = []
    let shipments = []
    let actual_fuels = 0
    let totalturnover = 0
    let totalPriceRepair = 0
    let carrepairs = []
    //get carrepair have car
    for (let i = 0; i < car.length; i++) {
      const idcar = car[i]._id
      const carrepair = await CarRepair.find({
        car: idcar, $and: [query]
      })
      carrepairs.push(...carrepair)
    }
    // console.log(carrepairs)
    for (let x = 0; x < carrepairs.length; x++) {
      const priceRepair = carrepairs[x].price
      totalPriceRepair += priceRepair
    }
    //get list bill has status completed
    for (let index = 0; index < bill.length; index++) {
      const bills1 = await Bill.find({
        _id: bill[index], status: BILL_STATUS.completed, $and: [query]
      })
      bills.push(...bills1)
      console.log(bills1)
    }
    // console.log("List Bill" + bills)
    //getshipment in bill has status
    for (let i = 0; i < bills.length; i++) {
      const shipment1 = bills[i].product_shipments
      const actual_fuel = bills[i].actual_fuel

      actual_fuels += actual_fuel

      shipments.push(...shipment1)
    }
    //get list turnover
    // console.log("Shipment: " + shipments)
    for (let j = 0; j < shipments.length; j++) {
      const turnover = shipments[j].turnover
      totalturnover += turnover
    }
    const profit = totalturnover - actual_fuels - totalPriceRepair
    sendSuccess(res, "Turnover Carfleet: ",
      {
        "Name Cafleet": cafleets.name,
        "Total revenue": totalturnover,
        "Acctual Fuel": actual_fuels,
        "ToTalPriceRepair": totalPriceRepair,
        "Profit": profit
      })
  } catch (error) {
    console.log(error)
    sendServerError(error)
  }
})

/**
 * @router GET /api/turnover/enterprise
 * @description get turnover 
 * @access private
 */
turnoverAdminRoute.get("/enterprise/total", async (req, res) => {
  try {
    let total_price = 0
    let total_pricecarrepair = 0
    let total_pricefuel = 0
    const { fromdate, todate } = req.query
    let query = {};
    if (fromdate) {
      query.createdAt = { $gte: fromdate, $lt: todate };
    }
    //get turnover order status status completed
    const order = await Order.find({
      status: BILL_STATUS.completed, $and: [query]
    }
    )
    for (let i = 0; i < order.length; i++) {
      total_price += order[i].total_price
    }
    const carrepair = await CarRepair.find({ $and: [query] });
    for (let j = 0; j < carrepair.length; j++) {
      total_pricecarrepair += carrepair[j].price
    }
    const bill = await Bill.find({ $and: [query] })
    for (let z = 0; z < bill.length; z++) {
      console.log(bill[z].theoretical_fuel)
      total_pricefuel += bill[z].theoretical_fuel
    }
    const profit = total_price - total_pricecarrepair - total_pricefuel
    sendSuccess(res, "Get turnover Successfully"
      , {
        "Total revenue": total_price,
        "Theoretical fuel": total_pricefuel,
        "Carrepair": total_pricecarrepair,
        "Profit": profit
      })

  } catch (error) {
    console.log(error)
    sendServerError(res)
  }
})

/**
 * @router Get /api/turnover/warehouse
 * @description get turnover
 * @access private
 */
turnoverAdminRoute.get("/warehouse/:idwarehouse", async (req, res) => {
  try {
    const { idwarehouse } = req.params
    const error = checkidobject(idwarehouse)
    if (error) return sendError(res, error)
    const warehouse = await Warehouse.findById({ _id: idwarehouse })

    return sendSuccess(res, "Get Turnover sucessfully", {
      "Name": warehouse.name,
      "Turnover": warehouse.turnover
    })
  } catch (error) {
    console.log(error)
    sendServerError(res)
  }
})

/**
 * @router GET /api/turnover/company
 * @description get company's revenue 
 * @access private
 */
turnoverAdminRoute.get("/company/total", async (req, res) => {
  try {
    let total_price = 0
    let total_pricecarrepair = 0
    let total_pricefuel = 0
    const { fromdate, todate } = req.query
    let query = {};
    if (fromdate) {
      query.createdAt = { $gte: fromdate, $lt: todate };
    }
    const order = await Order.find({
      status: BILL_STATUS.completed, $and: [query]
    })
    order.forEach(e => {
      total_price += e.total_price
    });
    const carrepair = await CarRepair.find({ $and: [query] });
    carrepair.forEach(e => {
      total_pricecarrepair += e.price
    })
    const bill = await Bill.find({ $and: [query] })
    bill.forEach(e => {
      total_pricefuel += e.theoretical_fuel
    })
    const profit = total_price - total_pricecarrepair - total_pricefuel
    sendSuccess(res, "Get turnover successfully"
      , {
        "total_revenue": total_price,
        "theoretical_fuel": total_pricefuel,
        "car_repair": total_pricecarrepair,
        "profit": profit
      })

  } catch (error) {
    console.log(error)
    sendServerError(res)
  }
})

/**
 * @router GET /api/turnover/car/:carId
 * @description get car's revenue
 * @access private
 */
turnoverAdminRoute.get("/carrevenue/:carId", async (req, res) => {
  try {
    const { carId } = req.params;
    const car = await Car.findById(carId);
    if (!car)
      return sendError(res, "Car does not exist");
    const bill = await Bill.find({ car });
    const repair = await CarRepair.find({ car });
    if (bill || repair) {
      let revenue = 0;
      let actual_fuel = 0;
      let carrepair = 0;
      bill.forEach(e => {
        e.product_shipments.forEach(i => {
          revenue += i.turnover;
        });
        actual_fuel += e.actual_fuel;
      });

      repair.forEach(e => {
        carrepair += e.price;
      });

      const profit = revenue - actual_fuel - carrepair;
      return sendSuccess(res, "Get car revenue sucessful", {
        "car_name": car.plate,
        "revenue": revenue,
        "actual_fuel": actual_fuel,
        "carrepair": carrepair,
        "profit": profit
      });
    }
    sendError(res, "Bill for this car does not exist");
  } catch (error) {
    console.log(error);
    sendServerError(res);
  }
});

turnoverAdminRoute.get("/car_fleet/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const car_fleet = await CarFleet.findById(id).populate("bills");
    if (car_fleet) {
      let revenue = 0;
      let actual_fuel = 0;
      let carrepair = 0;
      let repair = [];
      car_fleet.bills.forEach(e => {
        e.product_shipments.forEach(i => {
          revenue += i.turnover;
        });
        actual_fuel += e.actual_fuel;
      });
      const car = await Car.find({ car_fleet });
      for (let i = 0; i < car.length; i++) {
        const car_repair = await CarRepair.find({ car: car });
        repair.push(...car_repair);
      }
      repair.forEach(e => {
        carrepair += e.price;
      })
      const profit = revenue - actual_fuel - carrepair;
      return sendSuccess(res, "Get car revenue sucessful", {
        "fleet_name": car_fleet.name,
        "revenue": revenue,
        "actual_fuel": actual_fuel,
        "carrepair": carrepair,
        "profit": profit
      });
    }
    return sendError(res, "car fleet does not exist");
  }
  catch (err) {
    console.log(err);
    sendServerError(err);
  }
});

export default turnoverAdminRoute;