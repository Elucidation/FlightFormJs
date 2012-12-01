// MVC built using Backbone.js framework

// Model 		| FlightItem 	    FlightList  
// View  		| FlightItemView    FlightListView
// Controller 	| FlightController



/////////////////////////////////////////////////////////////////
// Model
var FlightItem = Backbone.Model.extend({});

var FlightList = Backbone.Collection.extend({
	model: FlightItem,
	initialize: function() {
		this.on('remove', this.hideModel);
	},
	hideModel: function(model) {
		model.trigger('hide');
	}
});
var flightList = new FlightList();




/////////////////////////////////////////////////////////////////
// View
var FlightView = Backbone.View.extend({
	tagName: 'div',
	id: 'flight',
	template: _.template('<a href=#pop/<%=id%>><h4>Generated Flight Information:</h4>' +
		'<i>Number of passengers:</i> <%= numPassengers %><br>' +
		'<i>From:</i> <%= from %><br>' +
		'<i>To:</i> <%= to %><br>' +
		'<i>Departing:</i> <%= depDate %> <%= depTime %><br>' +
		'<i>Returning:</i> <%= retDate %> <%= retTime %></a>'),

	initialize: function() {
		this.model.on('change', this.render, this);
		this.model.on('destroy', this.remove, this);
		this.model.on('hide', this.remove, this);
	},

	render: function() {
		this.$el.html(  this.template( this.model.toJSON() )  );
	},
	
	remove: function() {
		this.$el.remove();
	}
});


var FlightListView = Backbone.View.extend({
	initialize: function() {
		_.bindAll(this, 'render'); // fixes loss of context for 'this' within methods
		this.counter = 0;
		this.collection.on('add', this.addOne,this);
		this.collection.on('reset', this.addAll, this);
		this.collection.on('add', this.render);
		this.collection.on('remove', this.render);
		this.documentBinding = document.getElementById('flights');
	},
	addOne: function(flightItem) {
		flightItem.set({id: this.counter++});
		var flightView = new FlightView({model: flightItem});
		flightView.render();
		this.$el.append(flightView.el);
		
	},
	addAll: function() {
		this.counter = 0;
		this.$el.append('<h4>test</h4>');
		this.collection.forEach(this.addOne,this);;
		
	},
	render: function() {
		this.documentBinding.innerHTML = this.el.innerHTML;
	}
});
var flightListView = new FlightListView({collection: flightList});


/////////////////////////////////////////////////////////////////
// Controller (nothing fancier since its a one page deal)
var FlightController = Backbone.Router.extend({
	routes: {"": "index", "pop/:id": 'pop'},
	index: function() {
		console.log(this.flightList);
	},
	pop: function(id) {
		// Only pop item from list if list is long enough (to avoid malformed query parameters being passed in)
		if (this.flightList.length == 0) {
			this.navigate("",{trigger:true});
		} else {
			// console.log("Popping "+id+"...");
			prettyAlert(this.flightList.get(id));
			this.flightList.remove(id);
		}
	},
	initialize: function(args) {
		this.flightList = args.flightList;
	}
});
var flightController = new FlightController({flightList: flightList});

Backbone.history.start();

/////////////////////////////////////////////////////////////////
// Helpers
function exampleSubmit() {

	var form = document.forms[0];

	var flight = new FlightItem({
		from: 			form["from"].value,
		to: 			form["to"].value,
		depDate: 		form["depDate"].value,
		depTime: 		form["depTime"].value,
		retDate: 		form["retDate"].value,
		retTime: 		form["retTime"].value,
		numPassengers: 	form["numPassengers"].value
	});

	flightList.add(flight);

	
}
// Does a pretty alert showing info on a flight model instance
function prettyAlert(flight) {
	alert("Number of passengers: "+flight.attributes.numPassengers+"\n"+
		"From: "+flight.attributes.from+"\n"+
		"To: "+flight.attributes.to+"\n"+
		"Departing: "+flight.attributes.depDate+" "+flight.attributes.depTime+"\n"+
		"Returning: "+flight.attributes.retDate+" "+flight.attributes.retTime+"\n");
}

// Some regex-fu off of StackOverflow to parse url params as dict
function getUrlParameters() {
	var map = {};
	window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) { map[key] = value; });
	return map; 
}