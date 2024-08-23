const mongoose = require('mongoose');

// Geographical Distribution of Customers
const getGeographicalDistribution = async (req, res) => {
    try {
        const customers = await mongoose.connection.collection('shopifyCustomers').aggregate([
            {
                $addFields: {
                    created_at: {
                        $dateFromString: { dateString: '$created_at' }
                    }
                }
            },
            { $group: { _id: '$default_address.city', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).toArray();

        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching geographical distribution', error });
    }
};

module.exports = getGeographicalDistribution;