App = Ember.Application.create();

Ember.Handlebars.registerBoundHelper('pretty_date', function(date) {
  return moment(date).fromNow();
});

///////////
// Routes /
///////////

App.Router.map(function() {
  this.resource('about');
  this.resource('metamarks', function() {
    this.resource('metamark', { path: '/:metamark_id' }, function() {
      this.route('edit');
    });

    this.route('create');
  });
});

App.IndexRoute = Ember.Route.extend({
  redirect: function() {
    this.transitionTo('metamarks');
  }
});

App.MetamarksRoute = Ember.Route.extend({
  model: function() {
    return this.store.find('metamark');
  }
});

App.MetamarksCreateRoute = Ember.Route.extend({
  model: function() {
    return Em.Object.create({});
  }
});

App.MetamarkRoute = Ember.Route.extend({
  model: function(params) {
    return this.store.find('metamark', params.metamark_id);
  }
});

App.MetamarkEditRoute = Ember.Route.extend({
  model: function(params) {
    return this.modelFor('metamark');
  }
});

///////////
// Models /
///////////

App.ApplicationAdapter = DS.LSAdapter;

App.Metamark = DS.Model.extend({
  name: DS.attr(),
  url: DS.attr(),
  description: DS.attr(),
  created_at: DS.attr()
});

////////////////
// Controllers /
////////////////

App.MetamarksController = Ember.ArrayController.extend({
  sort_by: ['name'],
  sort_asc: true,
  metamarks_count: function() {
    return this.get('model.length');
  }.property('@each')
});

App.MetamarkController = Ember.ObjectController.extend({
  delete_mode: false,
  get_content: function() {
    var url = this.get('model.url');
    var url_matcher = /http[s]{0,1}:\/\/(.*)\/(.*)$/;
    var content = url;

    var url_parts = url.match(url_matcher);
    var url_parts = Ember.A(url_parts);

    if(url_parts.length > 1) {
      if(url_parts[0].match(/youtube/)) {
        var youtube_matcher = /http[s]{0,1}:\/\/.*\/.*v=(.*).*/
        var youtube_id_matches = url.match(youtube_matcher);
        
        if(youtube_id_matches) {
          var youtube_id = youtube_id_matches[1]
          
          if(youtube_id) {
            content = "<iframe width=\"560\" height=\"315\" src=\"http://www.youtube.com/embed/" + youtube_id + "\" frameborder=\"0\" allowfullscreen></iframe>"  
          }
        }
      } else if(url_parts[0].match(/\.jpg$|.gif$|.bmp$|.png$|.svg$|.jpeg$/)) {
        content = "<img class=\"img-rounded img-responsive\" src=\"" + url + "\">";  
      }
    }

    return content;
  }.property('model.url')
  ,
  actions: {
    edit: function() {
      this.transitionToRoute('metamark.edit');
    },
    delete: function() {      
      this.set('delete_mode', true);      
    },
    do_delete: function() {
      this.get('model').deleteRecord();
      this.get('model').save();

      this.transitionToRoute('metamarks');

      this.set('delete_mode', false);
    },
    cancel_delete: function() {
      this.set('delete_mode', false);
    }
  }
});

App.MetamarkEditController = Ember.ObjectController.extend({
  actions: {
    save: function() {
      var metamark = this.get('model');

      metamark.save();

      this.transitionToRoute('metamark', metamark);
    }
  }
});

App.MetamarksCreateController = Ember.ObjectController.extend({
  actions: {
    save: function() {
      this.get('model').set('created_at', new Date());

      var new_metamark = this.store.createRecord('metamark', this.get('model'));
      new_metamark.save();

      this.transitionToRoute('metamark', new_metamark);
    }
  }
});

App.MetamarksCreateView = Ember.View.extend({
  didInsertElement: function() {
    $('#create-modal').show();
  }
});
