

const sharp = require('sharp');
const { createCanvas, loadImage } = require('canvas');

// Reference: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage

const baseDir = __dirname + '/images/';

const size = 1024;

export const upperTransparent = (input, output) => {
    loadImage(input).then((img) => {
        const canvas = createCanvas(size, size);
        const context = canvas.getContext('2d');
    
    
        context.drawImage(
            img, // image src
            0, // x
            0, // y
            size, // width
            size / 2, // height
            0, // x position on canvas
            size / 2, // y position on canvas
            size, // width on canvas
            size / 2, // height on canvas
        );
    
        const buffer = canvas.toBuffer(); // get the buffer
    
        sharp(buffer)
            .png() // convert to png to maintain transparency
            .toFile(output) // output the image
            .then(() => console.log('Image processing complete.'))
            .catch(err => console.log(err));
    });
}

export const lowerTransparent = (input, output) => {
    loadImage(baseDir + 'img.png').then((img) => {
        const canvas = createCanvas(size, size);
        const context = canvas.getContext('2d');
            
        context.drawImage(
            img, // image src
            0, // x
            size / 2, // y
            size, // width
            size / 2, // height
            0, // x position on canvas
            0, // y position on canvas
            size, // width on canvas
            size / 2, // height on canvas
        );
    
        const buffer = canvas.toBuffer(); // get the buffer
    
        sharp(buffer)
            .png() // convert to png to maintain transparency
            .toFile(output) // output the image
            .then(() => console.log('Image processing complete.'))
            .catch(err => console.log(err));
    });
}

const mergeImages = async (path1, path2, output) => {
    const img1 = await loadImage(path1);
    const img2 = await loadImage(path2);

    const canvas = createCanvas(Math.max(img1.width, img2.width), img1.height + img2.height);
    const context = canvas.getContext('2d');

    context.drawImage(img1, 0, 0, img1.width, img1.height);
    context.drawImage(img2, 0, img1.height, img2.width, img2.height);

    const buffer = canvas.toBuffer('image/png');

    sharp(buffer)
        .toFile(output)
        .then(() => console.log('Images merged successfully.'))
        .catch(err => console.log(err));
}

// upperTransparent(baseDir + 'img.png', baseDir + 'output-upper-transparent.png');
// lowerTransparent(baseDir + 'img.png', baseDir + 'output-lower-transparent.png');

// mergeImages(baseDir + 'output-upper-transparent.png', baseDir + 'output-lower-transparent.png', baseDir + 'output-merge.png')