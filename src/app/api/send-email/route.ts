import { Resend } from "resend";


export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const body = await req.json();

    const { name, lastName, id, email, type, message } = body;

    // ✅ Validación básica
    if (!name || !lastName || !id || !email || !type || !message) {
      return Response.json(
        { success: false, error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    const data = await resend.emails.send({
      from: "Soporte EyeSchool <onboarding@resend.dev>",
      to: ["sierrasamuel147@gmail.com"],
      subject: `Nuevo soporte - ${type}`,
      html: `
        <h2>Nuevo mensaje de soporte</h2>

        <p><strong>Nombre:</strong> ${name} ${lastName}</p>
        <p><strong>Cédula:</strong> ${id}</p>
        <p><strong>Correo:</strong> ${email}</p>
        <p><strong>Tipo de ayuda:</strong> ${type}</p>

        <hr/>

        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
      `,
    });

    return Response.json({ success: true, data });

  } catch (error: any) {
    console.error(error);

    return Response.json(
      { success: false, error: "Error enviando el correo" },
      { status: 500 }
    );
  }
}