// Native (iOS + Android) — uses react-native-webview
import React from "react";
import { StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

type Props = { html: string };

export function PlatformWebView({ html }: Props) {
  return (
    <WebView
      source={{ html }}
      style={StyleSheet.absoluteFillObject}
      originWhitelist={["*"]}
      javaScriptEnabled
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    />
  );
}
