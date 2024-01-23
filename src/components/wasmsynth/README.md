# wasmsynth

This is just a very early experiment to find out how to run wasm in an AudioWorklet.
WASM can be compiled from several languages, which are tested here..

## zig

<https://dev.to/sleibrock/webassembly-with-zig-part-1-4onm>

```sh
# (re)compile dsp.zig
brew install zig # prequisite
cd zigsaw
zig build-lib zigsaw.zig -target wasm32-freestanding -dynamic -rdynamic -O ReleaseSmall # build
cp zigsaw.wsm ..
```

wasm file size: 690B

## rust

<https://developer.mozilla.org/en-US/docs/WebAssembly/Rust_to_Wasm>

```sh
# https://www.rust-lang.org/tools/install
cargo install wasm-pack # prequisite
cd rustsaw
wasm-pack build --target bundler # build
cp pkg/rustsaw_bg.wasm ..
```

wasm file size: 653B

## c

<https://emscripten.org/docs/getting_started/Tutorial.html>

```sh
# brew install emscripten
cd csaw
emcc -O2 csaw.c -o csaw # build
cp csaw.wasm ..
```

wasm file size: 680B

## assemblyscript

<https://www.assemblyscript.org/getting-started.html#setting-up-a-new-project>

```sh
cd ascsaw
# npm i
npm run asbuild # build
cp ascsaw/build/release.wasm ..
```

wasm file size: 122B !
