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

    // Check subject
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


    // Add year when a specific year was selected
    if (year && year !== "Random") {
      params.set("year", year);
    }


    // Request question from SdashAPI
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


    // Read SdashAPI response
    const data = await response.json();

    console.log("SdashAPI response received");


    // Make sure a question exists
    if (!data.data) {
      return res.status(404).json({
        error: "No question found",
        details: data.message || "SdashAPI returned no question"
      });
    }


    // The actual question is inside data.data
    const q = data.data;


    // ─────────────────────────────────────────
    // IMPORTANT:
    // We intentionally DO NOT return q.solution.
    //
    // SdashAPI solution stays on the backend.
    // Later, OpenAI will generate the
    // UTMESchools explanation.
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


    // Send clean question to frontend
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
