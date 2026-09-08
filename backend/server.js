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
// GET JAMB QUESTION
// ─────────────────────────────────────────────

app.get("/api/question", async (req, res) => {
  try {
    const { subject, year } = req.query;

    if (!subject) {
      return res.status(400).json({
        error: "Subject is required"
      });
    }


    // Build SdashAPI request
    const params = new URLSearchParams({
      subject: subject,
      type: "utme",
      limit: "1"
    });


    if (year && year !== "Random") {
      params.set("year", year);
    }


    // Ask SdashAPI for a question
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


    // SdashAPI may return either:
    //
    // data: { question object }
    //
    // OR
    //
    // data: [question object]
    //
    // We handle BOTH.

    const q = Array.isArray(result.data)
      ? result.data[0]
      : result.data;


    // Make sure we actually received a question
    if (!q || !q.id) {
      return res.status(404).json({
        error: "Invalid question response",
        details: "SdashAPI returned data, but no valid question was found"
      });
    }


    // ─────────────────────────────────────────
    // IMPORTANT SECURITY RULE
    //
    // We DO NOT send SdashAPI's "solution"
    // to the frontend.
    //
    // Later, UTMESchools will generate its
    // own explanation using OpenAI.
    // ─────────────────────────────────────────

    const cleanedQuestion = {
      id: q.id,
      question: q.question,
      section: q.section,
      option: q.option,
      answer: q.answer,
      image: q.image,
      examtype: q.examtype,
      examyear: q.examyear,
      university: q.university
    };


    // Send the clean question to UTMESchools
    res.json(cleanedQuestion);

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
  console.log(`UTMESchools backend running on port ${PORT}`);
});
