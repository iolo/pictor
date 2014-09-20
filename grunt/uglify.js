module.exports = {
    options: {
        banner: '/*! <%=pkg.name%> - v<%=pkg.version%> - <%=grunt.template.today("yyyy-mm-dd")%> */\n'
    },
    public: {
        files: {
            'build/public/js/all.min.js': ['<%=concat.public.dest%>']
        }
    }
};
