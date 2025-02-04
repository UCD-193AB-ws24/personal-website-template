'use client'

import Image from "next/image"
import file from "../../../public/file.svg"
import Sidebar from '@components/sidebar/Sidebar';
import Textbox from "@components/textbox"
import Interactive from "@components/interactive"

export default function Editor() {
  const preventDefault = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  return (
    <div className="flex h-screen">
      <Sidebar />

      <div
        className="flex-1 bg-white p-4 relative"
        onDragOver={preventDefault}
      >
        <h1 className="text-2xl font-bold mb-4">Your Website Preview</h1>
        <div onDragOver={preventDefault} >
          <div onDragOver={preventDefault} style={{ "width": "100vw", "height": "100vh" }}>
            <Interactive
              child={<h1>This is an h1 tag</h1>}
              widthPx={250}
              heightPx={50}
            />
            <Interactive
              child={<p>This is a p tag</p>}
              widthPx={250}
              heightPx={50}
            />
            <Interactive
              child={<Textbox />}
              widthPx={250}
              heightPx={250}
            />
            <Interactive
              child={<div style={{ border: "1px solid red" }} contentEditable="true"></div>}
            />
            <Interactive
              child={<Image src={file} alt="nextjs" width="50" height="50" />}
            />
          </div>
        </div>
      </div>
      )
}
