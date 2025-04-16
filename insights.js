import {
    database,
    ref,
    get,
    child,
    getAuth
} from "./firebaseConfig.js";

// 2. Fetch user data
async function fetchAllData(email) {
    const formattedEmail = email.replace(/\./g, "_");
    const baseRef = ref(database, `users/${formattedEmail}`);

    const [sleepSnap, nutritionSnap, activitySnap] = await Promise.all([
        get(child(baseRef, "sleep")),
        get(child(baseRef, "nutrition")),
        get(child(baseRef, "activities")),
    ]);

    // Convert snapshots into arrays for sleep and activities data
    const sleepData = sleepSnap.exists() ? Object.values(sleepSnap.val()) : [];
    const activityData = activitySnap.exists() ? Object.values(activitySnap.val()) : [];

    // Fetching individual nutrition data for each meal
    const nutritionData = nutritionSnap.exists() ? nutritionSnap.val() : {};

    return {
        sleep: sleepData,
        nutrition: nutritionData,
        activity: activityData,
    };
}


// 3. Create prompt
function createPrompt(data) {
    return `
  You are a fitness assistant. Analyze the following fitness data and give 3 personalized suggestions for improvement.
  
  Sleep data:
  ${JSON.stringify(data.sleep, null, 2)}
  
  Nutrition data:
  ${JSON.stringify(data.nutrition, null, 2)}
  
  Activity data:
  ${JSON.stringify(data.activity, null, 2)}
  
  Provide actionable, motivating advice.
    `;
}

// 4. Fetch AI response from Hugging Face
async function getAIResponse(prompt) {
    try {
        const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3", {
            method: "POST",
            headers: {
                Authorization: "Bearer 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", // Replace with your Hugging Face token
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: prompt }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch AI response.");
        }

        const data = await response.json();
        let aiResponse = data[0]?.generated_text || "No insights generated.";

        // Process the AI response to remove prompt-based text
        // Remove everything before "Provide actionable, motivating advice." and after that point
        const adviceStartIndex = aiResponse.indexOf("1.");
        const actionableInsights = aiResponse.substring(adviceStartIndex).trim();

        return actionableInsights || "❌ An error occurred while generating actionable insights.";
    } catch (error) {
        console.error("Error during AI response:", error);
        return "❌ An error occurred while generating insights. Please try again.";
    }
}

// 5. Render the insights on the dashboard
function renderInsights(text) {
    const insightsElement = document.getElementById("ai-insights");
    if (insightsElement) {
        insightsElement.innerHTML = `<p style="font-size: 16px; color: #333;">${text.replace(/\n/g, "<br>")}</p>`;
    }
}

// 6. Run everything (using user email passed from onAuthStateChanged)
export async function generateAIInsights(formattedEmail) {
    try {
        renderInsights("Generating insights...");
        const data = await fetchAllData(formattedEmail); // Use the formatted email to fetch data
        const prompt = createPrompt(data);
        const insights = await getAIResponse(prompt);
        renderInsights(insights);
    } catch (err) {
        console.error("Insight generation failed", err);
        renderInsights("❌ Unable to generate insights. Please try again.");
    }
}

