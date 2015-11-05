var databank = require('databank').Databank,
    _ = require('underscore')._,
    fs = require('fs');

var params = {
    'schema': {},
    'port': 6379
};
var db = databank.get('redis', params);
db.connect({}, function(err) {
    if(err) {
        throw new Error('Could not connect to database');
    }
}.bind(this));

var structure = JSON.parse(fs.readFileSync('results.json', 'utf-8'));

_.each(structure, function(struc, ont) {
  var oid = _.last(ont.split('/'));
  db.read('ontologies', oid, function(err, ontology) {
    if(!err && ontology) {
      ontology.ncbi_id = struc.ncbi;
      ontology.species = struc.species;
      ontology.topics = struc.topics;

      db.save('ontologies', oid, ontology, function() {
        console.log('Updated ' + oid);
      });
    } else {
      console.log('Could not find ' + oid);
    }
  });
});
