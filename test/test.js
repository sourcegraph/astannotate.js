var astannotate = require('../astannotate');
var acorn = require('acorn'), should = require('should');

describe('AST node annotations', function() {
  it('calls the registered callback function', function(done) {
    astannotate.nodeVisitor('#', null, function(node, x) {
      node.type.should.eql('VariableDeclaration');
      x.should.eql('A');
      done();
    })('var a/*#:A*/;');
  });
  it('triggers on multiple instances', function(done) {
    var xs = ['A', 'B'], types = ['VariableDeclaration', 'CallExpression'], i = 0;
    astannotate.nodeVisitor('#', null, function(node, x) {
      node.type.should.eql(types[i]);
      x.should.eql(xs[i]);
      i++;
      if (i == 1) done();
    })('var a/*#:A*/; a()/*#:B*/;');
  });
  it('respects the test function', function(done) {
    astannotate.nodeVisitor('#', 'Identifier', function(node, x) {
      node.type.should.eql('Identifier');
      done();
    })('var a/*#:A*/;');
  });
});
