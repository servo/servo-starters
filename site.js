var d = React.DOM;

var getIssues = function(callback) {
    var issuesUrl = "https://api.github.com/repos/servo/servo/issues";

    var easy = $.ajax({
        dataType: "json",
        url: issuesUrl,
        data: {labels: "E-Easy"},
    });

    var lessEasy = $.ajax({
        dataType: "json",
        url: issuesUrl,
        data: {labels: "E-Less easy"},
    });

    $.when(easy, lessEasy).done(function(r1, r2) {
        var easies = r1[0],
            lessEasies = r2[0],
            all = easies.concat(lessEasies);

        all.sort(function(l, r) { return r.number - l.number });

        callback(all);
    });
};

var Issue = React.createClass({
    render: function() {
        return d.li(
            {className: "issue"},
            d.a(
                {href: this.props.html_url, title: this.props.title},
                this.props.title
            )
        );
    }
});

var issueItem = function(data) {
    return React.createElement(Issue, data);
}

var IssueList = React.createClass({
    componentDidMount: function() {
        getIssues(function(data) {
            if (this.isMounted()) {
                this.setState({
                    issues: data
                });
            }
        }.bind(this));
    },

    getInitialState: function() {
        return {
            issues: []
        };
    },

    render: function() {
        return d.ul(
            {id: "issues"},
            this.state.issues.map(issueItem)
        );
    }
});

React.render(
    React.createElement(IssueList, {}),
    document.getElementById("app")
);

