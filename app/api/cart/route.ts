import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import prisma from "../../../lib/prisma";

async function getOrCreateCart(sessionId: string) {
  let cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: { items: { include: { product: true } } },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { sessionId },
      include: { items: { include: { product: true } } },
    });
  }
  return cart;
}

export async function GET() {
  const store = await cookies();
  let sid = store.get("sid")?.value;
  if (!sid) {
    sid = randomUUID();
    store.set("sid", sid, { httpOnly: true, sameSite: "lax", path: "/" });
  }
  const cart = await getOrCreateCart(sid);
  return NextResponse.json(cart);
}

export async function POST(req: Request) {
  const store = await cookies();
  let sid = store.get("sid")?.value;
  if (!sid) {
    sid = randomUUID();
    store.set("sid", sid, { httpOnly: true, sameSite: "lax", path: "/" });
  }
  const contentType = req.headers.get("content-type") || "";
  let productId = "";
  let quantity = 1;
  if (contentType.includes("application/json")) {
    const body = await req.json();
    productId = body.productId;
    quantity = Math.max(1, Number(body.quantity) || 1);
  } else {
    const form = await req.formData();
    productId = String(form.get("productId") || "");
    quantity = Math.max(1, Number(form.get("quantity")) || 1);
  }
  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }
  const cart = await getOrCreateCart(sid);
  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });
  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }
  const nextCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  });
  return NextResponse.json(nextCart);
}

export async function DELETE(req: Request) {
  const store = await cookies();
  const sid = store.get("sid")?.value;
  if (!sid) {
    return NextResponse.json({ ok: true });
  }
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const cart = await prisma.cart.findUnique({ where: { sessionId: sid } });
  if (!cart) return NextResponse.json({ ok: true });
  if (productId) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });
  } else {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
  return NextResponse.json({ ok: true });
}
