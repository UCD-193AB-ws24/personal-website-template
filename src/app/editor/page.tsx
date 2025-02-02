'use client'

import Textbox from "@components/textbox"

export default function Editor() {
  const preventDefault = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  return (
    <div onDragOver={preventDefault} style={{"width": "100vw", "height": "100vh"}}>
      <Textbox />
    </div>
  )
}