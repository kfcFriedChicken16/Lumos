"use client";

import dynamic from "next/dynamic";
// styles are loaded globally via layout/globals as shown above

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then(m => m.Excalidraw),
  { ssr: false }
);

export default function Whiteboard() {
  return (
    <div className="h-full w-full">
      <Excalidraw
        initialData={{
          elements: [],
          appState: {
            theme: "light",
            viewBackgroundColor: "#fff",
            gridSize: 20,
            zoom: { value: 1 as any },
            scrollX: 0,
            scrollY: 0,
          },
        }}
        // no UIOptions/custom CSS — get the default floating toolbar exactly like excalidraw.com
      />
    </div>
  );
}
