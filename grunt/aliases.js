module.exports = {
    default: ['build'],
    test: ['jshint', 'mochaTest'],
    docs: ['doxx', 'apidoc'],
    build: ['jshint', 'concat', 'uglify', 'jade', 'copy'],
    deploy: ['build', 'docs', 'rsync'],
    run: ['build', 'node', 'watch']
};
