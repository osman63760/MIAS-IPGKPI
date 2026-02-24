import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("mias_rotations.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS rotations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    task TEXT NOT NULL,
    duty_date TEXT NOT NULL,
    image_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Migration: Add prayer_type if it doesn't exist
try {
  const columns = db.prepare("PRAGMA table_info(rotations)").all() as any[];
  const hasPrayerType = columns.some(col => col.name === 'prayer_type');
  if (!hasPrayerType) {
    db.exec("ALTER TABLE rotations ADD COLUMN prayer_type TEXT NOT NULL DEFAULT 'Solat Fardu'");
    console.log("Migration: Added prayer_type column to rotations table.");
  }
} catch (error) {
  console.error("Migration error:", error);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/rotations", (req, res) => {
    try {
      const rows = db.prepare("SELECT * FROM rotations ORDER BY duty_date DESC").all();
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rotations" });
    }
  });

  app.post("/api/rotations", (req, res) => {
    const { name, task, prayer_type, duty_date, image_data } = req.body;
    if (!name || !task || !prayer_type || !duty_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const stmt = db.prepare(
        "INSERT INTO rotations (name, task, prayer_type, duty_date, image_data) VALUES (?, ?, ?, ?, ?)"
      );
      const result = stmt.run(name, task, prayer_type, duty_date, image_data);
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      console.error("Database Error:", error);
      res.status(500).json({ error: "Gagal menyimpan ke pangkalan data. Sila hubungi pentadbir." });
    }
  });

  app.delete("/api/rotations/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM rotations WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete rotation" });
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
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
