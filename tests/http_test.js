'use strict';

var
    fs = require('fs'),
    utils = require('node-toybox').utils,
    app = require('../libs/http').createApp(require('../config')({http: {prefix: '/'}})),
    agent = require('supertest').agent(app),
    TEST_ID = 'foo.jpg',
    assert = require('assert'),
    fixtures = require('./fixtures'),
    debug = require('debug')('test');

describe('api', function () {
    it('should upload with id', function (done) {
        agent.post('/' + TEST_ID)
            .attach('file', fixtures.src_jpg)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function (res) {
                debug('upload -->', arguments, res.body);
                assert.equal(res.body.id, TEST_ID);
                assert.equal(utils.digestFile(res.body.file), utils.digestFile(fixtures.src_jpg));
            })
            .end(done);
    });
    it('should upload with new', function (done) {
        agent.post('/new')
            .attach('file', fixtures.src_jpg)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function (res) {
                debug(res.body);
                assert.ok(/^[\w\-]+\.jpeg$/.test(res.body.id));
                assert.equal(utils.digestFile(res.body.file), utils.digestFile(fixtures.src_jpg));
            })
            .end(done);
    });
    it('should upload with new and prefix', function (done) {
        agent.post('/new')
            .field('prefix', 'prefix')
            .attach('file', fixtures.src_jpg)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function (res) {
                debug(res.body);
                assert.ok(/^prefix[\w\-]+\.jpeg$/.test(res.body.id));
                assert.equal(utils.digestFile(res.body.file), utils.digestFile(fixtures.src_jpg));
            })
            .end(done);
    });
    it('should NOT upload with no file', function (done) {
        agent.post('/' + TEST_ID)
            .set('Accept', 'application/json')
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(function (res) {
                debug(res.body);
                assert.equal(res.body.error.status, 400);
                assert.equal(res.body.error.message, 'required_param_file');
            })
            .end(done);
    });
    it('should upload raw', function (done) {
        // curl -v -X PUT -H 'Content-Type:image/jpeg' http://localhost:3001/pictor/test.jpg --data-binary @tests/test.jpg
        var req = agent.put('/' + TEST_ID)
            .type('image/jpeg')
            .set('Accept', 'application/json');

        req.write(fs.readFileSync(fixtures.src_jpg))
        req.expect(200)
            .expect('Content-Type', /json/)
            .expect(function (res) {
                debug(res.body);
                assert.equal(res.body.id, TEST_ID);
                assert.equal(utils.digestFile(res.body.file), utils.digestFile(fixtures.src_jpg));
            })
            .end(done);
    });
    it('should upload url', function (done) {
        var url = agent.get('/' + TEST_ID).url; // some always existing url
        agent.get('/upload')
            .set('Accept', 'application/json')
            .query({id: TEST_ID, url: url})
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function (res) {
                debug(res.body);
                assert.equal(res.body.id, TEST_ID);
            })
            .end(done);
    });
    it('should NOT upload url with bad host', function (done) {
        var url = '__bad_host__';
        agent.get('/upload')
            .set('Accept', 'application/json')
            .query({id: TEST_ID, url: url})
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(function (res) {
                debug(res.body);
                assert.equal(res.body.error.status, 400);
                assert.equal(res.body.error.message, 'invalid_param_url');
            })
            .end(done);
    });
    it('should NOT upload url with bad file', function (done) {
        var url = agent.get('/__bad_file__').url;
        agent.get('/upload')
            .query({id: TEST_ID, url: url})
            .set('Accept', 'application/json')
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(function (res) {
                debug(res.body);
                assert.equal(res.body.error.status, 400);
                assert.equal(res.body.error.message, 'invalid_param_url');
            })
            .end(done);
    });
    it('should download', function (done) {
        agent.get('/download')
            .query({id: TEST_ID})
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /jpeg/)
            .end(done);
    });
    it('should NOT download for not found', function (done) {
        agent.get('/download')
            .query({id: '__not_found__'})
            .set('Accept', 'application/json')
            .expect(404)
            .expect('Content-Type', /json/)
            .expect(function (res) {
                debug(res.body);
                assert.equal(res.body.error.status, 404);
                assert.equal(res.body.error.message, 'not_found');
            })
            .end(done);
    });
    it('should get converters', function (done) {
        agent.get('/info/converters').expect(200).end(done);
    });
    it('should get presets', function (done) {
        agent.get('/info/presets').expect(200).end(done);
    });
    //TODO: it('should upload multi', function (done) { }
    //TODO: more test cases...
});
