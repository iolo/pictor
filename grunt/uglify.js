module.exports = {
    options: {
        banner: '/*! <%=pkg.name%> <%=pkg.version%> (build at ' + (new Date()) + ') */\n'
    },
    app: {
        files: {
            'build/app/js/all.min.js': ['<%=concat.app.dest%>']
        }
    }
};
