import express from "express";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    status: "online",
    app: "UTMESchools Backend"
  });
});

app.get("/api/question", async (req, res) => {
  try {
    const { subject, year } = req.query;

    if (!subject) {
      return res.status(400).json({
        error: "Subject is required"
      });
    }

    const params = new URLSearchParams({
      subject,
      type: "utme",
      limit: "1"
    });

    if (year && year !== "Random") {
      params.set("year", year);
    }

    const response = await fetch(
      `https://sdashapi.com/api/v1/q?${params.toString()}`,
      {
        headers: {
          AccessToken: process.env.SDASH_API_KEY
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      return res.status(response.status).json({
        error: "SdashAPI request failed",
        details: errorText
      });
    }

    const data = await response.json();

    // Only return the fields UTMESchools needs.
    // SdashAPI's original "solution" is intentionally NOT sent.
    const questions = Array.isArray(data) ? data : [data];

    const cleanedQuestions = questions.map((q) => ({
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

    res.json(cleanedQuestions);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Backend error"
    });
  }
});

app.listen(PORT, () => {
  console.log(`UTMESchools backend running on port ${PORT}`);
});
