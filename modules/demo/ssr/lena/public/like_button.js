'use strict';

const e = React.createElement;

class LikeButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {liked: false};
  }

  render() {
    console.log('rerender');
    console.log(this.props.tabledata);
    if (this.state.liked) { return 'You liked comment number ' + this.props.tabledata; }

    return e('button', {onClick: () => this.setState({liked: true})}, 'Like');
  }
}

const domContainer = document.querySelector('#like_button_container');
const tabledata    = parseInt(domContainer.dataset.tabledata, 10);
ReactDOM.render(e(LikeButton, {tabledata: tabledata}), domContainer);
