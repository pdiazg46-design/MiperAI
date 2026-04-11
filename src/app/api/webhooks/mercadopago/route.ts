import { NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import prisma from '@/lib/prisma';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' });

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("data.id");
    const type = url.searchParams.get("type");

    // "subscription_preapproval" es el evento que gatilla los pagos de mensualidad recurrentes
    if (type === "subscription_preapproval" && id) {
      const preApproval = new PreApproval(client);
      const subscriptionInfo = await preApproval.get({ id });

      const userId = subscriptionInfo.external_reference;
      const status = subscriptionInfo.status; // 'authorized', 'paused', 'cancelled'

      if (userId) {
        if (status === "authorized") {
          const nextMonth = new Date();
          nextMonth.setDate(nextMonth.getDate() + 30);

          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: "ACTIVE",
              queriesUsed: 0,
              currentPeriodEnd: nextMonth
            }
          });
          
          console.log(`[Webhook MP] Suscripción Autorizada/Pagada mensualmente. Usuario: ${userId}.`);
        } else if (status === "cancelled" || status === "paused") {
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: "CANCELED"
            }
          });
          console.log(`[Webhook MP] Suscripción Cancelada o Suspendida. Usuario: ${userId}.`);
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Webhook MP Error]", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
