"use strict";

// dependencies
const gulpUtil = require('gulp-util')
const through = require('through2')
const fs = require('fs');
const path = require('path');

const pluginName = 'gulp-html-img-to-picture'
const PluginError = gulpUtil.PluginError

module.exports = function (customParameters) {
    return through.obj(function (file, enc, cb) {

        // Errors log
        if (file.isNull()) {
            cb(null, file)
            return
        }
        if (file.isStream()) {
            cb(new PluginError(pluginName, 'Streaming not supported'))
            return
        }

        try {
            const parameters = {
                imgFolder: false, // `${buildFolder}/`
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
                ...customParameters
            };

            const EXTENSION_REGEX = /(?<=src=[\'\"][\w\W]*)\.[\w]+(?=[\'\"])/i; // Get images extension from string
            const PICTURE_CLASS_REGEX = new RegExp(`<img[^>]*(${parameters.pictureClassAttribute}=([\\"\\']\\S+[\\"\\']))[^>]*>`, 'i'); // Get attr pictureClass from string
            const IMG_SRC_REGEX = /<img[^>]*src=[\"\'](\S+)[\"\'][^>]*>/i; // Get Image src value from string
            const IMG_REGEX = /<img[^>]*src=[\"|']([^\"\s]+)[\"|'][^>]*>/gi; // Get <img> from HTML code string
            const IMG_CLASS_REGEX = /(?: class)=(?:["']\W+\s*(?:\w+)\()?["']([^'"]+)['"]/; // Get class="" from image
            const PICTURE_REGEX = /<\s*picture[^>]*>([\w\W]*?)<\s*\/\s*picture\s*>/gi; // Get <picture> from HTML code string
            const SCRIPT_REGEX = /<\s*script[^>]*>([\w\W]*?)<\s*\/\s*script\s*>/gi; // Get <picture> from HTML code string
            const COMMENTS_REGEX = /(?=<!--)([\s\S]*?)-->/gi; // Get comments from HTML code string

            // Get HTML code string from File
            const htmlString = file.contents.toString();

            // Variables
            let newHtmlString;
            let tempHtmlString;
            let imagesConvertedToPictureCount = 0;
            let imagesIgnored = 0;

            /*** Comments ***/
                // Save all comments from source HTML
            const comments = htmlString.match(COMMENTS_REGEX);

            // Remove all comments from html and replace it with {{}}
            if (parameters.ignoreComments) {
                tempHtmlString = htmlString.replace(
                    COMMENTS_REGEX,
                    `{{ ${pluginName}__insert-comment }}`
                );
            }

            /*** Scripts ***/
                // Save all <script> from source HTML
            const scripts = tempHtmlString.match(SCRIPT_REGEX);

            // Remove all <script> from html and replace it with {{}}
            if (parameters.ignoreScripts) {
                tempHtmlString = tempHtmlString.replace(
                    SCRIPT_REGEX,
                    `{{ ${pluginName}__insert-script }}`
                );
            }

            /*** <picture> ***/
                // Save all <picture> from source HTML
            const pictures = tempHtmlString.match(PICTURE_REGEX);

            // Remove all <picture> from html and replace it with {{}}
            tempHtmlString = tempHtmlString.replace(
                PICTURE_REGEX,
                `{{ ${pluginName}__insert-picture }}`
            );

            /*** <img> ***/
                // Save all <img> from source HTML
            const images = tempHtmlString.match(IMG_REGEX);

            // Remove all <img> from html and replace it with {{}}
            tempHtmlString = tempHtmlString.replace(
                IMG_REGEX,
                `{{ ${pluginName}__insert-image }}`
            );

            newHtmlString = tempHtmlString

            if (images) {

                const newImages = images.map((image) => {
                    // Flags
                    let hasIgnoreClass = false;
                    let hasIgnoreAttribute = false;

                    // If image has class="" attribute
                    if (image.match(IMG_CLASS_REGEX)) {
                        const matches = image.match(IMG_CLASS_REGEX)
                        let classesArray = matches[1].split(' ')

                        // If image has a img-ignore class
                        if (classesArray.includes(parameters.ignoreClassname)) {
                            hasIgnoreClass = true

                            // Remove class img-ignore
                            classesArray = classesArray.filter(function (item) {
                                return item !== parameters.ignoreClassname
                            })
                            image = image.replace(matches[0], ` class="${classesArray.join(' ')}"`);
                        }
                    }

                    // If image has data-ignore attribute
                    if (image.includes(parameters.ignoreAttribute)) {
                        hasIgnoreAttribute = true;

                        // Remove attribute data-ignore
                        image = image.replace(parameters.ignoreAttribute, '');
                    }

                    // Remove attribute data-picture-class if image should be ignored
                    if ((hasIgnoreClass || hasIgnoreAttribute) &&
                        PICTURE_CLASS_REGEX.test(image)) {
                        const pictureClassAttr = image.match(PICTURE_CLASS_REGEX)[1];
                        image = image.replace(pictureClassAttr, '');
                    }

                    // Convert <img> to <picture> if img has extenstion and not ignored
                    if ((!hasIgnoreClass || !hasIgnoreAttribute) && EXTENSION_REGEX.test(image)) {
                        const imageExtension = image.match(EXTENSION_REGEX)[0];

                        // Check if extension is allowed
                        if (!parameters.extensions.includes(imageExtension)) {
                            return image;
                        }

                        const srcValueWithoutExt = image.match(IMG_SRC_REGEX)[1].replace(imageExtension, '');

                        let pictureClass = false;
                        if (PICTURE_CLASS_REGEX.test(image)) {
                            const pictureClassAttr = image.match(PICTURE_CLASS_REGEX)[1];
                            pictureClass = image.match(PICTURE_CLASS_REGEX)[2];
                            image = image.replace(pictureClassAttr, '');
                        }

                        function getFileSize(src) {
                            try {
                                return fs.statSync(src).size
                            } catch (err) {
                                return 0;
                            }
                        }

                        let imagesArray = [
                            {
                                name: 'original',
                                html: image,
                                size: getFileSize(`${parameters.imgFolder}${srcValueWithoutExt}${imageExtension}`)
                            },
                        ]

                        if (parameters.sourceExtensions) {
                            parameters.sourceExtensions.forEach((imgElement) => {
                                imagesArray.unshift(
                                    {
                                        name: imgElement.extension,
                                        html: `<source srcset="${srcValueWithoutExt}.${imgElement.extension}" type="${imgElement.mimetype}">`,
                                        size: getFileSize(`${parameters.imgFolder}${srcValueWithoutExt}.${imgElement.extension}`)
                                    }
                                )
                            })
                        }

                        // Filter Images
                        if (parameters.imgFolder && parameters.filterUnexistedImages) {
                            imagesArray = imagesArray.filter(function (img) {
                                if (img.name !== 'original' && img.size === 0) {
                                    // Remove unexisted img
                                } else {
                                    return img;
                                }
                            })
                        }

                        // Sort Images
                        if (parameters.imgFolder && parameters.sortBySize) {
                            imagesArray.sort((a, b) => a.size > b.size ? 1 : -1);
                        }

                        if (pictureClass) {
                            pictureClass = ` class=${pictureClass} `
                        } else {
                            pictureClass = ''
                        }

                        let newTag = `<picture${pictureClass}>`;
                        imagesArray.forEach((img) => {
                            newTag += img.html;
                        })
                        newTag += `</picture>`;

                        imagesConvertedToPictureCount++;

                        return newTag;
                    }

                    // Ignored Images Counter
                    if (hasIgnoreAttribute || hasIgnoreClass) {
                        imagesIgnored++;
                    }

                    return image;
                });

                // Replace {{}} with new tags
                newImages.forEach((newImage) => {
                    newHtmlString = newHtmlString.replace(`{{ ${pluginName}__insert-image }}`, newImage);
                });
            }

            if (pictures) {
                // Insert <picture> back to html
                pictures.forEach((picture) => {
                    newHtmlString = newHtmlString.replace(`{{ ${pluginName}__insert-picture }}`, picture);
                });
            }

            if (comments && parameters.ignoreComments) {
                // Insert comments back to html
                comments.forEach((comment) => {
                    newHtmlString = newHtmlString.replace(`{{ ${pluginName}__insert-comment }}`, comment);
                });
            }

            if (scripts && parameters.ignoreScripts) {
                // Insert <picture> back to html
                scripts.forEach((script) => {
                    newHtmlString = newHtmlString.replace(`{{ ${pluginName}__insert-script }}`, script);
                });
            }


            file.contents = new Buffer.from(newHtmlString || htmlString);
            this.push(file);


            // Logger
            if (parameters.logger) {
                console.info(`${pluginName}:`, path.basename(file.path));
                console.info(`${pluginName}:`, `${imagesConvertedToPictureCount} images converted to <picture>`);
                console.info(`${pluginName}:`, `${imagesIgnored} images ignored`);
            }

            this.push(file)
        } catch (err) {
            this.emit('error', new PluginError(pluginName, err));
        }

        cb()
    })
}

