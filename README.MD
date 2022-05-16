# gulp-html-img-to-picture

> Gulp plugin to replace html element `<img>` to `<picture>` with [`gulp-html-img-to-picture`](https://github.com/andrii-marushchak/gulp-html-img-to-picture), including .avif and .webp and sort sources inside `<picture>` by size
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
        .pipe(imgToPicture())
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
        .pipe(imgToPicture())
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
        .pipe(imgToPicture())
        .pipe(gulp.dest('dist/'))
}

exports.html = html;
```

## Parameters

You can pass an array of image extensions to be converted to `<picture>`, the default is `['.jpg', '.jpeg', '.png']`

```js
import gulp from "gulp"
import imgToPicture from "gulp-html-img-to-picture"

const html = () => {
    return src('src/*.html')
        .pipe(imgToPicture(
            ['.jpg', '.jpeg', '.png']
        ))
        .pipe(gulp.dest('dist/'))
}

exports.html = html;
```

## Example

> Notice. if `.avif` or `.webp` img aren't exist - they won't be added to markup

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

Sometimes **WebP** image is smaller then **Avif**, it will be automatically sorted

```html
// Output
<picture>
    <source srcset="img/test.webp" type="image/webp"><!-- 0.9 KB -->
    <source srcset="img/test.avif" type="image/avif"><!-- 1 KB  -->
    <img src="img/test.jpg" alt="image"><!-- 1.3 KB -->
</picture>
```

## Image ignore

To ignore an image from being converted to `picture` you have to add `data-ignore` attribute or `img-ignore` class name

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

## Other
import webp from 'gulp-webp'
import avif from 'gulp-avif'