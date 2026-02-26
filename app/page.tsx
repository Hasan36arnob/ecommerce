export const dynamic = "force-dynamic";
import Link from "next/link";
import Image from "next/image";
import prisma from "../lib/prisma";

export default async function Home() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 24,
  });
  return (
    <main className="mx-auto max-w-7xl p-6">
      <h1 className="text-2xl font-semibold">Products</h1>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            className="group rounded-lg border p-4 hover:shadow"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded bg-gray-100">
              <Image
                src={p.imageUrl}
                alt={p.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">{p.category?.name}</div>
                <div className="font-medium">{p.name}</div>
              </div>
              <div className="font-semibold">${Number(p.price).toFixed(2)}</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
