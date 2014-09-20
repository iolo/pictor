module.exports = {
    options: {
        pretty: false,
        compileDebug: true
    },
    public: {
        expand: true,
        cwd: 'public/',
        src: ['**/*.less'],
        dest: 'build/public',
        ext: '.css'
    }
};
