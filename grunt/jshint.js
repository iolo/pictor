module.exports = {
    options: {
        devel: true,
        browser: true,
        node: true,
        '-W030': true,//Expected an assignment or function call and instead saw an expression.
        '-W097': true,//Use the function form of 'use strict'.
        globals: {
            $: true,
            angular: true
        }
    },
    config: ['config/**/*.js'],
    lib: ['lib/**/*.js'],
    public: ['public/**/*.js']
};
