'use strict';

const compare = require('../compare');

module.exports = function sortDeclarations(declarations) {
  for (var j = 0; j < declarations.length; j++) {
    var declaration = declarations[j];

    // remove comment nodes from declarations
    if (declaration.type === 'comment' || declaration.comment) {
      declarations.splice(j, 1);
      j--;
    }

    if (declaration.value) {
      // normalize whitespace
      declaration.value = declaration.value.replace(/\s*!important/g, ' !important').replace(/\s+/g, ' ');

      // 0.1 => .1
      declaration.value = declaration.value.replace(/(^|[\s,])0+\./g, '$1.');
    }
  }

  var merged = [];
  mergeDeclarations(merged, declarations);

  declarations.length = 0;

  for (var j = 0; j < merged.length; j++) {
    declarations.push(merged[j]);
  }

  // sort declaration nodes within this rule
  declarations.sort(function(a, b) {
    var propertyCompare = compare.ci(a.property, b.property);
    if (propertyCompare !== 0) {
      return propertyCompare;
    }
    return a.position.start.line - b.position.start.line;
  });

  function mergeDeclarations(destDecl, srcDecl) {
    for (var i = 0; i < srcDecl.length; i++) {
      var declaration = srcDecl[i];
      var property = cleanDeclarationName(declaration.property);

      var item = destDecl.find(function (element, index) {
        return element.property == property;
      });

      if (item) {
        item.value = declaration.value;
      }
      else {
        var dupeDeclaration = Object.assign({}, declaration);

        dupeDeclaration.property = property;
        destDecl.push(dupeDeclaration);
      }
    }

    return destDecl;
  };

  function cleanDeclarationName(name) {
    name = name.toLocaleLowerCase();

    if (name.startsWith('_')) {
      name = name.substring(1);
    }

    return name;
  };
};
