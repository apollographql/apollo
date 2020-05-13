import React from "react";

export default ({ src, title }) => (
  <div
    style={{
      position: "relative",
      overflow: "hidden",
      paddingTop: "calc(100% / (16 / 9))",
    }}
  >
    <iframe
      src={src}
      title={title}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        border: 0,
      }}
      frameborder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    />
  </div>
);
