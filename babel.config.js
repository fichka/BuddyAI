module.exports = function babelConfig(api) {
  const platform = api.caller((caller) => caller?.platform ?? "web");

  return {
    presets: [
      "babel-preset-expo",
      [
        "react-strict-dom/babel-preset",
        {
          debug: false,
          dev: process.env.NODE_ENV !== "production",
          platform: platform === "web" ? "web" : "native"
        }
      ]
    ],
    plugins: ["react-native-reanimated/plugin"]
  };
};
