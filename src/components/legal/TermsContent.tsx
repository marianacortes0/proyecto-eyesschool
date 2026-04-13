export default function TermsContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Términos y Condiciones</h2>

      <section>
        <h3 className="font-semibold text-lg mb-2">1. Aceptación de los términos</h3>
        <p>
          Al acceder a EyeSchool, el usuario acepta cumplir estos términos y condiciones.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-lg mb-2">2. Uso de la plataforma</h3>
        <p>
          La plataforma debe utilizarse exclusivamente con fines educativos y administrativos autorizados.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-lg mb-2">3. Responsabilidades del usuario</h3>
        <ul className="list-disc ml-5 space-y-1">
          <li>Mantener la confidencialidad de sus credenciales</li>
          <li>No hacer uso indebido del sistema</li>
          <li>Respetar la información de otros usuarios</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-lg mb-2">4. Limitación de responsabilidad</h3>
        <p>
          EyeSchool no garantiza disponibilidad continua del servicio ni se responsabiliza por fallos externos.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-lg mb-2">5. Modificaciones</h3>
        <p>
          Nos reservamos el derecho de actualizar estos términos en cualquier momento.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-lg mb-2">6. Terminación</h3>
        <p>
          El acceso podrá ser suspendido si se incumplen estas condiciones.
        </p>
      </section>
    </div>
  );
}