// convert to a json file
var fs = require('fs'),
    _ = require('underscore')._,
    request = require('request'),
    async = require('async');

var lines = fs.readFileSync('sheet.tsv').toString().split('\n'),
    structure = {};

async.each(lines, function(line, done) {
  var fields = line.split('\t'),
      topics = fields[0].trim().split(';'),
      ontology = fields[3].trim(),
      topicClasses = [],
      taxon = fields[1].trim(),
      species = fields[2].trim();

  async.each(topics, function(topic, done) {
    topic = topic.trim();
    request.get('http://aber-owl.net/service/api/queryNames.groovy', {
      'json': true,
      'qs': {
        'ontology': 'EDAM',
        'term': topic
      }
    }, function(req, res, body) {
      if(body && _.size(body) > 0) { 
        body = body[_.keys(body)[0]]; // disgusting
        topicClasses.push(body[0].iri);
      } else {
        console.log('Did not find topic "' + topic + '" for ' + ontology);
      }
      done();
    });
  }, function() {
    structure[ontology] = {
      'ontology': ontology,
      'ncbi': taxon,
      'species': species,
      'topics': topicClasses
    };
    done();
  });
}, function() {
  fs.writeFileSync('results.json', JSON.stringify(structure, null, '    '));
  console.log('Done');
});
