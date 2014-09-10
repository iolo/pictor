'use strict';

/**
 * auth middleware.
 *
 * @module pictor.routes.auth
 */

module.exports = function (opts) {
    return function (req, res, next) {
        return next();
//        if (req.method === 'GET' && !/(upload|delete|rename|files)/.test(req.path)) {
//            return next();
//        }
//        return res.send(new errors.Forbidden());
    };
};
