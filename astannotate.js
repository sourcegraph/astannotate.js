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
