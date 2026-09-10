import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();

app.use(express.json());

// --------------------------------------------------
// SUPABASE SERVER CONNECTION
// --------------------------------------------------

if (
  !process.env.SUPABASE_URL ||
  !process.env.SUPABASE_SECRET_KEY
) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SECRET_KEY"
  );
}

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

// --------------------------------------------------
// CORS
// --------------------------------------------------

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, AccessToken"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

const PORT = process.env.PORT || 3000;

const SDASH_BASE = "https://sdashapi.com/api/v1";

// --------------------------------------------------
// HOME
// --------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    status: "online",
    app: "UTMESchools Backend"
  });
});

// --------------------------------------------------
// TEMPORARY SUPABASE CONNECTION TEST
// --------------------------------------------------

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
      rows: data?.length ?? 0
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

// --------------------------------------------------
// GET AVAILABLE SUBJECTS
// --------------------------------------------------

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
      console.error(
        "SdashAPI subjects error:",
        result
      );

      return res.status(response.status).json({
        error: "Failed to retrieve subjects",
        details: result
      });
    }

    return res.json(result);

  } catch (error) {
    console.error(
      "Subjects endpoint error:",
      error
    );

    return res.status(500).json({
      error: "Backend error while retrieving subjects"
    });
  }
});

// --------------------------------------------------
// GET AVAILABLE YEARS
// --------------------------------------------------

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
      console.error(
        "SdashAPI years error:",
        result
      );

      return res.status(response.status).json({
        error: "Failed to retrieve years",
        details: result
      });
    }

    return res.json(result);

  } catch (error) {
    console.error(
      "Years endpoint error:",
      error
    );

    return res.status(500).json({
      error: "Backend error while retrieving years"
    });
  }
});

// --------------------------------------------------
// GET QUESTIONS FROM SDASHAPI
// --------------------------------------------------

app.get("/api/question", async (req, res) => {
  try {
    const { subject, year } = req.query;

    const requestedCount = parseInt(
      req.query.count || "1",
      10
    );

    const count = Math.min(
      Math.max(requestedCount, 1),
      50
    );

    if (!subject) {
      return res.status(400).json({
        error: "Subject is required"
      });
    }

    const params = new URLSearchParams({
      subject: subject,
      type: "utme",
      limit: String(count)
    });

    if (year && year !== "Random") {
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

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "SdashAPI question error:",
        errorText
      );

      return res.status(response.status).json({
        error: "SdashAPI request failed",
        details: errorText
      });
    }

    const result = await response.json();

    console.log(
      "SdashAPI question status:",
      result.status
    );

    if (!result.data) {
      return res.status(404).json({
        error: "No question found",
        details:
          result.message ||
          "SdashAPI returned no question"
      });
    }

    const rawQuestions = Array.isArray(result.data)
      ? result.data
      : [result.data];

    const questions = rawQuestions
      .filter(q => q && q.id)
      .map(q => ({
        id: q.id,
        question: q.question,
        section: q.section,
        option: q.option,
        answer: q.answer,
        image: q.image,
        examtype: q.examtype,
        examyear: q.examyear,
        university: q.university
      }));

    if (questions.length === 0) {
      return res.status(404).json({
        error: "Invalid question response",
        details:
          "SdashAPI returned data, but no valid questions were found"
      });
    }

    if (count === 1) {
      return res.json(questions[0]);
    }

    return res.json(questions);

  } catch (error) {
    console.error(
      "Backend error:",
      error
    );

    return res.status(500).json({
      error: "Backend error"
    });
  }
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, () => {
  console.log(
    `UTMESchools Backend running on port ${PORT}`
  );
});
