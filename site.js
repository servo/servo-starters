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
    componentDidMount: function() {
        this.props.loader(function(data) {
            if (this.isMounted()) {
                this.setState({
                    issues: data,
                    loading: false
                });
            }
        }.bind(this));
    },

    getInitialState: function() {
        return {
            issues: [],
            loading: true
        };
    },

    render: function() {
        if (this.state.loading) {
            return d.div({id: "loading"});
        } else {
            return d.ul(
                {id: "issues"},
                this.state.issues.map(issueItem)
            );
        }
    }
});

React.render(
    React.createElement(IssueList, {loader: getOpenIssues}),
    document.getElementById("open-issues")
);

React.render(
    React.createElement(IssueList, {loader: getPotentiallyOpenIssues}),
    document.getElementById("potentially-open-issues")
);

