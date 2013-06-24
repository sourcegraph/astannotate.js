var astannotate = require('./astannotate');

// Simple directive.
astannotate.nodeVisitor('#', null, function(node, x) {
  console.log('Found node', node.type, 'with data:', x);
})('var a/*#:A*/;');
// outputs:
// Found node VariableDeclaration with data: A

// Use a different directive and a node test ('Identifier') to constrain the matched nodes.
astannotate.nodeVisitor('VAR', 'Identifier', function(node, x) {
  console.log('Found node', node.type, node.name, 'with data:', x);
})('var a, b/*VAR:foo*/, c/*VAR:bar*/;');
// outputs:
// Found node Identifier b with data: foo
// Found node Identifier c with data: bar

// Visit annotated ranges.
astannotate.rangeVisitor('DECL', 'VariableDeclarator', function(range, x) {
  console.log('Found node', range.node.type, 'with data:', x);
})('var /*DECL*/a = 7/*DECL:foo*/;');
// outputs:
// Found node VariableDeclarator with data: foo



function findDecl() {
  return {name: 'dummy'};
}
var decls = {};
var declVisitor = astannotate.rangeVisitor('DECL', null, function(range, name) {
  decls[name] = range;
});
var refVisitor = astannotate.nodeVisitor('REF', 'Identifier', function(identNode, declName) {
  // call our findDecl function on the Identifier node
  var decl = findDecl(identNode);
  if (decl.name !== declName) {
    throw new Error('Expected Identifier at ' + identNode.start + '-' + identNode.end +
                    ' to refer to decl ' + declName + ', but findDecl gave ' + decl.name);
  }
});
try {
  astannotate.multi([declVisitor, refVisitor])(
    'var /*DECL*/a = 8/*DECL:a*/;' +
    'var x = a/*REF:a*/ + 8;'
  );
} catch (e) {
  if (e.toString() == 'Error: Expected Identifier at 36-37 to refer to decl a, but findDecl gave dummy')
    console.log('Got expected error:', e);
  else throw e;
}
