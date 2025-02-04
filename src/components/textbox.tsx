'use client';

import { InteractiveChildProps } from "@components/interactive";

export default function Textbox({
  style = {width: "100px", height: "60px", position: "static" }
}: InteractiveChildProps) {
  return (
    <textarea
      style={{resize: "none", border: "2px solid black", textAlign: "start", ...style}}
    ></textarea>
  );
}