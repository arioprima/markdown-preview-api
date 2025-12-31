export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 20;

export const parsePaginationOptions = (query = {}, defaults = {}) => {
    const {
        page = defaults.page || DEFAULT_PAGE,
        limit = defaults.limit || DEFAULT_LIMIT,
        orderBy = defaults.orderBy || 'created_at',
        order = defaults.order || 'desc'
    } = query;

    const parsedPage = Math.max(1, parseInt(page, 10) || DEFAULT_PAGE);
    const parsedLimit = Math.min(
        MAX_LIMIT,
        Math.max(1, parseInt(limit, 10) || DEFAULT_LIMIT)
    );

    const validOrder = ['asc', 'desc'].includes(order?.toLowerCase())
        ? order.toLowerCase()
        : 'desc';

    return {
        page: parsedPage,
        limit: parsedLimit,
        orderBy,
        order: validOrder,
        skip: (parsedPage - 1) * parsedLimit
    };
};

export const buildPaginationMeta = (total, page, limit) => {
    const totalPages = Math.ceil(total / limit);

    return {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
    };
};

export const paginatedResponse = (data, total, options) => {
    const { page, limit } = options;

    return {
        data,
        pagination: buildPaginationMeta(total, page, limit)
    };
};

export const paginatedQuery = async (model, where, options, queryOptions = {}) => {
    const { page, limit, skip, orderBy, order } = parsePaginationOptions(options);

    const [data, total] = await Promise.all([
        model.findMany({
            where,
            orderBy: { [orderBy]: order },
            take: limit,
            skip,
            ...queryOptions
        }),
        model.count({ where })
    ]);

    return paginatedResponse(data, total, { page, limit });
};
