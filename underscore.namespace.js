/**
 * @fileoverview Light port of NamespaceJS for UnderscoreJS.
 * @author Maxime Bouroumeau-Fuseau (original)
 * @author Peng Wang 
 */
(function(window){
  /**
   * Creates an Object following the specified namespace identifier.
   * @param {string} identifier The namespace string.
   * @param {?Object=} classes An object which properties will be added to the namespace.
   * @return {Object} The most inner object
   */
  _.namespace = function(identifier){
    var classes = arguments[1] || false;
    var ns = window;
    if (identifier !== '') {
      var parts = identifier.split(_.namespacer);
      for (var i = 0; i < parts.length; i++) {
        if (!ns[parts[i]]) {
          ns[parts[i]] = {};
        }
        ns = ns[parts[i]];
      }
    }
    if (classes) {
      for (var c in classes) {
        if (classes.hasOwnProperty(c)) {
          ns[c] = classes[c];
        }
      }
    }
    return ns;
  };
  /**
   * Imports properties from the specified namespace to the global space (window).
   *      The identifier string can contain the * wildcard character as its last 
   *      segment (eg: com.test.*) which will import all properties from the namespace.
   *      If not, the targeted namespace will be imported (ie. if com.test is 
   *      imported, the test object will now be global). 
   * NOTE: Remember that importing is destructive to the global namespace. Use as last resort.
   * @public
   * @param {string} identifier The namespace string.
   * @param {?function=} callback A function to call when the process is completed
   */
  _.using = function(identifier){
    var identifiers = identifier.pop ? identifier : [identifier];
    var callback = arguments[1] || false;
    var event = { 'identifier': identifier };
    var parts, target, ns;
    var import_ = function(objectName, ns){
      window[objectName] = ns[objectName];
    };
    for (var i = 0; i < identifiers.length; i++) {
      identifier = identifiers[i];
      parts = identifier.split(_.namespacer);
      target = parts.pop();
      ns = _.namespace(parts.join(_.namespacer));
      if (target == '*') {
        // imports all objects from the identifier, can't use include() in that case
        for (var objectName in ns) {
          if (ns.hasOwnProperty(objectName)) {
            import_(objectName, ns);
          }
        }
      } else if (ns[target]) {
        // imports only one object
        import_(target, ns);
      }
    }
    // all identifiers have been unpacked
    if (typeof callback === "function") { 
      callback(); 
    }
  };
  /**
   * Namespace segment separator
   * @var String
   */
  _.namespacer = '.';    
})(window);