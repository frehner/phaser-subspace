import serve from "rollup-plugin-serve"
import commonjs from "rollup-plugin-commonjs"
import resolve from "rollup-plugin-node-resolve"
import postcss from "rollup-plugin-postcss"
import image from "rollup-plugin-img"

export default {
  input: "./src/index.js",
  output: {
    dir: "dist",
    format: "umd",
  },
  plugins: [
    commonjs(),
    resolve(),
    serve({
      contentBase: "dist",
      port: 9000,
    }),
    postcss(),
    image({
      output: "dist"
    }),
  ]
}