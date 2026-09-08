import express from "express";

const app = express();

const PORT = process.env.PORT || 3000;

/* ================================================================
   CORS
   Allows the UTMESchools Cloudflare frontend to communicate
   with this Render backend.
   ================================================================ */

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

app.use(express.json());

/* ================================================================
   HOME / HEALTH CHECK
   ================================================================ */

app.get("/", (req, res) => {
  res.json({
    status: "online",
    app: "UTMESchools Backend"
  });
});

/* ================================================================
   GET JAMB QUESTIONS
   ================================================================ */

app.get("/api/question", async (req, res) => {
  try {
    const { subject, year } = req.query;

    /* ------------------------------------------------------------
       Validate subject
       ------------------------------------------------------------ */

    if (!subject) {
      return res.status(400).json({
        error: "Subject is required"
      });
    }

    /* ------------------------------------------------------------
       Get requested question count

       SdashAPI allows a maximum of 50 questions per request.
       ------------------------------------------------------------ */

    const requestedCount = parseInt(req.query.count || "1", 10);

    const count = Math.min(
      Math.max(requestedCount, 1),
      50
    );

    /* ------------------------------------------------------------
       Build SdashAPI request
       ------------------------------------------------------------ */

    const params = new URLSearchParams({
      subject: subject,
      type: "utme",
      limit: String(count)
    });

    /* Only add year when a specific year was selected */

    if (year && year !== "Random") {
      params.set("year", year);
    }

    /* ------------------------------------------------------------
       Request authentic JAMB questions from SdashAPI
       ------------------------------------------------------------ */

    const response = await fetch(
      `https://sdashapi.com/api/v1/q?${params.toString()}`,
      {
        headers: {
          AccessToken: process.env.SDASH_API_KEY
        }
      }
    );

    /* ------------------------------------------------------------
       Handle SdashAPI errors
       ------------------------------------------------------------ */

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "SdashAPI error:",
        errorText
      );

      return res.status(response.status).json({
        error: "SdashAPI request failed",
        details: errorText
      });
    }

    /* ------------------------------------------------------------
       Read response
       ------------------------------------------------------------ */

    const result = await response.json();

    console.log(
      "SdashAPI status:",
      result.status
    );

    /* ------------------------------------------------------------
       Make sure questions were returned
       ------------------------------------------------------------ */

    if (!result.data) {
      return res.status(404).json({
        error: "No question found",
        details:
          result.message ||
          "SdashAPI returned no question"
      });
    }

    /* ------------------------------------------------------------
       SdashAPI returns:

       - an object when limit = 1
       - an array when limit > 1

       Convert both into one consistent array.
       ------------------------------------------------------------ */

    const rawQuestions = Array.isArray(result.data)
      ? result.data
      : [result.data];

    /* ------------------------------------------------------------
       Convert SdashAPI response into the UTMESchools format.

       IMPORTANT:
       We deliberately DO NOT return SdashAPI's "solution".
       UTMESchools will eventually generate its own explanations.
       ------------------------------------------------------------ */

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

    /* ------------------------------------------------------------
       Make sure at least one valid question exists
       ------------------------------------------------------------ */

    if (questions.length === 0) {
      return res.status(404).json({
        error: "Invalid question response",
        details:
          "SdashAPI returned data, but no valid questions were found"
      });
    }

    /* ------------------------------------------------------------
       Return one question or an array depending on count
       ------------------------------------------------------------ */

    if (count === 1) {
      return res.json(questions[0]);
    }

    return res.json(questions);

  } catch (error) {
    /* ------------------------------------------------------------
       Catch unexpected backend errors
       ------------------------------------------------------------ */

    console.error(
      "Backend error:",
      error
    );

    return res.status(500).json({
      error: "Backend error"
    });
  }
});

/* ================================================================
   START SERVER
   ================================================================ */

app.listen(PORT, () => {
  console.log(
    `UTMESchools Backend running on port ${PORT}`
  );
});
