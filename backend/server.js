import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();

app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 10000;
const SDASH_BASE = "https://sdashapi.com/api/v1";

/* ============================================================
   CORS
   Allows the GitHub Pages frontend to communicate with Render.
   ============================================================ */

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

/* ============================================================
   ENVIRONMENT VARIABLES
   ============================================================ */

if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL is missing");
}

if (!process.env.SUPABASE_SECRET_KEY) {
  throw new Error("SUPABASE_SECRET_KEY is missing");
}

if (!process.env.SDASH_API_KEY) {
  throw new Error("SDASH_API_KEY is missing");
}

/* ============================================================
   SUPABASE SERVER CLIENT
   ============================================================ */

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

/* ============================================================
   HELPERS
   ============================================================ */

function getLimit(value, fallback = 20, max = 100) {
  const parsed = parseInt(value || String(fallback), 10);

  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, 1), max);
}

function shuffle(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

/* ============================================================
   HEALTH CHECK
   ============================================================ */

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "UTMESchools Backend",
    status: "running"
  });
});

/* ============================================================
   SUPABASE CONNECTION TEST
   ============================================================ */

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

/* ============================================================
   GET QUESTIONS FROM SUPABASE
   THIS IS THE MAIN STUDENT QUESTION API.
   ============================================================ */

app.get("/api/questions", async (req, res) => {
  try {
    const subject = req.query.subject || "";
    const year = req.query.year || "";
    const topic = req.query.topic || "";
    const subtopic = req.query.subtopic || "";
    const difficulty = req.query.difficulty || "";
    const limit = getLimit(req.query.limit, 20, 100);
    const shuffleQuestions = req.query.shuffle !== "0";

    let query = supabase
      .from("questions")
      .select(`
        id,
        question,
        exam_body,
        exam_type,
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
        ai_explanation,
        source,
        source_id
      `);

    if (subject) {
      query = query.eq("subject_slug", subject);
    }

    if (year && year !== "Random") {
      query = query.eq("exam_year", Number(year));
    }

    if (topic) {
      query = query.eq("topic", topic);
    }

    if (subtopic) {
      query = query.eq("subtopic", subtopic);
    }

    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }

    const { data, error } = await query.limit(limit);

    if (error) {
      console.error("Question retrieval error:", error);

      return res.status(500).json({
        ok: false,
        error: "Failed to retrieve questions",
        details: error.message
      });
    }

    const questions = shuffleQuestions
      ? shuffle(data || [])
      : (data || []);

    return res.json({
      ok: true,
      count: questions.length,
      source: "Supabase",
      data: questions
    });

  } catch (error) {
    console.error("Questions API error:", error);

    return res.status(500).json({
      ok: false,
      error: "Questions request failed",
      details: error.message
    });
  }
});

/* ============================================================
   GET AVAILABLE SUBJECTS FROM OUR DATABASE
   ============================================================ */

app.get("/api/database-subjects", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("subject_name, subject_slug");

    if (error) {
      return res.status(500).json({
        ok: false,
        error: error.message
      });
    }

    const unique = new Map();

    for (const row of data || []) {
      if (row.subject_slug) {
        unique.set(row.subject_slug, {
          name: row.subject_name,
          slug: row.subject_slug
        });
      }
    }

    return res.json({
      ok: true,
      subjects: Array.from(unique.values())
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

/* ============================================================
   GET AVAILABLE YEARS FOR A SUBJECT
   ============================================================ */

app.get("/api/database-years", async (req, res) => {
  try {
    const subject = req.query.subject || "";

    let query = supabase
      .from("questions")
      .select("exam_year");

    if (subject) {
      query = query.eq("subject_slug", subject);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        ok: false,
        error: error.message
      });
    }

    const years = [...new Set(
      (data || [])
        .map(row => Number(row.exam_year))
        .filter(Boolean)
    )].sort((a, b) => b - a);

    return res.json({
      ok: true,
      years
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

/* ============================================================
   CREATE PRACTICE SESSION
   ============================================================ */

app.post("/api/sessions", async (req, res) => {
  try {
    const {
      user_id = null,
      mode = "practice",
      total_questions = 0,
      subjects = []
    } = req.body;

    if (!["practice", "mock", "study"].includes(mode)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid practice mode"
      });
    }

    const { data, error } = await supabase
      .from("practice_sessions")
      .insert({
        user_id,
        mode,
        total_questions: Number(total_questions) || 0,
        attempted_questions: 0,
        correct_answers: 0,
        total_score: 0,
        total_possible: Number(total_questions) || 0,
        time_taken_seconds: 0,
        subjects: Array.isArray(subjects) ? subjects : []
      })
      .select()
      .single();

    if (error) {
      console.error("Session creation error:", error);

      return res.status(500).json({
        ok: false,
        error: "Failed to create practice session",
        details: error.message
      });
    }

    return res.status(201).json({
      ok: true,
      session: data
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

/* ============================================================
   SAVE QUESTION ATTEMPT
   ============================================================ */

app.post("/api/sessions/:sessionId/attempts", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const {
      user_id = null,
      question_id,
      subject_slug = null,
      exam_year = null,
      topic = null,
      subtopic = null,
      difficulty = null,
      selected_answer = null,
      correct_answer = null,
      is_correct = false,
      time_spent_seconds = 0
    } = req.body;

    if (!question_id) {
      return res.status(400).json({
        ok: false,
        error: "question_id is required"
      });
    }

    const { data, error } = await supabase
      .from("question_attempts")
      .insert({
        session_id: sessionId,
        user_id,
        question_id: String(question_id),
        subject_slug,
        exam_year: exam_year ? Number(exam_year) : null,
        topic,
        subtopic,
        difficulty,
        selected_answer,
        correct_answer,
        is_correct: Boolean(is_correct),
        time_spent_seconds: Number(time_spent_seconds) || 0
      })
      .select()
      .single();

    if (error) {
      console.error("Attempt save error:", error);

      return res.status(500).json({
        ok: false,
        error: "Failed to save question attempt",
        details: error.message
      });
    }

    return res.status(201).json({
      ok: true,
      attempt: data
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

/* ============================================================
   COMPLETE PRACTICE SESSION
   ============================================================ */

app.patch("/api/sessions/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const {
      attempted_questions,
      correct_answers,
      total_score,
      total_possible,
      time_taken_seconds
    } = req.body;

    const { data, error } = await supabase
      .from("practice_sessions")
      .update({
        attempted_questions: Number(attempted_questions) || 0,
        correct_answers: Number(correct_answers) || 0,
        total_score: Number(total_score) || 0,
        total_possible: Number(total_possible) || 0,
        time_taken_seconds: Number(time_taken_seconds) || 0
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) {
      console.error("Session update error:", error);

      return res.status(500).json({
        ok: false,
        error: "Failed to update practice session",
        details: error.message
      });
    }

    return res.json({
      ok: true,
      session: data
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

/* ============================================================
   GET SESSION + ATTEMPTS
   USED BY RESULTS / CORRECTION
   ============================================================ */

app.get("/api/sessions/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const { data: session, error: sessionError } = await supabase
      .from("practice_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError) {
      return res.status(404).json({
        ok: false,
        error: "Practice session not found",
        details: sessionError.message
      });
    }

    const { data: attempts, error: attemptsError } = await supabase
      .from("question_attempts")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (attemptsError) {
      return res.status(500).json({
        ok: false,
        error: "Failed to retrieve attempts",
        details: attemptsError.message
      });
    }

    return res.json({
      ok: true,
      session,
      attempts: attempts || []
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

/* ============================================================
   COACH ANALYTICS
   Calculates performance by subject/topic/subtopic.
   ============================================================ */

app.get("/api/coach/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("question_attempts")
      .select(`
        subject_slug,
        topic,
        subtopic,
        difficulty,
        is_correct,
        created_at
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        ok: false,
        error: "Failed to retrieve coach data",
        details: error.message
      });
    }

    const groups = new Map();

    for (const attempt of data || []) {
      const key = [
        attempt.subject_slug || "unknown",
        attempt.topic || "Unclassified",
        attempt.subtopic || "Unclassified"
      ].join("|");

      if (!groups.has(key)) {
        groups.set(key, {
          subject: attempt.subject_slug || "unknown",
          topic: attempt.topic || "Unclassified",
          subtopic: attempt.subtopic || "Unclassified",
          questions: 0,
          correct: 0
        });
      }

      const group = groups.get(key);

      group.questions += 1;

      if (attempt.is_correct) {
        group.correct += 1;
      }
    }

    const performance = Array.from(groups.values())
      .map(item => ({
        ...item,
        percentage: item.questions
          ? Math.round((item.correct / item.questions) * 100)
          : 0
      }))
      .sort((a, b) => a.percentage - b.percentage);

    const weakest = performance.slice(0, 5);

    return res.json({
      ok: true,
      user_id: userId,
      total_attempts: (data || []).length,
      performance,
      weakest,
      recommendation: weakest.length
        ? `Prioritize ${weakest[0].topic} — ${weakest[0].subtopic}.`
        : "Complete some practice questions so Coach Mode can analyze your performance."
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

/* ============================================================
   BOOKMARKS — GET
   ============================================================ */

app.get("/api/bookmarks/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        ok: false,
        error: "Failed to retrieve bookmarks",
        details: error.message
      });
    }

    return res.json({
      ok: true,
      bookmarks: data || []
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

/* ============================================================
   BOOKMARKS — ADD
   ============================================================ */

app.post("/api/bookmarks", async (req, res) => {
  try {
    const {
      user_id,
      question_id
    } = req.body;

    if (!user_id || !question_id) {
      return res.status(400).json({
        ok: false,
        error: "user_id and question_id are required"
      });
    }

    const { data, error } = await supabase
      .from("bookmarks")
      .upsert(
        {
          user_id,
          question_id: String(question_id)
        },
        {
          onConflict: "user_id,question_id"
        }
      )
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        ok: false,
        error: "Failed to save bookmark",
        details: error.message
      });
    }

    return res.status(201).json({
      ok: true,
      bookmark: data
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

/* ============================================================
   BOOKMARKS — REMOVE
   ============================================================ */

app.delete("/api/bookmarks", async (req, res) => {
  try {
    const {
      user_id,
      question_id
    } = req.body;

    if (!user_id || !question_id) {
      return res.status(400).json({
        ok: false,
        error: "user_id and question_id are required"
      });
    }

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", user_id)
      .eq("question_id", String(question_id));

    if (error) {
      return res.status(500).json({
        ok: false,
        error: "Failed to remove bookmark",
        details: error.message
      });
    }

    return res.json({
      ok: true,
      removed: true
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

/* ============================================================
   SDASH SUBJECTS
   ============================================================ */

app.get("/api/subjects", async (req, res) => {
  try {
    const response = await fetch(`${SDASH_BASE}/subjects`, {
      headers: {
        AccessToken: process.env.SDASH_API_KEY
      }
    });

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

/* ============================================================
   SDASH YEARS
   ============================================================ */

app.get("/api/years", async (req, res) => {
  try {
    const response = await fetch(`${SDASH_BASE}/years`, {
      headers: {
        AccessToken: process.env.SDASH_API_KEY
      }
    });

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

/* ============================================================
   LIVE SDASH QUESTION TEST
   DEVELOPMENT ONLY
   ============================================================ */

app.get("/api/question", async (req, res) => {
  try {
    const subject = req.query.subject || "chemistry";
    const year = req.query.year || "";
    const count = getLimit(req.query.count, 1, 50);

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

/* ============================================================
   IMPORT QUESTIONS FROM SDASH → SUPABASE
   TEMPORARY MAXIMUM: 5 PER REQUEST
   ============================================================ */

app.get("/api/import-questions", async (req, res) => {
  try {
    const subject = req.query.subject || "chemistry";
    const year = req.query.year || "2025";

    const requestedCount = parseInt(
      req.query.count || "5",
      10
    );

    const count = Math.min(
      Math.max(requestedCount, 1),
      5
    );

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

      return res.status(response.status).json({
        ok: false,
        error: "SdashAPI request failed",
        details: errorText
      });
    }

    const result = await response.json();

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

        topic: null,
        subtopic: null,
        syllabus_objective: null,
        difficulty: null,

        explanation: q.solution || null,

        source: "SdashAPI",
        source_id: String(q.id),

        university: q.university || null
      }));

    if (questions.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "No valid questions to import"
      });
    }

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

/* ============================================================
   START SERVER
   ============================================================ */

app.listen(PORT, () => {
  console.log(
    `UTMESchools Backend running on port ${PORT}`
  );
});
