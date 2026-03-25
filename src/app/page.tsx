import { redirect } from "next/navigation";

export default function Home() {
  // Redirigir automáticamente a la nueva página de login
  redirect("/pages/login");
}
