var serv = new Service();
exec(serv);
serv.addItem("item1");
console.log('added 1');
serv.addItem("item2");
console.log('added 2');


function Service() {
  var self = this;
  var items = [];

  self.addItem = function(item) {
    items.push(item);
    return items.length;
  }

  self.getItems = function() {
    return items;
  }
  var ob = new observer();
  ob.wrap(self);
}

function exec(service) {
  service.observe('addItem', function(itemsLength) {
    console.log(`items length : ${itemsLength}`);
  });
}


function observer() {
  var observers = [];
  this.wrap = function(service) {
    var publicFunctions = _getPublicFunctions(service);
    _initPrivateVars(service);
    _setDefaultValues(service, publicFunctions);
    _wrapAllPublicFunctions(service, publicFunctions);
  }

  function _initPrivateVars(service) {
    service._observers = {};
    service.observe = _observe;

    //This will be called by the client function to register the callback
    function _observe(functionName, observer) {
      this._observers[functionName] = this._observers[functionName] || [];
      this._observers[functionName].push(observer);
    }
  }

  function _setDefaultValues(service, publicFunctions) {
    publicFunctions.forEach(function(functionName) {
      service._observers[functionName] = [];
    });
  }

  function _getPublicFunctions(service) {
    return Object.getOwnPropertyNames(service)
      .filter(function(p) {
        return typeof service[p] === 'function';
      });
  }

  function _wrapAllPublicFunctions(service, publicFunctions) {
    publicFunctions.forEach(function(functionName) {
      _wrap(service, functionName);
    });
  }

  function _wrap(service, functionName) {
    service[functionName] = xyz();
    function xyz() {
      var cached_func = service[functionName];
      return function(modal) {
        var returned = cached_func.apply(service, arguments);
        service._observers[functionName].forEach(function(ob) {
          ob(returned);
        });
      };
    }
  }
}
