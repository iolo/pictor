module.exports = {
    options: {
        pretty: false, // https://github.com/visionmedia/jade/issues/889
        compileDebug: true
    },
    app: {
        expand: true,
        cwd: 'app/',
        src: ['**/*.jade'],
        dest: 'build/app',
        ext: '.html'
    }
};
