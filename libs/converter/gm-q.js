'use strict';

/**
 * kriskowal's Q support for gm
 *
 * @module pictor.converter.gm
 */

var
    Q = require('q'),
    Q_INSTANCE_METHODS = [
        // getters
        'identify',
        'identifyPattern',
        'format',
        'depth',
        'filesize',
        'size',
        'color',
        'orientation',
        'res',
        // command
        'write',
        'stream',
        'toBuffer',
        // convenience
        'thumb',
        'morph'
    ];

function qualify(gm) {
    gm = gm || require('gm');
    if (!gm.__qualified__) {
        gm.__qualified__ = true;
        Q_INSTANCE_METHODS.forEach(function (methodName) {
            gm.prototype[methodName + 'Q'] = function () {
                return Q.npost(this, methodName, arguments);
            };
        });
    }
    return gm;
}

module.exports = qualify;

