export default function CheckoutPage() {
  async function placeOrder() {
    "use server";
  }
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <form action={placeOrder} className="mt-6 space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full rounded border px-3 py-2"
          required
        />
        <button
          formAction="/api/checkout"
          formMethod="post"
          className="h-10 rounded bg-black px-6 text-white hover:bg-gray-800"
        >
          Place Order
        </button>
      </form>
    </main>
  );
}
