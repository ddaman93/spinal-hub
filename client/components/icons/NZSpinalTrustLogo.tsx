import React from "react";
import { ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

// Coordinate-space bounding box that encloses both paths after their transforms.
// Path 1 (blue)  – translate(0.106, 0)  – spans roughly y 0–42
// Path 2 (orange)– translate(0, 9.727)  – spans roughly y 38–74
const VIEW_W = 44;
const VIEW_H = 74;

interface NZSpinalTrustLogoProps {
  /** Controls the rendered height in points; width scales to preserve aspect ratio. */
  size?: number;
  style?: ViewStyle;
}

export default function NZSpinalTrustLogo({
  size = 38,
  style,
}: NZSpinalTrustLogoProps) {
  const height = size;
  const width = (VIEW_W / VIEW_H) * height;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      style={style}
    >
      {/* Blue upper spiral */}
      <Path
        d="M28.624,41.772a2.912,2.912,0,0,0,4.054.059,59.792,59.792,0,0,0,7.143-7.584A21.6,21.6,0,0,0,37.5,6.335a21.919,21.919,0,0,0-30.827,0A21.6,21.6,0,0,0,4.352,34.248a2.914,2.914,0,1,0,4.734-3.4,15.773,15.773,0,0,1,1.7-20.38,16.087,16.087,0,0,1,22.608,0,15.773,15.773,0,0,1,1.7,20.38,41.486,41.486,0,0,1-4.472,4.888c-5.767-5.056-11.578-10.331-12.362-11.361a4.636,4.636,0,0,1-.869-2.713,4.708,4.708,0,0,1,8.769-2.34,4.53,4.53,0,0,0,1.441,8.811l0,0s.05,0,.137,0h.026a4.649,4.649,0,0,0,4.362-2.967,8.876,8.876,0,0,0,.462-4.377A10.529,10.529,0,1,0,13.515,27.77c1.43,2,15.109,14,15.109,14"
        fill="#488AC9"
        transform="translate(0.106 0)"
      />
      {/* Orange lower spiral */}
      <Path
        d="M15.247,28.5a2.915,2.915,0,0,0-4.054-.059A59.792,59.792,0,0,0,4.05,36.023,21.6,21.6,0,0,0,6.371,63.937a21.916,21.916,0,0,0,30.827,0,21.6,21.6,0,0,0,2.321-27.913,2.914,2.914,0,1,0-4.734,3.4,15.773,15.773,0,0,1-1.7,20.38,16.087,16.087,0,0,1-22.608,0,15.773,15.773,0,0,1-1.7-20.38,41.486,41.486,0,0,1,4.472-4.888C19.023,39.591,24.834,44.867,25.618,45.9a4.636,4.636,0,0,1,.869,2.713,4.708,4.708,0,0,1-8.769,2.34,4.53,4.53,0,0,0-1.441-8.811l0,0s-.05,0-.137,0h-.026A4.649,4.649,0,0,0,11.755,45.1a8.878,8.878,0,0,0-.462,4.377A10.529,10.529,0,1,0,30.356,42.5c-1.43-2-15.109-14-15.109-14"
        fill="#FFA800"
        transform="translate(0 9.727)"
      />
    </Svg>
  );
}
