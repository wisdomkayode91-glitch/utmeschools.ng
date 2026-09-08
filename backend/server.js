import express from "express";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;


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
// GET JAMB QUESTION(S)
// ─────────────────────────────────────────────

app.get("/api/question", async (req, res) => {
  try {
    const { subject, year } = req.query;

    const requestedCount = parseInt(req.query.count || "1", 10);
    const count = Math.min(Math.max(requestedCount, 1), 50);

    if (!subject) {
      return res.status(400).json({
        error: "Subject is required"
      });
    }


    // Build SdashAPI request
    const params = new URLSearchParams({
      subject: subject,
      type: "utme",
      limit: String(count)
    });


    if (year && year !== "Random") {
      params.set("year", year);
    }


    // Ask SdashAPI for authentic JAMB question(s)
    const response = await fetch(
      `https://sdashapi.com/api/v1/q?${params.toString()}`,
      {
        headers: {
          AccessToken: process.env.SDASH_API_KEY
        }
      }
    );


    // Handle SdashAPI errors
    if (!response.ok) {
      const errorText = await response.text();

      console.error("SdashAPI error:", errorText);

      return res.status(response.status).json({
        error: "SdashAPI request failed",
        details: errorText
      });
    }


    // Read the response
    const result = await response.json();

    console.log("SdashAPI status:", result.status);


    // Make sure data exists
    if (!result.data) {
      return res.status(404).json({
        error: "No question found",
        details: result.message || "SdashAPI returned no question"
      });
    }


    // SdashAPI can return either an object or an array.
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
        details: "SdashAPI returned data, but no valid questions were found"
      });
    }


    // IMPORTANT:
    // SdashAPI's "solution" is deliberately NOT included.
    // UTMESchools will generate its own explanation with OpenAI later.

    if (count === 1) {
      return res.json(questions[0]);
    }

    return res.json(questions);

  } catch (error) {

    console.error("Backend error:", error);

    res.status(500).json({
      error: "Backend error"
    });
  }
});


// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`UTMESchools Backend running on port ${PORT}`);
});
