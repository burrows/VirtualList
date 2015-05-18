"use strict";

var slice = Array.prototype.slice;

var VirtualList = React.createClass({
  displayName: "VirtualList",

  propTypes: {
    content: React.PropTypes.array.isRequired,
    windowSize: React.PropTypes.number
  },

  getDefaultProps: function getDefaultProps() {
    return { windowSize: 10 };
  },

  getInitialState: function getInitialState() {
    return { winStart: 0, top: 0, bottom: null, scrollbarTop: 0, scrollbarHeight: 0 };
  },

  componentDidMount: function componentDidMount() {
    this.scroll(0);
  },

  render: function render() {
    var content = this.props.content,
        items = content.slice(this.state.winStart, this.state.winStart + this.props.windowSize),
        style = { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, overflowY: "hidden" },
        cstyle = {
      position: "absolute",
      top: typeof this.state.top === "number" ? -this.state.top : null,
      bottom: typeof this.state.bottom === "number" ? -this.state.bottom : null,
      left: 0,
      right: 0
    },
        sstyle = {
      position: "absolute",
      top: this.state.scrollbarTop,
      height: this.state.scrollbarHeight,
      right: 1,
      width: 7,
      backgroundColor: "#000",
      opacity: 0.5,
      borderRadius: 10
    };

    return React.createElement(
      "div",
      { className: "VirtualList", style: style, onWheel: this.onWheel },
      React.createElement(
        "div",
        { ref: "content", className: "VirtualList-content", style: cstyle },
        items.map(function (item, i) {
          return React.createElement(
            "div",
            { key: i, className: "VirtualList-item" },
            React.addons.cloneWithProps(this.props.children, { content: item })
          );
        }, this)
      ),
      React.createElement("div", { className: "VirtualList-scrollbar", style: sstyle, onMouseDown: this.onScrollStart })
    );
  },

  scroll: function scroll(delta) {
    var content = this.props.content,
        winSize = Math.min(this.props.windowSize, this.props.content.length),
        maxWinStart = content.length - winSize,
        winStart = this.state.winStart,
        node = this.getDOMNode(),
        contentNode = this.refs.content.getDOMNode(),
        itemNodes = slice.call(contentNode.childNodes),
        windowH = node.clientHeight,
        contentH = contentNode.offsetHeight,
        top = this.state.top,
        bottom = this.state.bottom,
        rem,
        i,
        n;

    if (delta < -contentH) {
      rem = Math.round((-delta - top) / this.averageItemHeight());
      winStart = Math.max(0, winStart - rem);
      top = 0;
      bottom = null;
    } else if (delta > contentH) {
      rem = Math.round((delta - contentH - top) / this.averageItemHeight());
      winStart = Math.min(maxWinStart, winStart + winSize + rem);
      top = 0;
      bottom = null;
    } else if (delta < 0) {
      if (top !== null) {
        bottom = contentNode.offsetHeight - node.offsetHeight - top;
        top = null;
      }

      if (winStart === 0 && -delta > contentH - windowH - bottom) {
        delta = -Math.max(0, contentH - windowH - bottom);
      }

      bottom = bottom + -delta;

      for (i = itemNodes.length - 1; i >= 0; i--) {
        if (winStart === 0) {
          break;
        }

        if (bottom > itemNodes[i].offsetHeight) {
          winStart--;
          bottom = bottom - itemNodes[i].offsetHeight;
        } else {
          break;
        }
      }
    } else if (delta > 0) {
      if (bottom !== null) {
        top = contentNode.offsetHeight - node.offsetHeight - bottom;
        bottom = null;
      }

      if (winStart === maxWinStart && delta > contentH - windowH - top) {
        delta = Math.max(0, contentH - windowH - top);
      }

      top += delta;

      for (i = 0, n = itemNodes.length; i < n; i++) {
        if (winStart === maxWinStart) {
          break;
        }

        if (top > itemNodes[i].offsetTop + itemNodes[i].offsetHeight) {
          winStart++;
          top = top - itemNodes[i].offsetHeight;
        } else {
          break;
        }
      }
    }

    // calculate scrollbar position and height
    var avgItemH = contentH / itemNodes.length;
    var estContentH = avgItemH * content.length;
    var windowContentRatio = windowH / estContentH;
    var scrollbarHeight = Math.min(windowH, Math.max(20, Math.round(windowH * windowContentRatio)));
    var scrollH = estContentH - windowH;
    var windowPos = top !== null ? winStart * avgItemH + top : winStart * avgItemH + (contentH - windowH - bottom);
    var windowPosRatio = windowPos / scrollH;
    var scrollbarTop = Math.round(windowH - scrollbarHeight) * windowPosRatio;

    this.setState({ winStart: winStart, top: top, bottom: bottom, scrollbarTop: scrollbarTop, scrollbarHeight: scrollbarHeight });
  },

  onWheel: function onWheel(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.deltaY !== 0) {
      this.scroll(e.deltaY);
    }
  },

  onScrollStart: function onScrollStart(e) {
    this.clientY = e.clientY;
    document.addEventListener("mousemove", this._onScroll = this.onScroll.bind(this));
    document.addEventListener("mouseup", this._onScrollStop = this.onScrollStop.bind(this));
  },

  onScroll: function onScroll(e) {
    e.preventDefault();
    if (this.clientY === e.clientY) {
      return;
    }
    var estContentH = this.props.content.length * this.averageItemHeight();
    var windowH = this.getDOMNode().clientHeight;
    var rawDelta = e.clientY - this.clientY;
    var delta = Math.round(rawDelta / windowH * estContentH);
    this.scroll(delta);
    this.clientY = e.clientY;
  },

  onScrollStop: function onScrollStop() {
    this.clientY = null;
    document.removeEventListener("mousemove", this._onScroll);
    document.removeEventListener("mouseup", this._onScrollStop);
  },

  averageItemHeight: function averageItemHeight() {
    var contentNode = this.refs.content.getDOMNode();
    return contentNode.offsetHeight / contentNode.childNodes.length;
  }
});

module.exports = VirtualList;
