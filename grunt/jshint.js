module.exports = {
    options: {
        devel: true,
        node: true,
        '-W030': true,//Expected an assignment or function call and instead saw an expression.
        '-W097': true,//Use the function form of 'use strict'.
        globals: {
        }
    },
    libs: ['libs/**/*.js'],
    public: ['public/js/**/*.js']
};
