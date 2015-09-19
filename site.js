var d = React.DOM;

var getPotentiallyOpenIssues = function(callback) {
    var issuesUrl = "https://api.github.com/search/issues";
    var today = new Date(),
        twoWeeksAgo = new Date(today - 86400000 * 14),
        olderThanTwoWeeks = "<" + twoWeeksAgo.toISOString().slice(0, 10);

    var easy = $.ajax({
        dataType: "json",
        url: issuesUrl,
        data: "q=created:" + olderThanTwoWeeks + "+state:open+label:C-assigned+label:E-Easy+repo:servo/servo&sort=created"
    });

    var lessEasy = $.ajax({
        dataType: "json",
        url: issuesUrl,
        data: "q=created:" + olderThanTwoWeeks + "+state:open+label:C-assigned+label:\"E-Less%20easy\"+repo:servo/servo&sort=created"
    });

    $.when(easy, lessEasy).done(function(r1, r2) {
        var easies = r1[0].items,
            lessEasies = r2[0].items,
            all = easies.concat(lessEasies);

        all.sort(function(l, r) { return r.created_at.localeCompare(l.created_at) });

        callback(all);
    });
};

var getOpenIssues = function(callback) {
    var issuesUrl = "https://api.github.com/search/issues";

    var easy = $.ajax({
        dataType: "json",
        url: issuesUrl,
        data: "q=state:open+-label:C-assigned+label:E-Easy+repo:servo/servo&sort=created"
    });

    var lessEasy = $.ajax({
        dataType: "json",
        url: issuesUrl,
        data: "q=state:open+-label:C-assigned+label:\"E-Less%20easy\"+repo:servo/servo&sort=created"
    });

    $.when(easy, lessEasy).done(function(r1, r2) {
        var easies = r1[0].items,
            lessEasies = r2[0].items,
            all = easies.concat(lessEasies);

        all.sort(function(l, r) { return r.created_at.localeCompare(l.created_at) });

        callback(all);
    });
};

var label = function(data) {
    var color = (data.color == "d7e102" ||
                 data.color == "bfd4f2" ||
                 data.color == "d4c5f9" ||
                 data.color == "02d7e1") ? "black" : "white";
    return d.span(
        {className: "label", style: {backgroundColor: "#" + data.color, color: color}},
        data.name
    );
}

var FeelingAdventurous = React.createClass({
    gotoRandomIssue: function() {
        var issues = this.props.issues;

        var randomIndex = Math.floor(Math.random() * (issues.length + 1));

        window.location.href = issues[randomIndex].html_url;
    },

    render: function() {
        return d.button(
            {className: "button", onClick: this.gotoRandomIssue},
            "I'm Feeling Adventurous..."
        );
    }
});

var feelingAdventurous = function(issues) {
    return React.createElement(FeelingAdventurous, {issues: issues});
};

var Labels = React.createClass({
    render: function() {
        return d.div(
            {className: "labels"},
            this.props.labels.map(label)
        );
    }
});

var labels = function(data) {
    return React.createElement(Labels, data);
}

var Issue = React.createClass({
    render: function() {
        return d.li(
            {className: "issue"},
            d.div(
                {},
                "[ ",
                d.a(
                    {
                        className: "issue-link",
                        href: this.props.html_url,
                        title: this.props.title
                    },
                    this.props.number
                ),
                " ] - ",
                d.span(
                    {className: "issue-desc"},
                    this.props.title
                )
            ),
            labels(this.props)
        );
    }
});

var issueItem = function(data) {
    return React.createElement(Issue, data);
}

var IssueList = React.createClass({
    getInitialState: function() {
        return {
            limited: true
        };
    },

    render: function() {
        if (this.props.loading) {
            return d.div({id: "loading"});
        } else {
            var issues;

            if (this.state.limited) {
                issues = this.props.issues.map(issueItem)
                                          .slice(0, 5)
                                          .concat(
                                              d.div(
                                                  {
                                                      className: "view-all",
                                                      onClick: function() {
                                                          this.setState({limited: false})
                                                      }.bind(this)
                                                  },
                                                  "view all..."
                                              )
                                          );
            } else {
                issues = this.props.issues.map(issueItem);
            }

            return d.ul(
                {id: "issues"},
                issues
            );
        }
    }
});

var issueList = function(issues, loading) {
    return React.createElement(IssueList, {issues: issues, loading: loading});
};

var App = React.createClass({
    componentDidMount: function() {
        getOpenIssues(function(data) {
            this.setState({
                openIssues: data,
                openIssuesLoading: false
            });
        }.bind(this));

        getPotentiallyOpenIssues(function(data) {
            this.setState({
                potentiallyOpenIssues: data,
                potentiallyOpenIssuesLoading: false
            });
        }.bind(this));
    },

    getInitialState: function() {
        return {
            openIssuesLoading: true,
            potentiallyOpenIssuesLoading: true,
            openIssues: [],
            potentiallyOpenIssues: []
        };
    },

    render: function() {
        return d.div(
            {},
            this.state.openIssuesLoading ? [] : feelingAdventurous(this.state.openIssues),
            d.h2({}, "Open Issues"),
            issueList(this.state.openIssues, this.state.openIssuesLoading),
            d.h2({}, "Potentially Open Issues"),
            issueList(this.state.potentiallyOpenIssues, this.state.potentiallyOpenIssuesLoading)
        );
    }
});

React.render(
    React.createElement(App, {}),
    document.getElementById("app")
);

