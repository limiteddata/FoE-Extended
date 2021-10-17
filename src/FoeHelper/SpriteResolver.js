
class SpriteResolver {
    constructor() {
        this.baseUrl = 'https://foero.innogamescdn.com/assets/';
        this.sprites = {};
    }
    getIcon = function (spritePath, iconName) {
        let styles = {};
        // if json file doesn't exist get it and cache it
        const completePath = `${this.baseUrl}${spritePath}`;
        if (!this.sprites.hasOwnProperty(`${completePath}.json`)) {
            let request = new XMLHttpRequest();
            request.open('GET', `${completePath}.json`, false);
            request.send();
            if (request.status === 200)
                this.sprites[`${completePath}.json`] = JSON.parse(request.responseText);
        }    
        // construct the style for the specific sprite icon
        this.sprites[`${completePath}.json`].frames.forEach(frame => {
            if (frame[0] === iconName){
                styles = {
                    backgroundImage: `url(${completePath}.png)`,
                    backgroundRepeat: 'no-repeat',
                    width: frame[3],
                    height: frame[4],
                    backgroundPosition: `-${frame[1]}px -${frame[2]}px`
                }
            }
        });
        return styles;       
    };
}

const spriteResolver = new SpriteResolver();
 
export { spriteResolver }