export default function Home() {
  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Welcome to KidToKid</h1>
        <p className="text-gray-600">
          Browse our curated selection of items and add your favorites to the basket.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <article className="rounded border p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Featured Item</h2>
          <p className="text-sm text-gray-600">Check back soon for real products!</p>
        </article>
      </div>
    </section>
  );
}
