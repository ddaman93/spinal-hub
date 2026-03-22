// Web — uses a plain iframe (react-native-webview has no web support)
import React from "react";

type Props = { html: string };

export function PlatformWebView({ html }: Props) {
  // React.createElement with a lowercase string renders a real DOM element,
  // which is valid in React Native Web / Expo Web.
  return React.createElement("iframe", {
    srcDoc: html,
    sandbox: "allow-scripts allow-same-origin",
    style: {
      border: "none",
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
    },
  });
}
