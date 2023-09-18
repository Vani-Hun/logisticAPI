// import schedule from "node-schedule"
// import { sendError, sendServerError, sendAutoMail, sendSuccess, sendAutoSMS } from "../helper/client.js"
// import User from "../model/User.js"
// import Car from "../model/Car.js"
// import CarFleet from "../model/CarFleet.js"
// import Bill from "../model/Bill.js"
// import Notification from "../model/Notification.js"
// import { io } from "socket.io-client"
// import { NOTIFY_EVENT, STAFF } from "../constant.js"
// import Road from "../model/Road.js"
// import Warehouse from "../model/Warehouse.js"
// import Staff from "../model/Staff.js"
// export const sendMailToCafllet = async() => {
//     try {

//     const listcar = await Car.find({})
//         for (let index = 0; index < listcar.length; index++) {
//             let day = 7
//             const endtime = listcar[index]['insurance']['expired']
//             const starttime = new Date
//             starttime.setDate(endtime.getDate() - day)      
//             let j = schedule.scheduleJob({ start: starttime, end: endtime, rule: '* * */24 * * *' }, async function () {
//                 const idcarfleet = listcar[index]['car_fleet'] + ''
//                 const car_fleet = await CarFleet.findById(idcarfleet)
//                 const idstaff = car_fleet['director'] + ''
//                 const user = await User.find({ role: idstaff })
//                 user.toString()
//                 let b = JSON.stringify(user);
//                 let c = b.substring(1, b.length - 1);
//                 let d = JSON.parse(c);
//                 try {
//                     if(d.email){
//                     const notification = {
//                         to: d.email,
//                         subject: "Xe " + listcar[index]['plate'] + " Sắp hết hạn vui lòng đăng ký lại",
//                         html: `<p>Bạn cần đăng ký lại bảo hiểm xe trước ngày </p>` + listcar[index]['insurance']['expired']
//                     }
//                     const sendMailSuccess = await sendAutoMail(notification)
//                     console.log(notification)
//                     console.log('gui thanh cong')
//                     if(!sendMailSuccess) sendError(res,'Send Mail to carfleet Faild')
//                     }
//                     else{
//                         const notification = {
//                             to:d.phone,
//                             body: ` Xe  ${listcar[index]['plate']} Sắp hết hạn vui lòng đăng ký lại. Bạn cần đăng ký lại bảo hiểm xe trước ngày ${listcar[index]['insurance']['expired']}`
//                         }
//                         const sendSMSSucsses = await sendAutoSMS(notification)
//                         if(!sendSMSSucsses) sendError(res,'Send SMS to Carfleer Faild')

//                     }
//                     const conten =  ` Xe  ${listcar[index]['plate']} Sắp hết hạn vui lòng đăng ký lại. Bạn cần đăng ký lại bảo hiểm xe trước ngày ${listcar[index]['insurance']['expired']}`
//                     const socket = io(process.env.SOCKET_SERVER,{reconnection: true});
//                     socket.emit(NOTIFY_EVENT.send,d._id,{conten})
//                 } catch (error) {
//                     sendServerError(res)
//                 }
//                 const receiver = d._id;
//                 const title = "Xe " + listcar[index]['plate'] + " Sắp hết hạn vui lòng đăng ký lại"
//                 const message = `Bạn cần đăng ký lại bảo hiểm xe trước ngày` + listcar[index]['insurance']['expired']
//                 await Notification.create({receiver, title, message })
// console.log(oke)
           
//             })
            
//         }
        
//     } catch (error) {
//         console.log(error)
//     }
// }
// export const sendMailToDriver = async(req, res) => {
//     try {
//         const listBill = await Bill.find({status: "waiting"}) 
//         for(let i=0; i< listBill.length; i++) {            
//             const starttime = new Date
//             const endtime = new Date
//             endtime.setDate(endtime.getDate() + 1) 
//             let j = schedule.scheduleJob({ start: starttime, end: endtime, rule: '* * */24 * * *' }, async function () {
//                 let driverId = listBill[i].driver+'';
//                 let id = listBill[i]._id + '';
//                 let user = await User.find({role:driverId})        
//                 user.toString()
//                 let b = JSON.stringify(user);
//                 let c = b.substring(1, b.length - 1);
//                 let d = JSON.parse(c);     

//                 let drvierEmail = d.email   
//                 let drvierPhone = d.phone   

//                 try{
//                     if(drvierEmail){
//                         const notification = {
//                             to: drvierEmail,
//                             subject: "Tài xế nhận bill",
//                             html: '<p>Bạn cần nhận bill: </p>' + id  + '<br>' +
//                                   '<p>Service: </p>' + listBill[i].service + '<br>' +
//                                   '<p> Road: </p>' + listBill[i].road + '<br>' +                                  
//                                   '<p> Product shipments: </p>' + listBill[i].product_shipments + '<br>'
//                         }
//                         const sendMailSuccess = await sendAutoMail(notification)
//                         console.log(notification)
//                         console.log('Send successfully')
//                         if(!sendMailSuccess) sendError(res,'Send Mail to driver failed')
//                     }
//                     else{
//                         const notification = {
//                             to: drvierPhone,
//                             body: `Bạn cần nhận bill  ${id}`
//                         }
//                         const sendSMSSucsses = await sendAutoSMS(notification)
//                         if(!sendSMSSucsses) sendError(res,'Send SMS to driver failed')
//                     }
//                     const content = `Tài xế nhận bill  ${id}`
//                     const socket = io(process.env.SOCKET_SERVER,{reconnection: true});
//                     //console.log(driverId)
//                     socket.emit(NOTIFY_EVENT.send,driverId,{content})
//                 }catch(error) {
//                     sendServerError(res)
//                 }   
//                 const receiver = driverId;
//                 const title = "Tài xế nhận bill"
//                 const message = `Bạn cần nhận bill  ${id}`
//                 await Notification.create({receiver, title, message })
//             })         
//         }    
//     } catch (error) {
//         console.log(error)
//     }
// }
// export const sendBillCompletedToDriver = async() => {
//     try {
//         const listBill = await Bill.find({status: "completed"}) 

//         for(let i=0; i< listBill.length; i++) {          
//             const starttime = new Date
//             const endtime = new Date
//             endtime.setDate(endtime.getDate() + 1) 
//             let j = schedule.scheduleJob({ start: starttime, end: endtime, rule: '* * */24 * * *' }, async function () {
//                 let driverId = listBill[i].driver+''
//                 let idBill = listBill[i]._id + ''
//                 let user = await User.find({role:driverId})        
//                 user.toString()

//                 let b = JSON.stringify(user)
//                 let c = b.substring(1, b.length - 1)
//                 let d = JSON.parse(c)     
//                 let drvierEmail = d.email   
//                 let drvierPhone = d.phone   

//                 let staffDriver = await Staff.findById({_id: driverId})

//                 let roadId = listBill[i].road
//                 let road = await Road.findById(roadId)

//                 let roadOrigin = road.origin
//                 let roadDestination = road.destination
//                 let originWH = await Warehouse.findById(roadOrigin)
//                 let destinationWH = await Warehouse.findById(roadDestination)

//                 try{
//                     if(drvierEmail){
//                         const notification = {
//                             to: drvierEmail,
//                             subject: "Tài xế nhận đơn hàng vận chuyển",
//                             html: `<p>Tài xế ${staffDriver.name} cần vận chuyển đơn hàng.</p>
//                             <p> Từ ${originWH.name} địa chỉ là: ${originWH.street} ${originWH.ward} ${originWH.district} ${originWH.province} </p>
//                             <p> Đến ${destinationWH.name} địa chỉ là: ${destinationWH.street} ${destinationWH.ward} ${destinationWH.district} ${destinationWH.province}</p>`
//                         }
//                         const sendMailSuccess = await sendAutoMail(notification)
//                         console.log(notification)
//                         console.log('Send successfully')
//                         if(!sendMailSuccess) sendError(res,'Send Mail to driver failed')
//                     }
//                     else{
//                         const notification = {
//                             to: drvierPhone,
//                             body: `Tài xế ${staffDriver.name} cần nhận đơn hàng vận chuyển: ${idBill}. Từ ${originWH.name} địa chỉ là: ${originWH.street} ${originWH.ward} ${originWH.district} ${originWH.province}. Đến ${destinationWH.name} địa chỉ là: ${destinationWH.street} ${destinationWH.ward} ${destinationWH.district} ${destinationWH.province}.`
//                         }
//                         const sendSMSSucsses = await sendAutoSMS(notification)
//                         if(!sendSMSSucsses) sendError(res,'Send SMS to driver failed')
//                     }
//                     const content = `Tài xế nhận đơn hàng vận chuyển ${idBill}`
//                     const socket = io(process.env.SOCKET_SERVER,{reconnection: true})
//                     socket.emit(NOTIFY_EVENT.send,driverId,{content})
//                 }catch(error) {
//                     // console.log(error)
//                     sendServerError(res)
//                 }   
//                 const receiver = driverId
//                 const title = "Tài xế nhận đơn hàng vận chuyển"
//                 const message = `Bạn cần nhận đơn hàng vận chuyển  ${idBill}`
//                 await Notification.create({receiver, title, message })
//             })         
//         }    
//     } catch (error) {
//         console.log(error)
//     }
// }