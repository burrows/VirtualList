var slice = Array.prototype.slice;

var VirtualList = React.createClass({
  propTypes: {
    items: React.PropTypes.array.isRequired,
    windowSize: React.PropTypes.number
  },

  getDefaultProps() {
    return {windowSize: 10};
  },

  getInitialState() {
    return {winStart: 0, top: 0, bottom: null, scrollbarTop: 0, scrollbarHeight: 0};
  },

  componentDidMount() {
    this.scroll(0);
  },

  render() {
    var items   = this.props.items.slice(this.state.winStart, this.state.winStart + this.props.windowSize);
    var style   = {position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflowY: 'hidden'};
    var cstyle  = {
      position: 'absolute',
      top: typeof this.state.top === 'number' ? -this.state.top : null,
      bottom: typeof this.state.bottom === 'number' ? -this.state.bottom : null,
      left: 0,
      right: 0
    };
    var sstyle  = {
      position: 'absolute',
      top: this.state.scrollbarTop,
      height: this.state.scrollbarHeight,
      right: 1,
      width: 7,
      backgroundColor: '#000',
      opacity: 0.5,
      borderRadius: 10
    };

    return (
      <div className="VirtualList" tabIndex="0" style={style} onWheel={this.onWheel} onKeyDown={this.onKeyDown}>
        <div ref="content" className="VirtualList-content" style={cstyle}>
          {items.map(function(item, i) {
            return (
              <div key={i} className="VirtualList-item">
                {React.addons.cloneWithProps(this.props.children, {item, itemIndex: this.state.winStart + i})}
              </div>
            );
          }, this)}
        </div>
        <div className="VirtualList-scrollbar" style={sstyle} onMouseDown={this.onScrollStart}>
        </div>
      </div>
    );
  },

  componentDidUpdate() {
    var first = this.findFirstVisible();

    if (this.props.onFirstVisibleChange && first !== this._first) {
      this.props.onFirstVisibleChange(first);
      this._first = first;
    }
  },

  scroll(delta) {
    var items = this.props.items;
    var winSize = Math.min(this.props.windowSize, items.length);
    var maxWinStart = items.length - winSize;
    var winStart = this.state.winStart;
    var node = this.getDOMNode();
    var contentNode = this.refs.content.getDOMNode();
    var itemNodes = slice.call(contentNode.childNodes);
    var windowH = node.clientHeight;
    var contentH = contentNode.offsetHeight;
    var top = this.state.top;
    var bottom = this.state.bottom;
    var rem, i, n;

    if (delta < -contentH) {
      rem = Math.round((-delta - top) / this.averageItemHeight());
      winStart = Math.max(0, winStart - rem);
      top = 0;
      bottom = null;
    }
    else if (delta > contentH) {
      rem = Math.round((delta - contentH - top) / this.averageItemHeight());
      winStart = Math.min(maxWinStart, winStart + winSize + rem);
      top = 0;
      bottom = null;
    }
    else if (delta < 0) {
      if (top !== null) {
        bottom = contentNode.offsetHeight - node.offsetHeight - top;
        top = null;
      }

      if (winStart === 0 && -delta > contentH - windowH - bottom) {
        delta = -Math.max(0, contentH - windowH - bottom);
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
    else if (delta > 0) {
      if (bottom !== null) {
        top = contentNode.offsetHeight - node.offsetHeight - bottom;
        bottom = null;
      }

      if (winStart === maxWinStart && delta > contentH - windowH - top) {
        delta = Math.max(0, contentH - windowH - top);
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

    // calculate scrollbar position and height
    var avgItemH = contentH / itemNodes.length;
    var estContentH = avgItemH * items.length;
    var windowContentRatio = windowH / estContentH;
    var scrollbarHeight = Math.min(windowH, Math.max(20, Math.round(windowH * windowContentRatio)));
    var scrollH = estContentH - windowH;
    var windowPos = top !== null ? winStart * avgItemH + top :
      winStart * avgItemH + (contentH - windowH - bottom);
    var windowPosRatio = windowPos / scrollH;
    var scrollbarTop = Math.round(windowH - scrollbarHeight) * windowPosRatio;

    this.setState({winStart, top, bottom, scrollbarTop, scrollbarHeight});

    return this;
  },

  pageDown() {
    return this.scroll(this.getDOMNode().clientHeight);
  },

  pageUp() {
    return this.scroll(-this.getDOMNode().clientHeight);
  },

  onWheel(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.deltaY !== 0) { this.scroll(e.deltaY); }
  },

  onKeyDown(e) {
    if (e.which === 32)      { if (e.shiftKey) { this.pageUp(); } else { this.pageDown(); } }
    else if (e.which === 33) { this.pageUp(); }
    else if (e.which === 34) { this.pageDown(); }
    else if (e.which === 38) { this.scroll(-20); }
    else if (e.which === 40) { this.scroll(20); }
  },

  onScrollStart(e) {
    this.clientY = e.clientY;
    document.addEventListener('mousemove', this.onScroll);
    document.addEventListener('mouseup', this.onScrollStop);
  },

  onScroll(e) {
    e.preventDefault();
    if (this.clientY === e.clientY) { return; }
    var estContentH = this.props.items.length * this.averageItemHeight();
    var windowH = this.getDOMNode().clientHeight;
    var rawDelta = e.clientY - this.clientY;
    var delta = Math.round((rawDelta / windowH) * estContentH);
    this.scroll(delta);
    this.clientY = e.clientY;
  },

  onScrollStop() {
    this.clientY = null;
    document.removeEventListener('mousemove', this.onScroll);
    document.removeEventListener('mouseup', this.onScrollStop);
  },

  averageItemHeight() {
    var contentNode = this.refs.content.getDOMNode();
    return contentNode.offsetHeight / contentNode.childNodes.length;
  },

  findFirstVisible() {
    var contentNode   = this.refs.content.getDOMNode();
    var contentOffset = -contentNode.offsetTop;
    var itemNodes     = slice.call(contentNode.childNodes);
    var i             = this.state.winStart;

    while (itemNodes.length && itemNodes[0].offsetTop + itemNodes[0].offsetHeight < contentOffset) {
      itemNodes.shift();
      i++;
    }

    return this.props.items[i];
  }
});

export default VirtualList;

