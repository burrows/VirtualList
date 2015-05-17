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
	    return { winStart: 0, top: 0, bottom: null };
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
	      )
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
	        i,
	        n;

	    if (delta > 0) {
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
	    }

	    this.setState({ winStart: winStart, top: top, bottom: bottom });
	  },

	  onWheel: function onWheel(e) {
	    e.preventDefault();
	    e.stopPropagation();
	    if (e.deltaY !== 0) {
	      this.scroll(e.deltaY);
	    }
	  }
	});

	module.exports = VirtualList;

/***/ }
/******/ ]);