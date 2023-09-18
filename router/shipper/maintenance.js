import express, { query } from "express";
// import { verifyToken, verifyShipper } from "../../middleware/verify.js";
// import { sendError, sendServerError, sendSuccess } from "../../helper/client.js";
// import { SCAN_TYPE } from "../../constant.js";
// import User from "../../model/User.js";
// import Order from "../../model/Order.js";
// import { validateDates } from "../../validation/checkDate.js"
const maintenancerouter = express.Router();


/**
 * @route POST /shipper/Createmaintenance/
 * @description Create maintenance information for vehicles
 * @access public
 */
// Route to create a new maintenance record
maintenancerouter.post('/maintenance', async (req, res) => {
  try {
    const { shipperId, vehicleId, maintenanceDate, description } = req.body;

    // Create a new record
    const maintenance = new Maintenance({
      shipperId,
      vehicleId,
      maintenanceDate,
      description,
    });

    // Save it to the database
    await maintenance.save();

    res.status(201).json({ message: 'Vehicle maintenance has been created.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while creating vehicle maintenance.' });
  }
});

/**
 * @route GET /shipper/maintenanceinformation/
 * @description Get maintenance information for vehicles
 * @access public
 */

// Route to retrieve a list of vehicle maintenance records
maintenancerouter.get('/maintenance', async (req, res) => {
    try {
      const maintenanceList = await Maintenance.find();
      res.json(maintenanceList);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while fetching vehicle maintenance information.' });
    }
  });
  
  // Route to retrieve vehicle maintenance information by ID
  maintenancerouter.get('/maintenance/:id', async (req, res) => {
    const maintenanceId = req.params.id;
  
    try {
      const maintenance = await Maintenance.findById(maintenanceId);
  
      if (!maintenance) {
        return res.status(404).json({ message: 'Vehicle maintenance information not found.' });
      }
  
      res.json(maintenance);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while fetching vehicle maintenance information.' });
    }
  });

  
  /**
 * @route PUT /shipper/maintenanceupdates/
 * @description Update maintenance information for vehicles
 * @access public
 */

  // Route to update vehicle maintenance information by ID
  maintenancerouter.put('/maintenance/:id', async (req, res) => {
    const maintenanceId = req.params.id;
    const { shipperId, vehicleId, maintenanceDate, description } = req.body;
  
    try {
      const maintenance = await Maintenance.findById(maintenanceId);
  
      if (!maintenance) {
        return res.status(404).json({ message: 'Vehicle maintenance information not found.' });
      }
  
      maintenance.shipperId = shipperId;
      maintenance.vehicleId = vehicleId;
      maintenance.maintenanceDate = maintenanceDate;
      maintenance.description = description;
  
      await maintenance.save();
  
      res.json({ message: 'Vehicle maintenance information has been updated.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while updating vehicle maintenance information.' });
    }
  });

  
  /**
 * @route DELETE /shipper/deletemaintenance/
 * @description Delete maintenance information for vehicles
 * @access public
 */

  // Route to delete vehicle maintenance information by ID
  maintenancerouter.delete('/maintenance/:id', async (req, res) => {
    const maintenanceId = req.params.id;
  
    try {
      const maintenance = await Maintenance.findById(maintenanceId);
  
      if (!maintenance) {
        return res.status(404).json({ message: 'Vehicle maintenance information not found.' });
      }
  
      await maintenance.remove();
  
      res.json({ message: 'Vehicle maintenance information has been deleted.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while deleting vehicle maintenance information.' });
    }
  })
export default maintenancerouter;