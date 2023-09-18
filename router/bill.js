// import express from "express"
// import Bill from "../model/Bill.js"
// import { sendError, sendServerError, sendSuccess } from "../helper/client.js"
// import { verifyToken, verifyStorekeeper, verifyDriver } from "../middleware/index.js"
// import Road from "../model/Road.js"
// import Warehouse from "../model/Warehouse.js"
// import DeliveryService from "../model/DeliveryService.js"
// import Car from "../model/Car.js"
// import Staff from "../model/Staff.js"
// import Error from "../helper/error.js"

// const billRoute = express.Router()

// /**
//  * @router GET /api/bill/driver/
//  * @description get list of bills by driver ID
//  */
//  billRoute.get('/driver', verifyToken, verifyDriver, async (req, res) => {
//     try {
//         const driverId = req.user.role._id
        
//         const bills = await Bill.find({driver: driverId})
        
//         if (bills) {
//             return sendSuccess(res, "Get list bill successfully.", bills)
//         }
//         return sendError(res, "There was no information found.")
//     } catch (error) {
//         console.log(error)
//         return sendServerError(res)
//     }
// })

// /**
//  * @route GET /api/bill/:id
//  * @description get a list of Bills with storekeeper starting or ending point
//  * @access private
//  */
// billRoute.get('/:id', verifyToken, verifyStorekeeper,
//     async (req, res) => {
//         try {
//             const { id } = req.params

//             if (!id.match(/^[0-9a-fA-F]{24}$/)) return sendError(res, "Bill does not exist.")

//             const isExist = await Bill.exists({ _id: id })
//             if (!isExist) return sendError(res, "Bill does not exist.")

//             const staffslogin = req.user.role._id
//             const bills = await Bill.findById(id)

//             const services = await DeliveryService.findById(bills.service)
//             const roads = await Road.findById(bills.road)
//             const cars = await Car.findById(bills.car)
//             const drivers = await Staff.findById(bills.driver)

//             const warehouse1 = await Warehouse.findById(roads.origin)
//             const warehouse2 = await Warehouse.findById(roads.destination)

//             const storekeeperorigin = warehouse1.storekeeper
//             const storekeeperdestination = warehouse2.storekeeper

//             if (storekeeperorigin == staffslogin || storekeeperdestination == staffslogin) {
//                 return sendSuccess(res, 'Get bills successfully.',
//                         {
//                             _id: bills._id,
//                             service: services,
//                             road: {
//                                 _id: roads._id,
//                                 origin: warehouse1,
//                                 destination: warehouse2,
//                                 distance: roads.distance
//                             },
//                             car: cars,
//                             driver: drivers,
//                             status: bills.status,
//                             actual_fuel: bills.actual_fuel,
//                             theoretical_fuel: bills.theoretical_fuel,
//                             product_shipments: bills.product_shipments,
//                             __v: bills.__v
//                         }
//                 )
//             }
//             return sendError(res, "Forbidden.")
//         } catch (error) {
//             console.log(error)
//             return sendServerError(res)
//         }
//     }
// );

// /**
//  * @route PUT /api/bill/:id/actual_fuel
//  * @description put about actual fuel of bill by driver
//  * @access private
//  */
// billRoute.put('/:id/actual_fuel', verifyToken, verifyDriver,
//     async (req, res) => {
//         try {
//             const { id } = req.params

//             if (!id.match(/^[0-9a-fA-F]{24}$/)) return sendError(res, "Bill does not exist.")

//             const isExist = await Bill.exists({ _id: id })
//             if (!isExist)
//                 return sendError(res, "Bill does not exist.")

//             const bills = await Bill.findById(id)
//             const staffs_login = req.user

//             if (bills.driver.toString() == staffs_login.role._id) {
//                 const { actual_fuel } = req.body
//                 await Bill.findByIdAndUpdate(id, {
//                     actual_fuel: actual_fuel
//                 })
//                 return sendSuccess(res, "Update actual fuel successfully.", { actual_fuel })
//             }
//             return sendError(res, "Forbidden.")
//         } catch (error) {
//             console.log(error)
//             return sendServerError(res)
//         }
//     }
// );

// /**
// * @router GET /api/bill/:billId/driver
// * @description get information of bill by bill ID
// */
// billRoute.get('/:billId/driver', verifyToken, verifyDriver, async (req, res) => {
// try {
//     //get id of driver by account login
//     const driverId = req.user.role._id
    
//     const bills = await Bill.find({driver: driverId}) 

//     const { billId } = req.params
//     if(!billId.match(/^[0-9a-fA-F]{24}$/)){
//         return sendError(res, "Bill does not exist.")
//     }
      
//     var err = new Error()
//     if(!err.checkId(billId)){
//         return sendError(res ,"Bill id is invalid.")
//     }

//     const bill = await Bill.findOne({_id: billId})
//     //check bill belong to list bill of driver
//     for(let i = 0; i < bills.length; i++) {
//         if(bill._id.toString() == bills[i]._id.toString()) {
            
//             var serviceId = bill.service + ""    
//             const service = await DeliveryService.findOne({_id: serviceId})

//             var s = '{"_id":"' +  bill._id + '","service":' + JSON.stringify(service)
//             var str = JSON.stringify(bill)
//             str = str.substring(70,str.length)            
//             const data = JSON.parse(s + str)                    
            
//             return sendSuccess(res, "Get info of bill successfully.", data)
//         }
//     } 
//     return sendError(res, "There was no information found.")
// } catch (error) {
//     console.log(error)
//     return sendServerError(res)
// }
// })

// /**
//  * @route PUT api/bill/:id
//  * @description update information of bill with driver role
//  * @access public
//  */
// billRoute.put('/:id', verifyToken, verifyDriver, async (req, res) => {
//     try {
//         const { id } = req.params
//         if(!id.match(/^[0-9a-fA-F]{24}$/)) return sendError(res, "Bill does not exist.")
//         const { current_fuel_price, toll_cost, police_cost, food_cost, carrepair_cost, warehouse_cost, other_cost } = req.body
//         const bill = await Bill.findById({ _id: id })
//         if(!bill) return sendError(res, 'Bill does not exist.')
//         if(bill.driver.toString() == req.user.role._id){
//             if (bill && bill.status == 'waiting' || bill.status == 'processing') {  
//                 await Bill.findByIdAndUpdate(id, {
//                     current_fuel_price: current_fuel_price, other_costs: {
//                         toll_cost: toll_cost, police_cost: police_cost,
//                         food_cost: food_cost, carrepair_cost: carrepair_cost, 
//                         warehouse_cost: warehouse_cost, other_cost: other_cost
//                     }
//                 })
//                 return sendSuccess(res, 'Update bill successfully.', 
//                 { current_fuel_price, toll_cost, police_cost, food_cost, carrepair_cost, warehouse_cost, other_cost })
//             } return sendError(res, 'Bill status must be waiting or in processing.')
//         } return sendError(res, "Forbidden.")
//     } catch (error) {
//         console.log(error)
//         return sendServerError(res)
//     }
// })

// export default billRoute