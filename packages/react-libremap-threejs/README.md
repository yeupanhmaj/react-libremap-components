# react-libremap-threejs

This library provides React components to easily integrate [Three.js](https://threejs.org/) 3D content into [MapLibre GL JS](https://maplibre.org/) maps using [react-libremap-components](https://github.com/mapcomponents/react-map-components-maplibre).

## Installation

Install the package and its peer dependencies:

```bash
npm install react-libremap-threejs react-libremap-components
```

## Getting Started

To use `react-libremap-threejs`, you need to wrap your 3D layers with the `ThreeProvider` component. This provider initializes the Three.js scene, camera, and renderer, and registers a custom layer within the MapLibre map.

### Basic Usage

Here is a simple example of how to render a 3D model on a map:

```tsx
import React from 'react';
import { MapComponentsProvider, MapLibreMap } from 'react-libremap-components';
import { ThreeProvider, MlThreeModelLayer } from 'react-libremap-threejs';

const App = () => {
  return (
    <MapComponentsProvider>
      <ThreeProvider id="three-scene-1">
        <MapLibreMap
          options={{
            style: 'https://demotiles.maplibre.org/style.json',
            center: [13.404954, 52.520008],
            zoom: 15,
            pitch: 60
          }}
        />
      
        <MlThreeModelLayer
          url="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb"
          mapPosition={[13.404954, 52.520008]}
          scale={10}
        />
      </ThreeProvider>
    </MapComponentsProvider>
  );
};

export default App;
```

## Running unit tests

Run `nx test react-libremap-threejs` to execute the unit tests via [Vitest](https://vitest.dev/).
