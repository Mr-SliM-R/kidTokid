const mockItems = [
  { id: 1, name: 'Plush Bear', price: 12.99 },
  { id: 2, name: 'Story Book', price: 8.49 },
];

export default function Basket() {
  const total = mockItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Your Basket</h1>
        <p className="text-gray-600">Items currently in your basket.</p>
      </header>

      <ul className="space-y-2">
        {mockItems.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded border p-3 shadow-sm">
            <span>{item.name}</span>
            <span className="font-semibold">${item.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t pt-4 text-lg font-semibold">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </section>
  );
}
