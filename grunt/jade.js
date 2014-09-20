module.exports = {
    options: {
        pretty: false, // https://github.com/visionmedia/jade/issues/889
        compileDebug: true
    },
    public: {
        expand: true,
        cwd: 'public/',
        src: ['**/*.jade'],
        dest: 'build/public',
        ext: '.html'
    }
};
