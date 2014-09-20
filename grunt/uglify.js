module.exports = {
    options: {
        banner: '/*! <%=pkg.name%> <%=pkg.version%> (build at ' + (new Date()) + ') */\n'
    },
    public: {
        files: {
            'build/public/js/all.min.js': ['<%=concat.public.dest%>']
        }
    }
};
