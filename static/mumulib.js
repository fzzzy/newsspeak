var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/object-path/index.js
var require_object_path = __commonJS({
  "node_modules/object-path/index.js"(exports, module) {
    (function(root, factory) {
      "use strict";
      if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = factory();
      } else if (typeof define === "function" && define.amd) {
        define([], factory);
      } else {
        root.objectPath = factory();
      }
    })(exports, function() {
      "use strict";
      var toStr = Object.prototype.toString;
      function hasOwnProperty(obj, prop) {
        if (obj == null) {
          return false;
        }
        return Object.prototype.hasOwnProperty.call(obj, prop);
      }
      function isEmpty(value) {
        if (!value) {
          return true;
        }
        if (isArray(value) && value.length === 0) {
          return true;
        } else if (typeof value !== "string") {
          for (var i in value) {
            if (hasOwnProperty(value, i)) {
              return false;
            }
          }
          return true;
        }
        return false;
      }
      function toString(type) {
        return toStr.call(type);
      }
      function isObject(obj) {
        return typeof obj === "object" && toString(obj) === "[object Object]";
      }
      var isArray = Array.isArray || function(obj) {
        return toStr.call(obj) === "[object Array]";
      };
      function isBoolean(obj) {
        return typeof obj === "boolean" || toString(obj) === "[object Boolean]";
      }
      function getKey(key) {
        var intKey = parseInt(key);
        if (intKey.toString() === key) {
          return intKey;
        }
        return key;
      }
      function factory(options) {
        options = options || {};
        var objectPath = function(obj) {
          return Object.keys(objectPath).reduce(function(proxy, prop) {
            if (prop === "create") {
              return proxy;
            }
            if (typeof objectPath[prop] === "function") {
              proxy[prop] = objectPath[prop].bind(objectPath, obj);
            }
            return proxy;
          }, {});
        };
        var hasShallowProperty;
        if (options.includeInheritedProps) {
          hasShallowProperty = function() {
            return true;
          };
        } else {
          hasShallowProperty = function(obj, prop) {
            return typeof prop === "number" && Array.isArray(obj) || hasOwnProperty(obj, prop);
          };
        }
        function getShallowProperty(obj, prop) {
          if (hasShallowProperty(obj, prop)) {
            return obj[prop];
          }
        }
        var getShallowPropertySafely;
        if (options.includeInheritedProps) {
          getShallowPropertySafely = function(obj, currentPath) {
            if (typeof currentPath !== "string" && typeof currentPath !== "number") {
              currentPath = String(currentPath);
            }
            var currentValue = getShallowProperty(obj, currentPath);
            if (currentPath === "__proto__" || currentPath === "prototype" || currentPath === "constructor" && typeof currentValue === "function") {
              throw new Error("For security reasons, object's magic properties cannot be set");
            }
            return currentValue;
          };
        } else {
          getShallowPropertySafely = function(obj, currentPath) {
            return getShallowProperty(obj, currentPath);
          };
        }
        function set3(obj, path, value, doNotReplace) {
          if (typeof path === "number") {
            path = [path];
          }
          if (!path || path.length === 0) {
            return obj;
          }
          if (typeof path === "string") {
            return set3(obj, path.split(".").map(getKey), value, doNotReplace);
          }
          var currentPath = path[0];
          var currentValue = getShallowPropertySafely(obj, currentPath);
          if (path.length === 1) {
            if (currentValue === void 0 || !doNotReplace) {
              obj[currentPath] = value;
            }
            return currentValue;
          }
          if (currentValue === void 0) {
            if (typeof path[1] === "number") {
              obj[currentPath] = [];
            } else {
              obj[currentPath] = {};
            }
          }
          return set3(obj[currentPath], path.slice(1), value, doNotReplace);
        }
        objectPath.has = function(obj, path) {
          if (typeof path === "number") {
            path = [path];
          } else if (typeof path === "string") {
            path = path.split(".");
          }
          if (!path || path.length === 0) {
            return !!obj;
          }
          for (var i = 0; i < path.length; i++) {
            var j = getKey(path[i]);
            if (typeof j === "number" && isArray(obj) && j < obj.length || (options.includeInheritedProps ? j in Object(obj) : hasOwnProperty(obj, j))) {
              obj = obj[j];
            } else {
              return false;
            }
          }
          return true;
        };
        objectPath.ensureExists = function(obj, path, value) {
          return set3(obj, path, value, true);
        };
        objectPath.set = function(obj, path, value, doNotReplace) {
          return set3(obj, path, value, doNotReplace);
        };
        objectPath.insert = function(obj, path, value, at) {
          var arr = objectPath.get(obj, path);
          at = ~~at;
          if (!isArray(arr)) {
            arr = [];
            objectPath.set(obj, path, arr);
          }
          arr.splice(at, 0, value);
        };
        objectPath.empty = function(obj, path) {
          if (isEmpty(path)) {
            return void 0;
          }
          if (obj == null) {
            return void 0;
          }
          var value, i;
          if (!(value = objectPath.get(obj, path))) {
            return void 0;
          }
          if (typeof value === "string") {
            return objectPath.set(obj, path, "");
          } else if (isBoolean(value)) {
            return objectPath.set(obj, path, false);
          } else if (typeof value === "number") {
            return objectPath.set(obj, path, 0);
          } else if (isArray(value)) {
            value.length = 0;
          } else if (isObject(value)) {
            for (i in value) {
              if (hasShallowProperty(value, i)) {
                delete value[i];
              }
            }
          } else {
            return objectPath.set(obj, path, null);
          }
        };
        objectPath.push = function(obj, path) {
          var arr = objectPath.get(obj, path);
          if (!isArray(arr)) {
            arr = [];
            objectPath.set(obj, path, arr);
          }
          arr.push.apply(arr, Array.prototype.slice.call(arguments, 2));
        };
        objectPath.coalesce = function(obj, paths, defaultValue) {
          var value;
          for (var i = 0, len = paths.length; i < len; i++) {
            if ((value = objectPath.get(obj, paths[i])) !== void 0) {
              return value;
            }
          }
          return defaultValue;
        };
        objectPath.get = function(obj, path, defaultValue) {
          if (typeof path === "number") {
            path = [path];
          }
          if (!path || path.length === 0) {
            return obj;
          }
          if (obj == null) {
            return defaultValue;
          }
          if (typeof path === "string") {
            return objectPath.get(obj, path.split("."), defaultValue);
          }
          var currentPath = getKey(path[0]);
          var nextObj = getShallowPropertySafely(obj, currentPath);
          if (nextObj === void 0) {
            return defaultValue;
          }
          if (path.length === 1) {
            return nextObj;
          }
          return objectPath.get(obj[currentPath], path.slice(1), defaultValue);
        };
        objectPath.del = function del(obj, path) {
          if (typeof path === "number") {
            path = [path];
          }
          if (obj == null) {
            return obj;
          }
          if (isEmpty(path)) {
            return obj;
          }
          if (typeof path === "string") {
            return objectPath.del(obj, path.split("."));
          }
          var currentPath = getKey(path[0]);
          getShallowPropertySafely(obj, currentPath);
          if (!hasShallowProperty(obj, currentPath)) {
            return obj;
          }
          if (path.length === 1) {
            if (isArray(obj)) {
              obj.splice(currentPath, 1);
            } else {
              delete obj[currentPath];
            }
          } else {
            return objectPath.del(obj[currentPath], path.slice(1));
          }
          return obj;
        };
        return objectPath;
      }
      var mod = factory();
      mod.create = factory;
      mod.withInheritedProps = factory({ includeInheritedProps: true });
      return mod;
    });
  }
});

// src/patslot.ts
var patslot_exports = {};
__export(patslot_exports, {
  Template: () => Template,
  append_to_slots: () => append_to_slots,
  clone_pat: () => clone_pat,
  fill_body: () => fill_body,
  fill_slots: () => fill_slots
});

// node_modules/morphdom/dist/morphdom-esm.js
var DOCUMENT_FRAGMENT_NODE = 11;
function morphAttrs(fromNode, toNode) {
  var toNodeAttrs = toNode.attributes;
  var attr;
  var attrName;
  var attrNamespaceURI;
  var attrValue;
  var fromValue;
  if (toNode.nodeType === DOCUMENT_FRAGMENT_NODE || fromNode.nodeType === DOCUMENT_FRAGMENT_NODE) {
    return;
  }
  for (var i = toNodeAttrs.length - 1; i >= 0; i--) {
    attr = toNodeAttrs[i];
    attrName = attr.name;
    attrNamespaceURI = attr.namespaceURI;
    attrValue = attr.value;
    if (attrNamespaceURI) {
      attrName = attr.localName || attrName;
      fromValue = fromNode.getAttributeNS(attrNamespaceURI, attrName);
      if (fromValue !== attrValue) {
        if (attr.prefix === "xmlns") {
          attrName = attr.name;
        }
        fromNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
      }
    } else {
      fromValue = fromNode.getAttribute(attrName);
      if (fromValue !== attrValue) {
        fromNode.setAttribute(attrName, attrValue);
      }
    }
  }
  var fromNodeAttrs = fromNode.attributes;
  for (var d = fromNodeAttrs.length - 1; d >= 0; d--) {
    attr = fromNodeAttrs[d];
    attrName = attr.name;
    attrNamespaceURI = attr.namespaceURI;
    if (attrNamespaceURI) {
      attrName = attr.localName || attrName;
      if (!toNode.hasAttributeNS(attrNamespaceURI, attrName)) {
        fromNode.removeAttributeNS(attrNamespaceURI, attrName);
      }
    } else {
      if (!toNode.hasAttribute(attrName)) {
        fromNode.removeAttribute(attrName);
      }
    }
  }
}
var range;
var NS_XHTML = "http://www.w3.org/1999/xhtml";
var doc = typeof document === "undefined" ? void 0 : document;
var HAS_TEMPLATE_SUPPORT = !!doc && "content" in doc.createElement("template");
var HAS_RANGE_SUPPORT = !!doc && doc.createRange && "createContextualFragment" in doc.createRange();
function createFragmentFromTemplate(str) {
  var template = doc.createElement("template");
  template.innerHTML = str;
  return template.content.childNodes[0];
}
function createFragmentFromRange(str) {
  if (!range) {
    range = doc.createRange();
    range.selectNode(doc.body);
  }
  var fragment = range.createContextualFragment(str);
  return fragment.childNodes[0];
}
function createFragmentFromWrap(str) {
  var fragment = doc.createElement("body");
  fragment.innerHTML = str;
  return fragment.childNodes[0];
}
function toElement(str) {
  str = str.trim();
  if (HAS_TEMPLATE_SUPPORT) {
    return createFragmentFromTemplate(str);
  } else if (HAS_RANGE_SUPPORT) {
    return createFragmentFromRange(str);
  }
  return createFragmentFromWrap(str);
}
function compareNodeNames(fromEl, toEl) {
  var fromNodeName = fromEl.nodeName;
  var toNodeName = toEl.nodeName;
  var fromCodeStart, toCodeStart;
  if (fromNodeName === toNodeName) {
    return true;
  }
  fromCodeStart = fromNodeName.charCodeAt(0);
  toCodeStart = toNodeName.charCodeAt(0);
  if (fromCodeStart <= 90 && toCodeStart >= 97) {
    return fromNodeName === toNodeName.toUpperCase();
  } else if (toCodeStart <= 90 && fromCodeStart >= 97) {
    return toNodeName === fromNodeName.toUpperCase();
  } else {
    return false;
  }
}
function createElementNS(name, namespaceURI) {
  return !namespaceURI || namespaceURI === NS_XHTML ? doc.createElement(name) : doc.createElementNS(namespaceURI, name);
}
function moveChildren(fromEl, toEl) {
  var curChild = fromEl.firstChild;
  while (curChild) {
    var nextChild = curChild.nextSibling;
    toEl.appendChild(curChild);
    curChild = nextChild;
  }
  return toEl;
}
function syncBooleanAttrProp(fromEl, toEl, name) {
  if (fromEl[name] !== toEl[name]) {
    fromEl[name] = toEl[name];
    if (fromEl[name]) {
      fromEl.setAttribute(name, "");
    } else {
      fromEl.removeAttribute(name);
    }
  }
}
var specialElHandlers = {
  OPTION: function(fromEl, toEl) {
    var parentNode = fromEl.parentNode;
    if (parentNode) {
      var parentName = parentNode.nodeName.toUpperCase();
      if (parentName === "OPTGROUP") {
        parentNode = parentNode.parentNode;
        parentName = parentNode && parentNode.nodeName.toUpperCase();
      }
      if (parentName === "SELECT" && !parentNode.hasAttribute("multiple")) {
        if (fromEl.hasAttribute("selected") && !toEl.selected) {
          fromEl.setAttribute("selected", "selected");
          fromEl.removeAttribute("selected");
        }
        parentNode.selectedIndex = -1;
      }
    }
    syncBooleanAttrProp(fromEl, toEl, "selected");
  },
  /**
   * The "value" attribute is special for the <input> element since it sets
   * the initial value. Changing the "value" attribute without changing the
   * "value" property will have no effect since it is only used to the set the
   * initial value.  Similar for the "checked" attribute, and "disabled".
   */
  INPUT: function(fromEl, toEl) {
    syncBooleanAttrProp(fromEl, toEl, "checked");
    syncBooleanAttrProp(fromEl, toEl, "disabled");
    if (fromEl.value !== toEl.value) {
      fromEl.value = toEl.value;
    }
    if (!toEl.hasAttribute("value")) {
      fromEl.removeAttribute("value");
    }
  },
  TEXTAREA: function(fromEl, toEl) {
    var newValue = toEl.value;
    if (fromEl.value !== newValue) {
      fromEl.value = newValue;
    }
    var firstChild = fromEl.firstChild;
    if (firstChild) {
      var oldValue = firstChild.nodeValue;
      if (oldValue == newValue || !newValue && oldValue == fromEl.placeholder) {
        return;
      }
      firstChild.nodeValue = newValue;
    }
  },
  SELECT: function(fromEl, toEl) {
    if (!toEl.hasAttribute("multiple")) {
      var selectedIndex = -1;
      var i = 0;
      var curChild = fromEl.firstChild;
      var optgroup;
      var nodeName;
      while (curChild) {
        nodeName = curChild.nodeName && curChild.nodeName.toUpperCase();
        if (nodeName === "OPTGROUP") {
          optgroup = curChild;
          curChild = optgroup.firstChild;
        } else {
          if (nodeName === "OPTION") {
            if (curChild.hasAttribute("selected")) {
              selectedIndex = i;
              break;
            }
            i++;
          }
          curChild = curChild.nextSibling;
          if (!curChild && optgroup) {
            curChild = optgroup.nextSibling;
            optgroup = null;
          }
        }
      }
      fromEl.selectedIndex = selectedIndex;
    }
  }
};
var ELEMENT_NODE = 1;
var DOCUMENT_FRAGMENT_NODE$1 = 11;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;
function noop() {
}
function defaultGetNodeKey(node) {
  if (node) {
    return node.getAttribute && node.getAttribute("id") || node.id;
  }
}
function morphdomFactory(morphAttrs2) {
  return function morphdom2(fromNode, toNode, options) {
    if (!options) {
      options = {};
    }
    if (typeof toNode === "string") {
      if (fromNode.nodeName === "#document" || fromNode.nodeName === "HTML" || fromNode.nodeName === "BODY") {
        var toNodeHtml = toNode;
        toNode = doc.createElement("html");
        toNode.innerHTML = toNodeHtml;
      } else {
        toNode = toElement(toNode);
      }
    } else if (toNode.nodeType === DOCUMENT_FRAGMENT_NODE$1) {
      toNode = toNode.firstElementChild;
    }
    var getNodeKey = options.getNodeKey || defaultGetNodeKey;
    var onBeforeNodeAdded = options.onBeforeNodeAdded || noop;
    var onNodeAdded = options.onNodeAdded || noop;
    var onBeforeElUpdated = options.onBeforeElUpdated || noop;
    var onElUpdated = options.onElUpdated || noop;
    var onBeforeNodeDiscarded = options.onBeforeNodeDiscarded || noop;
    var onNodeDiscarded = options.onNodeDiscarded || noop;
    var onBeforeElChildrenUpdated = options.onBeforeElChildrenUpdated || noop;
    var skipFromChildren = options.skipFromChildren || noop;
    var addChild = options.addChild || function(parent, child) {
      return parent.appendChild(child);
    };
    var childrenOnly = options.childrenOnly === true;
    var fromNodesLookup = /* @__PURE__ */ Object.create(null);
    var keyedRemovalList = [];
    function addKeyedRemoval(key) {
      keyedRemovalList.push(key);
    }
    function walkDiscardedChildNodes(node, skipKeyedNodes) {
      if (node.nodeType === ELEMENT_NODE) {
        var curChild = node.firstChild;
        while (curChild) {
          var key = void 0;
          if (skipKeyedNodes && (key = getNodeKey(curChild))) {
            addKeyedRemoval(key);
          } else {
            onNodeDiscarded(curChild);
            if (curChild.firstChild) {
              walkDiscardedChildNodes(curChild, skipKeyedNodes);
            }
          }
          curChild = curChild.nextSibling;
        }
      }
    }
    function removeNode(node, parentNode, skipKeyedNodes) {
      if (onBeforeNodeDiscarded(node) === false) {
        return;
      }
      if (parentNode) {
        parentNode.removeChild(node);
      }
      onNodeDiscarded(node);
      walkDiscardedChildNodes(node, skipKeyedNodes);
    }
    function indexTree(node) {
      if (node.nodeType === ELEMENT_NODE || node.nodeType === DOCUMENT_FRAGMENT_NODE$1) {
        var curChild = node.firstChild;
        while (curChild) {
          var key = getNodeKey(curChild);
          if (key) {
            fromNodesLookup[key] = curChild;
          }
          indexTree(curChild);
          curChild = curChild.nextSibling;
        }
      }
    }
    indexTree(fromNode);
    function handleNodeAdded(el) {
      onNodeAdded(el);
      var curChild = el.firstChild;
      while (curChild) {
        var nextSibling = curChild.nextSibling;
        var key = getNodeKey(curChild);
        if (key) {
          var unmatchedFromEl = fromNodesLookup[key];
          if (unmatchedFromEl && compareNodeNames(curChild, unmatchedFromEl)) {
            curChild.parentNode.replaceChild(unmatchedFromEl, curChild);
            morphEl(unmatchedFromEl, curChild);
          } else {
            handleNodeAdded(curChild);
          }
        } else {
          handleNodeAdded(curChild);
        }
        curChild = nextSibling;
      }
    }
    function cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey) {
      while (curFromNodeChild) {
        var fromNextSibling = curFromNodeChild.nextSibling;
        if (curFromNodeKey = getNodeKey(curFromNodeChild)) {
          addKeyedRemoval(curFromNodeKey);
        } else {
          removeNode(
            curFromNodeChild,
            fromEl,
            true
            /* skip keyed nodes */
          );
        }
        curFromNodeChild = fromNextSibling;
      }
    }
    function morphEl(fromEl, toEl, childrenOnly2) {
      var toElKey = getNodeKey(toEl);
      if (toElKey) {
        delete fromNodesLookup[toElKey];
      }
      if (!childrenOnly2) {
        var beforeUpdateResult = onBeforeElUpdated(fromEl, toEl);
        if (beforeUpdateResult === false) {
          return;
        } else if (beforeUpdateResult instanceof HTMLElement) {
          fromEl = beforeUpdateResult;
          indexTree(fromEl);
        }
        morphAttrs2(fromEl, toEl);
        onElUpdated(fromEl);
        if (onBeforeElChildrenUpdated(fromEl, toEl) === false) {
          return;
        }
      }
      if (fromEl.nodeName !== "TEXTAREA") {
        morphChildren(fromEl, toEl);
      } else {
        specialElHandlers.TEXTAREA(fromEl, toEl);
      }
    }
    function morphChildren(fromEl, toEl) {
      var skipFrom = skipFromChildren(fromEl, toEl);
      var curToNodeChild = toEl.firstChild;
      var curFromNodeChild = fromEl.firstChild;
      var curToNodeKey;
      var curFromNodeKey;
      var fromNextSibling;
      var toNextSibling;
      var matchingFromEl;
      outer:
        while (curToNodeChild) {
          toNextSibling = curToNodeChild.nextSibling;
          curToNodeKey = getNodeKey(curToNodeChild);
          while (!skipFrom && curFromNodeChild) {
            fromNextSibling = curFromNodeChild.nextSibling;
            if (curToNodeChild.isSameNode && curToNodeChild.isSameNode(curFromNodeChild)) {
              curToNodeChild = toNextSibling;
              curFromNodeChild = fromNextSibling;
              continue outer;
            }
            curFromNodeKey = getNodeKey(curFromNodeChild);
            var curFromNodeType = curFromNodeChild.nodeType;
            var isCompatible = void 0;
            if (curFromNodeType === curToNodeChild.nodeType) {
              if (curFromNodeType === ELEMENT_NODE) {
                if (curToNodeKey) {
                  if (curToNodeKey !== curFromNodeKey) {
                    if (matchingFromEl = fromNodesLookup[curToNodeKey]) {
                      if (fromNextSibling === matchingFromEl) {
                        isCompatible = false;
                      } else {
                        fromEl.insertBefore(matchingFromEl, curFromNodeChild);
                        if (curFromNodeKey) {
                          addKeyedRemoval(curFromNodeKey);
                        } else {
                          removeNode(
                            curFromNodeChild,
                            fromEl,
                            true
                            /* skip keyed nodes */
                          );
                        }
                        curFromNodeChild = matchingFromEl;
                        curFromNodeKey = getNodeKey(curFromNodeChild);
                      }
                    } else {
                      isCompatible = false;
                    }
                  }
                } else if (curFromNodeKey) {
                  isCompatible = false;
                }
                isCompatible = isCompatible !== false && compareNodeNames(curFromNodeChild, curToNodeChild);
                if (isCompatible) {
                  morphEl(curFromNodeChild, curToNodeChild);
                }
              } else if (curFromNodeType === TEXT_NODE || curFromNodeType == COMMENT_NODE) {
                isCompatible = true;
                if (curFromNodeChild.nodeValue !== curToNodeChild.nodeValue) {
                  curFromNodeChild.nodeValue = curToNodeChild.nodeValue;
                }
              }
            }
            if (isCompatible) {
              curToNodeChild = toNextSibling;
              curFromNodeChild = fromNextSibling;
              continue outer;
            }
            if (curFromNodeKey) {
              addKeyedRemoval(curFromNodeKey);
            } else {
              removeNode(
                curFromNodeChild,
                fromEl,
                true
                /* skip keyed nodes */
              );
            }
            curFromNodeChild = fromNextSibling;
          }
          if (curToNodeKey && (matchingFromEl = fromNodesLookup[curToNodeKey]) && compareNodeNames(matchingFromEl, curToNodeChild)) {
            if (!skipFrom) {
              addChild(fromEl, matchingFromEl);
            }
            morphEl(matchingFromEl, curToNodeChild);
          } else {
            var onBeforeNodeAddedResult = onBeforeNodeAdded(curToNodeChild);
            if (onBeforeNodeAddedResult !== false) {
              if (onBeforeNodeAddedResult) {
                curToNodeChild = onBeforeNodeAddedResult;
              }
              if (curToNodeChild.actualize) {
                curToNodeChild = curToNodeChild.actualize(fromEl.ownerDocument || doc);
              }
              addChild(fromEl, curToNodeChild);
              handleNodeAdded(curToNodeChild);
            }
          }
          curToNodeChild = toNextSibling;
          curFromNodeChild = fromNextSibling;
        }
      cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey);
      var specialElHandler = specialElHandlers[fromEl.nodeName];
      if (specialElHandler) {
        specialElHandler(fromEl, toEl);
      }
    }
    var morphedNode = fromNode;
    var morphedNodeType = morphedNode.nodeType;
    var toNodeType = toNode.nodeType;
    if (!childrenOnly) {
      if (morphedNodeType === ELEMENT_NODE) {
        if (toNodeType === ELEMENT_NODE) {
          if (!compareNodeNames(fromNode, toNode)) {
            onNodeDiscarded(fromNode);
            morphedNode = moveChildren(fromNode, createElementNS(toNode.nodeName, toNode.namespaceURI));
          }
        } else {
          morphedNode = toNode;
        }
      } else if (morphedNodeType === TEXT_NODE || morphedNodeType === COMMENT_NODE) {
        if (toNodeType === morphedNodeType) {
          if (morphedNode.nodeValue !== toNode.nodeValue) {
            morphedNode.nodeValue = toNode.nodeValue;
          }
          return morphedNode;
        } else {
          morphedNode = toNode;
        }
      }
    }
    if (morphedNode === toNode) {
      onNodeDiscarded(fromNode);
    } else {
      if (toNode.isSameNode && toNode.isSameNode(morphedNode)) {
        return;
      }
      morphEl(morphedNode, toNode, childrenOnly);
      if (keyedRemovalList) {
        for (var i = 0, len = keyedRemovalList.length; i < len; i++) {
          var elToRemove = fromNodesLookup[keyedRemovalList[i]];
          if (elToRemove) {
            removeNode(elToRemove, elToRemove.parentNode, false);
          }
        }
      }
    }
    if (!childrenOnly && morphedNode !== fromNode && fromNode.parentNode) {
      if (morphedNode.actualize) {
        morphedNode = morphedNode.actualize(fromNode.ownerDocument || doc);
      }
      fromNode.parentNode.replaceChild(morphedNode, fromNode);
    }
    return morphedNode;
  };
}
var morphdom = morphdomFactory(morphAttrs);
var morphdom_esm_default = morphdom;

// src/patslot.ts
var TEMPLATE = document.body.cloneNode(true);
var Template = class {
  url;
  constructor(url) {
    this.url = url;
  }
  async clone_pat(patname, slots) {
    let template;
    if (this.url === "") {
      template = TEMPLATE;
    } else {
      const response = await fetch(this.url);
      const text = await response.text();
      const parser = new DOMParser();
      const doc2 = parser.parseFromString(text, "text/html");
      template = doc2.body;
    }
    const pat = template.querySelector(`[data-pat=${patname}]`);
    if (!pat) {
      throw new Error(`No pat named ${patname}`);
    }
    const clone = pat.cloneNode(true);
    for (const [slotname, pat2] of Object.entries(slots)) {
      await fill_slots(clone, slotname, pat2);
    }
    return clone;
  }
};
async function fill_body(slots) {
  const clone = document.body.cloneNode(true);
  for (const [slotname, pat2] of Object.entries(slots)) {
    await fill_slots(clone, slotname, pat2);
  }
  morphdom_esm_default(document.body, clone);
}
async function fill_slots(node, slotname, pat) {
  await _fill_or_append_slots(node, slotname, pat, false);
}
async function append_to_slots(node, slotname, pat) {
  await _fill_or_append_slots(node, slotname, pat, true);
}
async function _fill_or_append_slots(node, slotname, pat, append) {
  let slots = [];
  if (node.dataset.slot == slotname) {
    slots = [node];
  } else {
    slots = node.querySelectorAll(`[data-slot=${slotname}]`);
  }
  let calculated_slot = [];
  if (pat instanceof Promise) {
    pat = await pat;
  }
  for (const slot of slots) {
    if (pat instanceof Element) {
      if (append) {
        slot.appendChild(pat.cloneNode(true));
      } else {
        pat.dataset.slot = slotname;
        slot.replaceWith(pat.cloneNode(true));
      }
    } else if (pat instanceof Array || typeof pat === "object" && "next" in pat && "throw" in pat) {
      if (!append) {
        while (slot.firstChild) {
          0;
          slot.removeChild(slot.firstChild);
        }
      }
      if (calculated_slot.length !== 0) {
        for (const p of calculated_slot) {
          if (p instanceof Element) {
            slot.appendChild(p.cloneNode(true));
          } else {
            slot.appendChild(document.createTextNode(p));
          }
        }
      } else {
        if (typeof pat[Symbol.asyncIterator] === "function") {
          for await (const p of pat) {
            if (p instanceof Element) {
              calculated_slot.push(p);
              slot.appendChild(p.cloneNode(true));
            } else {
              calculated_slot.push(p.toString());
              slot.appendChild(document.createTextNode(p.toString()));
            }
          }
        } else {
          for (let p of pat) {
            if (p instanceof Promise) {
              p = await p;
            }
            if (p instanceof Element) {
              calculated_slot.push(p);
              slot.appendChild(p.cloneNode(true));
            } else {
              calculated_slot.push(p.toString());
              slot.appendChild(document.createTextNode(p.toString()));
            }
          }
        }
      }
    } else {
      if (append) {
        slot.textContent += pat === void 0 ? "undefined" : pat.toString();
      } else {
        slot.textContent = pat === void 0 ? "undefined" : pat.toString();
      }
    }
  }
  let attrslots = [];
  if (node.dataset.attr) {
    attrslots = [node];
  }
  attrslots = [...attrslots, ...node.querySelectorAll(`[data-attr]`)];
  for (const attrslot of attrslots) {
    const attrs = attrslot.dataset.attr || "";
    const mappings = attrs.split(",");
    const results = mappings.map(async (mapping) => {
      const [attribute_name, attribute_slot] = mapping.split("=");
      if (attribute_slot != slotname) {
        return;
      }
      if (pat instanceof Element) {
        throw new Error("Can't set attr to Element");
      } else if (pat instanceof Array || typeof pat === "object" && "next" in pat && "throw" in pat) {
        let patstr = "";
        if (typeof pat[Symbol.asyncIterator] === "function") {
          for await (const p of pat) {
            if (p instanceof Element) {
              throw new Error("Can't set attr to Element");
            } else {
              patstr += p.toString();
            }
          }
        } else {
          for (const p of pat) {
            if (p instanceof Element) {
              throw new Error("Can't set attr to Element");
            } else {
              patstr += p.toString();
            }
          }
        }
        attrslot.setAttribute(attribute_name, patstr);
      } else {
        attrslot.setAttribute(attribute_name, pat.toString());
      }
    });
    await Promise.all(results);
  }
}
async function clone_pat(patname, slots) {
  const template = new Template("");
  return await template.clone_pat(patname, slots);
}

// src/state.ts
var state_exports = {};
__export(state_exports, {
  debug: () => debug,
  onstate: () => onstate,
  set_path: () => set_path,
  set_state: () => set_state,
  state: () => state
});
var import_object_path = __toESM(require_object_path(), 1);
var initialValues = {};
var obs = [];
var loaded = false;
var state = {};
var setting = 0;
var dirty = false;
var debug_mode = false;
function debug(mode) {
  debug_mode = mode;
}
async function onstate(onstatechange) {
  if (loaded) {
    await onstatechange(state);
  }
  obs.push(onstatechange);
}
async function _set_state(root, path, nstate) {
  let changed = false;
  if (nstate === null) {
    changed = true;
  } else {
    if (!path) {
      for (const [k, v] of Object.entries(nstate)) {
        if (root[k] !== v) {
          if (v === void 0) {
            delete root[k];
          } else {
            root[k] = v;
            changed = true;
          }
        }
      }
    } else {
      const old = (0, import_object_path.get)(root, path);
      if (old !== nstate) {
        (0, import_object_path.set)(root, path, nstate);
        changed = true;
      }
    }
  }
  if (!changed) {
    return;
  }
  setting++;
  if (setting === 1) {
    update_dom_state(state);
    if (debug_mode) {
      document.body.dataset.state = JSON.stringify(state);
      console.log("onstatechange", state);
    }
    for (const onstatechange of obs) {
      await onstatechange(state);
    }
  } else {
    dirty = true;
  }
  setting--;
  if (setting === 0 && dirty) {
    dirty = false;
    window.requestAnimationFrame(() => set_state(null));
  }
}
async function set_state(nstate) {
  await _set_state(state, "", nstate);
}
async function _set_path(root, path, nstate) {
  await _set_state(root, path, nstate);
}
async function set_path(path, nstate) {
  await _set_path(state, path, nstate);
}
document.addEventListener("DOMContentLoaded", async function() {
  loaded = true;
  await set_state(null);
});
document.addEventListener("focus", function(e) {
  if (e.target && e.target instanceof HTMLInputElement) {
    initialValues[e.target.name] = e.target.value;
  }
}, true);
function possibly_changed(e) {
  let target;
  if (e.target) {
    if (e.target instanceof HTMLInputElement) {
      target = e.target;
    } else if (e.target instanceof HTMLSelectElement) {
      target = e.target;
    } else if (e.target instanceof HTMLTextAreaElement) {
      target = e.target;
    }
    if (!target.name || !target.value) {
      return;
    }
  }
  let name = target.name;
  let value = target.value;
  if (initialValues[name] === value) {
    return;
  }
  if (name.substring(0, 5) === "this.") {
    (0, import_object_path.set)(state, name.substring(5), value);
    console.log(`${name} = ${JSON.stringify(value)}`);
    set_state(null);
  } else if (name.substring(0, 9) === "selected.") {
    const selected = (0, import_object_path.get)(state, state["selected"]);
    console.log("selected", selected);
    (0, import_object_path.set)(selected, name.substring(9), value);
    if (debug_mode) {
      console.log(`${name} = ${JSON.stringify(value)}`);
    }
    set_state(null);
  } else if (name === "selected") {
    (0, import_object_path.set)(state, "selected", value);
    set_state(null);
  }
}
document.addEventListener("focusout", function(e) {
  if (e.target && (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
    possibly_changed(e);
  }
}, true);
document.addEventListener("change", function(e) {
  if (e.target && (e.target instanceof HTMLInputElement && e.target.type === "radio" || e.target instanceof HTMLSelectElement)) {
    possibly_changed(e);
  }
}, true);
async function update_dom_state(state2) {
  const elements = document.querySelectorAll("input, select, textarea");
  elements.forEach((element) => {
    let el;
    if (element instanceof HTMLInputElement) {
      el = element;
    } else if (element instanceof HTMLSelectElement) {
      el = element;
    } else if (element instanceof HTMLTextAreaElement) {
      el = element;
    }
    const name = el.name;
    if (name.startsWith("this.")) {
      const value = (0, import_object_path.get)(state2, name.slice(5));
      if (el.value !== value) {
        el.value = value;
      }
    } else if (name.startsWith("selected.")) {
      const selectedState = (0, import_object_path.get)(state2, state2["selected"]);
      const value = (0, import_object_path.get)(selectedState, name.slice(9));
      if (el.value !== value) {
        el.value = value;
      }
    } else if (name === "selected") {
      const sel = state2["selected"];
      if (el.type === "radio") {
        if (el.value === sel) {
          el.checked = true;
        } else {
          el.checked = false;
        }
      } else {
        el.value = sel;
      }
    }
  });
}

// src/dialog.ts
var dialog_exports = {};
__export(dialog_exports, {
  do_dialog: () => do_dialog
});
var import_object_path2 = __toESM(require_object_path(), 1);
function do_dialog(dialog_name, path, render) {
  set_state(
    { "selected": path }
  );
  const substate = (0, import_object_path2.get)(state, path.substring(5));
  console.log("SUBSTATE", state, path, substate);
  const dialog = document.getElementById(dialog_name);
  if (dialog && dialog instanceof HTMLDialogElement) {
    const clone = render(dialog, substate);
    console.log("cloned", dialog, clone);
    morphdom_esm_default(dialog, clone);
    for (const d of dialog.querySelectorAll("form")) {
      d.onsubmit = (event) => {
        event.preventDefault();
        if (event.target) {
          let target = event.target;
          while (!(target instanceof HTMLDialogElement)) {
            if (target.parentNode) {
              target = target.parentNode;
            } else {
              console.error("Dialog target not found");
              return;
            }
          }
          target.close();
        }
      };
    }
    dialog.showModal();
    dialog.onclose = async (ev) => {
      console.log("closing", ev.target);
      if (!ev.target) {
        return;
      }
      let form;
      const returnValue = ev.target.returnValue;
      if (returnValue) {
        if (returnValue === "cancel") {
          set_state({ "selected": void 0 });
          return;
        }
        form = ev.target.querySelector(`form[name=${returnValue}]`);
        if (!form) {
          form = ev.target.querySelector("form");
        }
      } else {
        form = ev.target.querySelector("form");
      }
      if (form) {
        const method = form.querySelector('input[name="method"]');
        if (method) {
          const args = {};
          for (const inp of form.querySelectorAll("input")) {
            args[inp.name] = inp.value;
          }
          console.log("calling method", method.value, args);
          const got = (0, import_object_path2.get)(state, args["path"].substring(5));
          console.log("got", got);
          delete args["method"];
          delete args["path"];
          const result = got[method.value].call(got, args);
          if (result instanceof Promise) {
            await result;
          }
        } else {
          for (const inp of form.querySelectorAll("input")) {
            if (inp.name.substring(0, 9) === "selected.") {
              const fullname = `${state["selected"]}.${inp.name.substring(9)}`;
              console.log("setting", fullname, inp.value);
              (0, import_object_path2.set)(
                state,
                fullname.substring(5),
                inp.value
              );
            }
          }
        }
        set_state({ "selected": void 0 });
      }
    };
  } else {
    console.error(`Dialog ${dialog_name} not found.`);
  }
}
export {
  dialog_exports as dialog,
  patslot_exports as patslot,
  state_exports as state
};
//# sourceMappingURL=index.js.map
