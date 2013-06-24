ast-annotate.js
===============

ast-annotate is a node.js package that supports querying a JavaScript AST annotated with comments.
It is useful for testing libraries that perform JavaScript source introspection.


Usage
=====

Install the library by running `npm install astannotate` or by adding it to
your package.json file.

```javascript
var astannotate = require('astannotate');
```

The two main functions are `astannotate.nodeVisitor` and
`astannotate.rangeVisitor`, which visit annotated AST nodes and ranges,
respectively. Both functions let you define a comment directive and specify a
test (constraint) function on the matched AST nodes.


Example
-------

```javascript
var astannotate = require('astannotate');

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
```

These examples are contained in example.js. See the test file for more
examples.


Known issues
=====

* When using `rangeVisitor`, the range between the start/end comments must
  exactly contain a node in order for it to be defined on the callback range's
  `node` property. If there is extra whitespace or nested comments, such as
  `/*##*/foo/*hello*//*##:*/`, then the node will not be detected.


Running tests
=============

Run `npm test`.


Contributors
============

* Quinn Slack <sqs@sourcegraph.com>
