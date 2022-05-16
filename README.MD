# gulp-html-img-to-picture

> Gulp plugin to wrap tag `<img>` with `<picture>` adding `<source>`  including .avif and .webp and sort sources inside `<picture>` by size

## The Idea of Package

> I checked all popular packages that wrapping `<img>` with `<picture>` and combined them all in one with extra options & parameters like: sorting by size, adding custom image extenstions, ignoring certain image(s)

A list of packages that inspired me. You can check them out if you need more similar / simpler solutions

- [gulp-html-img-wrapper](https://www.npmjs.com/package/gulp-html-img-wrapper)
- [gulp-webp-html-nosvg](https://www.npmjs.com/package/gulp-webp-html-nosvg)
- [gulp-xv-webp-html](https://www.npmjs.com/package/gulp-xv-webp-html)
- [gulp-avif-webp-html](https://www.npmjs.com/package/gulp-avif-webp-html)
- [gulp-webp-html](https://www.npmjs.com/package/gulp-webp-html)

## Features

- Works with any format if `<img>` tag (no need to write tag in one line, it can be tabulated)
- Adds `<source>` with .avif & .webp by default ( can be adjusted in parameters ) and possibility to add custom image extensions
- Ignore `<img>` inside HTML Comments
- Ignore `<img>` inside `<script></script>` that inlined into html
- Ignore existing `<picture>` tags
- Option to add a class for the `<picture>` tag after building the project using a special attribute `<img data-picture-class="picture-wrapper">` in the source code
- Option to sort sources inside `<picture>` by their size to force browser download the smallest one
- Option to remove `<sources>` with incorrect or unexisted `src` attribute
- Possibility not to wrap certain image(s) with special attribute or class name `<img data-ignore class="img-ignore" src="" alt="">`

## Install

```
$ npm i --save-dev gulp-html-img-to-picture
```

## Usage

Use this into your `gulpfile.js`:

```js
const gulp = require('gulp')
const imgToPicture = require("gulp-html-img-to-picture")

function html() {
    return src('src/*.html')
        .pipe(imgToPicture({
            imgFolder: './dist',
        }))
        .pipe(gulp.dest('dist/'))
}

exports.html = html;
```

Use this into your `gulpfile.js` with ES6 module syntax:

```js
import gulp from "gulp"
import imgToPicture from "gulp-html-img-to-picture"

const html = () => {
    return src('src/*.html')
        .pipe(imgToPicture({
            imgFolder: './dist',
        }))
        .pipe(gulp.dest('dist/'))
}

exports.html = html;
```

Recommended to use with [`gulp-plumber`](https://www.npmjs.com/package/gulp-plumber):

```js
import gulp from "gulp"
import plumber from "gulp-plumber"
import imgToPicture from "gulp-html-img-to-picture"

const html = () => {
    return src('src/*.html')
        .pipe(plumber({
            errorHandler: function (err) {
                notify.onError({
                    title: "HTML Error",
                    message: "<%= error.message %>"
                })(err)
            }
        }))
        .pipe(imgToPicture({
            imgFolder: './dist',
        }))
        .pipe(gulp.dest('dist/'))
}

exports.html = html;
```

## Parameters | Options

```js
imgToPicture({
    imgFolder: './dist', // required for sorting by size
    extensions: ['.jpg', '.jpeg', '.png'],
    ignoreClassname: 'img-ignore',
    ignoreAttribute: 'data-ignore',
    pictureClassAttribute: 'data-picture-class',
    logger: true,
    sortBySize: true,
    ignoreScripts: true,
    ignoreComments: true,
    filterUnexistedImages: true,
    sourceExtensions: [
        {
            extension: 'avif',
            mimetype: 'image/avif',
        },
        {
            extension: 'webp',
            mimetype: 'image/webp',
        },
    ],
})
```

## Options

#### imgFolder

Type: `string`<br>
Default: `false` <Br>

Pass an relative path to build folder where images are located. <br>
It's required only parameter in case you want to use sorting by image size <br>
In my [Gulp Boilerplate](https://github.com/andrii-marushchak/Gulp-4-Webpack-Boilerplate) it's `'./dist'`

#### extensions

Type: `array[]`<br>
Default: `['.jpg', '.jpeg', '.png']`

Pass an array of image extensions you want to wrap with `<picture>`

#### ignoreClassname

Type: `string`<br>
Default: `'img-ignore'`

The images with this class name won't be wrapped with `<picture>`

#### ignoreAttribute

Type: `string`<br>
Default: `'data-ignore'`

The images with this attribute won't be wrapped with `<picture>`

#### pictureClassAttribute

Type: `string`<br>
Default: `'data-picture-class'`

The attribute for adding CSS class name to `<picture>` that img will be wrapped with

#### logger

Type: `boolean`<br>
Default: `true`

If true, you will see the count of converted & ignored images in console <br>
![logger](https://i.imgur.com/VzsYmIC.png)

#### [sortBySize](#Sorting)

Type: `boolean`<br>
Default: `true`

If true, `<img>` and `<source>` in the `<picture>` will be sorted by their size <br>
> [`imgFolder`](#imgFolder) parameter is required for this option

#### ignoreScripts

Type: `boolean`<br>
Default: `true`

If true,  `<img>` inside `<script></script>` will be ignored

#### ignoreComments

Type: `boolean`<br>
Default: `true`

If true,  `<img>` inside HTML comments will be ignored

#### filterUnexistedImages

Type: `boolean`<br>
Default: `true`

If true, plugin will check sources path. `<sources>` with incorrect or unexisted `src` attribute will be removed from `<picture>`

#### sourceExtensions

Type: `array of ojects,json`<br>
Default:

 ```js
 [
    {
        extension: 'avif',
        mimetype: 'image/avif',
    },
    {
        extension: 'webp',
        mimetype: 'image/webp',
    },
]
```

An array of image extensions which will be existes as `<source>` inside `<picture>`. <br>
You can adjust their order in case if [sortBySize](#sortBySize) is set to false.

## Examples
```html
// Input
<img src="img/test.jpg" alt="image"> 
```

```html
// Output
<picture>
    <source srcset="img/test.avif" type="image/avif"><!-- 1 KB  -->
    <source srcset="img/test.webp" type="image/webp"><!-- 1.1 KB -->
    <img src="img/test.jpg" alt="image"><!-- 1.3 KB -->
</picture>
```

## Sorting

In specific cases **WebP** will be smaller then **Avif**, it will be automatically sorted if [sortBySize](#sortBySize) is set to true.

```html
// Output
<picture>
    <source srcset="img/test.webp" type="image/webp"><!-- 0.9 KB -->
    <source srcset="img/test.avif" type="image/avif"><!-- 1 KB  -->
    <img src="img/test.jpg" alt="image"><!-- 1.3 KB -->
</picture>
```

## Image ignoring / Excluding from wrapping

To ignore an image from being converted to `picture` you have to add `data-ignore` attribute or `img-ignore` class name. <br/>
also can be adjusted with these parameters

```js
ignoreClassname, ignoreAttribute
```

```html
// Input
<img src="assets/img/test.jpg" alt="">

<img data-ignore class="img-ignore" src="assets/img/test.jpg" alt="">

<img class="img-ignore" src="assets/img/test.jpg" alt="">
```

```html
// Output
<picture>
    <source srcset="assets/img/test.webp" type="image/webp">
    <img src="assets/img/test.jpg" alt="">
    <source srcset="assets/img/test.avif" type="image/avif">
</picture>

<img data-ignore class="img-ignore" src="assets/img/test.jpg" alt="">

<img class="img-ignore" src="assets/img/test.jpg" alt="">
``` 

## Browser support

- [`<picture>` Tag support](https://caniuse.com/?search=Picture%20element)
- [`.avif`  image format](https://caniuse.com/?search=AVIF%20image%20format)
- [`.webp`  image format](https://caniuse.com/?search=WebP%20image%20format)