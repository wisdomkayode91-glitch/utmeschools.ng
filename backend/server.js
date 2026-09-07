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
      type: "utme"
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

    res.json(data);

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
