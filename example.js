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
