import { ViewTransition } from "react";

/**
 * Las plantillas se vuelven a montar en cada navegación (los layouts no),
 * así que aquí sí se disparan las animaciones de entrada y salida de página.
 */
export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
