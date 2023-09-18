import express from "express"
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js";
import Kios from "../../model/Kios.js";

const kiosAdminRoute = express.Router();

kiosAdminRoute.get('/', async (req, res) => {
    try {
      const kios = await Kios.find()
      sendSuccess(res, 'Get inventory success', kios);
    } catch (err) {
        console.log(err)
        return sendServerError(err)
    }
});

kiosAdminRoute.get('/:id', getKios, async (req, res) => {
    sendSuccess(res, 'Get a single inventory success', res.kios)
  });

kiosAdminRoute.post('/', async (req, res) => {
    const { name, quantity, price } = req.body;
    try {  
      const kios = new Kios({
        name,
        quantity,
        price
      });
  
      const newKios = await kios.save();
      sendSuccess(res, 'Created Kios success', newKios)
      
    } catch (err) {
        console.log(err)
        return sendServerError(err)
    }
  });

  // Update an inventory item by ID
kiosAdminRoute.patch('/:id', getKios, async (req, res) => {
    const { quantity, name, price } = req.body;
    if (quantity) {
        res.kios.quantity = quantity;
    }

    if (name) {
        res.kios.name = name;
    }

    if (price) {
        res.kios.price = price;
    }
  
    try {
        const updatedKios = await res.kios.save({ validateBeforeSave: false });
        sendSuccess(res, 'Update Kios success', updatedKios);
    } catch (err) {
        console.log(err)
        return sendServerError(err)
    }
  });
  
  // Delete an inventory item by ID
kiosAdminRoute.delete('/:id', getKios, async (req, res) => {
    try {
        await res.kios.remove();
        // res.json({ message: 'Inventory item has been deleted' });
        sendSuccess(res, 'Delete inventory success');
    } catch (err) {
        console.log(err)
        return sendServerError(err)
    }
});


// Middleware function to get inventory item by ID
async function getKios(req, res, next) {
    try {
        const kios = await Kios.findById(req.params.id);
        if (!kios) {
            return sendError(res, 'kios item not found')
        }
        res.kios = kios;
        next();
    } catch (err) {
        console.log(err)
        return sendServerError(err)
    }
}

export default kiosAdminRoute