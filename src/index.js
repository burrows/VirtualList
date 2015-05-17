var DEFAULT_WIN_SIZE = 10;

var slice = Array.prototype.slice;

var VirtualList = React.createClass({
  propTypes: {
    content: React.PropTypes.array.isRequired,
    windowSize: React.PropTypes.number
  },

  componentWillMount() {
    this.itemView = this.props.children;
    this.state = {winSize: this.props.windowSize || DEFAULT_WIN_SIZE, winStart: 0, top: 0, bottom: null};
  },

  render() {
    var content = this.props.content,
        items   = content.slice(this.state.winStart, this.state.winStart + this.state.winSize),
        style   = {position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflowY: 'hidden'},
        cstyle  = {
          position: 'absolute',
          top: typeof this.state.top === 'number' ? -this.state.top : null,
          bottom: typeof this.state.bottom === 'number' ? -this.state.bottom : null,
          left: 0,
          right: 0
        };

    return (
      <div className="VirtualList" style={style} onWheel={this.onWheel}>
        <div ref="content" className="VirtualList-content" style={cstyle}>
          {items.map(function(item, i) {
            return (
              <div key={i} className="VirtualList-item">
                {React.addons.cloneWithProps(this.itemView, {content: item})}
              </div>
            );
          }, this)}
        </div>
      </div>
    );
  },

  scroll(delta) {
    var maxWinSize = this.props.windowSize || DEFAULT_WIN_SIZE,
        winSize = Math.min(maxWinSize, this.props.content.length),
        maxWinStart = content.length - winSize,
        winStart = Math.min(maxWinStart, this.state.winStart),
        node = this.getDOMNode(),
        contentNode = this.refs.content.getDOMNode(),
        contentH = contentNode.offsetHeight,
        itemNodes = slice.call(contentNode.childNodes),
        top = this.state.top,
        bottom = this.state.bottom,
        i, n;

    if (delta > 0) {
      if (typeof bottom === 'number') {
        top = contentNode.offsetHeight - node.offsetHeight - bottom;
        bottom = null;
      }

      top += delta;

      for (i = 0, n = itemNodes.length; i < n; i++) {
        if (winStart === maxWinStart) { break; }

        if (top > itemNodes[i].offsetTop + itemNodes[i].offsetHeight) {
          winStart++;
          top = top - itemNodes[i].offsetHeight;
        }
        else {
          break;
        }
      }
    }
    else if (delta < 0) {
      if (typeof top === 'number') {
        bottom = contentNode.offsetHeight - node.offsetHeight - top;
        top = null;
      }

      bottom = bottom + (-delta);

      for (i = itemNodes.length - 1; i >= 0; i--) {
        if (winStart === 0) { break; }

        if (bottom > itemNodes[i].offsetHeight) {
          winStart--;
          bottom = bottom - itemNodes[i].offsetHeight;
        }
        else {
          break;
        }
      }
    }

    this.setState({winStart, top, bottom});
  },

  onWheel(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.deltaY !== 0) { this.scroll(e.deltaY); }
  }
});

export default VirtualList;

