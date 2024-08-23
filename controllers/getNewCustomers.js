const mongoose = require('mongoose');
const getGroupByInterval = require('../utils/dateHelper');
const moment = require('moment');

// New Customers Added Over Time
const getNewCustomers = async (req, res) => {
    try {
        const interval = req.query.interval || 'daily';
        const startDate = '2020-01-01';
        const endDate = '2021-12-31'
        const groupBy = getGroupByInterval(interval);

        const newCustomersData = await mongoose.connection.collection('shopifyCustomers').aggregate([
            {
                $addFields: {
                    created_at: {
                        $dateFromString: { dateString: '$created_at' }
                    }
                }
            },
            { $group: { _id: groupBy, newCustomers: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]).toArray();

        // Generate the complete date range based on the interval and fill missing data
        const dateRange = [];
        let currentDate = moment(startDate);
        const endMoment = moment(endDate);

        while (currentDate.isBefore(endMoment) || currentDate.isSame(endMoment)) {
            let formattedDate;
            switch (interval) {
                case 'daily':
                    formattedDate = currentDate.format('YYYY-MM-DD');
                    currentDate.add(1, 'day');
                    break;
                case 'monthly':
                    formattedDate = currentDate.format('YYYY-MM');
                    currentDate.add(1, 'month');
                    break;
                case 'quarterly':
                    const quarter = Math.ceil((currentDate.month() + 1) / 3);
                    formattedDate = `${currentDate.year()}-Q${quarter}`;
                    currentDate.add(1, 'quarter');
                    break;
                case 'yearly':
                    formattedDate = currentDate.format('YYYY');
                    currentDate.add(1, 'year');
                    break;
                default:
                    formattedDate = currentDate.format('YYYY-MM-DD');
                    currentDate.add(1, 'day');
            }
            dateRange.push(formattedDate);
        }

        const newCustomers = dateRange.map(date => {
            const foundData = newCustomersData.find(item => item._id === date);
            return {
                date: date,
                newCustomers: foundData ? foundData.newCustomers : 0
            };
        });

        res.json(newCustomers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching new customers', error });
    }
};

module.exports = getNewCustomers;