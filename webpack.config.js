module.exports = {
    module: {
        rules: [
        // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
        { test: /\.tsx?$/, loader: "ts-loader" },
        { test: /\.(glsl|vs|fs)$/, loader: "ts-shader-loader" }
        ]
    }
};