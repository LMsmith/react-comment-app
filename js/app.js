var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');

class CommentBox extends React.Component {
    constructor() {
        super();
        this.state = {
            showComments: false,
            comments:  []
        }
    }

    componentWillMount() {
        this._fetchComments();
    }

    componentDidMount() {
        this._timer = setInterval(() => this._fetchComments(), 5000);
    }

    componentWillUnmount() {
        clearInterval(this._timer);
    }

    render() {
        const comments = this._getComments();
        let commentNodes;
        let buttonText = "Show Comments";
        if(this.state.showComments) {
            commentNodes = <div className="comment-list">{comments}</div>
            buttonText = "Hide Comments";
        } else {
            buttonText = "Show Comments";
        }
        return (
            <div className="comment-box">
                <CommentForm addComment={this._addComment.bind(this)} />
                <div className="divide"></div>
                <h3>Comments</h3>
                <button className="toggle" onClick={this._handleClick.bind(this)}>{buttonText}</button>
                <h4 className="comment-count">{this._getCommentsTitle(comments.length)}</h4>
                {commentNodes}
            </div>
        );
    }

    _getComments() {
        return this.state.comments.map((comment) => {
            return (<Comment author={comment.author}
                body={comment.body}
                id={comment.id}
                key={comment.id}
                onDelete={this._deleteComment.bind(this)} />);
        });
    }

    _getCommentsTitle(commentCount) {
        if(commentCount === 0) {
            return "No comments yet";
        } else if(commentCount === 1) {
            return "1 comment";
        } else {
            return `${commentCount} comments`;
        }
    }

    _handleClick() {
        this.setState({showComments: !this.state.showComments});
    }

    _addComment(author, body) {
        const comment = {author, body};
        const url = 'http://localhost:3000/data';

        $.ajax({
            dataType: 'json',
            method: 'POST',
            data: comment,
            url: url,
            success: comment => {
                this.setState({ comments: this.state.comments.concat(comment) });
            }
        });
    }

    _fetchComments() {
        const url = 'http://localhost:3000/data';

        $.ajax({
            dataType: 'json',
            method: 'GET',
            url: url,
            success: (comments) => {
                this.setState({comments});
            }
        });
    }

    _deleteComment(comment) {
        const commentId = comment.props.id.toString();
        const url = `http://localhost:3000/data/${commentId}`;

        $.ajax({
            dataType: 'json',
            method: 'DELETE',
            url: url
        });

        const comments = [...this.state.comments];
        const commentIndex = comments.indexOf(comment);
        comments.splice(commentIndex, 1);

        this.setState({comments});
    }
}

class Comment extends React.Component {
    render() {
        return (
            <div className="comment">
                <p className="comment-header">{this.props.author}</p>
                <p className="comment-body">{this.props.body}</p>
                <div className="comment-footer">
                    <a href="#" className="comment-footer-delete" onClick={this._handleDelete.bind(this)}>
                        Delete comment
                    </a>
                </div>
            </div>
        )
    }

    _handleDelete(e) {
        e.preventDefault();
        if(confirm('Are you sure?')) {
            this.props.onDelete(this);
        }
    }
}

class CommentForm extends React.Component {
    render() {
        return (
            <form className="comment-form" onSubmit={this._handleSubmit.bind(this)}>
                <label>Join the discussion</label>
                <div className="comment-form-fields">
                    <input placeholder="Name" ref={(input) => this._author = input}/>
                    <textarea placeholder="Comment" ref={(textarea) => this._body = textarea}></textarea>
                </div>
                <div className="comment-form-actions">
                    <button type="submit">
                        Post comment
                    </button>
                </div>
            </form>
        );
    }

    _handleSubmit(e) {
        e.preventDefault();

        let author = this._author;
        let body = this._body;

        this.props.addComment(author.value, body.value);
    }
}

ReactDOM.render(<CommentBox />,  document.getElementById("comments-app"));