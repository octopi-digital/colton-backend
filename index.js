const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// x-api-key
const realEstateApiKey = "DIZWAYMLS-ce82-760e-af23-1399f2c83d6a";

// Skiptrace API & Webhook
const realEstateApiUrl = "https://api.realestateapi.com/v1/SkipTrace";
const webhookUrl = "https://services.leadconnectorhq.com/hooks/V2v3MIyr6arc4ftnD2Zg/webhook-trigger/84c9248b-bf8b-4ec6-af84-92099c0bbb66";

// Property details API & Webhook
const propertyDetailApiUrl = "https://api.realestateapi.com/v2/PropertyDetail";
const propertyDetailWebhookUrl = "https://services.leadconnectorhq.com/hooks/V2v3MIyr6arc4ftnD2Zg/webhook-trigger/5a288f71-acad-43ef-b4dd-e908d3085e42";

app.get("/", (req, res) => {
  res.send("Welcome to the API system!");
});

app.post("/api/process", async (req, res) => {
  try {
    const requestBody = req.body; 
    console.log("Received data:", requestBody);

    const realEstateResponse = await axios.post(realEstateApiUrl, requestBody, {
      headers: {
        "x-api-key": realEstateApiKey,
        "Content-Type": "application/json",
      },
    });

    console.log("Original Response Data:", realEstateResponse.data);

    // Transform the response data
    const transformedData = transformArrayToObject(realEstateResponse.data);

    console.log("Transformed Data:", transformedData);

    // Send to the webhook
    const webhookResponse = await axios.post(webhookUrl, transformedData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Webhook response:", webhookResponse.status);

    res.json({ message: "Data processed successfully", data: transformedData });
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ message: "An error occurred", error: error.message });
  }
});

// Function to transform arrays into individual properties
function transformArrayToObject(data) {
  const transformed = { ...data }; // Create a shallow copy of the original data

  // Ensure nested objects exist before modifying
  transformed.output.identity = transformed.output.identity || {};
  transformed.output.demographics = transformed.output.demographics || {};
  transformed.output.relationships = transformed.output.relationships || {};

  // Transform `identity.names` into an object
  if (Array.isArray(data.output.identity.names)) {
    const namesObject = {};
    data.output.identity.names.forEach((name, index) => {
      namesObject[`name${index + 1}`] = name;
    });
    transformed.output.identity.names = namesObject;
  }

  // Transform `identity.phones` into an object
  if (Array.isArray(data.output.identity.phones)) {
    const phonesObject = {};
    data.output.identity.phones.forEach((phone, index) => {
      phonesObject[`phone${index + 1}`] = phone;
    });
    transformed.output.identity.phones = phonesObject;
  }

  // Transform `identity.addressHistory` into an object
  if (Array.isArray(data.output.identity.addressHistory)) {
    const addressHistoryObject = {};
    data.output.identity.addressHistory.forEach((address, index) => {
      addressHistoryObject[`address${index + 1}`] = address;
    });
    transformed.output.identity.addressHistory = addressHistoryObject;
  }

  // Transform `identity.emails` into an object
  if (Array.isArray(data.output.identity.emails)) {
    const emailsObject = {};
    data.output.identity.emails.forEach((email, index) => {
      emailsObject[`email${index + 1}`] = email;
    });
    transformed.output.identity.emails = emailsObject;
  }

  // Transform `relationships` into an object
  if (Array.isArray(data.output.relationships)) {
    const relationshipsObject = {};
    data.output.relationships.forEach((relationship, index) => {
      relationshipsObject[`relationship${index + 1}`] = relationship;
    });
    transformed.output.relationships = relationshipsObject;
  }

  // Transform `demographics.social` into an object
  if (Array.isArray(data.output.demographics.social)) {
    const socialProfilesObject = {};
    data.output.demographics.social.forEach((social, index) => {
      socialProfilesObject[`socialProfile${index + 1}`] = social;
    });
    transformed.output.demographics.social = socialProfilesObject;
  }

  // Transform `demographics.jobs` into an object
  if (Array.isArray(data.output.demographics.jobs)) {
    const jobsObject = {};
    data.output.demographics.jobs.forEach((job, index) => {
      jobsObject[`job${index + 1}`] = job;
    });
    transformed.output.demographics.jobs = jobsObject;
  }

  // Transform `demographics.images` into an object
  if (Array.isArray(data.output.demographics.images)) {
    const imagesObject = {};
    data.output.demographics.images.forEach((image, index) => {
      imagesObject[`image${index + 1}`] = image;
    });
    transformed.output.demographics.images = imagesObject;
  }

  // Transform `demographics.education` into an object
  if (Array.isArray(data.output.demographics.education)) {
    const educationObject = {};
    data.output.demographics.education.forEach((education, index) => {
      educationObject[`education${index + 1}`] = education;
    });
    transformed.output.demographics.education = educationObject;
  }

  // Transform `demographics.names` into an object
  if (Array.isArray(data.output.demographics.names)) {
    const demoNamesObject = {};
    data.output.demographics.names.forEach((name, index) => {
      demoNamesObject[`name${index + 1}`] = name;
    });
    transformed.output.demographics.names = demoNamesObject;
  }

  return transformed;
}










// Property Detail API
app.post("/api/property-detail", async (req, res) => {
  try {
    const requestBody = req.body;
    console.log("Received Property Detail Request Data:", requestBody);


    delete requestBody.email;

    console.log("Update Received Property Detail Request Data:", requestBody);



    // Call the PropertyDetail API
    const propertyDetailResponse = await axios.post(propertyDetailApiUrl, requestBody, {
      headers: {
        "x-api-key": realEstateApiKey,
        "Content-Type": "application/json",
      },
    });

    console.log("Original Property Detail Response Data:", propertyDetailResponse.data);

    // Process and transform the response data if necessary
    const transformedData = transformPropertyDetailResponse(propertyDetailResponse.data);

    console.log("Transformed Property Detail Data:", transformedData);

    // Send the transformed data to the webhook
    const webhookResponse = await axios.post(propertyDetailWebhookUrl, transformedData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Webhook response status:", webhookResponse.status);

    res.json({ message: "Property detail data processed successfully", data: transformedData });
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ message: "An error occurred", error: error.message });
  }
});

// Function to transform the PropertyDetail API response
function transformPropertyDetailResponse(data) {
  const transformed = { ...data }; // Create a shallow copy of the original data

  // Transform currentMortgages into an object
  if (Array.isArray(data.data.currentMortgages)) {
    const mortgagesObject = {};
    data.data.currentMortgages.forEach((mortgage, index) => {
      mortgagesObject[`mortgage${index + 1}`] = mortgage;
    });
    transformed.data.currentMortgages = mortgagesObject;
  }

  // Transform foreclosureInfo into an object
  if (Array.isArray(data.data.foreclosureInfo)) {
    const foreclosureInfoObject = {};
    data.data.foreclosureInfo.forEach((info, index) => {
      foreclosureInfoObject[`foreclosure${index + 1}`] = info;
    });
    transformed.data.foreclosureInfo = foreclosureInfoObject;
  }

  // Transform mlsHistory into an object
  if (Array.isArray(data.data.mlsHistory)) {
    const mlsHistoryObject = {};
    data.data.mlsHistory.forEach((history, index) => {
      mlsHistoryObject[`mlsHistory${index + 1}`] = history;
    });
    transformed.data.mlsHistory = mlsHistoryObject;
  }

  // Transform mortgageHistory into an object
  if (Array.isArray(data.data.mortgageHistory)) {
    const mortgageHistoryObject = {};
    data.data.mortgageHistory.forEach((history, index) => {
      mortgageHistoryObject[`mortgageHistory${index + 1}`] = history;
    });
    transformed.data.mortgageHistory = mortgageHistoryObject;
  }

  // Transform saleHistory into an object
  if (Array.isArray(data.data.saleHistory)) {
    const saleHistoryObject = {};
    data.data.saleHistory.forEach((sale, index) => {
      saleHistoryObject[`sale${index + 1}`] = sale;
    });
    transformed.data.saleHistory = saleHistoryObject;
  }

  return transformed;
}











app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
