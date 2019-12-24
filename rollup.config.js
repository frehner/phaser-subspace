import serve from "rollup-plugin-serve"
import commonjs from "rollup-plugin-commonjs"
import resolve from "rollup-plugin-node-resolve"
import postcss from "rollup-plugin-postcss"
import image from "rollup-plugin-img"
import {terser} from "rollup-plugin-terser"

const isProduction = process.env.NODE_ENV === "production"

export default {
  input: "./src/index.js",
  output: {
    file: `./dist/bundle.min.js`,
    format: "iife",
  },
  plugins: [
    commonjs(),
    resolve(),
    !isProduction && serve({
      contentBase: "dist",
      port: 9000,
    }),
    postcss(),
    image({
      output: "dist"
    }),
    isProduction && terser(),
  ]
}