export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-4">Web Desa Sangkima — API Backend</h1>
        <p className="mb-4">Server berjalan. Gunakan Swagger UI untuk melihat dan mencoba endpoint API.</p>
        <p className="mb-6">
          Buka <a href="/api-docs" className="text-blue-600 underline">/api-docs</a> untuk dokumentasi interaktif.
        </p>
        <p className="text-sm text-gray-600">Jika masih kosong, periksa console atau jalankan <code>npm run dev</code> kembali.</p>
      </div>
    </main>
  );
}
