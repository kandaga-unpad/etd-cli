const kv = await Deno.openKv();

console.log(await kv.get(["fakultas", "110110"]));
