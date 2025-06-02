import axios, { AxiosResponse } from "axios";

const API_BASE_URL =
  "https://736c-2405-201-3009-d013-6dbe-2995-7082-cd7e.ngrok-free.app";

/**
 * Generic service for making API calls
 */

interface TrendingContentPayload {
  trendingKeyword: string;
  campaign_id: string;
  campaign_name: string;
  description: string;
}

export const Service = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  formData: any = {},
  queryParams?: Record<string, string>,
  formUrlEncoded: boolean = false
): Promise<any> => {
  const queryString = queryParams
    ? `?${new URLSearchParams(queryParams).toString()}`
    : "";

  const url = `${API_BASE_URL}/${endpoint}${queryString}`;
  const token = localStorage.getItem("token");

  try {
    const headers: Record<string, string> = {
      "ngrok-skip-browser-warning": "true",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    let dataToSend = formData;

    if (formData instanceof FormData) {
      headers["Content-Type"] = "multipart/form-data";
    } else if (formUrlEncoded) {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      dataToSend = new URLSearchParams(formData).toString();
    } else {
      headers["Content-Type"] = "application/json";
      dataToSend = formData;
    }

    const response: AxiosResponse = await axios({
      method,
      url,
      data: method !== "GET" ? dataToSend : undefined,
      headers: {
        ...headers,
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error(`❌ Error during API call to ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Call the /signup endpoint
 * @param name - User full name
 * @param email - User email
 * @param password - User password
 */
export const signupUser = async ({
  username,
  email,
  password,
  contact,
}: {
  username: string;
  email: string;
  password: string;
  contact: string;
}): Promise<any> => {
  try {
    const endpoint = "register";

    const payload = {
      username,
      email,
      password,
      contact,
    };

    const response = await Service(endpoint, "POST", payload);

    return {
      status: response?.status || "error",
      message: response?.message || "Something went wrong.",
    };
  } catch (error: any) {
    console.error("Error during signup:", error);

    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "An unexpected error occurred. Please try again.";

    return {
      status: "error",
      message: errorMessage,
    };
  }
};

export const verifyEmail = async ({
  email,
  otp_code,
}: {
  email: string;
  otp_code: string;
}): Promise<any> => {
  try {
    const endpoint = "verify-email";

    const payload = {
      username: email,
      otp_code,
    };

    const response = await Service(endpoint, "POST", payload);

    return {
      status: response?.status || "success",
      message: response?.message || "Email verified successfully",
    };
  } catch (error: any) {
    console.error("Error during email verification:", error);

    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "OTP verification failed. Please try again.";

    return {
      status: "error",
      message: errorMessage,
    };
  }
};

/**
 * Call the /login endpoint
 * @param email - User email
 * @param password - User password
 */
export const loginUser = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<any> => {
  try {
    const endpoint = "login";

    const payload = {
      grant_type: "password",
      username,
      password,
      scope: "",
      client_id: "string",
      client_secret: "string",
    };

    const response = await Service(endpoint, "POST", payload, undefined, true);

    if (response?.access_token) {
      return {
        status: "success",
        token: response.access_token,
      };
    } else {
      console.error("Login failed:", response?.message || response?.error);
      return {
        status: "error",
        message:
          response?.message || response?.error || "Unexpected login response",
      };
    }
  } catch (error) {
    console.error("Error during login:", error);
    return {
      status: "error",
      message: "User does not exist. Please register first.",
    };
  }
};

/**
 * Call the /resend-otp endpoint
 * @param email - User email
 */
export const resendotp = async ({ email }: { email: string }): Promise<any> => {
  try {
    const endpoint = "resend-otp";

    const payload = {
      email,
    };

    const response = await Service(endpoint, "POST", payload);

    if (response?.status === 200) {
      return {
        status: 200,
        message: response.message,
      };
    } else {
      console.error("OTP resend failed:", response?.message || response?.error);
      return {
        status: "error",
        message: response?.message || response?.error || "Unexpected response",
      };
    }
  } catch (error) {
    console.error("Error during resend OTP:", error);
    return {
      status: "error",
      message: "OTP resend failed due to unexpected error.",
    };
  }
};

/**
 * Call the /forget-password endpoint
 * @param email - User email
 */
export const forgetPassword = async ({
  email,
}: {
  email: string;
}): Promise<any> => {
  try {
    const endpoint = "forget-password";

    const payload = {
      email,
    };

    const response = await Service(endpoint, "POST", payload);

    if (response?.status === 200) {
      return {
        status: 200,
        message: response.message,
      };
    } else {
      console.error("OTP resend failed:", response?.message || response?.error);
      return {
        status: "error",
        message: response?.message || response?.error || "Unexpected response",
      };
    }
  } catch (error) {
    console.error("Error during resend OTP:", error);
    return {
      status: "error",
      message: "OTP resend failed due to unexpected error.",
    };
  }
};

/**
 * Call the /reset-password endpoint
 * @param email - User email
 * @param otp_code - OTP code sent to email
 * @param new_password - New password to set
 */
export const resetPassword = async ({
  email,
  otp_code,
  new_password,
}: {
  email: string;
  otp_code: string;
  new_password: string;
}): Promise<any> => {
  try {
    const endpoint = "reset-password";

    const payload = {
      email,
      otp_code,
      new_password,
    };

    const response = await Service(endpoint, "POST", payload);

    if (response?.status === 200) {
      return {
        status: 200,
        message: response.message,
      };
    } else {
      return {
        status: "error",
        message: response?.message || response?.error || "Unexpected response",
      };
    }
  } catch (error) {
    console.error("Error during reset password:", error);
    return {
      status: "error",
      message: "Reset password failed due to unexpected error.",
    };
  }
};

/**
 * Call the /linkedin/auth endpoint
 * @param urls - List of LinkedIn URLs
 */
export const linkedinConnect = async (): Promise<any> => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found in localStorage.");
      return;
    }

    const response = await Service("linkedin/auth-v2", "GET", {});

    if (response?.auth_url) {
      window.location.href = response.auth_url;
    } else {
      console.error("No auth_url in response");
    }
  } catch (error) {
    console.error("Error during LinkedIn connection:", error);
  }
};

/**
 * Call the /twitter/auth endpoint
 * @param urls - List of LinkedIn URLs
 */
export const twitterConnect = async (): Promise<any> => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found in localStorage.");
      return;
    }

    const response = await Service("twitter/auth-v2", "GET", {});
    console.log("Twitter auth response:", response);

    if (response?.redirect_url) {
      window.location.href = response.redirect_url;
    } else {
      console.error("No redirect_url in response");
    }
  } catch (error) {
    console.error("Error during LinkedIn connection:", error);
  }
};

/**
 * Call the /wordpress/auth endpoint
 * @param site_url - WordPress site URL
 * @param username - WordPress username
 * @param password - WordPress password
 */

export const wordpressConnect = async (
  site_url: string,
  username: string,
  password: string
): Promise<any> => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found in localStorage.");
      return;
    }

    const formBody = new URLSearchParams();
    formBody.append("site_url", site_url);
    formBody.append("username", username);
    formBody.append("password", password);

    const response = await fetch(`${API_BASE_URL}/wordpress/auth-v2`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    });

    const data = await response.json();

    if (response.ok) {
      console.log("WordPress connected successfully:", data);
    } else {
      console.error("Failed to connect to WordPress:", data);
    }

    return data;
  } catch (error) {
    console.error("Error during WordPress connection:", error);
  }
};

/**
 * Input parameters for the analyzeTrends API
 */
export interface AnalyzeTrendsInput {
  campaign_name: string;
  campaign_id: string;
  urls: string[];
  query: string;
  keywords: string[];
  campaign_type?: "keyword" | "url" | "trending";
  depth: number;
  max_pages: number;
  batch_size: number;
  include_links: boolean;
  stem: boolean;
  lemmatize: boolean;
  remove_stopwords_toggle: boolean;
  extract_persons: boolean;
  extract_organizations: boolean;
  extract_locations: boolean;
  extract_dates: boolean;
  topic_tool: string;
  num_topics: number;
  iterations: number;
  pass_threshold: number;
}

/**
 * Post structure in the response
 */
interface Post {
  text?: string;
  lemmatized_text?: string | null;
  stemmed_text?: string | null;
  stopwords_removed_text?: string | null;
  persons?: string[];
  organizations?: string[];
  locations?: string[];
  dates?: string[];
  topics?: string[];
}

/**
 * Response structure for the analyzeTrends API
 */
export interface AnalyzeTrendsResponse {
  status: "success" | "error";
  task?: string;
  campaign_name?: string;
  campaign_id?: string;
  keywords?: string[];
  posts?: Post[];
  topics?: string[];
  message?: string;
}

/**
 * Call the /analyze endpoint
 * @param input - Analyze input data
 * @throws Error if validation fails
 */
export const analyzeTrends = async ({
  campaign_name,
  campaign_id,
  urls = [],
  query = "",
  keywords = [],
  campaign_type = "keyword",
  depth = 3,
  max_pages = 10,
  batch_size = 1,
  include_links = true,
  stem = false,
  lemmatize = false,
  remove_stopwords_toggle = false,
  extract_persons = false,
  extract_organizations = false,
  extract_locations = false,
  extract_dates = false,
  topic_tool = "lda",
  num_topics = 3,
  iterations = 25,
  pass_threshold = 0.7,
}: AnalyzeTrendsInput): Promise<AnalyzeTrendsResponse> => {
  try {
    const endpoint = "analyze";

    const payload: AnalyzeTrendsInput = {
      campaign_name,
      campaign_id,
      urls,
      query,
      keywords,
      campaign_type,
      depth,
      max_pages,
      batch_size,
      include_links,
      stem,
      lemmatize,
      remove_stopwords_toggle,
      extract_persons,
      extract_organizations,
      extract_locations,
      extract_dates,
      topic_tool,
      num_topics,
      iterations,
      pass_threshold,
    };

    console.log("API Payload:", JSON.stringify(payload, null, 2));
    const response = await Service(endpoint, "POST", payload, undefined, false);

    if (response?.status === "success") {
      return {
        status: "success",
        task: response.task,
        campaign_name: response.campaign_name,
        campaign_id: response.campaign_id,
        keywords: response.keywords || keywords,
        posts: response.posts,
        topics: response.topics,
      };
    } else {
      console.error("Analyze failed:", response?.message || response?.error);
      return {
        status: "error",
        message:
          response?.message || response?.error || "Unexpected analyze response",
      };
    }
  } catch (error) {
    console.error("Error during analyze:", error);
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unexpected error occurred during analysis.",
    };
  }
};

export const getAllCampaigns = async () => {
  try {
    const endpoint = "campaigns";

    const response = await Service(
      endpoint,
      "GET",
      undefined,
      undefined,
      false
    );

    if (response?.status === "success") {
      return {
        status: "success",
        message: response,
      };
    } else {
      console.error("Analyze failed:", response?.message || response?.error);
      return {
        status: "error",
        message:
          response?.message ||
          response?.error ||
          "campaigns couldn't be fetched",
      };
    }
  } catch (error) {
    console.error("Error during analyze:", error);
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unexpected error occurred during analysis.",
    };
  }
};

export const getCampaignsById = async (campaign_id: string) => {
  try {
    const endpoint = `campaigns/${campaign_id}/raw_data`;

    const response = await Service(
      endpoint,
      "GET",
      undefined,
      undefined,
      false
    );

    if (response?.status === "success") {
      return {
        status: "success",
        message: response,
      };
    } else {
      console.error(
        "Failed to get campaigns for edit:",
        response?.message || response?.error
      );
      return {
        status: "error",
        message:
          response?.message ||
          response?.error ||
          "Failed to get campaigns for edit.",
      };
    }
  } catch (error) {
    console.error("Failed to get campaigns for edit.", error);
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unexpected error occurred.",
    };
  }
};

export const deleteCampaignsById = async (campaign_id: string) => {
  try {
    const endpoint = `campaigns/${campaign_id}`;

    const response = await Service(
      endpoint,
      "DELETE",
      undefined,
      undefined,
      false
    );

    if (response?.status === "success") {
      return {
        status: "success",
        message: "Deleted Successfully",
      };
    } else {
      console.error(
        "Error in deleting campaign:",
        response?.message || response?.error
      );
      return {
        status: "error",
        message:
          response?.message || response?.error || "Error in deleting campaign",
      };
    }
  } catch (error) {
    console.error("Error in deleting campaign", error);
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unexpected error occurred while deleting campaigns.",
    };
  }
};

export const getTrendingContent = async (payload: TrendingContentPayload) => {
  try {
    const { trendingKeyword, campaign_id, campaign_name, description } =
      payload;

    const queryParams = new URLSearchParams({
      query: trendingKeyword,
      campaign_id,
      campaign_name,
      description,
    }).toString();

    const endpoint = `search?${queryParams}`;

    const response = await Service(
      endpoint,
      "GET",
      undefined,
      undefined,
      false
    );

    if (response?.status === "success") {
      return {
        status: "success",
        message: response.tweets,
      };
    } else {
      console.error("Analyze failed:", response?.message || response?.error);
      return {
        status: "error",
        message:
          response?.message ||
          response?.error ||
          "Failed to get trending topics.",
      };
    }
  } catch (error) {
    console.error("Error during analyze:", error);
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unexpected error occurred in trending topics.",
    };
  }
};

export const generateContent = async ({
  campaign_name,
  campaign_id,
  urls = [],
  query = "",
  keywords = [],
  campaign_type = "keyword",
  depth = 3,
  max_pages = 10,
  batch_size = 1,
  include_links = true,
  stem = false,
  lemmatize = false,
  remove_stopwords_toggle = false,
  extract_persons = false,
  extract_organizations = false,
  extract_locations = false,
  extract_dates = false,
  topic_tool = "lda",
  num_topics = 3,
  iterations = 25,
  pass_threshold = 0.7,
}: AnalyzeTrendsInput): Promise<AnalyzeTrendsResponse> => {
  try {
    const endpoint = "analyze";

    const payload: AnalyzeTrendsInput = {
      campaign_name,
      campaign_id,
      urls,
      query,
      keywords,
      campaign_type,
      depth,
      max_pages,
      batch_size,
      include_links,
      stem,
      lemmatize,
      remove_stopwords_toggle,
      extract_persons,
      extract_organizations,
      extract_locations,
      extract_dates,
      topic_tool,
      num_topics,
      iterations,
      pass_threshold,
    };

    const response = await Service(endpoint, "POST", payload, undefined, false);

    if (response?.status === "success") {
      return {
        status: "success",
        task: response.task,
        campaign_name: response.campaign_name,
        campaign_id: response.campaign_id,
        keywords: response.keywords || keywords,
        posts: response.posts,
        topics: response.topics,
      };
    } else {
      console.error("Analyze failed:", response?.message || response?.error);
      return {
        status: "error",
        message:
          response?.message || response?.error || "Unexpected analyze response",
      };
    }
  } catch (error) {
    console.error("Error during analyze:", error);
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unexpected error occurred during analysis.",
    };
  }
};

// export const generateContentAPI = async () => {
//   try {
//     const endpoint = "generate_content";

//     const payloadData = localStorage.getItem("contentGenPayload");
//     const payloadTextData = localStorage.getItem("text");

//     let parsedPayload = {};
//     if (payloadData) {
//       parsedPayload = JSON.parse(payloadData);
//     }

//     const formParams = new URLSearchParams();

//     formParams.append(
//       "topics",
//       parsedPayload.keywords ? parsedPayload.keywords.join(",") : "AI, 2025"
//     );

//     formParams.append(
//       "text",
//       payloadTextData || "usme alag alag component the  isme alag hai"
//     );

//     if (
//       Array.isArray(parsedPayload.activePlatforms) &&
//       parsedPayload.activePlatforms.length > 0
//     ) {
//       formParams.append("platforms", parsedPayload.activePlatforms.join(","));
//     } else {
//       formParams.append("platforms", "Facebook");
//     }
//     if (
//       Array.isArray(parsedPayload.activeDays) &&
//       parsedPayload.activeDays.length > 0
//     ) {
//       formParams.append("days", parsedPayload.activeDays.join(","));
//     } else {
//       formParams.append("days", "Monday");
//     }

//     formParams.append("author", parsedPayload.author || "");

//     formParams.append(
//       "sample_text",
//       payloadTextData || "usme alag alag component the  isme alag hai"
//     );
//     const response = await Service(
//       endpoint,
//       "POST",
//       formParams,
//       undefined,
//       true
//     );
//     console.log("response", response);

//     if (response?.status === "success") {
//       return {
//         status: "success",
//         message: response.generated_content,
//       };
//     } else {
//       console.error("Analyze failed:", response?.message || response?.error);
//       return {
//         status: "error",
//         message:
//           response?.message || response?.error || "Unexpected analyze response",
//       };
//     }
//   } catch (error) {
//     console.error("Error during analyze:", error);
//     return {
//       status: "error",
//       message:
//         error instanceof Error
//           ? error.message
//           : "Unexpected error occurred during analysis.",
//     };
//   }
// };

export const generateContentAPI = async () => {
  try {
    const endpoint = "generate_content";

    // Retrieve data from localStorage
    const payloadData = localStorage.getItem("contentGenPayload");
    const payloadTextData = localStorage.getItem("text");

    // Parse JSON data from localStorage
    let parsedPayload = {};
    if (typeof payloadData === "string") {
      try {
        parsedPayload = JSON.parse(payloadData);
      } catch (e) {
        console.error("Error parsing contentGenPayload:", e);
      }
    }

    console.log("Parsed Payload:", parsedPayload); // Debug payload
    console.log("Text Data:", payloadTextData); // Debug text data

    const formParams = new URLSearchParams();

    // Use trendingTopic if available, else keywords, else fallback
    let topicsSource;
    if (
      parsedPayload.trendingTopic &&
      Array.isArray(parsedPayload.trendingTopic) &&
      parsedPayload.trendingTopic.length > 0
    ) {
      topicsSource = parsedPayload.trendingTopic.join(",");
    } else if (
      parsedPayload.keywords &&
      Array.isArray(parsedPayload.keywords) &&
      parsedPayload.keywords.length > 0
    ) {
      topicsSource = parsedPayload.keywords.join(",");
    } else {
      topicsSource = "social media trends"; // Meaningful fallback
    }

    formParams.append("topics", topicsSource);
    console.log("Topics Sent:", topicsSource); // Debug topics

    // Use trendingTopic for text if available, else payloadTextData, else fallback
    let textSource = null; // Initialize to null
    if (
      parsedPayload.trendingTopic &&
      Array.isArray(parsedPayload.trendingTopic) &&
      parsedPayload.trendingTopic.length > 0
    ) {
      textSource = parsedPayload.trendingTopic.join(" "); // Join with spaces for text
    } else if (payloadTextData && typeof payloadTextData === "string") {
      try {
        const parsedText = JSON.parse(payloadTextData);
        textSource =
          typeof parsedText === "string" ? parsedText : payloadTextData; // Use parsed text if string, else raw
      } catch (e) {
        textSource = payloadTextData; // Use raw string if parsing fails
        console.warn("Failed to parse payloadTextData, using raw string:", e);
      }
    }

    // Apply fallback if textSource is still null or not a string
    if (!textSource || typeof textSource !== "string") {
      textSource = "Generate content based on current social media trends."; // Meaningful fallback
    }

    formParams.append("text", textSource);
    formParams.append("sample_text", textSource); // Same as text for consistency
    console.log("Text Sent:", textSource); // Debug text

    // Platforms
    formParams.append(
      "platforms",
      Array.isArray(parsedPayload.activePlatforms) &&
        parsedPayload.activePlatforms.length > 0
        ? parsedPayload.activePlatforms.join(",")
        : "Facebook"
    );

    // Days
    formParams.append(
      "days",
      Array.isArray(parsedPayload.activeDays) &&
        parsedPayload.activeDays.length > 0
        ? parsedPayload.activeDays.join(",")
        : "Monday"
    );

    // Author
    formParams.append("author", parsedPayload.author || "");

    const response = await Service(
      endpoint,
      "POST",
      formParams,
      undefined,
      true
    );
    console.log("API Response:", response);

    if (response?.status === "success") {
      return {
        status: "success",
        message: response.generated_content,
      };
    } else {
      console.error(
        "Content generation failed:",
        response?.message || response?.error
      );
      return {
        status: "error",
        message:
          response?.message || response?.error || "Failed to generate content.",
      };
    }
  } catch (error) {
    console.error("Error during content generation:", error);
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unexpected error occurred during content generation.",
    };
  }
};

export const regenerateContentAPI = async ({ id, query, platform }) => {
  try {
    const endpoint = `regenerate_script_machine_content?id=${id}&query=${encodeURIComponent(
      query
    )}&platform=${platform}`;

    const response = await Service(endpoint, "PUT", null, undefined, true);

    if (response?.status === "success") {
      return {
        status: "success",
        message: response.content,
      };
    } else {
      console.error("Regenerate failed:", response?.message || response?.error);
      return {
        status: "error",
        message:
          response?.message ||
          response?.error ||
          "Unexpected regenerate response",
      };
    }
  } catch (error) {
    console.error("Error during regenerate:", error);
    return {
      status: "error",
      message: "Content regeneration failed due to unexpected error.",
    };
  }
};

export const generateImageMachineContent = async (payload: {
  id: string;
  query: string;
}) => {
  try {
    const { id, query } = payload;

    const queryParams = new URLSearchParams({
      id,
      query,
    }).toString();

    const endpoint = `generate_image_machine_content?${queryParams}`;

    const response = await Service(
      endpoint,
      "POST",
      undefined,
      {
        accept: "application/json",
      },
      false
    );
    if (response?.status === "success") {
      return {
        status: "success",
        message: response.image_url,
      };
    } else {
      console.error(
        "Image generation failed:",
        response?.message || response?.error
      );
      return {
        status: "error",
        message:
          response?.message || response?.error || "Failed to generate image.",
      };
    }
  } catch (error) {
    console.error("Error during image generation:", error);
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unexpected error occurred during image generation.",
    };
  }
};
