import "../styles/indexStyle.scss";
import "../styles/instaStyle.css";

import order from '../output.json'

import FastAverageColor from 'fast-average-color';
import { confetti } from 'dom-confetti'

const CLIENT_ID = '084e31407b21fa0';
const balance = [1, 0, 0.1];

window.addEventListener('load', () => {
    main().catch((error) => console.error(error))
})

function colorDistance(color1, color2) {
    var result = 0;
    color1 = rgbToHsl(color1[0], color1[1], color1[2]);
    color2 = rgbToHsl(color2[0], color2[1], color2[2]);
    for (var i = 0; i < color1.length; i++)
        result += (color1[i] - color2[i]) * (color1[i] - color2[i]) * balance[i];
    return result;
}

async function main() {
    const album = await getImages()
    
    const imagesP = album.images.map((image) => {
        const imageSrc = `https://i.imgur.com/${image.id}m.jpg`

        return ImagePreview.load(imageSrc, image)
    })

    const images = await Promise.all(imagesP)

    const sortImages = () => {
        images.sort((i1, i2) => {
            const c1 = i1.colors[i1.selectedColor]
            const c2 = i2.colors[i2.selectedColor]
            const dist1 = colorDistance(c1.value, [0, 0, 0])
            const dist2 = colorDistance(c2.value, [0, 0, 0])
            
            return dist2 - dist1
        })
    }

    window.render = () => {
        displayWithPreview(images)
    }
    const button = document.querySelector('#sort')
    button.addEventListener('click', () => {
        confetti(button, { angle: 270, spread: 360, elementCount: 100 })
        sortImages()
        window.render()
    })
    window.render()
}

class ImagePreview {
    constructor(src, element, data) {
        this.src = src
        this.element = element
        this.data = data

        const fac = new FastAverageColor()

        this.colors = {
            dominant: fac.getColor(element, { algorithm: 'dominant' }),
            sqrt: fac.getColor(element, { algorithm: 'sqrt' }),
            simple: fac.getColor(element, { algorithm: 'simple' })
        }

        this.selectedColor = 'sqrt'
    }

    static load(src, data) {
        const img = document.createElement('img')

        return new Promise((resolve, reject) => {
            img.addEventListener('load', () => {
                resolve(new ImagePreview(src, img, data))
            }, { once: true })

            img.addEventListener('error', (error) => {
                reject(error)
            }, { once: true })

            img.crossOrigin = "Anonymous";

            img.src = src
        })
    }

    render() {
        const parent = document.createElement('div')
        const previewContainer = document.createElement('div');
        const idPreview = document.createElement('div')

        idPreview.innerHTML = order[this.data.id]


        idPreview.classList.add('id-preview')

        const previews = Object.entries(this.colors).map(([name, color]) => {
            const preview = document.createElement('div')
            preview.classList.add('preview')
            preview.style.backgroundColor = color.rgba

            preview.addEventListener('click', () => {
                this.selectedColor = name
                window.render()
            })

            if (this.selectedColor === name) {
                preview.classList.add('selected')
            }

            return preview
        })

        // [1, 2, 3, 4, 10].reduce((akumulator, wartosc) => {
        //      return akumulator + wartosc
        // }, 0)

        /*
            List<Integer> a = new ArrayList<>();
            a.add(1); a.add(2);
            

            a.removeIf(a -> a==1)
        
        */

        // 1: akumulator = 0, wartosc = 1 => 1
        // 2: akumulator = 1, wartosc = 2 => 3
        // 3: akumulator = 3, wartosc = 3 => 6
        // 4: akumulator = 6, wartosc = 4 => 10

        for (let preview of previews) {
            previewContainer.appendChild(preview)
        }
        
        previewContainer.classList.add('preview-color-container');
        parent.classList.add('outer-div')
        this.element.classList.add('img')
        this.element.classList.add('loaded')

        parent.appendChild(this.element)
        parent.appendChild(idPreview)
        parent.appendChild(previewContainer)

        return parent
    }
}

async function getImages() {
    const result = await fetch(`https://api.imgur.com/3/album/2CtFNoI`, {
        headers: {
            "Authorization": `Client-ID ${CLIENT_ID}`,
        }
    });

    if (result.status !== 200) {
      throw new Error('Cannot load imgur album')
    }

    const data = await result.json();
    return data.data;
}


function displayWithPreview(images) {
    const grandParent = document.querySelector('#images')
    
    grandParent.innerHTML = ''

    for (let image of images) {
        const parent = image.render()
        grandParent.appendChild(parent)
    }
}

function rgbToHsl(r, g, b) {
    /* r === rgb pixel object || r value*/
    var h, s, l, min, max, _full = 255;
    if (arguments.length < 2)
      r = r.red / _full, g = r.green / _full, b = r.blue / _full
    else
      r /= _full, g /= _full, b /= _full
  
    min = Math.min(r,g,b)
    max = Math.max(r,g,b)
    l = (max + min) / 2

    if (max === min)
      s = h = 0;
    else {
      var d = max - min
      s = (l > 0.5) ? (d / (2 - max - min)) : (d / (max + min));
      h = 60 *
         ((r > b && r > g) ? (g - b) / d
        : (g > b && g > r) ? 2 + (b - r) / d
        : 4 + (r - g) / d)
  
      if (h < 0) h += 360
    }
  
    return [h,s,l]
}