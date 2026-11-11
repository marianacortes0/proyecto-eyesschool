import EyeSchoolLanding from "@/components/home/EyeSchoolLanding";

export default function Home() {
  // La portada trae su propio <main>: el layout raíz ya no lo pone (DEF-WEB-02).
  return (
    <main>
      <EyeSchoolLanding />
    </main>
  );
}
