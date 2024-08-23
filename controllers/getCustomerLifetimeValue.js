const mongoose = require('mongoose');

// Customer Lifetime Value by Cohorts
const getCustomerLifetimeValue = async (req, res) => {
    try {
        const cohortData = await mongoose.connection.collection('shopifyOrders').aggregate([
            {
                $addFields: {
                    created_at: {
                        $dateFromString: { dateString: '$created_at' }
                    }
                }
            },
            {
                $group: {
                    _id: {
                        cohortMonth: { $dateToString: { format: '%Y-%m', date: '$created_at' } },
                        customer_id: '$customer_id'
                    },
                    totalValue: { $sum: { $toDouble: '$total_price_set.shop_money.amount' } }
                }
            },
            {
                $group: {
                    _id: '$_id.cohortMonth',
                    totalLifetimeValue: { $sum: '$totalValue' }
                }
            },
            { $sort: { _id: 1 } }
        ]).toArray();

        res.json(cohortData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customer lifetime value', error });
    }
};

module.exports = getCustomerLifetimeValue;