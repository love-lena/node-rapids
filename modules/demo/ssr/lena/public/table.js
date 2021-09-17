'use strict';

const e = React.createElement;

class Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {liked: false};
  }

  render() {
    console.log('rerender');
    console.log(this.props.tabledata);
    if (this.state.liked) { return 'You liked comment number ' + this.props.tabledata; }

    return <><table><tr><th>Company</th>
          <th>Contact</th><th>Country</th>
        </tr>
      <tr><td>Alfreds Futterkiste</td>
          <td>Maria Anders</td><td>Germany</td>
        </tr>
      <tr><td>Centro comercial Moctezuma</td>
          <td>Francisco Chang</td>
      <td>Mexico</td>
        </tr></table>
           </>
  }
}

const domContainer = document.querySelector('#like_button_container');
const tabledata    = parseInt(domContainer.dataset.tabledata, 10);
ReactDOM.render(e(Table, {tabledata: tabledata}), domContainer);
