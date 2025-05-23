import axios, { AxiosResponse } from "axios";

const API_BASE_URL =
  "https://7382-2405-201-3009-d013-dced-12c5-5df-dc28.ngrok-free.app";

/**
 * Generic service for making API calls
 */
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
  // Validate campaign_name and campaign_id
  if (!campaign_name?.trim()) {
    return {
      status: "error",
      message: "Campaign name is required.",
    };
  }
  if (!campaign_id?.trim()) {
    return {
      status: "error",
      message: "Campaign ID is required.",
    };
  }
  if (!query.trim()) {
    return {
      status: "error",
      message: "Query is required.",
    };
  }

  // Validate based on campaign_type
  if (campaign_type === "url") {
    if (!urls.length) {
      return {
        status: "error",
        message: "At least one URL is required for URL-based campaigns.",
      };
    }
  } if (campaign_type === "keyword") {
    if (!keywords || keywords.length === 0 || !keywords[0]?.trim()) {
      return {
        status: "error",
        message:
          "At least one keyword is required for keyword-based campaigns.",
      };
    }
  } else if (campaign_type === "trending") {
    if (!keywords || !keywords.length || !keywords[0]?.trim()) {
      return {
        status: "error",
        message: "At least one keyword is required for trending campaigns.",
      };
    }
  }

  // Validate URLs if provided
  // if (urls.trim()) {
  //   const urlList = urls
  //     .split(",")
  //     .map((url) => url.trim())
  //     .filter(Boolean);
  //   for (const url of urlList) {
  //     try {
  //       new URL(url);
  //       if (!url.match(/^(https?:\/\/)/)) {
  //         return {
  //           status: "error",
  //           message: `URL must start with http:// or https://: ${url}`,
  //         };
  //       }
  //       if (url.includes("localhost")) {
  //         return {
  //           status: "error",
  //           message: `Localhost URLs are not accessible by the server: ${url}`,
  //         };
  //       }
  //     } catch {
  //       return {
  //         status: "error",
  //         message: `Invalid URL: ${url}`,
  //       };
  //     }
  //   }
  // }

  if (keywords.length === 0) {
    return {
      status: "error",
      message: `Please add keywords`,
    };
  }

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

    const response = await Service(endpoint, "GET", undefined, undefined, false);

    if (response?.status === "success") {
      return {
        status: "success",
        message: response
      };
    } else {
      console.error("Analyze failed:", response?.message || response?.error);
      return {
        status: "error",
        message:
          response?.message || response?.error || "campaigns couldn't be fetched",
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
    const endpoint = `campaigns/${campaign_id}/raw_data`

    const response = await Service(endpoint, "GET", undefined, undefined, false);

    if (response?.status === "success") {
      return {
        status: "success",
        message: response
      };
    } else {
      console.error("Failed to get campaigns for edit:", response?.message || response?.error);
      return {
        status: "error",
        message:
          response?.message || response?.error || "Failed to get campaigns for edit.",
      };
    }
  } catch (error) {
    console.error("Failed to get campaigns for edit.", error);
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unexpected error occurred.",
    };
  }
};

export const deleteCampaignsById = async (campaign_id: string) => {
  try {
    const endpoint = `campaigns/${campaign_id}`

    const response = await Service(endpoint, "DELETE", undefined, undefined, false);

    if (response?.status === "success") {
      return {
        status: "success",
        message: "Deleted Successfully"
      };
    } else {
      console.error("Error in deleting campaign:", response?.message || response?.error);
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


export const getTrendingContent = async (query: string) => {
  try {
    const endpoint = `search?query=${encodeURIComponent(query)}`;
    const response = await Service(endpoint, "GET", undefined, undefined, false);
    console.log("response getTrendingContent", response);

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
          response?.message || response?.error || "Failed to get trending topics.",
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
