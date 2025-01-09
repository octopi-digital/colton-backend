const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Database connection configuration
const dbConfig = {
  host: "162.214.68.40", // Replace with your database host
  user: "home9admin_sellhome9", // Replace with your MySQL username
  password: "Sell9Home", // Replace with your MySQL password
  database: "home9admin_SellHome9", // Replace with your database name
};

// x-api-key
const realEstateApiKey = "DIZWAY-74b8-7a65-97e2-a74e3aaf662d";

// Skiptrace API & Webhook
const realEstateApiUrl = "https://api.realestateapi.com/v1/SkipTrace";
const webhookUrl =
  "https://services.leadconnectorhq.com/hooks/V2v3MIyr6arc4ftnD2Zg/webhook-trigger/84c9248b-bf8b-4ec6-af84-92099c0bbb66";

// Property details API & Webhook
const propertyDetailApiUrl = "https://api.realestateapi.com/v2/PropertyDetail";
const propertyDetailWebhookUrl =
  "https://services.leadconnectorhq.com/hooks/V2v3MIyr6arc4ftnD2Zg/webhook-trigger/5a288f71-acad-43ef-b4dd-e908d3085e42";

// Third API: Property Comparables API
const propertyCompsApiUrl = "https://api.realestateapi.com/v3/PropertyComps";
const propertyCompsWebhookUrl =
  "https://services.leadconnectorhq.com/hooks/V2v3MIyr6arc4ftnD2Zg/webhook-trigger/cf2ab8ad-8b08-4489-aad8-1e8b8c5509df";

//AVM
const propertyAVMApiUrl = "https://api.realestateapi.com/v2/PropertyAvm";
const propertyAVMWebhookUrl =
  "https://services.leadconnectorhq.com/hooks/V2v3MIyr6arc4ftnD2Zg/webhook-trigger/KXTmzgh3RXgdsiE6BM9A";

app.get("/", (req, res) => {
  res.send("Welcome to the API system!");
});

// API endpoint to check database connection
app.get("/api/db-check", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.ping(); // Check the connection by pinging the server
    await connection.end();
    res.status(200).json({ message: "Database connection successful!" });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Database connection failed." });
  }
});

//Skiptrace API
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
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
});

// Function to transform arrays into individual properties for Skiptrace API
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
    //console.log("Received Property Detail Request Data:", requestBody);

    const email = { email: requestBody.email };

    //console.log(email);

    delete requestBody.email;

    //console.log("Update Received Property Detail Request Data: ", requestBody);

    // Call the PropertyDetail API
    const propertyDetailResponse = await axios.post(
      propertyDetailApiUrl,
      requestBody,
      {
        headers: {
          "x-api-key": realEstateApiKey,
          "Content-Type": "application/json",
        },
      }
    );

    // Process and transform the response data if necessary
    const transformedData = transformPropertyDetailResponse(
      propertyDetailResponse.data
    );

    // Include email with transformed data before sending to the webhook
    const payload = { ...transformedData, ...email };

    //console.log("Payload to send to webhook:", payload);

    // Send the transformed data along with email to the webhook
    const webhookResponse = await axios.post(
      propertyDetailWebhookUrl,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    //console.log("Webhook response status:", webhookResponse.status);

    res.json({
      message: "Property detail data processed successfully",
      data: payload,
    });

    //For Property Table
    const property = {
      propertyId: payload.data?.id,
      MFH2to4: payload.data?.MFH2to4,
      MFH5plus: payload.data?.MFH5plus,
      absenteeOwner: payload.data?.absenteeOwner,
      adjustableRate: payload.data?.adjustableRate,
      assumable: payload.data?.assumable,
      auction: payload.data?.auction,
      equity: payload.data?.equity,
      bankOwned: payload.data?.bankOwned,
      cashBuyer: payload.data?.cashBuyer,
      cashSale: payload.data?.cashSale,
      corporateOwned: payload.data?.corporateOwned,
      death: payload.data?.death,
      deathTransfer: payload.data?.deathTransfer,
      deedInLieu: payload.data?.deedInLieu,
      equityPercent: payload.data?.equityPercent,
      estimatedEquity: payload.data?.estimatedEquity,
      estimatedMortgageBalance: payload.data?.estimatedMortgageBalance,
      estimatedMortgagePayment: payload.data?.estimatedMortgagePayment,
      estimatedValue: payload.data?.estimatedValue,
      floodZone: payload.data?.floodZone,
      floodZoneDescription: payload.data?.floodZoneDescription,
      floodZoneType: payload.data?.floodZoneType,
      freeClear: payload.data?.freeClear,
      highEquity: payload.data?.highEquity,
      inStateAbsenteeOwner: payload.data?.inStateAbsenteeOwner,
      inherited: payload.data?.inherited,
      investorBuyer: payload.data?.investorBuyer,
      judgment: payload.data?.judgment,
      lastSaleDate: payload.data?.lastSaleDate,
      lastSalePrice: payload.data?.lastSalePrice,
      lastUpdateDate: payload.data?.lastUpdateDate?.split(" ")[0], // Format date to YYYY-MM-DD
      lien: payload.data?.lien,
      loanTypeCodeFirst: payload.data?.loanTypeCodeFirst,
      loanTypeCodeSecond: payload.data?.loanTypeCodeSecond,
      loanTypeCodeThird: payload.data?.loanTypeCodeThird,
      maturityDateFirst: payload.data?.maturityDateFirst?.split("T")[0], // Format date to YYYY-MM-DD
      mlsActive: payload.data?.mlsActive,
      mlsCancelled: payload.data?.mlsCancelled,
      mlsDaysOnMarket: payload.data?.mlsDaysOnMarket,
      mlsFailed: payload.data?.mlsFailed,
      mlsFailedDate: payload.data?.mlsFailedDate,
      mlsHasPhotos: payload.data?.mlsHasPhotos,
      mlsLastSaleDate: payload.data?.mlsLastSaleDate?.split("T")[0], // Format date to YYYY-MM-DD
      mlsLastStatusDate: payload.data?.mlsLastStatusDate?.split("T")[0], // Format date to YYYY-MM-DD
      mlsListingDate: payload.data?.mlsListingDate?.split("T")[0], // Format date to YYYY-MM-DD
      mlsListingPrice: payload.data?.mlsListingPrice,
      mlsListingPricePerSquareFoot: payload.data?.mlsListingPricePerSquareFoot,
      mlsPending: payload.data?.mlsPending,
      mlsSold: payload.data?.mlsSold,
      mlsSoldPrice: payload.data?.mlsSoldPrice,
      mlsStatus: payload.data?.mlsStatus,
      mlsTotalUpdates: payload.data?.mlsTotalUpdates,
      mlsType: payload.data?.mlsType,
      mobileHome: payload.data?.mobileHome,
      noticeType: payload.data?.noticeType,
      openMortgageBalance: payload.data?.openMortgageBalance,
      outOfStateAbsenteeOwner: payload.data?.outOfStateAbsenteeOwner,
      ownerOccupied: payload.data?.ownerOccupied,
      preForeclosure: payload.data?.preForeclosure,
      privateLender: payload.data?.privateLender,
      propertyType: payload.data?.propertyType,
      quitClaim: payload.data?.quitClaim,
      reapi_loaded_at: payload.data?.reapi_loaded_at,
      sheriffsDeed: payload.data?.sheriffsDeed,
      spousalDeath: payload.data?.spousalDeath,
      taxLien: payload.data?.taxLien,
      trusteeSale: payload.data?.trusteeSale,
      vacant: payload.data?.vacant,
      warrantyDeed: payload.data?.warrantyDeed,
    };

    //console.log(property);

    const connection = await mysql.createConnection(dbConfig);
    const keys = Object.keys(property).join(", ");
    const placeholders = Object.keys(property)
      .map(() => "?")
      .join(", ");
    const values = Object.values(property);

    const query = `INSERT INTO property (${keys}) VALUES (${placeholders})`;
    const [result] = await connection.execute(query, values);
    // await connection.end();

    //console.log("Result:", result.insertId);

    // Check if result.insertId exists
    if (result.insertId !== null) {
      // Final response for successful query execution
      console.log("Property detail data processed and inserted successfully");

      // ..................................................................................
      //Mortgage data
      const mortgageHistoryData = payload.data?.mortgageHistory || {};

      // Extract all mortgages dynamically
      const allMortgages = Object.keys(mortgageHistoryData).map((key) => {
        const mortgage = mortgageHistoryData[key]; // Access each mortgage (e.g., mortgageHistory1, mortgageHistory2)

        return {
          propertyId: payload.data?.id, // Assuming propertyId is available in payload.data
          amount: mortgage?.amount, // Dynamically extract amount
          assumable: mortgage?.assumable,
          book: mortgage?.book,
          page: mortgage?.page,
          documentNumber: mortgage?.documentNumber,
          deedType: mortgage?.deedType,
          documentDate: mortgage?.documentDate?.split("T")[0], // Format date to YYYY-MM-DD
          granteeName: mortgage?.granteeName,
          interestRate: mortgage?.interestRate,
          interestRateType: mortgage?.interestRateType,
          lenderCode: mortgage?.lenderCode,
          lenderName: mortgage?.lenderName,
          lenderType: mortgage?.lenderType,
          loanType: mortgage?.loanType,
          loanTypeCode: mortgage?.loanTypeCode,
          maturityDate: mortgage?.maturityDate?.split("T")[0], // Format date to YYYY-MM-DD
          position: mortgage?.position,
          recordingDate: mortgage?.recordingDate?.split("T")[0], // Format date to YYYY-MM-DD
          seqNo: mortgage?.seqNo,
          term: mortgage?.term,
          termType: mortgage?.termType,
          transactionType: mortgage?.transactionType,
        };
      });

      //console.log(allMortgages);

      // Insert each mortgage into the database
      for (const mortgage of allMortgages) {
        const query = `
        INSERT INTO mortgageHistory (
          propertyId, amount, assumable, book, page, documentNumber, deedType,
          documentDate, granteeName, interestRate, interestRateType, lenderCode,
          lenderName, lenderType, loanType, loanTypeCode, maturityDate, position,
          recordingDate, seqNo, term, termType, transactionType
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
        const values = [
          mortgage.propertyId,
          mortgage.amount,
          mortgage.assumable,
          mortgage.book,
          mortgage.page,
          mortgage.documentNumber,
          mortgage.deedType,
          mortgage.documentDate,
          mortgage.granteeName,
          mortgage.interestRate,
          mortgage.interestRateType,
          mortgage.lenderCode,
          mortgage.lenderName,
          mortgage.lenderType,
          mortgage.loanType,
          mortgage.loanTypeCode,
          mortgage.maturityDate,
          mortgage.position,
          mortgage.recordingDate,
          mortgage.seqNo,
          mortgage.term,
          mortgage.termType,
          mortgage.transactionType,
        ];

        // Execute the query
        const [result] = await connection.execute(query, values);
        if (result !== null) {
          console.log(
            `Inserted mortgage with ID: ${mortgage.mortgageId}, DB ID: ${result.insertId}`
          );
        } else {
          console.log("Mortgage data insert error");
        }
      }

      // ..................................................................................
      //Demographics data

      const demographics = {
        propertyId: payload.data?.id,
        fmrEfficiency: payload.data.demographics?.fmrEfficiency,
        fmrFourBedroom: payload.data.demographics?.fmrFourBedroom,
        fmrOneBedroom: payload.data.demographics?.fmrOneBedroom,
        fmrThreeBedroom: payload.data.demographics?.fmrThreeBedroom,
        fmrTwoBedroom: payload.data.demographics?.fmrTwoBedroom,
        fmrYear: payload.data.demographics?.fmrYear,
        hudAreaCode: payload.data.demographics?.hudAreaCode,
        hudAreaName: payload.data.demographics?.hudAreaName,
        medianIncome: payload.data.demographics?.medianIncome,
        suggestedRent: payload.data.demographics?.suggestedRent,
      };

      const demographicsKeys = Object.keys(demographics).join(", ");
      const demographicsKeysPlaceholders = Object.keys(demographics)
        .map(() => "?")
        .join(", ");
      const values = Object.values(demographics);

      const query = `INSERT INTO demographics (${demographicsKeys}) VALUES (${demographicsKeysPlaceholders})`;

      // Execute the query
      const [result] = await connection.execute(query, values);
      if (result !== null) {
        console.log(`Inserted demographics with DB ID: ${result.insertId}`);
      } else {
        console.log("demographics data insert error");
      }

      //.........................................................................
      // LotInfo data
      const lotInfo = {
        propertyId: payload.data?.id,
        apn: payload.data.lotInfo?.apn,
        apnUnformatted: payload.data.lotInfo?.apnUnformatted,
        censusBlock: payload.data.lotInfo?.censusBlock,
        censusBlockGroup: payload.data.lotInfo?.censusBlockGroup,
        censusTract: payload.data.lotInfo?.censusTract,
        landUse: payload.data.lotInfo?.landUse,
        legalDescription: payload.data.lotInfo?.legalDescription,
        legalSection: payload.data.lotInfo?.legalSection,
        lotAcres: payload.data.lotInfo?.lotAcres,
        lotNumber: payload.data.lotInfo?.lotNumber,
        lotSquareFeet: payload.data.lotInfo?.lotSquareFeet,
        propertyClass: payload.data.lotInfo?.propertyClass,
        propertyUse: payload.data.lotInfo?.propertyUse,
        subdivision: payload.data.lotInfo?.subdivision,
        zoning: payload.data.lotInfo?.zoning,
      };

      // Dynamically generate keys and placeholders
      const lotInfoKeys = Object.keys(lotInfo).join(", ");
      const lotInfoKeysPlaceholders = Object.keys(lotInfo)
        .map(() => "?")
        .join(", ");
      const lotInfoValues = Object.values(lotInfo);

      // Prepare the query
      const lotInfoQuery = `INSERT INTO lotInfo (${lotInfoKeys}) VALUES (${lotInfoKeysPlaceholders})`;

      try {
        // Execute the query
        const [result] = await connection.execute(lotInfoQuery, lotInfoValues);
        if (result?.affectedRows > 0) {
          console.log(`Inserted lotInfo with DB ID: ${result.insertId}`);
        } else {
          console.log("lotInfo data insert error");
        }
      } catch (error) {
        console.error(
          "Error inserting lotInfo:",
          error.message,
          "For:",
          lotInfo
        );
      }

      //......................................................
      //mlsHistory

      const mlsHistoryData = payload.data.mlsHistory || {};

      // Extract all mortgages dynamically
      const allMlsHistory = Object.keys(mlsHistoryData).map((key) => {
        const mls = mlsHistoryData[key]; // Access each mlsHistory (e.g., mlsHistory1, mlsHistory2)

        return {
          propertyId: mls?.propertyId, // Assuming propertyId is available in each MLS history
          agentEmail: mls?.agentEmail,
          agentName: mls?.agentName,
          agentOffice: mls?.agentOffice,
          agentPhone: mls?.agentPhone,
          baths: mls?.baths,
          beds: mls?.beds,
          daysOnMarket: mls?.daysOnMarket,
          lastStatusDate: mls?.lastStatusDate?.split("T")[0], // Format date to YYYY-MM-DD
          price: mls?.price,
          seqNo: mls?.seqNo,
          status: mls?.status,
          statusDate: mls?.statusDate?.split("T")[0], // Format date to YYYY-MM-DD
          type: mls?.type,
        };
      });

      //console.log(allMortgages);

      // Insert each mortgage into the database
      // Insert each MLS history into the database
      for (const mls of allMlsHistory) {
        try {
          const query = `
        INSERT INTO mlsHistory (
          propertyId, agentEmail, agentName, agentOffice, agentPhone, baths, beds,
          daysOnMarket, lastStatusDate, price, seqNo, status, statusDate, type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

          const values = [
            mls.propertyId,
            mls.agentEmail,
            mls.agentName,
            mls.agentOffice,
            mls.agentPhone,
            mls.baths,
            mls.beds,
            mls.daysOnMarket,
            mls.lastStatusDate,
            mls.price,
            mls.seqNo,
            mls.status,
            mls.statusDate,
            mls.type,
          ];

          // Debug logs
          //console.log("Values being passed to the mlsHistory query:", values);

          const [result] = await connection.execute(query, values);

          if (result?.affectedRows > 0) {
            console.log(
              `Inserted MLS history for propertyId: ${mls.propertyId}, DB ID: ${result.insertId}`
            );
          } else {
            console.error("Failed to insert MLS history:", mls);
          }
        } catch (error) {
          console.error("Error inserting MLS history:", error.message);
        }
      }

      //.......................................
      //Sale History
      // Check if saleHistory exists in the payload
      if (payload.data?.saleHistory) {
        const saleHistoryData = payload.data.saleHistory;

        // Extract all sale history dynamically
        const allSaleHistory = Object.keys(saleHistoryData).map((key) => {
          const sale = saleHistoryData[key]; // Access each saleHistory (e.g., sale1, sale2)

          return {
            propertyId: payload.data?.id,
            book: sale?.book,
            page: sale?.page,
            documentNumber: sale?.documentNumber,
            armsLength: sale?.armsLength,
            buyerNames: sale?.buyerNames,
            documentType: sale?.documentType,
            documentTypeCode: sale?.documentTypeCode,
            downPayment: sale?.downPayment,
            ltv: sale?.ltv,
            ownerIndividual: sale?.ownerIndividual,
            purchaseMethod: sale?.purchaseMethod,
            recordingDate: sale?.recordingDate?.split("T")[0], // Format date to YYYY-MM-DD
            saleAmount: sale?.saleAmount,
            saleDate: sale?.saleDate?.split("T")[0], // Format date to YYYY-MM-DD
            sellerNames: sale?.sellerNames,
            seqNo: sale?.seqNo,
            transactionType: sale?.transactionType,
          };
        });

        // Insert each sale history into the database
        for (const sale of allSaleHistory) {
          try {
            const query = `
            INSERT INTO salesHistory (
              propertyId, book, page, documentNumber, armsLength, buyerNames,
              documentType, documentTypeCode, downPayment, ltv, ownerIndividual,
              purchaseMethod, recordingDate, saleAmount, saleDate, sellerNames,
              seqNo, transactionType
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

            const values = [
              sale.propertyId,
              sale.book,
              sale.page,
              sale.documentNumber,
              sale.armsLength,
              sale.buyerNames,
              sale.documentType,
              sale.documentTypeCode,
              sale.downPayment,
              sale.ltv,
              sale.ownerIndividual,
              sale.purchaseMethod,
              sale.recordingDate,
              sale.saleAmount,
              sale.saleDate,
              sale.sellerNames,
              sale.seqNo,
              sale.transactionType,
            ];

            // Debug logs
            // console.log(
            //   "Values being passed to the saleHistory query:",
            //   values
            // );

            const [result] = await connection.execute(query, values);

            if (result?.affectedRows > 0) {
              console.log(
                `Inserted saleHistory for propertyId: ${sale.propertyId}, DB ID: ${result.insertId}`
              );
            } else {
              console.error("Failed to insert saleHistory:", sale);
            }
          } catch (error) {
            console.error("Error inserting saleHistory:", error.message);
          }
        }
      }

      //.........................................................................
      //School
      // Check if schools exist in the payload
      if (payload.data?.schools) {
        const schoolsData = payload.data.schools;

        // Extract all schools dynamically
        const allSchools = Object.keys(schoolsData).map((key) => {
          const school = schoolsData[key]; // Access each school (e.g., school1, school2)

          return {
            propertyId: payload.data?.id, // Assuming propertyId is available in payload.data
            city: school?.city,
            enrollment: school?.enrollment,
            grades: school?.grades,
            elementary: school?.levels?.elementary,
            high: school?.levels?.high,
            middle: school?.levels?.middle,
            preschool: school?.levels?.preschool,
            location: school?.location,
            name: school?.name,
            parentRating: school?.parentRating,
            rating: school?.rating,
            state: school?.state,
            street: school?.street,
            type: school?.type,
            zip: school?.zip,
          };
        });

        // Insert each school into the database
        for (const school of allSchools) {
          try {
            const query = `
            INSERT INTO schoolInfo (
              propertyId, city, enrollment, grades, elementary, high, middle,
              preschool, location, name, parentRating, rating, state, street, type, zip
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ST_GeomFromText(?), ?, ?, ?, ?, ?, ?, ?)
          `;

            const values = [
              school.propertyId,
              school.city,
              school.enrollment,
              school.grades,
              school.elementary,
              school.high,
              school.middle,
              school.preschool,
              school.location,
              school.name,
              school.parentRating,
              school.rating,
              school.state,
              school.street,
              school.type,
              school.zip,
            ];

            // Debug logs
            //console.log("Values being passed to the schools query:", values);

            const [result] = await connection.execute(query, values);

            if (result?.affectedRows > 0) {
              console.log(
                `Inserted school for propertyId: ${school.propertyId}, DB ID: ${result.insertId}`
              );
            } else {
              console.error("Failed to insert school:", school);
            }
          } catch (error) {
            console.error("Error inserting school:", error.message);
          }
        }
      }

      //...........................................................................
      //property Address
      if (payload.data?.propertyInfo?.address) {
        const propertyAddress = {
          propertyId: payload.data?.id,
          address: payload.data.propertyInfo?.address?.address,
          carrierRoute:
            payload.data.propertyInfo?.address?.carrierRoute,
          city: payload.data.propertyInfo?.address?.city,
          congressionalDistrict:
            payload.data.propertyInfo?.address?.congressionalDistrict,
          county: payload.data.propertyInfo?.address?.county,
          fips: payload.data.propertyInfo?.address?.fips,
          house: payload.data.propertyInfo?.address?.house,
          jurisdiction:
            payload.data.propertyInfo?.address?.jurisdiction,
          label: payload.data.propertyInfo?.address?.label,
          preDirection:
            payload.data.propertyInfo?.address?.preDirection,
          state: payload.data.propertyInfo?.address?.state,
          street: payload.data.propertyInfo?.address?.street,
          streetType: payload.data.propertyInfo?.address?.streetType,
          unit: payload.data.propertyInfo?.address?.unit,
          unitType: payload.data.propertyInfo?.address?.unitType,
          zip: payload.data.propertyInfo?.address?.zip,
          zip4: payload.data.propertyInfo?.address?.zip4,
        };

        const addressKeys = Object.keys(propertyAddress).join(", ");
        const addressPlaceholders = Object.keys(propertyAddress)
          .map(() => "?")
          .join(", ");
        const values = Object.values(propertyAddress);

        const query = `INSERT INTO propertyAddress (${addressKeys}) VALUES (${addressPlaceholders})`;

        const [result] = await connection.execute(query, values);
        if (result !== null) {
          console.log(
            `Inserted property address with DB ID: ${result.insertId}`
          );
        } else {
          console.log("Property address insert error");
        }
      }

      //...........................................................
      //property info
      if (payload.data?.propertyInfo) {
        const propertyInfo = {
          propertyId: payload.data?.id,
          airConditioningType:
            payload.data.propertyInfo?.airConditioningType,
          attic: payload.data.propertyInfo?.attic,
          basementFinishedPercent:
            payload.data.propertyInfo?.basementFinishedPercent,
          basementSquareFeet:
            payload.data.propertyInfo?.basementSquareFeet,
          basementSquareFeetFinished:
            payload.data.propertyInfo?.basementSquareFeetFinished,
          basementSquareFeetUnfinished:
            payload.data.propertyInfo?.basementSquareFeetUnfinished,
          basementType: payload.data.propertyInfo?.basementType,
          bathrooms: payload.data.propertyInfo?.bathrooms,
          bedrooms: payload.data.propertyInfo?.bedrooms,
          breezeway: payload.data.propertyInfo?.breezeway,
          buildingSquareFeet:
            payload.data.propertyInfo?.buildingSquareFeet,
          buildingsCount: payload.data.propertyInfo?.buildingsCount,
          carport: payload.data.propertyInfo?.carport,
          construction: payload.data.propertyInfo?.construction,
          deck: payload.data.propertyInfo?.deck,
          deckArea: payload.data.propertyInfo?.deckArea,
          featureBalcony: payload.data.propertyInfo?.featureBalcony,
          fireplace: payload.data.propertyInfo?.fireplace,
          fireplaces: payload.data.propertyInfo?.fireplaces,
          garageSquareFeet: payload.data.propertyInfo?.garageSquareFeet,
          garageType: payload.data.propertyInfo?.garageType,
          heatingFuelType: payload.data.propertyInfo?.heatingFuelType,
          heatingType: payload.data.propertyInfo?.heatingType,
          hoa: payload.data.propertyInfo?.hoa,
          interiorStructure:
            payload.data.propertyInfo?.interiorStructure,
          latitude: payload.data.propertyInfo?.latitude,
          livingSquareFeet: payload.data.propertyInfo?.livingSquareFeet,
          longitude: payload.data.propertyInfo?.longitude,
          lotSquareFeet: payload.data.propertyInfo?.lotSquareFeet,
          parcelAccountNumber:
            payload.data.propertyInfo?.parcelAccountNumber,
          parkingSpaces: payload.data.propertyInfo?.parkingSpaces,
          partialBathrooms: payload.data.propertyInfo?.partialBathrooms,
          patio: payload.data.propertyInfo?.patio,
          patioArea: payload.data.propertyInfo?.patioArea,
          plumbingFixturesCount:
            payload.data.propertyInfo?.plumbingFixturesCount,
          pool: payload.data.propertyInfo?.pool,
          poolArea: payload.data.propertyInfo?.poolArea,
          porchArea: payload.data.propertyInfo?.porchArea,
          porchType: payload.data.propertyInfo?.porchType,
          pricePerSquareFoot:
            payload.data.propertyInfo?.pricePerSquareFoot,
          propertyUse: payload.data.propertyInfo?.propertyUse,
          propertyUseCode: payload.data.propertyInfo?.propertyUseCode,
          roofConstruction: payload.data.propertyInfo?.roofConstruction,
          roofMaterial: payload.data.propertyInfo?.roofMaterial,
          roomsCount: payload.data.propertyInfo?.roomsCount,
          rvParking: payload.data.propertyInfo?.rvParking,
          safetyFireSprinklers:
            payload.data.propertyInfo?.safetyFireSprinklers,
          stories: payload.data.propertyInfo?.stories,
          taxExemptionHomeownerFlag:
            payload.data.propertyInfo?.taxExemptionHomeownerFlag,
          unitsCount: payload.data.propertyInfo?.unitsCount,
          utilitiesSewageUsage:
            payload.data.propertyInfo?.utilitiesSewageUsage,
          utilitiesWaterSource:
            payload.data.propertyInfo?.utilitiesWaterSource,
          yearBuilt: payload.data.propertyInfo?.yearBuilt,
        };

        const propertyInfoKeys = Object.keys(propertyInfo).join(", ");
        const propertyInfoPlaceholders = Object.keys(propertyInfo)
          .map(() => "?")
          .join(", ");
        const propertyInfoValues = Object.values(propertyInfo);

        const propertyInfoquery = `INSERT INTO propertyInfo (${propertyInfoKeys}) VALUES (${propertyInfoPlaceholders})`;

        const [result] = await connection.execute(
          propertyInfoquery,
          propertyInfoValues
        );
        if (result !== null) {
          console.log(`Inserted property info with DB ID: ${result.insertId}`);
        } else {
          console.log("Property info insert error");
        }
      }

      //...................................................................
      //Neighborhood
      // Neighborhood data
      if (payload.data?.neighborhood) {
        const neighborhood = {
          propertyId: payload.data?.id,
          center: payload.data.neighborhood?.center,
          neighborhoodIdExternal: payload.data.neighborhood?.id, // External neighborhood ID
          name: payload.data.neighborhood?.name,
          type: payload.data.neighborhood?.type,
        };

        const query = `
          INSERT INTO neighborhood (
            propertyId, center, neighborhoodIdExternal, name, type
          ) VALUES (?, ST_GeomFromText(?), ?, ?, ?)
        `;

        const values = [
          neighborhood.propertyId,
          neighborhood.center,
          neighborhood.neighborhoodIdExternal,
          neighborhood.name,
          neighborhood.type,
        ];

        try {
          const [result] = await connection.execute(query, values);
          if (result?.affectedRows > 0) {
            console.log(`Inserted neighborhood with DB ID: ${result.insertId}`);
          } else {
            console.log("Neighborhood data insert error");
          }
        } catch (error) {
          console.error("Error inserting neighborhood data:", error.message);
        }
      }

      //.................................................................
      //foreClosereInfo
      if (payload.data?.foreclosureInfo) {
        const foreclosureInfoData = payload.data.foreclosureInfo || {};
      
        // Extract all foreclosure records dynamically
        const allForeclosures = Object.keys(foreclosureInfoData).map((key) => {
          const foreclosure = foreclosureInfoData[key];
      
          return {
            propertyId: payload.data?.id,
            active: foreclosure?.active,
            auctionDate: foreclosure?.auctionDate?.split("T")[0], // Format date to YYYY-MM-DD
            auctionStreetAddress: foreclosure?.auctionStreetAddress,
            auctionTime: foreclosure?.auctionTime,
            caseNumber: foreclosure?.caseNumber,
            defaultAmount: foreclosure?.defaultAmount,
            documentType: foreclosure?.documentType,
            estimatedBankValue: foreclosure?.estimatedBankValue,
            foreclosureId: foreclosure?.foreclosureId,
            judgmentAmount: foreclosure?.judgmentAmount,
            judgmentDate: foreclosure?.judgmentDate?.split("T")[0], // Format date to YYYY-MM-DD
            lenderName: foreclosure?.lenderName,
            lenderPhone: foreclosure?.lenderPhone,
            noticeType: foreclosure?.noticeType,
            openingBid: foreclosure?.openingBid,
            originalLoanAmount: foreclosure?.originalLoanAmount,
            recordingDate: foreclosure?.recordingDate?.split("T")[0], // Format date to YYYY-MM-DD
            seqNo: foreclosure?.seqNo,
            trusteeAddress: foreclosure?.trusteeAddress,
            trusteeFullName: foreclosure?.trusteeFullName,
            trusteePhone: foreclosure?.trusteePhone,
            trusteeSaleNumber: foreclosure?.trusteeSaleNumber,
            typeName: foreclosure?.typeName,
          };
        });
      
        // Insert each foreclosure record into the database
        for (const foreclosure of allForeclosures) {
          const query = `
            INSERT INTO foreclosureInfo (
              propertyId, active, auctionDate, auctionStreetAddress, auctionTime,
              caseNumber, defaultAmount, documentType, estimatedBankValue, foreclosureId,
              judgmentAmount, judgmentDate, lenderName, lenderPhone, noticeType, openingBid,
              originalLoanAmount, recordingDate, seqNo, trusteeAddress, trusteeFullName,
              trusteePhone, trusteeSaleNumber, typeName
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
      
          const values = [
            foreclosure.propertyId,
            foreclosure.active,
            foreclosure.auctionDate || null,
            foreclosure.auctionStreetAddress,
            foreclosure.auctionTime,
            foreclosure.caseNumber,
            foreclosure.defaultAmount,
            foreclosure.documentType,
            foreclosure.estimatedBankValue,
            foreclosure.foreclosureId,
            foreclosure.judgmentAmount,
            foreclosure.judgmentDate || null,
            foreclosure.lenderName,
            foreclosure.lenderPhone,
            foreclosure.noticeType,
            foreclosure.openingBid,
            foreclosure.originalLoanAmount,
            foreclosure.recordingDate || null,
            foreclosure.seqNo,
            foreclosure.trusteeAddress,
            foreclosure.trusteeFullName,
            foreclosure.trusteePhone,
            foreclosure.trusteeSaleNumber,
            foreclosure.typeName,
          ];
      
          try {
            const [result] = await connection.execute(query, values);
            if (result?.affectedRows > 0) {
              console.log(
                `Inserted foreclosure record with DB ID: ${result.insertId}`
              );
            } else {
              console.log("Foreclosure data insert error");
            }
          } catch (error) {
            console.error("Error inserting foreclosure data:", error.message);
          }
        }
      }
      
      //..............................................................
      //taxHistory
      // Tax Info Data
      if (payload.data?.taxInfo) {
        const taxInfo = {
          propertyId: payload.data?.id,
          assessedImprovementValue:
            payload.data.taxInfo?.assessedImprovementValue,
          assessedLandValue: payload.data.taxInfo?.assessedLandValue,
          assessedValue: payload.data.taxInfo?.assessedValue,
          assessmentYear: payload.data.taxInfo?.assessmentYear,
          estimatedValue: payload.data.taxInfo?.estimatedValue,
          marketImprovementValue:
            payload.data.taxInfo?.marketImprovementValue,
          marketLandValue: payload.data.taxInfo?.marketLandValue,
          marketValue: payload.data.taxInfo?.marketValue,
          taxAmount: payload.data.taxInfo?.taxAmount,
          taxDelinquentYear: payload.data.taxInfo?.taxDelinquentYear,
          year: payload.data.taxInfo?.year,
        };

        const taxInfoKeys = Object.keys(taxInfo).join(", ");
        const taxInfoPlaceholders = Object.keys(taxInfo)
          .map(() => "?")
          .join(", ");
        const values = Object.values(taxInfo);

        const query = `INSERT INTO taxHistory (${taxInfoKeys}) VALUES (${taxInfoPlaceholders})`;

        try {
          const [result] = await connection.execute(query, values);
          if (result?.affectedRows > 0) {
            console.log(`Inserted tax info with DB ID: ${result.insertId}`);
          } else {
            console.log("Tax info data insert error");
          }
        } catch (error) {
          console.error("Error inserting tax info data:", error.message);
        }
      }

      //...................................................................
      //Owner Info
      if (payload.data?.ownerInfo) {
        const ownerInfo = {
          propertyId: payload.data?.id,
          absenteeOwner: payload.data.ownerInfo?.absenteeOwner,
          companyName: payload.data.ownerInfo?.companyName,
          corporateOwned: payload.data.ownerInfo?.corporateOwned,
          equity: payload.data.ownerInfo?.equity,
          inStateAbsenteeOwner:
            payload.data.ownerInfo?.inStateAbsenteeOwner,
          outOfStateAbsenteeOwner:
            payload.data.ownerInfo?.outOfStateAbsenteeOwner,
          owner1FirstName: payload.data.ownerInfo?.owner1FirstName,
          owner1FullName: payload.data.ownerInfo?.owner1FullName,
          owner1LastName: payload.data.ownerInfo?.owner1LastName,
          owner1Type: payload.data.ownerInfo?.owner1Type,
          owner2FirstName: payload.data.ownerInfo?.owner2FirstName,
          owner2FullName: payload.data.ownerInfo?.owner2FullName,
          owner2LastName: payload.data.ownerInfo?.owner2LastName,
          owner2Type: payload.data.ownerInfo?.owner2Type,
          owner3FirstName: payload.data.ownerInfo?.owner1FirstName,
          owner3FullName: payload.data.ownerInfo?.owner1FullName,
          owner3LastName: payload.data.ownerInfo?.owner1LastName,
          owner3Type: payload.data.ownerInfo?.owner1Type,
          owner4FirstName: payload.data.ownerInfo?.owner1FirstName,
          owner4FullName: payload.data.ownerInfo?.owner1FullName,
          owner4LastName: payload.data.ownerInfo?.owner1LastName,
          owner4Type: payload.data.ownerInfo?.owner1Type,
          ownerOccupied: payload.data.ownerInfo?.ownerOccupied,
          ownershipLength: payload.data.ownerInfo?.ownershipLength,
        };

        const ownerInfoKeys = Object.keys(ownerInfo).join(", ");
        const ownerInfoPlaceholders = Object.keys(ownerInfo)
          .map(() => "?")
          .join(", ");
        const ownerInfoValues = Object.values(ownerInfo);

        const query = `INSERT INTO ownerInfo (${ownerInfoKeys}) VALUES (${ownerInfoPlaceholders})`;

        try {
          const [result] = await connection.execute(query, ownerInfoValues);
          if (result?.affectedRows > 0) {
            console.log(`Inserted owner info with DB ID: ${result.insertId}`);
            const ownerInfoId = result.insertId;

            // Insert mailAddress
            const mailAddress = payload.data.ownerInfo?.mailAddress;
            if (mailAddress) {
              const mailAddressData = {
                ownerInfoId: ownerInfoId,
                address: mailAddress?.address,
                addressFormat: mailAddress?.addressFormat,
                carrierRoute: mailAddress?.carrierRoute,
                city: mailAddress?.city,
                county: mailAddress?.county,
                fips: mailAddress?.fips,
                house: mailAddress?.house,
                label: mailAddress?.label,
                preDirection: mailAddress?.preDirection,
                state: mailAddress?.state,
                street: mailAddress?.street,
                streetType: mailAddress?.streetType,
                unit: mailAddress?.unit,
                unitType: mailAddress?.unitType,
                zip: mailAddress?.zip,
                zip4: mailAddress?.zip4,
              };

              const mailAddressKeys = Object.keys(mailAddressData).join(", ");
              const mailAddressPlaceholders = Object.keys(mailAddressData)
                .map(() => "?")
                .join(", ");
              const mailAddressValues = Object.values(mailAddressData);

              const mailQuery = `INSERT INTO mailAddress (${mailAddressKeys}) VALUES (${mailAddressPlaceholders})`;

              try {
                const [mailResult] = await connection.execute(
                  mailQuery,
                  mailAddressValues
                );
                if (mailResult) {
                  console.log(
                    `Inserted mail address with DB ID: ${mailResult.insertId}`
                  );
                } else {
                  console.log("Mail address insert error");
                }
              } catch (mailError) {
                console.error(
                  "Error inserting mail address:",
                  mailError.message
                );
              }
            }
          } else {
            console.log("Owner info data insert error");
          }
        } catch (error) {
          console.error("Error inserting owner info:", error.message);
        }
      }

      //Property Return
      return;
    } else {
      // Handle unexpected null or missing result.insertId
      console.log("Failed to insert property data into the database");
      return;
    }
  } catch (error) {
    console.error("Error occurred:", error.message);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "An error occurred",
        error: error.message,
      });
    }
  }
});

// Function to transform the PropertyDetail API response for Property Details
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

  if (Array.isArray(data.data.schools)) {
    const schoolsObject = {};
    data.data.schools.forEach((school, index) => {
      schoolsObject[`school${index + 1}`] = school;
    });
    transformed.data.schools = schoolsObject;
  }

  return transformed;
}

// Coms Property API
app.post("/api/property-comps", async (req, res) => {
  try {
    const requestBody = req.body;
    console.log("Received Property Comps Request Data:", requestBody);

    const email = { email: requestBody.email };

    console.log("Extracted Email:", email);

    // Remove email from the main request body to avoid sending it to the external API
    delete requestBody.email;

    console.log("Updated Property Comps Request Data: ", requestBody);

    // Call the Property Comparables API
    const propertyCompsResponse = await axios.post(
      propertyCompsApiUrl,
      requestBody,
      {
        headers: {
          "x-api-key": realEstateApiKey,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "Response from Property Comps API:",
      propertyCompsResponse.data
    );

    // Process and transform the response data if necessary
    const transformedData = transformAllArraysToObjects(
      propertyCompsResponse.data
    );

    // Include email with transformed data before sending to the webhook
    const payload = { ...transformedData, ...email };

    console.log("Payload to send to Webhook:", payload);

    // Send the transformed data along with email to the webhook
    const webhookResponse = await axios.post(propertyCompsWebhookUrl, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Webhook response status:", webhookResponse.status);

    res.json({
      message: "Property comps data processed successfully",
      data: payload,
    });
  } catch (error) {
    console.error("Error occurred:", error.message);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
});

// Function to recursively transform all arrays into objects for comps
function transformAllArraysToObjects(data) {
  // Check if the input is an array
  if (Array.isArray(data)) {
    const transformedObject = {};
    data.forEach((item, index) => {
      transformedObject[`item${index + 1}`] = transformAllArraysToObjects(item);
    });
    return transformedObject;
  }

  // Check if the input is an object and recursively transform its properties
  if (data !== null && typeof data === "object") {
    const transformedObject = {};
    Object.keys(data).forEach((key) => {
      transformedObject[key] = transformAllArraysToObjects(data[key]);
    });
    return transformedObject;
  }

  // Return non-array, non-object values as is
  return data;
}

//AVM
app.post("/api/property-avm", async (req, res) => {
  try {
    const requestBody = req.body;
    console.log("Received Property AVM Request Data:", requestBody);

    const email = { email: requestBody.email };

    console.log("Extracted Email:", email);

    // Remove email from the main request body to avoid sending it to the external API
    delete requestBody.email;

    console.log("Updated Property AVM Request Data: ", requestBody);

    // Call the Property Comparables API
    const propertyCompsResponse = await axios.post(
      propertyAVMApiUrl,
      requestBody,
      {
        headers: {
          "x-api-key": "DIZWAYADDONTEST-b049-72ca-a511-0035c08f2559",
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response from Property AVM API:", propertyCompsResponse.data);

    // Include email with transformed data before sending to the webhook
    const payload = { ...propertyCompsResponse.data, ...email };

    console.log("Payload to send to Webhook:", payload);

    // Send the transformed data along with email to the webhook
    const webhookResponse = await axios.post(propertyAVMWebhookUrl, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Webhook response status:", webhookResponse.status);

    res.json({
      message: "Property AVM data processed successfully",
      data: payload,
    });
  } catch (error) {
    console.error("Error occurred:", error.message);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
