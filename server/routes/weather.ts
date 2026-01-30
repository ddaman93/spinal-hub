import type { Request, Response } from "express";

export async function getWeather(req: Request, res: Response): Promise<void> {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      res.status(400).json({ error: "Missing latitude or longitude" });
      return;
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "Weather API key not configured" });
      return;
    }

    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`,
    );

    if (!weatherRes.ok) {
      res.status(weatherRes.status).json({ error: "Failed to fetch weather" });
      return;
    }

    const data = await weatherRes.json();

    res.json({
      temp: Math.round(data.main.temp),
      icon: data.weather[0].icon,
      city: data.name,
    });
  } catch (error) {
    console.error("Weather API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
