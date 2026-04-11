export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "No autorizado. Inicia sesión primero." }, { status: 401 });
    const userId = (session.user as any).id;
    const userEmailContext = session.user.email;
    
    const { planId, userEmail } = await req.json();

    let unitPrice = 0;
    let title = "Suscripción MiperAI";
    if (planId === 'STARTER') {
      unitPrice = 19990;
      title = "MiperAI - Plan Starter (Mensual)";
    } else if (planId === 'PRO') {
      unitPrice = 49990;
      title = "MiperAI - Plan Profesional (Mensual)";
    } else {
      return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
    }

    // Usamos PreApproval para débitos automáticos mensuales
    const preApproval = new PreApproval(client);

    const result = await preApproval.create({
      body: {
        reason: title,
        external_reference: userId, // Es vital guardar el userId aquí para el Webhook
        payer_email: userEmail || "usuario@ejemplo.com",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: unitPrice,
          currency_id: "CLP"
        },
        back_url: process.env.NEXT_PUBLIC_APP_URL + "/dashboard?subscription=success",
        status: "pending"
      }
    });

    return NextResponse.json({ init_point: result.init_point });
  } catch (error: any) {
    console.error("Checkout Suscripción MP Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
