const { MongoClient, ObjectId } = require("mongodb");

// Environment variables
const dbUrl = process.env.DB_URL;
const dbName = process.env.DB_NAME;

exports.handler = async (event) => {
  try {
    // Connect to MongoDB
    const client = await MongoClient.connect(dbUrl, { useNewUrlParser: true });
    const db = client.db(dbName);
    const dues = db.collection('dues');
    const students = db.collection("students");

    // Find defaulters based on the current date
    const currentDate = new Date();
    const defaultersObjectIds = await dues
      .distinct('student', { due_date: { $lt: currentDate } });

    // Query the 'students' collection to get the selected students based on IDs
    const defaulters = await students
      .find({ _id: { $in: defaultersObjectIds } })
      .toArray();
    
    // Close MongoDB connection
    client.close();

    console.log(defaulters);

    return {
      statusCode: 200,
      body: JSON.stringify(defaulters),
    };
  } catch (err) {
    console.error("Error retrieving defaulters:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
