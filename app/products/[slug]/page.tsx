export const dynamic = "force-dynamic";
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "../../../lib/prisma";

type Params = { slug: string };

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!product) return notFound();
  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded bg-gray-100">
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
        </div>
        <div>
          <div className="text-sm text-gray-500">{product.category?.name}</div>
          <h1 className="mt-2 text-2xl font-semibold">{product.name}</h1>
          <div className="mt-2 text-xl font-bold">${Number(product.price).toFixed(2)}</div>
          <p className="mt-4 text-gray-700">{product.description}</p>
          <form action="/api/cart" method="post" className="mt-6 flex items-center gap-3">
            <input type="hidden" name="productId" value={product.id} />
            <input
              type="number"
              name="quantity"
              min={1}
              defaultValue={1}
              className="h-10 w-20 rounded border px-3"
            />
            <button
              type="submit"
              className="h-10 rounded bg-black px-6 text-white hover:bg-gray-800"
            >
              Add to Cart
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
