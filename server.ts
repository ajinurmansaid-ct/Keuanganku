import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "Pencatat Keuangan Pribadi" });
  });

  // AI Financial Advisor Endpoint
  app.post("/api/financial-advice", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY tidak ditemukan. Harap tambahkan API key di panel Rahasia / Secrets.",
        });
      }

      const { summary, topExpenseCategories, budgets, selectedMonth } = req.body;

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
Anda adalah seorang Penasihat Keuangan Pribadi (Financial Planner) berpengalaman di Indonesia.
Analisis data keuangan pengguna berikut untuk periode ${selectedMonth || 'Bulan Ini'}:

RINGKASAN KEUANGAN:
- Total Pemasukan: Rp ${Number(summary?.totalIncome || 0).toLocaleString('id-ID')}
- Total Pengeluaran: Rp ${Number(summary?.totalExpense || 0).toLocaleString('id-ID')}
- Sisa Saldo Bulan Ini: Rp ${Number(summary?.balance || 0).toLocaleString('id-ID')}
- Rasio Tabungan: ${summary?.savingsRate || 0}%
- Rata-rata Pengeluaran Harian: Rp ${Number(summary?.dailyAverageExpense || 0).toLocaleString('id-ID')}

KATEGORI PENGELUARAN TERBESAR:
${(topExpenseCategories || []).map((c: any) => `- ${c.name}: Rp ${Number(c.amount).toLocaleString('id-ID')} (${c.percentage}%)`).join('\n')}

INFORMASI ANGGARAN:
${(budgets || []).map((b: any) => `- ${b.categoryName}: Anggaran Rp ${Number(b.limit).toLocaleString('id-ID')} | Terpakai Rp ${Number(b.spent).toLocaleString('id-ID')} (${b.status})`).join('\n')}

TUGAS ANDA:
Berikan evaluasi dan saran keuangan yang realistis, hangat, serta mudah dipahami dalam bahasa Indonesia dengan format JSON valid berikut:
{
  "healthScore": number (skor kesehatan keuangan 0 - 100),
  "healthStatus": "Sangat Sehat" | "Cukup Sehat" | "Perlu Perhatian" | "Waspada",
  "summary": "1-2 kalimat ringkasan umum tentang kondisi keuangan bulan ini",
  "keyObservations": ["3 poin observasi utama terhadap pola pengeluaran atau pemasukan"],
  "recommendations": ["3-4 saran konkret dan dapat segera diterapkan (misal aturan 50/30/20, dana darurat, hemat di kategori tertentu)"],
  "spendingWarnings": ["Peringatan jika ada pengeluaran membengkak atau anggaran terlampaui (kosongkan jika tidak ada)"]
}

PENTING: kembalikan HANYA JSON tanpa format markdown backtick di luar JSON.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });

      const responseText = response.text || "";
      let parsed;
      try {
        parsed = JSON.parse(responseText.trim());
      } catch (parseErr) {
        // Fallback cleanup if response has markdown
        const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        parsed = JSON.parse(cleaned);
      }

      return res.json(parsed);
    } catch (err: any) {
      console.error("AI Financial Advice Error:", err);
      return res.status(500).json({
        error: err.message || "Gagal menghasilkan analisis AI. Coba lagi nanti.",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server pencatat keuangan running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
