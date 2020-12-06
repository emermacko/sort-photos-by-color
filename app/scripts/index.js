import "../styles/indexStyle.scss";

import order from "../output.json";

import FastAverageColor from "fast-average-color";
import { confetti } from "dom-confetti";

const CLIENT_ID = "084e31407b21fa0";
const balance = [1, 0, 0.1];

window.addEventListener("load", () => {
    main().catch(error => console.error(error));
    document.querySelector('#content').fadeIn();
});

function colorDistance(color1, color2) {
    var result = 0;
    color1 = rgbToHsl(color1[0], color1[1], color1[2]);
    color2 = rgbToHsl(color2[0], color2[1], color2[2]);
    for (var i = 0; i < color1.length; i++) {
        result += (color1[i] - color2[i]) * (color1[i] - color2[i]) * balance[i];
    }
    return result;
}

async function main() {
    const album = await getImages();
    
    const imagesP = album.images.map(image => {
        const imageSrc = `https://i.imgur.com/${image.id}m.jpg`;

        return ImagePreview.load(imageSrc, image);
    });

    const images = await Promise.all(imagesP);

    document.querySelector('#loading').fadeOut(500, true);
    document.querySelector('#sort').fadeIn();

    const sortImages = () => {
        images.sort((i1, i2) => {
            const c1 = i1.colors[i1.selectedColor];
            const c2 = i2.colors[i2.selectedColor];
            const dist1 = colorDistance(c1.value, [0, 0, 0]);
            const dist2 = colorDistance(c2.value, [0, 0, 0]);

            return dist2 - dist1;
        });
    };

    window.render = function() {
        displayWithPreview(images);
        document.querySelector('#images').fadeIn(500);
    };

    const button = document.querySelector("#sort");
    button.addEventListener("click", () => {
        const $images = document.querySelector("#images");
        $images.fadeOut(500, undefined, undefined, function () {
            sortImages();
            window.render();

            $images.fadeIn(500);
            confetti(button, { angle: 270, spread: 360, elementCount: 100 });
        });
    });
    window.render();
}

class ImagePreview {
    constructor(src, element, data) {
        this.src = src;
        this.element = element;
        this.data = data;

        const fac = new FastAverageColor();

        this.colors = {
            sqrt: fac.getColor(element, { algorithm: "sqrt" }),
            dominant: fac.getColor(element, { algorithm: "dominant" }),
            simple: fac.getColor(element, { algorithm: "simple" }),
        };

        this.selectedColor = "sqrt";
    }

    static load(src, data) {
        const img = document.createElement("img");

        return new Promise((resolve, reject) => {
            img.addEventListener("load",() => {
                    resolve(new ImagePreview(src, img, data));
                },{ once: true }
            );

            img.addEventListener("error", error => {
                    reject(error);
                },{ once: true }
            );

            img.crossOrigin = "Anonymous";
            img.src = src;
        });
    }

    render() {
        const parent = document.createElement("div");
        const previewContainer = document.createElement("div");
        const idPreview = document.createElement("div");

        idPreview.innerHTML = order[this.data.id];

        idPreview.classList.add("id-preview");

        const previews = Object.entries(this.colors).map(([name, color]) => {
            const preview = document.createElement("div");
            preview.classList.add("preview");
            preview.style.backgroundColor = color.rgba;

            preview.addEventListener("click", () =>{
                this.selectedColor = name;
                document.querySelector('#images').style.opacity = '1';
                window.render();
            });

            if (this.selectedColor === name) {
                preview.classList.add("selected");
            }

            return preview;
        });

        for (let preview of previews) {
            previewContainer.appendChild(preview);
        }

        previewContainer.classList.add("preview-color-container");
        parent.classList.add("outer-div");
        this.element.classList.add("img");

        parent.appendChild(this.element);
        parent.appendChild(idPreview);
        parent.appendChild(previewContainer);

        return parent;
    }
}

async function getImages() {
    const result = await fetch(`https://api.imgur.com/3/album/2CtFNoI`, {
        headers: {
            Authorization: `Client-ID ${CLIENT_ID}`,
        },
    });

    if (result.status !== 200) {
        throw new Error("Cannot load imgur album");
    }

    const data = await result.json();
    return data.data;
}

function displayWithPreview(images) {
    const grandParent = document.querySelector("#images");

    grandParent.innerHTML = "";

    for (let image of images) {
        const parent = image.render();
        grandParent.appendChild(parent);
    }
}

function rgbToHsl(e,n,r){var t,a,g,h,l,u,b=255;return arguments.length<2?(n=(e=e.red/b).green/b,r=e.blue/b):(e/=b,n/=b,r/=b),a=Math.min(e,n,r),t=((g=Math.max(e,n,r))+a)/2,g===a?l=u=0:(h=g-a,l=.5<t?h/(2-g-a):h/(g+a),(u=60*(r<e&&n<e?(n-r)/h:r<n&&e<n?2+(r-e)/h:4+(e-n)/h))<0&&(u+=360)),[u,l,t]}

Element.prototype.fadeIn = function (duration=400, displayMode=false, limit=1, callback) {
    const currentTransiton = this.style.transition;

    this.classList.add('fading');
    this.style.transition = `opacity ${duration}ms ease-in`;
    if (displayMode !== false) {
        this.style.display = displayMode;
    }

    setTimeout(() => {
        this.style.opacity = limit;
    }, 100);

    setTimeout(() => {
        this.classList.remove('fading');
        this.style.transition = currentTransiton;

        if (typeof callback == 'function') {
            callback();
        }
    }, duration + 200);

};

Element.prototype.fadeOut = function(duration=400, disable=false, limit=0, callback) {
    const currentTransiton = this.style.transition;

    this.classList.add('fading');
    this.style.transition = `opacity ${duration}ms ease-out`;
    if(disable) {
        this.style.display = 'none';
    }
    setTimeout(() => {
        this.style.opacity = limit;
    }, 100);

    setTimeout(() => {
        this.classList.remove('fading');
        this.style.transition = currentTransiton;

        if(typeof callback == 'function') {
            callback();
        }
    }, duration + 200);
};
