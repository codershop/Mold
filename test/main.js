var assert = require('assert')
var jsdom = require('jsdom')

var Mold, window

beforeEach(function (done) {
  jsdom.env('<div></div>', ['../mold.js'],
  function (err, win) {
    window = win
    Mold = window.Mold

    // pass logs through
    window.console = {
      log: function () {
        console.log.apply(console, arguments)
      }
    }

    done(err)
  })
})

describe('sanity', function () {
  it('should exist', function () {
    assert.ok(Mold)
  })
})

describe('html parsing', function () {

  it('should parse a string of text', function () {
    var dom = new Mold('Stop trying to hit me and hit me').create()
    assert.ok(dom)
    assert.equal(1, dom.length)
    assert.equal('#text', dom[0].nodeName)
    assert.equal('Stop trying to hit me and hit me', dom[0].nodeValue)
  })

  it('should parse a simple element to dom', function () {
    var dom = new Mold('<div></div>').create()
    assert.ok(dom)
    assert.equal(1, dom.length)
    assert.equal('DIV', dom[0].nodeName)
  })

  it('should parse multiple elements to dom', function () {
    var dom = new Mold('<section></section><div></div><span></span>').create()
    assert.equal(3, dom.length)
    assert.equal('SECTION', dom[0].nodeName)
    assert.equal('DIV', dom[1].nodeName)
    assert.equal('SPAN', dom[2].nodeName)
  })

  it('should parse nested elements to nested dom', function () {
    var dom = new Mold('<section><div></div><span></span></section>').create()
    assert.equal(1, dom.length)
    var children = dom[0].childNodes
    assert.equal(2, children.length)
    assert.equal('DIV', children[0].nodeName)
    assert.equal('SPAN', children[1].nodeName)
  })

  it('should allow self closing tags', function () {
    var dom = new Mold('<img><input>').create()
    assert.equal(2, dom.length)
    assert.equal('IMG', dom[0].nodeName)
    assert.equal('INPUT', dom[1].nodeName)
  })

  it('should parse attributes correctly', function () {
    var dom = new Mold('<input type="text"><a href="/gurus"><div class="good morning folks"></div></a>').create()
    assert.equal('text', dom[0].getAttribute('type'))
    assert.equal('/gurus', dom[1].getAttribute('href'))
    var children = dom[1].childNodes
    assert.equal('good morning folks', children[0].getAttribute('class'))
  })

  it('should parse inner text to text nodes', function () {
    var dom = new Mold('<div>My name is <span>Robot</span> thanks for reading the tests.</div>').create()
    var children = dom[0].childNodes
    assert.equal(3, children.length)
    assert.equal('#text', children[0].nodeName)
    assert.equal('My name is ', children[0].nodeValue)

    assert.equal('SPAN', children[1].nodeName)
    assert.equal(1, children[1].childNodes.length)
    assert.equal('Robot', children[1].childNodes[0].nodeValue)

    assert.equal('#text', children[2].nodeName)
    assert.equal(' thanks for reading the tests.', children[2].nodeValue)
  })

  it('should handle self closing tags', function () {
    var mold = new Mold('<input />')
    mold.create() // create will throw errors if mold doesn't ignore the / and tries to set it as an attribute
    new Mold('<input/>').create()
  })
})

describe('variable entities', function () {
  it('should blank out entities', function () {
    var dom = new Mold('<div>My name is {{name}}, hello.</div>').create()
    assert.equal('My name is , hello.', dom[0].childNodes[0].nodeValue)
  })

  it('should not make extra text nodes', function () {
    var dom = new Mold('<div>{{name}}</div>').create()
    assert.equal(1, dom[0].childNodes.length)
  })

  it('should update entities when update is called', function () {
    var mold = new Mold('<div>My name is {{name}}, hello.</div>')
    var dom = mold.create()

    mold.update({ name: 'Rob' })
    assert.equal('My name is Rob, hello.', dom[0].childNodes[0].nodeValue)

    mold.update({ name: 'Robot' })
    assert.equal('My name is Robot, hello.', dom[0].childNodes[0].nodeValue)
  })

  it('should replace the entities as the root element', function () {
    var mold = new Mold('My name is {{name}}, hello.')
    var dom = mold.create()
    mold.update({ name: 'Robot' })
    assert.equal('My name is Robot, hello.', dom[0].nodeValue)
  })

  it('should update multiple instances of the same entity name', function () {
    var mold = new Mold('<div>Hello, {{name}} will {{name}} you.</div>')
    var dom = mold.create()

    mold.update({ name: 'Rob' })
    assert.equal('Hello, Rob will Rob you.', dom[0].childNodes[0].nodeValue)
  })

  it('should allow multiple entity names', function () {
    var mold = new Mold('<div>Hello, {{name}} will {{action}} you.</div>')
    var dom = mold.create()

    mold.update({ name: 'Rob', action: 'look at' })
    assert.equal('Hello, Rob will look at you.', dom[0].childNodes[0].nodeValue)
  })

  it('should update entities in attributes', function () {
    var mold = new Mold('<div style="color: {{color}};" class="{{type}}">Hello.</div>')
    var dom = mold.create()

    mold.update({ color: 'red', type: 'statement' })
    assert.equal('color: red;', dom[0].getAttribute('style'))
    assert.equal('statement', dom[0].getAttribute('class'))
  })

  it('should not remove an entity if it is not updated', function () {
    var mold = new Mold('<div>{{name}}</div>')
    var dom = mold.create()

    mold.update({ name: 'Rob' })
    assert.equal('Rob', dom[0].childNodes[0].nodeValue)
    mold.update({ somethingElse: '1234' })
    assert.equal('Rob', dom[0].childNodes[0].nodeValue)
  })

  it('should remove values when undefined is specified', function () {
    var mold = new Mold('<div>{{name}}</div>')
    var dom = mold.create()

    mold.update({ name: 'Rob' })
    assert.equal('Rob', dom[0].childNodes[0].nodeValue)

    mold.update({ name: undefined })
    assert.equal('', dom[0].childNodes[0].nodeValue)
  })

  it('should use previous values when 2 separate updates affect the same thing', function () {
    var mold = new Mold('<div>{{firstName}} {{lastName}}</div>')

    var dom = mold.create()

    mold.update({ firstName: 'Rob' })
    mold.update({ lastName: 'Middleton' })

    assert.equal('Rob Middleton', dom[0].childNodes[0].nodeValue)
  })
})

describe('performance', function () {
  it('should not update the dom when the same thing is set', function () {
    var mold = new Mold('<div>{{name}}</div>')
    var dom = mold.create()
    var mutated = false

    mold.update({ name: 'Rob' })
    dom[0].addEventListener('DOMCharacterDataModified', function () {
      mutated = true
    }, false)

    mold.update({ name: 'Rob' })
    assert.equal(false, mutated)
  })
})