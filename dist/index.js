"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var clone = React.addons.cloneWithProps;

var VirtualList = (function (_React$Component) {
  function VirtualList() {
    _classCallCheck(this, VirtualList);

    if (_React$Component != null) {
      _React$Component.apply(this, arguments);
    }
  }

  _inherits(VirtualList, _React$Component);

  _prototypeProperties(VirtualList, null, {
    render: {
      value: function render() {
        var content = this.props.content,
            itemView = this.props.children[0];
        return React.createElement(
          "div",
          { className: "VirtualList" },
          content.map(function (c) {
            return React.createElement(
              "div",
              { className: "VirtualList-item" },
              clone(itemView, { content: c })
            );
          })
        );
      },
      writable: true,
      configurable: true
    }
  });

  return VirtualList;
})(React.Component);

VirtualList.propTypes = {
  content: React.PropTypes.array.isRequired
};

module.exports = VirtualList;
