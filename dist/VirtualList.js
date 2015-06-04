this["VirtualList"] =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var slice = Array.prototype.slice;

	var Item = React.createClass({
	  displayName: "Item",

	  shouldComponentUpdate: function shouldComponentUpdate(nextProps) {
	    return this.props.item !== nextProps.item || this.props.itemIndex !== nextProps.itemIndex;
	  },

	  render: function render() {
	    var itemView = React.addons.cloneWithProps(this.props.itemView, {
	      item: this.props.item, itemIndex: this.props.itemIndex
	    });
	    return React.createElement(
	      "div",
	      { className: "VirtualList-item" },
	      itemView
	    );
	  }
	});

	var Items = React.createClass({
	  displayName: "Items",

	  shouldComponentUpdate: function shouldComponentUpdate(nextProps) {
	    return this.props.winStart !== nextProps.winStart;
	  },

	  render: function render() {
	    var itemView = this.props.itemView;
	    var winStart = this.props.winStart;
	    var winSize = this.props.winSize;

	    return React.createElement(
	      "div",
	      { className: "VirtualList-items" },
	      this.props.items.slice(winStart, winStart + winSize).map(function (item, i) {
	        return React.createElement(Item, {
	          key: (winStart + i) % winSize,
	          itemView: itemView,
	          item: item,
	          itemIndex: winStart + i });
	      })
	    );
	  }
	});

	var VirtualList = React.createClass({
	  displayName: "VirtualList",

	  propTypes: {
	    items: React.PropTypes.array.isRequired,
	    windowSize: React.PropTypes.number
	  },

	  getDefaultProps: function getDefaultProps() {
	    return { windowSize: 10 };
	  },

	  getInitialState: function getInitialState() {
	    return { winStart: 0, top: 0, scrollbarTop: 0, scrollbarHeight: 0 };
	  },

	  componentDidMount: function componentDidMount() {
	    this.scroll(0);
	  },

	  render: function render() {
	    var scrollTop = this.state.scrollbarTop;
	    var scrollHeight = this.state.scrollbarHeight;
	    var style = { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, overflowY: "hidden" };
	    var cstyle = { transform: "translate3d(0, " + -this.state.top + "px, 0)" };
	    //var cstyle = {position: 'absolute', top: -this.state.top, right: 0, left: 0};
	    var sstyle = {
	      position: "absolute",
	      top: scrollTop,
	      height: scrollHeight,
	      right: 1,
	      width: 7,
	      backgroundColor: "#000",
	      opacity: 0.5,
	      borderRadius: 10
	    };

	    return React.createElement(
	      "div",
	      { className: "VirtualList", tabIndex: "0", style: style, onWheel: this.onWheel,
	        onKeyDown: this.onKeyDown },
	      React.createElement(
	        "div",
	        { ref: "content", className: "VirtualList-content", style: cstyle },
	        React.createElement(Items, {
	          ref: "items",
	          items: this.props.items,
	          itemView: React.Children.only(this.props.children),
	          winStart: this.state.winStart,
	          winSize: this.props.windowSize })
	      ),
	      React.createElement("div", { className: "VirtualList-scrollbar", style: sstyle, onMouseDown: this.onScrollStart })
	    );
	  },

	  componentDidUpdate: function componentDidUpdate() {
	    var first = this.findFirstVisible();

	    if (this.props.onFirstVisibleChange && first !== this._first) {
	      this.props.onFirstVisibleChange(first);
	      this._first = first;
	    }
	  },

	  scroll: function scroll(delta) {
	    var items = this.props.items;
	    var winSize = Math.min(this.props.windowSize, items.length);
	    var maxWinStart = items.length - winSize;
	    var winStart = this.state.winStart;
	    var node = this.getDOMNode();
	    var contentNode = this.refs.content.getDOMNode();
	    var itemNodes = slice.call(this.refs.items.getDOMNode().childNodes);
	    var windowH = node.clientHeight;
	    var contentH = contentNode.offsetHeight;
	    var canScroll = contentH > windowH;
	    var top = this.state.top;
	    var movedToTop = 0;
	    var topAdjust = 0;
	    var rem, i, n;

	    if (delta < -contentH) {
	      rem = Math.round((-delta - top) / this.averageItemHeight());
	      winStart = Math.max(0, winStart - rem);
	      top = 0;
	    } else if (delta > contentH) {
	      rem = Math.round((delta - contentH - top) / this.averageItemHeight());
	      winStart = Math.min(maxWinStart, winStart + winSize + rem);
	      top = 0;
	    } else if (delta < 0 && canScroll) {
	      top += delta;

	      for (i = itemNodes.length - 1; i >= 0; i--) {
	        if (winStart === 0) {
	          break;
	        }

	        if (itemNodes[i].offsetTop > windowH + top) {
	          winStart--;
	          movedToTop++;
	        } else {
	          break;
	        }
	      }

	      // ensure that we don't scroll past the top of the list
	      if (winStart === 0) {
	        top = Math.max(0, top);
	      }
	    } else if (delta > 0 && canScroll) {
	      top += delta;

	      for (i = 0, n = itemNodes.length; i < n; i++) {
	        if (winStart === maxWinStart) {
	          break;
	        }

	        if (top > itemNodes[i].offsetTop + itemNodes[i].offsetHeight) {
	          winStart++;
	          topAdjust += itemNodes[i].offsetHeight;
	        } else {
	          break;
	        }
	      }

	      top = top - topAdjust;

	      // ensure that we don't scroll past the bottom of the list
	      if (winStart === maxWinStart) {
	        top = Math.min(top, contentH - windowH);
	      }
	    }

	    var state = { winStart: winStart, top: top };

	    if (movedToTop) {
	      this.setState(state, function () {
	        this.processNewTopItems(movedToTop);
	      });
	    } else {
	      var scrollbarPos = this.calcScrollbarPos(winStart, top);
	      state.scrollbarTop = scrollbarPos.scrollbarTop;
	      state.scrollbarHeight = scrollbarPos.scrollbarHeight;
	      this.setState(state);
	    }

	    return this;
	  },

	  processNewTopItems: function processNewTopItems(n) {
	    var contentNode = this.refs.content.getDOMNode();
	    var itemNodes = this.refs.items.getDOMNode().childNodes;
	    var top = this.state.top;
	    var i;

	    for (i = 0; i < n; i++) {
	      top += itemNodes[i].offsetHeight;
	    }

	    var scrollbarPos = this.calcScrollbarPos(this.state.winStart, top);

	    this.setState({
	      top: top,
	      scrollbarTop: scrollbarPos.scrollbarTop,
	      scrollbarHeight: scrollbarPos.scrollbarHeight
	    });
	  },

	  pageDown: function pageDown() {
	    return this.scroll(this.getDOMNode().clientHeight);
	  },

	  pageUp: function pageUp() {
	    return this.scroll(-this.getDOMNode().clientHeight);
	  },

	  scrollToItem: function scrollToItem(item) {
	    var items = this.props.items;
	    var winSize = Math.min(this.props.windowSize, items.length);
	    var maxWinStart = items.length - winSize;
	    var index = this.props.items.indexOf(item);

	    if (index === -1) {
	      throw new Error("VirtualList#scrollToItem: item " + item + " not found.");
	    }

	    var winStart = Math.min(maxWinStart, index);
	    var top = 0;
	    var scrollbarPos = this.calcScrollbarPos(winStart, top);

	    this.setState({
	      winStart: winStart,
	      top: top,
	      bottom: bottom,
	      scrollbarTop: scrollbarPos.scrollbarTop,
	      scrollbarHeight: scrollbarPos.scrollbarHeight
	    });

	    return this;
	  },

	  onWheel: function onWheel(e) {
	    e.preventDefault();
	    e.stopPropagation();
	    if (e.deltaY !== 0) {
	      this.scroll(e.deltaY);
	    }
	  },

	  onKeyDown: function onKeyDown(e) {
	    if (e.which === 33) {
	      this.pageUp();
	    } else if (e.which === 34) {
	      this.pageDown();
	    } else if (e.which === 38) {
	      this.scroll(-20);
	    } else if (e.which === 40) {
	      this.scroll(20);
	    }
	  },

	  onScrollStart: function onScrollStart(e) {
	    this._clientY = e.clientY;
	    document.addEventListener("mousemove", this.onScroll);
	    document.addEventListener("mouseup", this.onScrollStop);
	  },

	  onScroll: function onScroll(e) {
	    e.preventDefault();
	    if (this._clientY === e.clientY) {
	      return;
	    }
	    var estContentH = this.props.items.length * this.averageItemHeight();
	    var windowH = this.getDOMNode().clientHeight;
	    var rawDelta = e.clientY - this._clientY;
	    var delta = Math.round(rawDelta / windowH * estContentH);
	    this.scroll(delta);
	    this._clientY = e.clientY;
	  },

	  onScrollStop: function onScrollStop() {
	    this._clientY = null;
	    document.removeEventListener("mousemove", this.onScroll);
	    document.removeEventListener("mouseup", this.onScrollStop);
	  },

	  averageItemHeight: function averageItemHeight() {
	    var contentNode = this.refs.content.getDOMNode();
	    return contentNode.offsetHeight / contentNode.childNodes.length;
	  },

	  findFirstVisible: function findFirstVisible() {
	    var contentNode = this.refs.content.getDOMNode();
	    var contentOffset = -contentNode.offsetTop;
	    var itemNodes = slice.call(this.refs.items.getDOMNode().childNodes);
	    var i = this.state.winStart;

	    while (itemNodes.length && itemNodes[0].offsetTop + itemNodes[0].offsetHeight < contentOffset) {
	      itemNodes.shift();
	      i++;
	    }

	    return this.props.items[i];
	  },

	  calcScrollbarPos: function calcScrollbarPos(winStart, top) {
	    var contentNode = this.refs.content.getDOMNode();
	    var contentH = contentNode.offsetHeight;
	    var numItemNodes = this.refs.items.getDOMNode().childNodes.length;
	    var windowH = this.getDOMNode().clientHeight;
	    var avgItemH = contentH / numItemNodes;
	    var estContentH = avgItemH * this.props.items.length;
	    var windowContentRatio = windowH / estContentH;
	    var scrollbarHeight = Math.min(windowH, Math.max(20, Math.round(windowH * windowContentRatio)));
	    var scrollH = estContentH - windowH;
	    var windowPos = winStart * avgItemH + top;
	    var windowPosRatio = windowPos / scrollH;
	    var scrollbarTop = Math.round(windowH - scrollbarHeight) * windowPosRatio;

	    return { scrollbarTop: scrollbarTop, scrollbarHeight: scrollbarHeight };
	  }
	});

	module.exports = VirtualList;

/***/ }
/******/ ]);