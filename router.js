var routes = require('routes')();
var fs = require('fs');
var db = require('monk')('localhost/movies');
var movies = db.get('movies');
var  qs = require('qs');
var view = require('./view');
var mime = require('mime');

//All movies
routes.addRoute('/movies', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html')
  if (req.method === 'GET') {
    movies.find({}, function (err, docs) {
      var template = view.render('movies/index', { movies: docs, pageTitle: 'Movie Ratings By Juicy J:' })
      res.end(template);
    })
  }
  if (req.method === 'POST') {
    var data = '';
    req.on('data', function (chunk) {
      data += chunk;
    });
    req.on('end', function () {
      var movieInfo = qs.parse(data);
      movies.insert(movieInfo, function (err, doc) {
        if (err) res.end('404')
        res.writeHead(302, {'Location': '/movies'})
        res.end()
      })
    })
  }
});

//New movie
routes.addRoute('/movies/new', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html')
    var template = view.render('movies/new', {})
    res.end(template)
});

//Show movie at specific ID
routes.addRoute('/movies/:id', (req, res, url) => {
  if (req.method === 'GET') {
    movies.findOne({_id: url.params.id}, function (err, doc) {
      if (err) res.end('Sorry 404')
      var template = view.render('movies/show', doc)
      res.end(template)
    })
  }
});

//Edit movie at specifc ID
routes.addRoute('/movies/:id/edit', (req, res, url) => {
  if (req.method === 'GET') {
    movies.findOne({_id: url.params.id}, function (err, doc) {
      if (err) return ('movie not found')
      var template = view.render('movies/edit', doc)
      res.end(template)
    })
  }
});

//Update movie at specific ID
routes.addRoute('/movies/:id/update', function (req, res, url) {
  if (req.method === 'POST') {
    var data = '' // query string coming in from the form
    req.on('data', function (chunk) {
      data += chunk
    })
    req.on('end', function () {
      var movieInfo = qs.parse(data)
      movies.update({_id: url.params.id}, movieInfo, function (err, doc) {
        if (err) throw console.error
        res.writeHead(302, {'Location': '/movies'})
        res.end()
      })
    })
  }
});

//Delete movie at specifc ID
routes.addRoute('/movies/:id/delete', (req, res, url) => {
  if (req.method === 'POST') {
    movies.remove({_id: url.params.id}, function (err, doc) {
      if (err) res.end('404 -- Didn\'t Delete')
      res.writeHead(302, {Location: '/movies'})
      res.end()
    })
  }
});

//Public with CSS and Images
routes.addRoute('/public/*', (req, res, url) => {
  res.setHeader('Content-Type', mime.lookup(req.url))
  fs.readFile('.' + req.url, function (err, file) {
    if (err) res.end('404, page doesn\'t exist')
    res.end(file)
  })
});

//Landing page
routes.addRoute('/', (req, res, url) => {
  res.setHeader('Content-Type', 'text/html')
  if (req.method === 'GET') {
    movies.find({}, function (err, docs) {
      if (err) res.end('Sorry 404')
      var template = view.render('movies/movies', docs)
      res.end(template)
    })
  }
})

module.exports = routes
