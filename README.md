# moldjs

moldjs is a templating library that updates elements in place instead of replacing
them. It treats templating as creating and modifying trees of DOM elements.
This means updating your template in response to data changes doesn't remove
and recreate DOM elements. It is smart enough to only re-render things that
have changed.

moldjs is great for rendering nested views, since updates to the parent view don't
have to touch DOM elements create by the child views. We have used it
successfully for this in Backbone projects.

It uses a Handlebars-like syntax for template variables.

## Get moldjs

You can get moldjs with npm:

```bash
npm install moldjs
```

You can also download the standalone file right
[here](https://raw.github.com/idottv/Mold/master/mold.js)

## Require moldjs

moldjs supports CommonJS, AMD, and old-school browser global syntax, so it should
work with whatever build system you are using.

## Use moldjs

A simple demo of using moldjs in an app.

HTML:


```html
<html>
<head>
<script src="http://code.jquery.com/jquery.min.js"></script>
<script src="https://raw.github.com/idottv/Mold/master/mold.js"></script>
<script src="main.js></script>
</head>
<body>
</body>
</html>
```

main.js:

```JavaScript
$(function () {
  var templateString = '<h1>Hello {{name}}</h1>',
      template = new Mold(templateString),
      data = { name: 'Frobo Daggins' },
      $root = $('body'),
      $template

  // .create returns the DOM tree for the template
  // put it in a jquery element for easy manipulation
  $template = $(template.create())
  $root.append($template)

  // fill in our template with our data
  template.update(data)

  // Now our template is in the dom with data. Let's pretend our data has updated.
  data.name = 'Grandalf The Beige'
  // Let's update the template. This actually modifies the DOM elements in place
  // instead of recreating them.
  template.update(data)
});
```

## API

### `new Mold(str)`
Takes in `str`, an HTML string, and returns a new moldjs template object.

### `.create()`
Returns the DOM tree for the template.

### `.update(obj)`
Takes the template, and replaces variables within {{}} with the matching
properties in `obj`. Currently doesn't support nested properties or functions.

## Develop moldjs

Run the tests with

```bash
npm install
npm test
```

Pull requests for bug fixes or new features welcome. If you are adding or
changing functionality, please provide test cases. Feel free to add stuff
that is bothering you to the issue queue as well.

An [i.tv](http://i.tv) thang.

Contains SimpleHtmlParser Copyright 2004 Erik Arvidsson.  (although we would like to remove that dependency)
