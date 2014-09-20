module.exports = {
    test: ['jshint', 'mochaTest'],
    docs: ['doxx', 'apidoc'],
    build: ['clean', 'jshint', 'copy', 'jade', 'less', 'concat', 'uglify'],
    deploy: ['build', 'docs', 'rsync'],
    run: ['build', 'shell', 'watch'],
    default: ['run']
};
