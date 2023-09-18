// import express from "express"
// import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
// import Bill from "../../model/Bill.js"
// import DeliveryService from "../../model/DeliveryService.js"
// import Road from "../../model/Road.js"
// import Car from "../../model/Car.js"
// import CarFleet from "../../model/CarFleet.js"
// import Staff from "../../model/Staff.js"
// import ProductShipment from "../../model/ProductShipment.js"
// import { createBillValidate } from "../../validation/bill.js"
// import Distance from "../../model/Distance.js"
// import Warehouse from "../../model/Warehouse.js"
// import Order from "../../model/Order.js"
// import { updateStatusBill } from "../../service/bill.js"
// import Notification from "../../model/Notification.js"
// import CarRepair from "../../model/CarRepair.js"

// const billAdminRoute = express.Router()

// /**
//  * @route GET /api/admin/bill
//  * @description get about information
//  * @access private
//  */
// billAdminRoute.get("/", async (req, res) => {
//     try {
//         const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0;
//         const page = req.query.page ? parseInt(req.query.page) : 0;
//         const { keyword, sortBy, limit, service, road, car, driver, product_shipments, status } = req.query;
//         console.log(keyword, sortBy, limit, service, road, car, driver, product_shipments, status)

//         let query = {};
//         let keywordList = keyword
//             ? {
//                 $or: [
//                     { service: { $regex: keyword, $options: "i" } },
//                     { road: { $regex: keyword, $options: "i" } },
//                     { car: { $regex: keyword, $options: "i" } },
//                     { driver: { $regex: keyword, $options: "i" } },
//                     { product_shipments: { $regex: keyword, $options: "i" } },
//                     { status: { $regex: keyword, $options: "i" } },
//                 ],
//             }
//             : {};
           
//         if (service) {
//             query.service = service;
//         }
//         if (road) {
//             query.road = road;
//         }
//         if (car) {
//             query.car = car;
//         }
//         if (driver) {
//             query.driver = driver;
//         }
//         if (product_shipments) {
//             query.product_shipments = product_shipments;
//         }
//         if (status) {
//             query.status = status;
//         }
       
//         const length = await Bill.find({ $and: [query, keywordList] }).count()
//         const bills = await Bill.find({ $and: [query, keywordList] })
//             .skip(pageSize * page)
//             .limit(pageSize)
//             .sort(`${sortBy}`)
//             .populate('service','name')
//             .populate({
//                 path:'road', select:'name',              
//                 populate: [{ path: 'origin',  select: 'name'}, {path:'destination', select: 'name'}]}) 
//             .populate({
//                 path:'car', select:'car_type',              
//                 populate: { path: 'car_fleet',  select: 'name'}}) 
//             .populate({path:'car', select:'car_type'});
       
//         if (bills)
//             return sendSuccess(res, "Get bill information successfully.", { length, bills });
//         return sendError(res, "Bill information is not found.");
//     } catch (error) {
//         console.log(error);
//         return sendServerError(res);
//     }
// });

// /**
//  * @route GET /api/admin/bill/expenditure/:year/year
//  * @description update information of product shipment
//  * @access private
//  */
// function handleTotalPrice(bills, carRepairs) {

//     const billPriceList = [];
//     const carRepairPriceList = [];
        
//     let total = 0;
//     for (const bill of bills) {
//         total += bill.actual_fuel;
//         billPriceList.push(bill?.actual_fuel);
//     }

//     for (const carRepair of carRepairs) {
//         total += carRepair.price
//         carRepairPriceList.push(carRepair?.price);
//     }

//     return {total, billPriceList, carRepairPriceList}
// }

// billAdminRoute.get('/expenditure/:year/year', async (req, res) => {
//     const year = req.params.year * 1;
//     try {
//         const carRepairs = await CarRepair.find({
//             createdAt: {
//                 $gte: new Date(`${year}-01-01`),
//                 $lt: new Date(`${year + 1}-01-01`)
//             }
//         });

//         const bills = await Bill.find({
//             createdAt: {
//                 $gte: new Date(`${year}-01-01`),
//                 $lt: new Date(`${year + 1}-01-01`)
//             }
//         });

//         const {total, billPriceList, carRepairPriceList} = handleTotalPrice(bills, carRepairs);

//         sendSuccess(res, `Get expenditure of year ${year} successfull`, {
//             total: total ? total : 'Does not have a expenditure for this year',
//             billPriceList,
//             carRepairPriceList,
//         });
//     } catch (error) {
//         console.log(error);
//         sendError(res, 'Error get expenditure', 500);
//     }
    
// })

// /**
//  * @route GET /api/admin/bill/expenditure/:year/:month/month
//  * @description update information of product shipment
//  * @access private
//  */
// billAdminRoute.get('/expenditure/:year/:month/month', async (req, res) => {
//     const year = req.params.year * 1;
//     const month = req.params.month * 1;
//     try {
//         const bills = await Bill.find({
//             createdAt: {
//                 $gte: new Date(`${year}-${month}-01`),
//                 $lte: new Date(`${year}-${month}-31`)
//             }
//         });

//         const carRepairs = await CarRepair.find({
//             createdAt: {
//                 $gte: new Date(`${year}-${month}-01`),
//                 $lte: new Date(`${year}-${month}-31`)
//             }
//         });
        
//         const {total, billPriceList, carRepairPriceList} = handleTotalPrice(bills, carRepairs);
    
//         sendSuccess(res, `Get expenditure of month ${month} successfull`, {
//             total: total ? total : 'Does not have a expenditure for this month',
//             billPriceList,
//             carRepairPriceList
//         });
//     } catch (error) {
//         console.log(error);
//         sendError(res, 'Error get expenditure', 500);
//     }
    
// })

// /**
//  * @route GET /api/admin/bill/expenditure/:year/:quarter/quarter
//  * @description update information of product shipment
//  * @access private
//  */
// billAdminRoute.get('/expenditure/:year/:quarter/quarter', async (req, res) => {
//     const year = req.params.year * 1;
//     const quarter = req.params.quarter * 1;
//     try {
//         const bills = await Bill.find({
//             createdAt: {
//                 $gte: new Date(`${year}-${(quarter - 1) * 3 + 1}-01`),
//                 $lt: new Date(`${year}-${quarter * 3}-31`),
//             }
//         });

//         const carRepairs = await CarRepair.find({
//             createdAt: {
//                 $gte: new Date(`${year}-${(quarter - 1) * 3 + 1}-01`),
//                 $lt: new Date(`${year}-${quarter * 3}-31`),
//             }
//         });
        
//         const {total, billPriceList, carRepairPriceList} = handleTotalPrice(bills, carRepairs);
    
//         sendSuccess(res, `Get expenditure of quarter ${quarter} successfull`, {
//             total:  total ? total : 'Does not have a expenditure for this quarter',
//             billPriceList,
//             carRepairPriceList
//         });
//     } catch (error) {
//         console.log(error);
//         sendError(res, 'Error get expenditure', 500);
//     }
   
// })

// /**
//  * @route GET /api/admin/bill/expenditure/:year/:week/week
//  * @description update information of product shipment
//  * @access private
//  */
// billAdminRoute.get('/expenditure/:year/:week/week', async (req, res) => {
//     try {
//         const year = req.params.year * 1;
//         const week = req.params.week * 1;
//         const startDate = new Date(year, 0, 1); // Ngày đầu tiên của năm
//         const endDate = new Date(year, 0, 1); // Ngày đầu tiên của năm
//         endDate.setDate(startDate.getDate() + (week - 1) * 7 + 6); // Ngày cuối cùng của tuần
        
//         const bills = await Bill.find({
//             createdAt: {
//                 $gte: startDate,
//                 $lt: endDate,
//             }
//         });

//         const carRepairs = await CarRepair.find({
//             createdAt: {
//                 $gte: startDate,
//                 $lt: endDate,
//             }
//         });
        
//         const {total, billPriceList, carRepairPriceList} = handleTotalPrice(bills, carRepairs);

//         sendSuccess(res, `Get expenditure of week ${week} successfull`, {
//             total: total ? total : 'Does not have a expenditure for this week',
//             billPriceList,
//             carRepairPriceList
//         });
//     } catch (error) {
//         console.log(error);
//         sendError(res, 'Error get expenditure', 500);
//     }
    
// })

// /**
//  * @route GET /api/admin/bill/:id
//  * @description get about information of bill by id
//  * @access private
//  */
// billAdminRoute.get('/:id',
//     async (req, res) => {
//         try {
//             const { id } = req.params
//             const bills = await Bill.findById(id)
//             if (bills) return sendSuccess(res, "Get bill successful.", bills)
//             return sendError(res, "Not information found.")
//         } catch (error) {
//             console.log(error)
//             return sendServerError(res)
//         }
//     })

// /**
//  * @router get /api/admin/bill/debt/driver
//  * @description get information about the driver debt
//  * @access private 
//  */
// billAdminRoute.get('/debt/driver', async (req, res) => {
//     try {
//         const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0
//         const page = req.query.page ? parseInt(req.query.page) : 0
//         const { keyword, sortBy, service, road, car, driver, product_shipments, status } = req.query
//         let costDriver = 0, collect = 0, pay = 0, totalCollect = 0, totalPay = 0, length = 0
//         let arrBills = []
//         let query = {}, costBill = {}
//         let keywordList = keyword
//             ? {
//                 $or: [
//                     { service: { $regex: keyword, $options: "i" } },
//                     { road: { $regex: keyword, $options: "i" } },
//                     { car: { $regex: keyword, $options: "i" } },
//                     { driver: { $regex: keyword, $options: "i" } },
//                     { product_shipments: { $regex: keyword, $options: "i" } },
//                     { status: { $regex: keyword, $options: "i" } }
//                 ]
//             }
//             : {}
//         if (service) {
//             query.service = service
//         }
//         if (road) {
//             query.road = road
//         }
//         if (car) {
//             query.car = car
//         }
//         if (driver) {
//             query.driver = driver
//         }
//         if (product_shipments) {
//             query.product_shipments = product_shipments
//         }
//         if (status) {
//             query.status = status
//         }
//         const bills = await Bill.find({ $and: [query, keywordList] })
//             .skip(pageSize * page)
//             .limit(pageSize)
//             .sort(`${sortBy}`)
//         bills.map(async bill => {
//             if (bill.status === 'completed') {
//                 let cost_caculation = (bill.other_costs.food_cost + bill.other_costs.police_cost
//                     + bill.other_costs.toll_cost + bill.other_costs.carrepair_cost
//                     + bill.other_costs.warehouse_cost + bill.other_costs.other_cost)
//                 if (isNaN(cost_caculation)) {
//                     cost_caculation = 0
//                 }
//                 costDriver = Number(cost_caculation) + Number(bill.current_fuel_price * bill.actual_fuel)
//                 if (bill.cost > costDriver) {
//                     collect = (bill.cost - costDriver)
//                 } else if (bill.cost < costDriver) {
//                     pay = (costDriver - bill.cost)
//                 } else if (bill.cost == costDriver) {
//                     collect = 0
//                     pay = 0
//                 }
//                 costBill = { cost: bill.cost, costDriver: costDriver, collect: collect, pay: pay, bill: bill }
//                 arrBills.push(costBill)
//                 length = Object.keys(arrBills).length
//                 totalCollect += collect
//                 totalPay += pay
//             }
//         })
//         return sendSuccess(res, 'Get bill information successfully', { length, totalCollect, totalPay, bills: arrBills })
//     } catch (error) {
//         console.log(error)
//         return sendServerError(res)
//     }
// })

// /**
//  * @route POST /api/admin/bill/create
//  * @description create information of bill
//  * @access private
//  */
// billAdminRoute.post('/create', async (req, res) => {
//     const errors = createBillValidate(req.body)
//     if (errors) return sendError(res, errors)
//     try {
//         const { service, road, car, driver, status, theoretical_fuel, cost } = req.body

//         if (!service.match(/^[0-9a-fA-F]{24}$/)) {
//             return sendError(res, "Service does not exist.")
//         }

//         if (!road.match(/^[0-9a-fA-F]{24}$/)) {
//             return sendError(res, "Road does not exist.")
//         }

//         if (!car.match(/^[0-9a-fA-F]{24}$/)) {
//             return sendError(res, "Car does not exist.")
//         }

//         if (!driver.match(/^[0-9a-fA-F]{24}$/)) {
//             return sendError(res, "Driver does not exist.")
//         }

//         const services = await DeliveryService.findById({ _id: service })
//         if (!services) return sendError(res, 'Service does not exist.')

//         const roads = await Road.findById({ _id: road })
//         if (!roads) return sendError(res, 'Road does not exist.')

//         const cars = await Car.findById({ _id: car })
//         if (!cars) return sendError(res, 'Car does not exist.')

//         const drivers = await Staff.findById({ _id: driver })
//         if (!drivers) return sendError(res, 'Driver does not exist.')

//         const carFleetId = cars.car_fleet
//         const car_fleets = await CarFleet.findById({ _id: carFleetId })
//         if (!car_fleets) return sendError(res, 'Carfleet does not exist.')     

//         let orderId = await Order.find()
//         let serviceIds = []
//         for (let i = 0; i < orderId.length; i++) {
//             serviceIds.push(orderId[i].service)
//         }

//         let serviceString = serviceIds.toString()
//         if (serviceString.includes(service)) {
//             let distance = services.distances
//             let findDistance = await Distance.findById(distance)
//             let distanceFromProvince = findDistance.fromProvince
//             let distanceToProvince = findDistance.toProvince

//             let roadOrigin = roads.origin
//             let roadDestination = roads.destination
//             let warehouseOrigin = await Warehouse.findById(roadOrigin)
//             let warehouseDestination = await Warehouse.findById(roadDestination)
//             let warehouseProvinceOrigin = warehouseOrigin.province
//             let warehouseProvinceDestination = warehouseDestination.province

//             if (distanceFromProvince == warehouseProvinceOrigin && distanceToProvince == warehouseProvinceDestination || distanceFromProvince == warehouseProvinceDestination && distanceToProvince == warehouseProvinceOrigin) {
//                 const bill = await Bill.create({ service, road, car, driver, status, theoretical_fuel, cost })
//                 const updateCarFleet = await CarFleet.findOneAndUpdate(
//                     { _id: carFleetId },
//                     { $push: { bills: bill } }
//                 );
//                 if (!updateCarFleet) return sendServerError(res, "Update bill in carfleet failed.")
//                 return sendSuccess(res, 'Create bill information successfully.', bill)
//             }
//             return sendError(res, 'Create bill information failed.')
//         } else {
//             return sendError(res, 'Order has not been created.')
//         }
//     }
//     catch (error) {
//         console.log(error)
//         return sendServerError(res)
//     }
// });

// /**
//  * @route POST /api/admin/bill/
//  * @description create information of bill
//  * @access private
//  */
// billAdminRoute.post("/product_shipments/:billId", async (req, res) => {
//     let billId = req.params.billId
//     if (!billId.match(/^[0-9a-fA-F]{24}$/)) {
//         return sendError(res, "Bill does not exist.")
//     }
//     const { shipment, turnover } = req.body;
//     if (!shipment.match(/^[0-9a-fA-F]{24}$/)) {
//         return sendError(res, "Product shipment does not exist.")
//     }
//     try {
//         const isExist = await Bill.exists({
//             _id: billId,
//         })

//         if (!isExist) {
//             return sendError(res, 'bill not exists')
//         }
//         const shipmentExist = await ProductShipment.exists({
//             _id: shipment
//         })
//         if (!shipmentExist) {
//             return sendError(res, 'the shipment is not exists.')
//         }

//         await Bill.updateOne(
//             {
//                 _id: req.params.billId,
//             },
//             {
//                 $push: { product_shipments: { shipment, turnover } },
//             }
//         );
//         return sendSuccess(res, "Add product shipment successfully.");

//     } catch (error) {
//         return sendServerError(res);

//     }
// })

// /**
//  * @route DELETE /api/admin/bill/:id
//  * @description delete a bill existing 
//  * @access private
//  */
// billAdminRoute.delete('/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         if (!id.match(/^[0-9a-fA-F]{24}$/)) return sendError(res, "Bill does not exist.")
//         const isExit = await Bill.exists({ _id: id })
//         if (!isExit) return sendError(res, "Bill does not exist.")

//         const data = await Bill.findByIdAndRemove(id)
//         await CarFleet.updateMany({}, { $pull: { bills: id } });
//         return sendSuccess(res, "Delete bill successfully.", data)
//     }
//     catch (error) {
//         console.log(error)
//         return sendServerError(res)
//     }
// })

// /**
//  * @route PUT /api/admin/bill/:id
//  * @description update information of product shipment
//  * @access private
//  */
// billAdminRoute.put('/:id', async (req, res) => {
//     try {
//         const { id } = req.params
//         if (!id.match(/^[0-9a-fA-F]{24}$/)) {
//             return sendError(res, "Bill does not exist.")
//         }
//         const { service, road, car, driver, status, theoretical_fuel } = req.body

//         const errors = createBillValidate(req.body)

//         if (!service.match(/^[0-9a-fA-F]{24}$/)) {
//             return sendError(res, "Service does not exist.")
//         }

//         if (!road.match(/^[0-9a-fA-F]{24}$/)) {
//             return sendError(res, "Road does not exist.")
//         }

//         if (!car.match(/^[0-9a-fA-F]{24}$/)) {
//             return sendError(res, "Car does not exist.")
//         }

//         if (!driver.match(/^[0-9a-fA-F]{24}$/)) {
//             return sendError(res, "Driver does not exist.")
//         }
//         if (errors)
//             return sendError(res, errors)

//         const isExist = await Bill.exists({
//             service: service, road: road, car: car,
//             driver: driver, status: status, actual_fuel: actual_fuel, theoretical_fuel: theoretical_fuel
//         })
//         if (isExist)
//             return sendError(res, "This bill is existed.")

//         await Bill.findByIdAndUpdate(id, {
//             service: service, road: road, car: car,
//             driver: driver, status: status, actual_fuel: actual_fuel, theoretical_fuel: theoretical_fuel
//         })
//         return sendSuccess(res, "Update bill successfully.", { service, road, car, driver, status, actual_fuel, theoretical_fuel })

//     } catch (error) {
//         console.log(error)
//         return sendServerError(res)
//     }
// })

// /**
//  * @router Put /api/admin/bill/status/:id
//  * @description update infomation of status bill
//  * @access private
//  */
//  billAdminRoute.put('/status/:id', async(req, res) => {
//     try {
//     const { id } = req.params
//     if (!id.match(/^[0-9a-fA-F]{24}$/)) {
//         return sendError(res, "Bill does not exist.")
//     }
//     const isExit = await Bill.exists({ _id: id })
//     if (!isExit){
//     return sendError(res, "Bill does not exist.")
//     }
//     updateStatusBill(id)
//     return sendSuccess(res, "Update status to completed")
//     } catch (error) {
//         console.log(error)
//         return sendServerError(res)
//     }
  
// })

// /**
//  * @route GET /api/admin/bill/fee_ride/:id
//  * @description fee of ride
//  * @access private
//  */
// billAdminRoute.post("/fee_ride/:id", async (req, res) => {
//     try {
//       const { id } = req.params
//       const { tollFee, whFee, otherFee, price_fuel } = req.body

//       const bill = await Bill.findById(id)
//       if(bill.status === "waiting"){
//         if(bill.theoretical_fuel === undefined) {
//             bill.theoretical_fuel = 0
//         }

//         let fuel_fee = Number(bill.theoretical_fuel) * Number(price_fuel)

//         const cars = await Car.findById(bill.car)
//         const idCar = cars.id

//         const carRepair = await CarRepair.findOne({car: cars})
//         let carRepair_fee = Number(carRepair.price)
//         let othersFee = Number(otherFee)
//         let costOfRide = 0
//         costOfRide += (carRepair_fee + fuel_fee + Number(tollFee) + Number(whFee) + othersFee)

//         return sendSuccess(res, "Get bill successfully.", {idCar, costOfRide})
//      } return sendSuccess(res, "Not bill with waiting status.")
//     } catch (error) {
//       console.log(error);
//       return sendServerError(res);
//     }
//   })

// /**
//  * @route GET /api/admin/bill/report/info
//  * @description get report of bill
//  * @access private
//  */
// billAdminRoute.get('/report/info',
//     async (req, res) => {
//         try {
//             const reports = await Notification.find()
//             const reportBill = new Array();
//             reports.forEach(element => {
//                 if(element.message.includes("Bạn cần nhận bill")){
//                     reportBill.push(element)
//                 }
//             });
            
//             if (reports) return sendSuccess(res, "Get report successful.", reports)
//             return sendError(res, "Not information found.")
//         } catch (error) {
//             console.log(error)
//             return sendServerError(res)
//         }
//     })
    
// export default billAdminRoute