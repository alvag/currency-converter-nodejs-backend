const { successResponse } = require('../helpers/response.helper');

const get = (req, res) => {
    successResponse(res, { message: 'Rest Server corriendo correctamente.' });
};

module.exports = {
    get
};
