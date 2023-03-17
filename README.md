<img alt="elixr" src="src/assets/logo.svg" width="200" style="margin-bottom: 10px">

**SKYBX** is an open-source project that brings the power of [Blockade Labs](https://www.blockadelabs.com/)' AI-powered skybox generation tool into an immersive WebXR environment. This project enables users to create stunning skyboxes in a 3D world and experience the generated environments as if they were truly inhabiting them.

SKYBX is developed using the [Elixr engine](https://elixrjs.io/), a WebXR-centric framework built on top of [Three.js](https://threejs.org/) which integrates a robust Entity Component System (ECS) and the high-performance [Rapier](https://rapier.rs/) physics engine.

## Features

- 🤖 Tight integration with Blockade Labs' AI-powered skybox generation tool
- 🌐 Immersive experience when creating skyboxes in a 3D environment
- 🌟 Cross-platform compatibility for a wide range of WebXR-supported devices
- 🎨 Friendly and easy-to-use user interface for seamless skybox generation

## Local Development

### Prerequisites

To run this project locally, ensure you have the following installed:

- Node.js (v14.x or newer)
- npm (v7.x or newer)

### Installation

1. Git clone the repository and navigate to the project folder:

```sh
$ git clone git@github.com:felixtrz/skybx.git
$ cd skybx
```

2. Install dependencies:

```bash
$ npm install
```

3. Start the development server:

```bash
$ npm run serve
```

### Resources

- Elixr engine [documentation](https://elixrjs.io/) and [sample code](https://github.com/felixtrz/sndbx)
- Three.js [documentation](https://threejs.org/docs/) and [examples](https://threejs.org/examples/)
- Immersive Web Emulator [blog post](https://developer.oculus.com/blog/webxr-development-immersive-web-emulator/) and [Chrome web store page](https://chrome.google.com/webstore/detail/immersive-web-emulator/cgffilbpcibhmcfbgggfhfolhkfbhmik)

## Usage

1. Access [SKYBX](https://skybx.elixrjs.io/) through a compatible browser on a device that supports WebXR, such as Meta Quest 2 or Pico 4.
2. Use the virtual keyboard to enter a descriptive prompt for the skybox you wish to generate.
3. Point and click the "Generate" button with your controller to create a new skybox based on your prompt.
4. Explore and enjoy the generated world.

## API

Please refer to [elixrjs.io](https://elixrjs.io) for full API documentation.

## License

This project is co-licensed under the MIT License by Blockade Games, Inc., a Delaware corporation, and Felix Zhang, an individual. See the [LICENSE](./LICENSE.md) file for details.
