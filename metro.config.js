const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

const nodeOnlyModules = new Set([
  "pg",
  "pg-pool",
  "pg-native",
  "pg-types",
  "pg-protocol",
  "pg-cursor",
  "pg-connection-string",
  "pg-numeric",
  "pgpass",
  "net",
  "tls",
  "dns",
  "fs",
  "child_process",
  "buffer-writer",
  "packet-reader",
]);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web") {
    if (nodeOnlyModules.has(moduleName)) {
      return { type: "empty" };
    }

    if (
      moduleName.startsWith("pg/") ||
      moduleName.startsWith("pg-") ||
      moduleName.includes("/pg/") ||
      moduleName.includes("/pg-") ||
      moduleName.includes("drizzle-orm/pg")
    ) {
      return { type: "empty" };
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
