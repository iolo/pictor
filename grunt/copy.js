module.exports = {
    public: {
        expand: true,
        cwd: 'public/',
        src: ['**', '!**/*.jade', '!**/*.less'],
        dest: 'build/public'
    }
};
