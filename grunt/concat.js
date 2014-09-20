module.exports = {
    options: {
        banner: '/*! <%=pkg.name%> - v<%=pkg.version%> - <%=grunt.template.today("yyyy-mm-dd")%> */\n',
        process: function (src, filepath) {
            return '/*! ' + filepath + ' */' + src;
        }
    },
    public: {
        src: ['public/js/**/*.js'],
        dest: 'build/public/js/all.js'
    }
};
