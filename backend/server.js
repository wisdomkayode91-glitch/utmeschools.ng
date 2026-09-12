import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────
// ENVIRONMENT VARIABLES
// ─────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const SDASH_API_KEY = process.env.SDASH_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error("Missing Supabase environment variables.");
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SECRET_KEY
);

// ─────────────────────────────────────────────
// HOME / HEALTH CHECK
// ─────────────────────────────────────────────

app.get("/", (req, res) => {
  res.json({
    status: "online",
    app: "UTMESchools Backend"
  });
});

// ─────────────────────────────────────────────
// SUPABASE CONNECTION TEST
// ─────────────────────────────────────────────

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
      rows: data?.length || 0
    });
  } catch (error) {
    console.error("Supabase connection error:", error);

    return res.status(500).json({
      ok: false,
      connected: false,
      error: "Supabase connection failed"
    });
  }
});

// ─────────────────────────────────────────────
// GET QUESTIONS FROM SUPABASE
// ─────────────────────────────────────────────
//
// This is now the main student question endpoint.
//
// Flow:
// Select Subjects
//      ↓
// Practice
//      ↓
// Render Backend
//      ↓
// Supabase questions table
//
// SdashAPI is NOT used here.
// ─────────────────────────────────────────────

app.get("/api/question", async (req, res) => {
  try {
    const {
      subject,
      year,
      topic,
      subtopic
    } = req.query;

    const requestedCount = parseInt(
      req.query.count || "1",
      10
    );

    const count = Math.min(
      Math.max(requestedCount, 1),
      100
    );

    if (!subject) {
      return res.status(400).json({
        error: "Subject is required"
      });
    }

    // ─────────────────────────────────────────
    // BUILD SUPABASE QUERY
    // ─────────────────────────────────────────

    let query = supabase
      .from("questions")
      .select(`
        id,
        question,
        exam_body,
        exam_type,
        subject_id,
        subject_name,
        subject_slug,
        exam_year,
        options,
        answer,
        section,
        passage,
        image_url,
        topic,
        subtopic,
        syllabus_objective,
        difficulty,
        explanation,
        source,
        source_id,
        university
      `)
      .eq("exam_body", "JAMB")
      .eq("subject_slug", subject);

    // ─────────────────────────────────────────
    // YEAR FILTER
    // ─────────────────────────────────────────

    if (year && year !== "Random" && year !== "random") {
      const parsedYear = parseInt(year, 10);

      if (!Number.isNaN(parsedYear)) {
        query = query.eq("exam_year", parsedYear);
      }
    }

    // ─────────────────────────────────────────
    // TOPIC FILTER
    // ─────────────────────────────────────────

    if (
      topic &&
      topic !== "__none__" &&
      topic !== "Random" &&
      topic !== "random"
    ) {
      query = query.eq("topic", topic);
    }

    // ─────────────────────────────────────────
    // SUBTOPIC FILTER
    // ─────────────────────────────────────────

    if (
      subtopic &&
      subtopic !== "__none__" &&
      subtopic !== "Random" &&
      subtopic !== "random"
    ) {
      query = query.eq("subtopic", subtopic);
    }

    // ─────────────────────────────────────────
    // FETCH QUESTIONS
    // ─────────────────────────────────────────

    const { data, error } = await query.limit(count);

    if (error) {
      console.error("Supabase question error:", error);

      return res.status(500).json({
        error: "Failed to load questions",
        details: error.message
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: "No questions found",
        details: {
          subject,
          year: year || null,
          topic: topic || null,
          subtopic: subtopic || null
        }
      });
    }

    // ─────────────────────────────────────────
    // RETURN QUESTIONS
    // ─────────────────────────────────────────

    if (count === 1) {
      return res.json(data[0]);
    }

    return res.json(data);

  } catch (error) {
    console.error("Question endpoint error:", error);

    return res.status(500).json({
      error: "Backend error"
    });
  }
});

// ─────────────────────────────────────────────
// GET AVAILABLE SUBJECTS FROM SUPABASE
// ─────────────────────────────────────────────

app.get("/api/supabase-subjects", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("subject_slug, subject_name")
      .eq("exam_body", "JAMB");

    if (error) {
      console.error("Subjects error:", error);

      return res.status(500).json({
        error: "Failed to load subjects",
        details: error.message
      });
    }

    const uniqueSubjects = [];

    for (const row of data || []) {
      if (!row.subject_slug) continue;

      const exists = uniqueSubjects.some(
        item => item.subject_slug === row.subject_slug
      );

      if (!exists) {
        uniqueSubjects.push({
          subject_slug: row.subject_slug,
          subject_name: row.subject_name
        });
      }
    }

    return res.json(uniqueSubjects);

  } catch (error) {
    console.error("Subject endpoint error:", error);

    return res.status(500).json({
      error: "Backend error"
    });
  }
});

// ─────────────────────────────────────────────
// GET AVAILABLE YEARS FROM SUPABASE
// ─────────────────────────────────────────────

app.get("/api/supabase-years", async (req, res) => {
  try {
    const { subject } = req.query;

    if (!subject) {
      return res.status(400).json({
        error: "Subject is required"
      });
    }

    const { data, error } = await supabase
      .from("questions")
      .select("exam_year")
      .eq("exam_body", "JAMB")
      .eq("subject_slug", subject);

    if (error) {
      console.error("Years error:", error);

      return res.status(500).json({
        error: "Failed to load years",
        details: error.message
      });
    }

    const years = [
      ...new Set(
        (data || [])
          .map(row => row.exam_year)
          .filter(year => year !== null)
      )
    ].sort((a, b) => b - a);

    return res.json(years);

  } catch (error) {
    console.error("Years endpoint error:", error);

    return res.status(500).json({
      error: "Backend error"
    });
  }
});

// ─────────────────────────────────────────────
// IMPORT QUESTIONS FROM SDASHAPI → SUPABASE
// ─────────────────────────────────────────────
//
// IMPORTANT:
// This route is for importing questions into our
// own database.
//
// Students do NOT use this route.
//
// SdashAPI remains a content source.
// Supabase becomes the student-facing database.
// ─────────────────────────────────────────────

app.get("/api/import-questions", async (req, res) => {
  try {
    if (!SDASH_API_KEY) {
      return res.status(500).json({
        error: "SDASH_API_KEY is not configured"
      });
    }

    const {
      subject,
      year
    } = req.query;

    if (!subject) {
      return res.status(400).json({
        error: "Subject is required"
      });
    }

    const requestedCount = parseInt(
      req.query.count || "5",
      10
    );

    const count = Math.min(
      Math.max(requestedCount, 1),
      50
    );

    // ─────────────────────────────────────────
    // REQUEST SDASH QUESTIONS
    // ─────────────────────────────────────────

    const params = new URLSearchParams({
      subject,
      type: "utme",
      limit: String(count)
    });

    if (
      year &&
      year !== "Random" &&
      year !== "random"
    ) {
      params.set("year", year);
    }

    const response = await fetch(
      `https://sdashapi.com/api/v1/q?${params.toString()}`,
      {
        headers: {
          AccessToken: SDASH_API_KEY
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
        error: "SdashAPI request failed",
        details: errorText
      });
    }

    const result = await response.json();

    if (!result.data) {
      return res.status(404).json({
        error: "SdashAPI returned no questions",
        details: result.message || null
      });
    }

    const rawQuestions = Array.isArray(result.data)
      ? result.data
      : [result.data];

    // ─────────────────────────────────────────
    // MAP SDASH → OUR DATABASE STRUCTURE
    // ─────────────────────────────────────────

    const questions = rawQuestions
      .filter(q => q && q.id && q.question)
      .map(q => ({
        id: String(q.id),

        question: q.question,

        exam_body: "JAMB",

        exam_type: q.examtype || "UTME",

        subject_id: null,

        subject_name: null,

        subject_slug: subject,

        exam_year: q.examyear
          ? parseInt(q.examyear, 10)
          : null,

        options: q.option || null,

        answer: q.answer || null,

        section: q.section || null,

        passage: null,

        image_url: q.image || null,

        topic: null,

        subtopic: null,

        syllabus_objective: null,

        difficulty: null,

        // Deliberately do not use Sdash
        // explanations as our final explanation.
        explanation: null,

        source: "SdashAPI",

        source_id: String(q.id),

        university: q.university || null,

        imported_at: new Date().toISOString(),

        updated_at: new Date().toISOString()
      }));

    if (questions.length === 0) {
      return res.status(404).json({
        error: "No valid questions were returned by SdashAPI"
      });
    }

    // ─────────────────────────────────────────
    // SAVE INTO SUPABASE
    // ─────────────────────────────────────────

    const { data, error } = await supabase
      .from("questions")
      .upsert(questions, {
        onConflict: "id"
      })
      .select();

    if (error) {
      console.error(
        "Supabase import error:",
        error
      );

      return res.status(500).json({
        error: "Failed to save questions to Supabase",
        details: error.message
      });
    }

    return res.json({
      ok: true,
      imported: data?.length || 0,
      questions: data || []
    });

  } catch (error) {
    console.error(
      "Import endpoint error:",
      error
    );

    return res.status(500).json({
      error: "Import failed"
    });
  }
});

// ─────────────────────────────────────────────
// TEMPORARY DATABASE WRITE TEST
// ─────────────────────────────────────────────
//
// Kept temporarily because we previously used it
// to verify that Render can write to Supabase.
// We will remove this after the new database flow
// is confirmed.
// ─────────────────────────────────────────────

app.get("/api/supabase-write-test", async (req, res) => {
  try {
    const testQuestion = {
      id: "__utmeschools_write_test__",
      question: "UTMESchools temporary database write test.",
      source: "UTMESchools_TEST"
    };

    const { data, error } = await supabase
      .from("questions")
      .upsert(testQuestion, {
        onConflict: "id"
      })
      .select();

    if (error) {
      console.error(
        "Supabase write test error:",
        error
      );

      return res.status(500).json({
        ok: false,
        written: false,
        error: error.message
      });
    }

    return res.json({
      ok: true,
      written: true,
      data
    });

  } catch (error) {
    console.error(
      "Write test error:",
      error
    );

    return res.status(500).json({
      ok: false,
      written: false,
      error: "Write test failed"
    });
  }
});

// ─────────────────────────────────────────────
// 404 HANDLER
// ─────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

// ─────────────────────────────────────────────
// ERROR HANDLER
// ─────────────────────────────────────────────

app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error);

  res.status(500).json({
    error: "Internal server error"
  });
});

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(
    `UTMESchools backend running on port ${PORT}`
  );
});
