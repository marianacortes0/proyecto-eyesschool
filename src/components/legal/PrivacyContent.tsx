export default function PrivacyContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Política de Privacidad</h2>

      <section>
        <h3 className="font-semibold text-lg mb-2">1. Información General</h3>
        <p>
          EyeSchool es una plataforma de gestión escolar diseñada para facilitar la administración
          académica y mejorar la experiencia educativa. Nos comprometemos a proteger la privacidad
          de nuestros usuarios.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-lg mb-2">2. Información que recopilamos</h3>
        <ul className="list-disc ml-5 space-y-1">
          <li>Datos personales: nombre, correo electrónico, identificación.</li>
          <li>Información académica: calificaciones, asistencia.</li>
          <li>Datos técnicos: IP, navegador, dispositivo.</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-lg mb-2">3. Uso de la información</h3>
        <p>
          Utilizamos la información para mejorar el servicio, garantizar seguridad y cumplir
          obligaciones legales.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-lg mb-2">4. Protección de datos</h3>
        <p>
          Implementamos medidas de seguridad técnicas y organizativas para proteger la información.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-lg mb-2">5. Derechos del usuario</h3>
        <ul className="list-disc ml-5 space-y-1">
          <li>Acceder a sus datos</li>
          <li>Solicitar corrección o eliminación</li>
          <li>Retirar consentimiento</li>
        </ul>
      </section>
    </div>
  );
}