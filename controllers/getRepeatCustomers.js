const mongoose = require('mongoose');
const getGroupByInterval = require('../utils/dateHelper');
const moment = require('moment');

// Number of Repeat Customers
const getRepeatCustomers = async (req, res) => {
    try {
        const interval = req.query.interval || 'daily';
        const startDate = '2022-01-01';
        const endDate = '2023-12-31'
        const groupBy = getGroupByInterval(interval);

        const repeatCustomersData = await mongoose.connection.collection('shopifyOrders').aggregate([
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
                        customer_id: '$customer.id',
                        interval: groupBy
                    },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $match: { orderCount: { $gt: 1 } }
            },
            {
                $group: {
                    _id: '$_id.interval',
                    repeatCustomers: { $addToSet: '$_id.customer_id' } 
                }
            },
            {
                $project: {
                    repeatCustomers: { $size: '$repeatCustomers' } 
                }
            },
            { $sort: { _id: 1 } }
        ]).toArray();

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

        const repeatCustomers = dateRange.map(date => {
            const foundData = repeatCustomersData.find(item => item._id === date);
            return {
                date: date,
                repeatCustomers: foundData ? foundData.repeatCustomers : 0
            };
        });

        res.json(repeatCustomers);
    } catch (error) {
        console.error('Error fetching repeat customers:', error);
        res.status(500).json({ message: 'Error fetching repeat customers', error });
    }
};

module.exports = getRepeatCustomers;