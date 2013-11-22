var astannotate = require('../astannotate');
var acorn = require('acorn'), should = require('should');

describe('AST node annotations', function() {
  it('calls the registered callback function', function(done) {
    astannotate.nodeVisitor('#', null, function(node, x) {
      node.type.should.eql('VariableDeclarator');
      x.should.eql('A');
      done();
    })('var a/*#:A*/;');
  });
  it('triggers on multiple instances', function(done) {
    var xs = ['A', 'B'], types = ['VariableDeclarator', 'CallExpression'], i = 0;
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

describe('AST range annotations', function() {
  it('calls the registered callback function with the enclosed node', function(done) {
    astannotate.rangeVisitor('##', null, function(range, x) {
      range.node.type.should.eql('Identifier');
      range.src.should.eql('a');
      x.should.eql('A');
      done();
    })('var /*##*/a/*##:A*/;');
  });
  it('calls the registered callback function with the range if the range does not exactly contain a node', function(done) {
    astannotate.rangeVisitor('##', null, function(range, x) {
      range.start.should.eql(10);
      range.end.should.eql(12);
      range.src.should.eql('a;');
      should.not.exist(range.node);
      x.should.eql('A');
      done();
    })('var /*##*/a;/*##:A*/');
  });
  it('triggers on multiple instances', function(done) {
    var xs = ['A', 'B'], types = ['Identifier', 'CallExpression'], i = 0;
    astannotate.rangeVisitor('##', null, function(range, x) {
      range.node.type.should.eql(types[i]);
      x.should.eql(xs[i]);
      i++;
      if (i == 1) done();
    })('var /*##*/a/*##:A*/; /*##*/a()/*##:B*/;');
  });
  it('respects the test function', function(done) {
    astannotate.rangeVisitor('##', 'VariableDeclarator', function(range, x) {
      range.node.type.should.eql('VariableDeclarator');
      done();
    })('var /*##*/a/*##:A*/;');
  });
});

describe('multiple visitors', function() {
  var types = ['Identifier', 'VariableDeclarator', 'Literal'], xs = ['A', 'B', 'C'], i = 0;
  astannotate.multi([
    astannotate.rangeVisitor('##', null, function(range, x) {
      x.should.eql(xs[i]);
      range.node.type.should.eql(types[i]);
      i++;
    }),
    astannotate.nodeVisitor('#', null, function(node, x) {
      x.should.eql(xs[i]);
      node.type.should.eql(types[i]);
      i++;
    }),
  ])('var /*##*/a/*##:A*//*#:B*/;3/*#:C*/;');
});
