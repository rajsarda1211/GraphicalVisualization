const express = require('express');
const getTotalSales = require('../controllers/getTotalSales')
const getSalesGrowth = require('../controllers/getSalesGrowth')
const getNewCustomers = require('../controllers/getNewCustomers')
const getRepeatCustomers = require('../controllers/getRepeatCustomers')
const getGeographicalDistribution = require('../controllers/getGeographicalDistribution')
const getCustomerLifetimeValue = require('../controllers/getCustomerLifetimeValue')
const router = express.Router();

router.get('/total-sales', getTotalSales);
router.get('/sales-growth', getSalesGrowth);
router.get('/new-customers', getNewCustomers);
router.get('/repeat-customers', getRepeatCustomers);
router.get('/geographical-distribution', getGeographicalDistribution);
router.get('/customer-lifetime-value', getCustomerLifetimeValue);

module.exports = router;
