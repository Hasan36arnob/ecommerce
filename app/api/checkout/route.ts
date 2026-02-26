import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "../../../lib/prisma";

export async function POST(req: Request) {
  const store = await cookies();
  const sid = store.get("sid")?.value;
  if (!sid) {
    return NextResponse.json({ error: "Empty cart" }, { status: 400 });
  }
  const body = await req.json().catch(() => ({}));
  const email = body.email || "guest@example.com";
  const cart = await prisma.cart.findUnique({
    where: { sessionId: sid },
    include: { items: { include: { product: true } } },
  });
  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Empty cart" }, { status: 400 });
  }
  const total = cart.items.reduce((sum, it) => {
    return sum + Number(it.product.price) * it.quantity;
  }, 0);
  const order = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}`,
      email,
      total,
      items: {
        create: cart.items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.product.price,
        })),
      },
    },
    include: { items: true },
  });
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return NextResponse.json(order);
}
