astannotate
===========

astannotate is a node.js package that supports querying a JavaScript AST
annotated with comments. It is useful for testing libraries that perform
JavaScript source introspection because it lets you define test expectations
inline in source code instead of having to put them in separate test files.

For example, suppose we want to test a function `findDecl` that determines the
definition location of any JavaScript identifier in source code. You can use
astannotate.js to help you test this function by first writing JavaScript code
interspersed with comments as follows:

```javascript
var /*DECL*/a = 8/*DECL:a*/;
var x = a/*REF:a*/ + 8;
```

And then define AST annotation visitors:

```javascript
var astannotate = require('astannotate');
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
```

Then we can run this simple test case as follows, and it will throw an error if
the output of findDecl doesn't match the expectations we've defined in the
source code annotations.

```javascript
astannotate.multi([declVisitor, refVisitor])(
  'var /*DECL*/a = 8/*DECL:a*/;' +
  'var x = a/*REF:a*/ + 8;'
);
```

Documentation: [astannotate.js on Sourcegraph](https://sourcegraph.com/repos/github.com/sourcegraph/astannotate.js)

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
