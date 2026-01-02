const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web") {
    const emptyModules = [
      "ws",
      "crypto",
      "stream",
      "stream/promises",
      "http",
      "https",
      "net",
      "tls",
      "fs",
      "fs/promises",
      "child_process",
      "os",
      "zlib",
      "dns",
      "dgram",
      "cluster",
      "readline",
      "repl",
      "vm",
      "tty",
      "domain",
      "constants",
      "timers",
      "timers/promises",
      "worker_threads",
      "perf_hooks",
      "async_hooks",
      "v8",
      "inspector",
      "trace_events",
      "inherits",
      "pg",
      "pg-native",
    ];

    if (emptyModules.includes(moduleName)) {
      return {
        type: "empty",
      };
    }

    if (moduleName.startsWith("node:")) {
      return {
        type: "empty",
      };
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
