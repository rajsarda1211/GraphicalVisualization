const mongoose = require('mongoose');
const getGroupByInterval = require('../utils/dateHelper');
const moment = require('moment');

// Sales Growth Rate Over Time
const getSalesGrowth = async (req, res) => {
    try {
        const interval = req.query.interval || 'daily';
        const startDate = req.query.startDate || '2022-01-01';
        const endDate = req.query.endDate || '2023-12-31';

        const groupBy = getGroupByInterval(interval);

        const sales = await mongoose.connection.collection('shopifyOrders').aggregate([
            {
                $addFields: {
                    created_at: {
                        $dateFromString: { dateString: '$created_at' }
                    }
                }
            },
            {
                $match: {
                    created_at: { $gte: new Date(startDate), $lte: new Date(endDate) }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    totalSales: { $sum: { $toDouble: '$total_price_set.shop_money.amount' } }
                }
            },
            { $sort: { _id: 1 } },
        ]).toArray();

        const allIntervals = [];
        let currentDate = moment(startDate);
        const endDateMoment = moment(endDate);

        while (currentDate.isSameOrBefore(endDateMoment)) {
            let formattedInterval;
            switch (interval) {
                case 'monthly':
                    formattedInterval = currentDate.format('YYYY-MM');
                    break;
                case 'quarterly':
                    const quarter = Math.ceil((currentDate.month() + 1) / 3);
                    formattedInterval = `${currentDate.year()}-Q${quarter}`;
                    break;
                case 'yearly':
                    formattedInterval = currentDate.format('YYYY');
                    break;
                default: 
                    formattedInterval = currentDate.format('YYYY-MM-DD');
            }
            allIntervals.push(formattedInterval);
            switch (interval) {
                case 'monthly':
                    currentDate = currentDate.add(1, 'months');
                    break;
                case 'quarterly':
                    if (currentDate.month() % 3 === 2) {
                        currentDate = currentDate.add(1, 'years').startOf('year');
                    } else {
                        currentDate = currentDate.add(3, 'months');
                    }
                    break;
                case 'yearly':
                    currentDate = currentDate.add(1, 'years');
                    break;
                default:
                    currentDate = currentDate.add(1, 'days');
            }
        }

        const salesWithAllIntervals = allIntervals.map(interval => {
            const salesForInterval = sales.find(sale => sale._id === interval);
            return {
                [interval === 'yearly' ? 'year' : interval === 'quarterly' ? 'quarter' : interval === 'monthly' ? 'month' : 'date']: interval,
                totalSales: salesForInterval ? salesForInterval.totalSales : 0,
            };
        });

        const salesWithGrowthRate = salesWithAllIntervals.map((sale, index, array) => {
            if (index === 0) {
                return { ...sale, growthRate: 0 };
            }
            const previousSale = array[index - 1];
            const growthRate = previousSale.totalSales === 0
                ? (sale.totalSales === 0 ? 0 : 1) 
                : (sale.totalSales - previousSale.totalSales) / previousSale.totalSales;
            return { ...sale, growthRate };
        });

        res.json([{ _id: null, sales: salesWithGrowthRate }]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sales growth rate', error });
    }
};

module.exports = getSalesGrowth;