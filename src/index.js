var clone = React.addons.cloneWithProps;

class VirtualList extends React.Component {
  render() {
    var content = this.props.content, itemView = this.props.children[0];
    return (
      <div className="VirtualList">
        {content.map(function(c) {
          return (
            <div className="VirtualList-item">
              {clone(itemView, {content: c})}
            </div>
          );
        })}
      </div>
    );
  }
}

VirtualList.propTypes = {
  content: React.PropTypes.array.isRequired
};

export default VirtualList;
