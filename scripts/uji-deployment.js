import assert from "node:assert/strict";

let jumlah = 0;
try {
  const asal = new URL(process.argv[2] ?? "http://127.0.0.1:3000");
  assert.equal(asal.pathname, "/", "Gunakan alamat dasar tanpa /api.");
  assert.ok(!asal.search && !asal.hash && !asal.username && !asal.password);
  assert.ok(
    asal.protocol === "https:" ||
      (asal.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(asal.hostname)),
    "Alamat publik wajib HTTPS.",
  );

  async function baca(path) {
    return fetch(new URL(path, asal), {
      headers: { Accept: "application/json, text/html" },
      signal: AbortSignal.timeout(120000),
    });
  }

  function lulus(nama) {
    jumlah++;
    console.log(`PASS ${nama}`);
  }

  let res = await baca("/healthz");
  assert.equal(res.status, 200, "/healthz wajib 200");
  let body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.data?.status, "ok");
  lulus("1. /healthz mengembalikan status ok");

  res = await baca("/api/health");
  assert.equal(res.status, 200, "/api/health wajib 200");
  body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.data?.database, "connected");
  lulus("2. /api/health terhubung ke database");

  res = await baca("/");
  assert.equal(res.status, 200, "Halaman utama Vue wajib disajikan");
  const teksHtml = await res.text();
  assert.ok(teksHtml.includes("<div id=\"app\">"), "HTML Vue tidak lengkap");
  lulus("3. Halaman utama menyajikan SPA Vue");

  res = await baca("/api/penawaran");
  assert.equal(res.status, 200, "/api/penawaran publik wajib 200");
  body = await res.json();
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data), "Data penawaran harus array");
  lulus("4. GET /api/penawaran mengembalikan array data");

  res = await baca("/api/route-tidak-ada-12345");
  assert.equal(res.status, 404, "API tidak ada wajib JSON 404");
  body = await res.json();
  assert.equal(body.success, false);
  assert.equal(body.error?.code, "NOT_FOUND");
  lulus("5. API tidak dikenal mengembalikan JSON 404");

  res = await baca("/halaman-vue-sembarang");
  assert.equal(res.status, 200, "Route halaman Vue wajib kembalikan index.html");
  lulus("6. Route non-API menyajikan index.html");

  res = await fetch(new URL("/api/penawaran", asal), {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: "bukan json",
  });
  assert.equal(res.status, 415, "POST tanpa header JSON wajib 415");
  lulus("7. Content-Type selain JSON ditolak (415)");

  res = await fetch(new URL("/api/penawaran", asal), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nama: "x" }),
  });
  assert.equal(res.status, 401, "Aksi tanpa token wajib 401");
  lulus("8. Akses tanpa auth ditolak (401)");

  res = await fetch(new URL("/api/auth/login", asal), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "invalid", kataSandi: "x" }),
  });
  assert.equal(res.status, 400, "Login format salah wajib 400");
  lulus("9. Validasi skema input bekerja (400)");

  res = await fetch(new URL("/api/auth/login", asal), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "user.tidak.ada@example.com",
      kataSandi: "SandiSalah123!",
    }),
  });
  assert.equal(res.status, 401, "Kredensial salah wajib 401");
  lulus("10. Kredensial tidak valid ditolak (401)");

  console.log(`\nSelesai: ${jumlah} pemeriksaan lulus. Tidak ada data ditulis.`);
} catch (error) {
  console.error(`\nGAGAL pada pengujian: ${error.message}`);
  process.exitCode = 1;
}