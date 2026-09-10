import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 10000;

const SDASH_BASE = "https://sdashapi.com/api/v1";


// ============================================================
// ENVIRONMENT VARIABLES
// ============================================================

if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL is missing");
}

if (!process.env.SUPABASE_SECRET_KEY) {
  throw new Error("SUPABASE_SECRET_KEY is missing");
}

if (!process.env.SDASH_API_KEY) {
  throw new Error("SDASH_API_KEY is missing");
}


// ============================================================
// SUPABASE SERVER CLIENT
// ============================================================

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);


// ============================================================
// BASIC HEALTH CHECK
// ============================================================

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "UTMESchools Backend",
    status: "running"
  });
});


// ============================================================
// TEST SUPABASE CONNECTION
// ============================================================

app.get("/api/supabase-test", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Supabase test error:", error);

      return res.status(500).json({
        ok: false,
        connected: false,
        error: error.message
      });
    }

    return res.json({
      ok: true,
      connected: true,
      rows: data ? data.length : 0
    });

  } catch (error) {
    console.error("Supabase connection error:", error);

    return res.status(500).json({
      ok: false,
      connected: false,
      error: error.message
    });
  }
});


// ============================================================
// GET AVAILABLE SUBJECTS FROM SDASHAPI
// ============================================================

app.get("/api/subjects", async (req, res) => {
  try {
    const response = await fetch(
      `${SDASH_BASE}/subjects`,
      {
        headers: {
          AccessToken: process.env.SDASH_API_KEY
        }
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: "SdashAPI subjects request failed",
        details: result
      });
    }

    return res.json(result);

  } catch (error) {
    console.error("Subjects error:", error);

    return res.status(500).json({
      ok: false,
      error: "Failed to get subjects",
      details: error.message
    });
  }
});


// ============================================================
// GET AVAILABLE YEARS FROM SDASHAPI
// ============================================================

app.get("/api/years", async (req, res) => {
  try {
    const response = await fetch(
      `${SDASH_BASE}/years`,
      {
        headers: {
          AccessToken: process.env.SDASH_API_KEY
        }
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: "SdashAPI years request failed",
        details: result
      });
    }

    return res.json(result);

  } catch (error) {
    console.error("Years error:", error);

    return res.status(500).json({
      ok: false,
      error: "Failed to get years",
      details: error.message
    });
  }
});


// ============================================================
// GET QUESTIONS FROM SDASHAPI
// ============================================================

app.get("/api/question", async (req, res) => {
  try {
    const subject = req.query.subject || "chemistry";
    const year = req.query.year || "";
    const count = Math.min(
      Math.max(parseInt(req.query.count || "1", 10), 1),
      50
    );

    const params = new URLSearchParams({
      subject,
      type: "utme",
      limit: String(count)
    });

    if (year) {
      params.set("year", year);
    }

    const response = await fetch(
      `${SDASH_BASE}/q?${params.toString()}`,
      {
        headers: {
          AccessToken: process.env.SDASH_API_KEY
        }
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: "SdashAPI request failed",
        details: result
      });
    }

    return res.json({
      ok: true,
      source: "SdashAPI",
      data: result.data
    });

  } catch (error) {
    console.error("Question request error:", error);

    return res.status(500).json({
      ok: false,
      error: "Failed to get questions",
      details: error.message
    });
  }
});


// ============================================================
// IMPORT QUESTIONS FROM SDASHAPI INTO SUPABASE
//
// THIS IS CURRENTLY A SMALL TEST ROUTE.
// Maximum: 5 questions per request.
// ============================================================

app.get("/api/import-questions", async (req, res) => {
  try {
    const subject = req.query.subject || "chemistry";
    const year = req.query.year || "2025";

    const requestedCount = parseInt(
      req.query.count || "5",
      10
    );

    // Safety limit for this first import test.
    const count = Math.min(
      Math.max(requestedCount, 1),
      5
    );

    // --------------------------------------------------------
    // STEP 1: Ask SdashAPI for questions
    // --------------------------------------------------------

    const params = new URLSearchParams({
      subject,
      type: "utme",
      year,
      limit: String(count)
    });

    const response = await fetch(
      `${SDASH_BASE}/q?${params.toString()}`,
      {
        headers: {
          AccessToken: process.env.SDASH_API_KEY
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "SdashAPI import error:",
        errorText
      );

      return res.status(response.status).json({
        ok: false,
        error: "SdashAPI request failed",
        details: errorText
      });
    }

    const result = await response.json();

    // --------------------------------------------------------
    // STEP 2: Check whether SdashAPI returned questions
    // --------------------------------------------------------

    if (!result.data) {
      return res.status(404).json({
        ok: false,
        error: "No questions returned by SdashAPI",
        details: result.message || null
      });
    }

    const rawQuestions = Array.isArray(result.data)
      ? result.data
      : [result.data];


    // --------------------------------------------------------
    // STEP 3: Convert SdashAPI format to our Supabase format
    // --------------------------------------------------------

    const questions = rawQuestions
      .filter(q => q && q.id && q.question)
      .map(q => ({
        id: `sdash_${q.id}`,

        question: q.question,

        exam_body: "JAMB",

        exam_type: "UTME",

        subject_name: subject,

        subject_slug: subject,

        exam_year:
          Number(q.examyear) || Number(year),

        options: q.option || {},

        answer: q.answer,

        section: q.section || null,

        passage: null,

        image_url: q.image || null,

        // These will be filled later by our
        // AI processing/classification pipeline.
        topic: null,

        subtopic: null,

        syllabus_objective: null,

        difficulty: null,

        // SdashAPI's solution becomes our
        // temporary/source explanation.
        explanation: q.solution || null,

        source: "SdashAPI",

        source_id: String(q.id),

        university: q.university || null
      }));


    // --------------------------------------------------------
    // STEP 4: Make sure we actually have valid questions
    // --------------------------------------------------------

    if (questions.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "No valid questions to import"
      });
    }


    // --------------------------------------------------------
    // STEP 5: Save questions into Supabase
    //
    // We use UPSERT based on the primary key `id`.
    // This means running the same small test again will
    // update the same SdashAPI question instead of creating
    // a duplicate row.
    // --------------------------------------------------------

    const { data, error } = await supabase
      .from("questions")
      .upsert(
        questions,
        {
          onConflict: "id"
        }
      )
      .select(
        "id, source_id, subject_slug, exam_year"
      );

    if (error) {
      console.error(
        "Supabase import error:",
        error
      );

      return res.status(500).json({
        ok: false,
        error: "Supabase import failed",
        details: error.message
      });
    }


    // --------------------------------------------------------
    // STEP 6: Return the result
    // --------------------------------------------------------

    return res.json({
      ok: true,
      source: "SdashAPI",
      subject,
      year,
      requested: count,
      received: rawQuestions.length,
      imported: data ? data.length : 0,
      questions: data || []
    });

  } catch (error) {
    console.error(
      "Import route error:",
      error
    );

    return res.status(500).json({
      ok: false,
      error: "Import failed",
      details: error.message
    });
  }
});


// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
  console.log(
    `UTMESchools Backend running on port ${PORT}`
  );
});
