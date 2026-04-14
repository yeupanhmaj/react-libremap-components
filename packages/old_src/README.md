# EagMapDisplay

This is the project contain EagMapDisplay components and Storybook stories for RUC.

## Installation

```Bash
npm install eag-map-display
```

## Usage

```JS
import { EagMapDisplay } from 'eag-map-display';
```

```JS
<EagMapDisplay
  // deprecate, no longer used, the map will provide default url, make sure you provided the apiKey
  urlTemplate={`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`}
  apiKey={YOU_API_KEY}
  center={[51.505, -0.09]}
  onCenterChanged={() => {}}
  geoJson={geoJson}
  onGeoJsonChange={(e) =>
    localStorage.setItem("geoJson", JSON.stringify(e))
  }
  zoom={13}
  onZoomChanged={(zoom) => console.log("Zoom changed:", zoom)}
/>
```

> <span style="color: orange; font-weight: bold;">Warning</span>  
> The map take full <b>width</b> and <b>height</b> of the parent element; make make sure your parent have the specific value for width and height.
>
> More details at [Document](https://confluence.galliker.com/display/UC/Eag+Map+Display)

## For development

```
git clone https://bitbucket.galliker.local/scm/eag/gpms.md-frontend.git

cd gpms.md-frontend

npm install

npm run dev
```

## Project structure

- [assets/](.\src\assets)
  - [color-palette-svgrepo-com.svg](.\src\assets\color-palette-svgrepo-com.svg)
  - [fullscreen.png](.\src\assets\fullscreen.png)
  - [fullscreen@2x.png](.\src\assets\fullscreen@2x.png)
  - [layers-2x.png](.\src\assets\layers-2x.png)
  - [layers.png](.\src\assets\layers.png)
  - [layers.svg](.\src\assets\layers.svg)
  - [logo.svg](.\src\assets\logo.svg)
  - [marker-icon-2x.png](.\src\assets\marker-icon-2x.png)
  - [marker-icon.png](.\src\assets\marker-icon.png)
  - [marker-icon.svg](.\src\assets\marker-icon.svg)
  - [marker-shadow.png](.\src\assets\marker-shadow.png)
  - [marker-shadow.svg](.\src\assets\marker-shadow.svg)
  - [react.svg](.\src\assets\react.svg)
- [libs/](.\src\libs)
  - [geoman-core/](.\src\libs\geoman-core)
    - [leaflet-geoman.css](.\src\libs\geoman-core\leaflet-geoman.css)
    - [leaflet-geoman.css.map](.\src\libs\geoman-core\leaflet-geoman.css.map)
    - [leaflet-geoman.d.ts](.\src\libs\geoman-core\leaflet-geoman.d.ts)
    - [leaflet-geoman.js](.\src\libs\geoman-core\leaflet-geoman.js)
    - [leaflet-geoman.js.map](.\src\libs\geoman-core\leaflet-geoman.js.map)
    - [leaflet-geoman.min.js](.\src\libs\geoman-core\leaflet-geoman.min.js)
  - [leaflet-core/](.\src\libs\leaflet-core)
    - [images/](.\src\libs\leaflet-core\images)
      - [layers-2x.png](.\src\libs\leaflet-core\images\layers-2x.png)
      - [layers.png](.\src\libs\leaflet-core\images\layers.png)
      - [layers.svg](.\src\libs\leaflet-core\images\layers.svg)
      - [logo.svg](.\src\libs\leaflet-core\images\logo.svg)
      - [marker-icon-2x.png](.\src\libs\leaflet-core\images\marker-icon-2x.png)
      - [marker-icon.png](.\src\libs\leaflet-core\images\marker-icon.png)
      - [marker-icon.svg](.\src\libs\leaflet-core\images\marker-icon.svg)
      - [marker-shadow.png](.\src\libs\leaflet-core\images\marker-shadow.png)
      - [marker-shadow.svg](.\src\libs\leaflet-core\images\marker-shadow.svg)
    - [leaflet-src.esm.js](.\src\libs\leaflet-core\leaflet-src.esm.js)
    - [leaflet-src.esm.js.map](.\src\libs\leaflet-core\leaflet-src.esm.js.map)
    - [leaflet-src.js](.\src\libs\leaflet-core\leaflet-src.js)
    - [leaflet-src.js.map](.\src\libs\leaflet-core\leaflet-src.js.map)
    - [leaflet.css](.\src\libs\leaflet-core\leaflet.css)
    - [leaflet.d.ts](.\src\libs\leaflet-core\leaflet.d.ts)
    - [leaflet.fullscreen.css](.\src\libs\leaflet-core\leaflet.fullscreen.css)
    - [leaflet.fullscreen.min.js](.\src\libs\leaflet-core\leaflet.fullscreen.min.js)
    - [leaflet.js](.\src\libs\leaflet-core\leaflet.js)
    - [leaflet.js.map](.\src\libs\leaflet-core\leaflet.js.map)
- [map-component/](.\src\map-component)
  - [leaflet-map/](.\src\map-component\leaflet-map)
    - [geoman-core/](.\src\map-component\leaflet-map\geoman-core)
      - [leaflet-geoman.css](.\src\map-component\leaflet-map\geoman-core\leaflet-geoman.css)
      - [leaflet-geoman.css.map](.\src\map-component\leaflet-map\geoman-core\leaflet-geoman.css.map)
      - [leaflet-geoman.d.ts](.\src\map-component\leaflet-map\geoman-core\leaflet-geoman.d.ts)
      - [leaflet-geoman.js](.\src\map-component\leaflet-map\geoman-core\leaflet-geoman.js)
      - [leaflet-geoman.js.map](.\src\map-component\leaflet-map\geoman-core\leaflet-geoman.js.map)
      - [leaflet-geoman.min.js](.\src\map-component\leaflet-map\geoman-core\leaflet-geoman.min.js)
    - [hook/](.\src\map-component\leaflet-map\hook)
      - [MapLocalStorage.ts](.\src\map-component\leaflet-map\hook\MapLocalStorage.ts)
    - [leaflet-core/](.\src\map-component\leaflet-map\leaflet-core)
      - [images/](.\src\map-component\leaflet-map\leaflet-core\images)
        - [color-palette-svgrepo-com.svg](.\src\map-component\leaflet-map\leaflet-core\images\color-palette-svgrepo-com.svg)
        - [fullscreen.png](.\src\map-component\leaflet-map\leaflet-core\images\fullscreen.png)
        - [fullscreen@2x.png](.\src\map-component\leaflet-map\leaflet-core\images\fullscreen@2x.png)
        - [layers-2x.png](.\src\map-component\leaflet-map\leaflet-core\images\layers-2x.png)
        - [layers.png](.\src\map-component\leaflet-map\leaflet-core\images\layers.png)
        - [layers.svg](.\src\map-component\leaflet-map\leaflet-core\images\layers.svg)
        - [logo.svg](.\src\map-component\leaflet-map\leaflet-core\images\logo.svg)
        - [marker-icon-2x.png](.\src\map-component\leaflet-map\leaflet-core\images\marker-icon-2x.png)
        - [marker-icon.png](.\src\map-component\leaflet-map\leaflet-core\images\marker-icon.png)
        - [marker-icon.svg](.\src\map-component\leaflet-map\leaflet-core\images\marker-icon.svg)
        - [marker-shadow.png](.\src\map-component\leaflet-map\leaflet-core\images\marker-shadow.png)
        - [marker-shadow.svg](.\src\map-component\leaflet-map\leaflet-core\images\marker-shadow.svg)
      - [leaflet-src.esm.js](.\src\map-component\leaflet-map\leaflet-core\leaflet-src.esm.js)
      - [leaflet-src.esm.js.map](.\src\map-component\leaflet-map\leaflet-core\leaflet-src.esm.js.map)
      - [leaflet-src.js](.\src\map-component\leaflet-map\leaflet-core\leaflet-src.js)
      - [leaflet-src.js.map](.\src\map-component\leaflet-map\leaflet-core\leaflet-src.js.map)
      - [leaflet.css](.\src\map-component\leaflet-map\leaflet-core\leaflet.css)
      - [leaflet.d.ts](.\src\map-component\leaflet-map\leaflet-core\leaflet.d.ts)
      - [leaflet.fullscreen.css](.\src\map-component\leaflet-map\leaflet-core\leaflet.fullscreen.css)
      - [leaflet.fullscreen.min.js](.\src\map-component\leaflet-map\leaflet-core\leaflet.fullscreen.min.js)
      - [leaflet.js](.\src\map-component\leaflet-map\leaflet-core\leaflet.js)
      - [leaflet.js.map](.\src\map-component\leaflet-map\leaflet-core\leaflet.js.map)
    - [GeomanColorOptions.ts](.\src\map-component\leaflet-map\GeomanColorOptions.ts)
    - [leafle-map.style.css](.\src\map-component\leaflet-map\leafle-map.style.css)
    - [leaflet-map.tsx](.\src\map-component\leaflet-map\leaflet-map.tsx)
  - [openlayers-map/](.\src\map-component\openlayers-map)
    - [custom-css.css](.\src\map-component\openlayers-map\custom-css.css)
    - [open-map-test.tsx](.\src\map-component\openlayers-map\open-map-test.tsx)
- [types/](.\src\types)
  - [eag-map-display.d.ts](.\src\types\eag-map-display.d.ts)
- [App.css](.\src\App.css)
- [App.tsx](.\src\App.tsx)
- [index.css](.\src\index.css)
- [index.ts](.\src\index.ts)
- [main.tsx](.\src\main.tsx)
- [vite-env.d.ts](.\src\vite-env.d.ts)
