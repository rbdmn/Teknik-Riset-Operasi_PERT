Jangan ubah logika PERT core (pert.ts, graph.ts, route.ts).
Semua perubahan hanya di komponen UI dan page.tsx.

Color palette WAJIB (tidak boleh ada warna lain):
--floral-white: #fffcf2
--silver: #ccc5b9
--charcoal: #403d39
--carbon: #252422
--paprika: #eb5e28

Untuk Network Diagram, semua warna node/edge harus dari palette ini:
- Node kritis: background #eb5e28, teks #fffcf2
- Node non-kritis: background #403d39, border #ccc5b9, teks #fffcf2
- Edge kritis: stroke #eb5e28
- Edge non-kritis: stroke rgba(204,197,185,0.4)
- Canvas/background diagram: #252422
