module.exports = function (grunt, options) {
    return {
        options: {
            compileDebug: true,
            pretty: options.env !== 'production',
            data: options
        },
        public: {
            expand: true,
            cwd: 'public/',
            src: ['**/*.jade'],
            dest: 'build/public',
            ext: '.html'
        }
    };
};
