const db = require("../db");

// Helper function for async query
const query = (sql, values) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// ADD SCHOOL API
const addSchool = async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;

    // Validation
    if (!name || !address || latitude == null || longitude == null) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude must be numbers",
      });
    }

    const sql =
      "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";

    const result = await db.query(sql, [
      name,
      address,
      latitude,
      longitude,
    ]);

    res.status(201).json({
      success: true,
      message: "School added successfully",
      schoolId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// LIST SCHOOLS API
const listSchools = async (req, res) => {
  try {
    const userLat = Number(req.query.latitude);
    const userLon = Number(req.query.longitude);

    if (isNaN(userLat) || isNaN(userLon)) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required",
      });
    }

    const sql = "SELECT * FROM schools";

    const schools = await db.query(sql);

    // Haversine Formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;

      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c;
    };

    const sortedSchools = schools.map((school) => {

      const schoolLat = Number(school.latitude);
      const schoolLon = Number(school.longitude);

      const distance = calculateDistance(
        userLat,
        userLon,
        schoolLat,
        schoolLon
      );

      return {
        ...school,
        distance: `${distance.toFixed(2)} KM`,
      };
    });

    sortedSchools.sort(
      (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
    );

    res.json({
      success: true,
      count: sortedSchools.length,
      data: sortedSchools,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};


module.exports = {
  addSchool,
  listSchools,
};