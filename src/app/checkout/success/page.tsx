import Link from "next/link";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string; email?: string }>;
}) {
  const { order_id, email } = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-green-600 dark:text-green-400"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>

      <h1 className="mt-6 text-2xl font-semibold">Order placed!</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Thanks for shopping with PhoneDeck. Your order has been confirmed.
      </p>

      {order_id && (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          Order number:{" "}
          <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
            {order_id.slice(0, 8).toUpperCase()}
          </span>
        </p>
      )}

      {email && (
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          A confirmation email will be sent to{" "}
          <span className="font-medium text-zinc-800 dark:text-zinc-200">{email}</span>.
        </p>
      )}

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/shop"
          className="inline-flex h-11 items-center justify-center rounded-full bg-indigo-600 px-6 font-medium text-white hover:bg-indigo-700"
        >
          Continue shopping
        </Link>
        <Link
          href="/orders"
          className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-6 font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          View orders
        </Link>
      </div>
    </div>
  );
}
