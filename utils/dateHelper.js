const getGroupByInterval = (interval) => {
    switch (interval) {
        case 'daily':
            return { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } };
        case 'monthly':
            return { $dateToString: { format: '%Y-%m', date: '$created_at' } };
        case 'quarterly':
            return {
                $concat: [
                    { $dateToString: { format: '%Y', date: '$created_at' } },
                    '-Q',
                    { $toString: { $ceil: { $divide: [{ $month: '$created_at' }, 3] } } }
                ]
            };
        case 'yearly':
            return { $dateToString: { format: '%Y', date: '$created_at' } };
        default:
            return { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } };
    }
};

module.exports = getGroupByInterval;
