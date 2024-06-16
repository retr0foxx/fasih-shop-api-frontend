module.exports = ({ limit, page, ...options }) => ({
    offset: limit && page ? parseInt(limit*page) : undefined,
    limit: limit ? parseInt(limit) : undefined,
    ...options
});