var acorn = require('acorn'), walk = require('acorn/util/walk'), walkall = require('walkall');

// nodeVisitor constructs a node visitor function that takes a source code
// string and optional AST node and calls c(node, params...) each time a
// comment /*directive:params...*/ appears in the source AST. The test
// parameter is used as the acorn walk test function.
exports.nodeVisitor = function(directive, test, c) {
  return function(src, ast) {
    if (!ast) ast = acorn.parse(src);
    var re = new RegExp('/\\*' + directive + ':(.*?)\\*/', 'g'), m;
    while ((m = re.exec(src)) !== null) {
      var line = acorn.getLineInfo(src, m.index);
      var node = walk.findNodeBefore(ast, m.index, test, walkall.traversers);
      c(node.node, m[1]);
    }
  };
};

// rangeVisitor constructs a range visitor function that takes a source code
// string and optional AST node and calls c(range, params...) each time a pair
// of comments /*directive*/.../*directive:params...*/ appears in the source
// AST. The range object passed to the callback is of the form {start, end,
// src, node}, where node is non-null only if the range exactly contains an AST
// node that passes the test function.
exports.rangeVisitor = function(directive, test, c) {
  return function(src, ast) {
    if (!ast) ast = acorn.parse(src);
    var re = new RegExp('(/\\*' + directive + '\\*/)(.*?)/\\*' + directive + ':(.*?)\\*/', 'g'), m;
    while ((m = re.exec(src)) !== null) {
      var start = m[1].length + m.index, end = start + m[2].length;
      var node = walk.findNodeAt(ast, start, end, test, walkall.traversers);
      var range = {start: start, end: end, node: node && node.node, src: m[2]};
      c(range, m[3]);
    }
  };
};

// multi composes multiple node/range visitors into a single visitor function.
exports.multi = function(visitors) {
  return function(src, ast) {
    if (!ast) ast = acorn.parse(src);
    for (var i = 0; i < visitors.length; ++i) {
      visitors[i](src, ast);
    }
  };
};
