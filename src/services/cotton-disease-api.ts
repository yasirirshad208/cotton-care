/**
 * Represents the possible cotton diseases.
 */
export type CottonDisease =
  | "Aphids"
  | "Army worm"
  | "Bacterial blight"
  | "Cotton Boll Rot"
  | "Green Cotton Boll"
  | "Healthy"
  | "Powdery mildew"
  | "Target spot"
  | "Unknown"; // Added for cases where the API response isn't one of the known types

/**
 * Represents the structure of the response from the prediction API.
 */
interface ApiPredictionResponse {
  predicted_class: string; // The API returns the disease name in the 'class' field
   confidence: number; // The API might return a confidence score
}


/**
 * Represents the processed prediction response used within the app.
 */
export interface PredictionResponse {
  /**
   * The detected cotton disease, or null if no disease is detected or an error occurs.
   */
  disease: CottonDisease | null;
}

const API_ENDPOINT = "https://api-cotton.onrender.com/predict";

/**
 * Asynchronously predicts the cotton disease from an image using the external API.
 *
 * @param image The image file of the cotton plant.
 * @returns A promise that resolves to a PredictionResponse object.
 */
export async function predictCottonDisease(image: File): Promise<PredictionResponse> {
  const formData = new FormData();
  formData.append('file', image); // The API expects the image under the key 'file'

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData,
      // Headers might not be strictly needed if the API handles FormData correctly,
      // but sometimes 'Content-Type': 'multipart/form-data' is required.
      // Avoid setting Content-Type manually when using FormData with fetch,
      // as the browser sets it automatically with the correct boundary.
    });

    if (!response.ok) {
      // Attempt to read the error body for more details
       let errorBody = 'Unknown error';
       try {
           errorBody = await response.text();
       } catch (e) { /* Ignore if reading body fails */ }
       console.error(`API Error ${response.status}: ${response.statusText}. Body: ${errorBody}`);
       throw new Error(`Failed to predict disease. Status: ${response.status} ${response.statusText}`);
    }

    const data: ApiPredictionResponse = await response.json();

    console.log("API Response Data:", data);

     // Validate and map the API response class to our known CottonDisease types
     const detectedClass = data.predicted_class;
     let mappedDisease: CottonDisease | null = null;

     const knownDiseases: CottonDisease[] = [
       "Aphids", "Army worm", "Bacterial blight", "Cotton Boll Rot",
       "Green Cotton Boll", "Healthy", "Powdery mildew", "Target spot"
     ];

     if (knownDiseases.includes(detectedClass as CottonDisease)) {
       mappedDisease = detectedClass as CottonDisease;
     } else {
       console.warn(`API returned unrecognized disease class: "${detectedClass}". Treating as Unknown.`);
       mappedDisease = "Unknown"; // Map unrecognized results to "Unknown"
     }


    return {
      disease: mappedDisease,
    };

  } catch (error: any) {
     console.error('Error calling prediction API:', error);
     // Rethrow or return a specific error state
     // For now, return null disease to indicate failure
     // throw new Error(`Prediction API call failed: ${error.message}`);
     return { disease: null };
  }
}
